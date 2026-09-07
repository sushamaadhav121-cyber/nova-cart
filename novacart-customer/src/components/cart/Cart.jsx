import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Cart() {
  const [cartItems, setCartItems] = useState(null);
  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  // 1. Fetch Cart
  useEffect(() => {
    async function getCartProductsByCustomerId() {
      if (!loggedInUser) return;

      try {
        let response = await fetch(`http://localhost:8080/api/v1/customer/${loggedInUser.id}/cart`, {
          headers: {
            "Authorization": `Bearer ${loggedInUser.token}`
          }
        });
        let responseObject = await response.json();

        if (response.ok) {
          setCartItems(responseObject.data);
        }
      } catch (error) {
        console.error("Cart fetch error:", error);
      }
    }
    getCartProductsByCustomerId();
  }, []);

  // 2. Pricing & Items Calculations
  const DELIVERY_CHARGE = 50;
  const DISCOUNT = 70;

  const totalItems = cartItems ? cartItems.reduce((acc, item) => acc + item.quantity, 0)
    : 0;

  const subtotal = cartItems ? cartItems.reduce((sum, cartItem) => {
        return sum + (cartItem.product?.price || 0) * cartItem.quantity;
      }, 0)
    : 0;

  const total = subtotal > 0 ? subtotal + DELIVERY_CHARGE - DISCOUNT : 0;

  // 3. Update Quantity Functionality (+ / -)
  async function updateQuantity(cartId, newQuantity) {
    if (newQuantity < 1) return;

    try {
      let response = await fetch(`http://localhost:8080/api/v1/customer/cart/${cartId}?quantity=${newQuantity}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${loggedInUser.token}`
        }
      });

      if (response.ok) {
        const updatedCart = cartItems.map((item) => {
          if (item.id === cartId) {
            return { ...item, quantity: newQuantity };
          }
          return item;
        });
        setCartItems(updatedCart);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  }

  // 4. Remove Item from Cart Functionality
  async function removeFromCart(cartId) {
    try {
      let response = await fetch(`http://localhost:8080/api/v1/customer/cart/${cartId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${loggedInUser.token}`
        }
      });
      let responseObject = await response.json();
      if (response.ok) {
        toast.success(responseObject.message);
        const updatedCart = cartItems.filter((item) => item.id !== cartId);
        setCartItems(updatedCart);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  }

  // 5. Load Razorpay
  function loadRazorpayScript() {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => {
        resolve(true);
      };

      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  }

  // 6. Handle Razorpay Checkout Payment
  async function handlePayment() {
    if (!loggedInUser) {
      toast.error("Please login to proceed");
      navigate("/login");
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      toast.error("Razorpay SDK failed to load. Check internet connection.");
      return;
    }

    const payableAmount = Math.round(total);

    try {

      const createOrderResponse = await fetch(
        `http://localhost:8080/api/v1/customer/create-order?amount=${payableAmount}&currency=INR&customerId=${loggedInUser.id}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${loggedInUser.token}`
          }
        }
      );

      const order = await createOrderResponse.json();
      console.log("Razorpay Order Created:", order);

      if (!createOrderResponse.ok || !order.id) {
        toast.error("Unable to create order on server");
        return;
      }

      
      const options = {key: "rzp_test_TWndbSYXQrY289", 
        amount: order.amount,
        currency: order.currency || "INR",
        order_id: order.id,
        name: "NovaCart",
        description: "Order Payment",
        handler: async function (paymentResponse) {
          console.log("Razorpay Payment Response:", paymentResponse);

          try {
            
            const verifyResponse = await fetch(
              "http://localhost:8080/api/v1/customer/verify-payment",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${loggedInUser.token}`
                },
                body: JSON.stringify({
                  razorpayOrderId: paymentResponse.razorpay_order_id,
                  razorpayPaymentId: paymentResponse.razorpay_payment_id,
                  razorpaySignature: paymentResponse.razorpay_signature,
                  customerId: loggedInUser.id
                })
              }
            );

            if (verifyResponse.ok) {
              toast.success("Payment Successful!");
              setCartItems([]);
              navigate("/my-orders");
            } else {
              toast.error("Payment Verification Failed on server");
            }
          } catch (err) {
            console.error("Verification error:", err);
            toast.error("Payment Verification Failed");
          }
        },
        prefill: {
          name: loggedInUser.name || "Customer",
          email: loggedInUser.email || "customer@example.com",
          contact: loggedInUser.mobile || "9999999999"
        },
        theme: {
          color: "#F37254"
        }
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        toast.error("Payment Failed");
        console.error("Payment Failed Error:", response.error);
      });

      razorpay.open();
    } catch (error) {
      console.error("Payment creation error:", error);
      toast.error("Failed to initiate checkout");
    }
  }

  return (
    <div className='container mt-5 mb-5'>
      <div className="row align-items-start">
        {/* Cart Items List */}
        <div className="col-12 col-lg-9">
          <h3>Your Cart</h3>
          <hr />
          {cartItems && cartItems.length > 0 ? (
            cartItems.map((cartItem) => {
              return (
                <div key={cartItem.id} className='border rounded-2 p-3 w-100 d-flex justify-content-between align-items-center mb-3 shadow-sm bg-white'>
                  {/* Product Details */}
                  <div className='w-100'>
                    <h6 className='text-capitalize fw-bold'>{cartItem.product?.name}</h6>
                    <div className="container px-0 mt-2">
                      <div className='row align-items-center'>
                        <div className='d-flex align-items-center col-4'>
                          <div>
                            <img src={`http://localhost:8080/api/v1/images/${cartItem.product?.imageName}`}
                                 alt={cartItem.product?.name}
                                 style={{ height: "90px", width: "90px", objectFit: "contain" }}
                                 onError={(e) => {
                                 e.target.src = "https://via.placeholder.com/90?text=No+Image";
                              }}/>
                          </div>
                          <div className='d-flex flex-column ms-3 lh-1'>
                            <p className='small text-muted mb-1'>SKU-921</p>
                            <p className='text-capitalize small mb-1'>{cartItem.product?.brand || "Brand"}</p>
                            <p className='bg-success text-light px-2 py-1 rounded small mb-0 w-auto d-inline-block text-center'>In Stock</p>
                          </div>
                        </div>

                        <div className='col-2 text-center'>
                          <p className='text-muted small mb-1'>Each</p>
                          <h6 className='mt-2 fw-bold'>₹ {cartItem.product?.price}</h6>
                        </div>

                        <div className='text-center col-3'>
                          <p className='text-muted small mb-1'>Quantity</p>
                          <div className='d-flex justify-content-center align-items-center mt-1'>
                            <p className='fs-4 mb-0'
                              style={{ cursor: "pointer" }}
                              onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}>
                              <i className="bi bi-dash-circle"></i>
                            </p>
                            <p className='p-2 mx-3 mb-0 fw-bold'>{cartItem.quantity}</p>
                            <p className='fs-4 mb-0' style={{ cursor: "pointer" }}
                              onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}>
                              <i className="bi bi-plus-circle"></i>
                            </p>
                          </div>
                        </div>

                        <div className='col-3 text-center'>
                          <p className='text-muted small mb-1'>Total</p>
                          <h6 className='mt-2 text-primary fw-bold'>₹ {Number(cartItem.product?.price) * Number(cartItem.quantity)}</h6>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <div
                    className='bg-body-secondary p-2 d-flex align-items-center justify-content-center rounded ms-3'
                    style={{ cursor: "pointer", width: "35px", height: "35px" }}
                    onClick={() => removeFromCart(cartItem.id)}
                    title="Remove item">
                    <h6 className='mb-0 text-danger fw-bold'>x</h6>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center my-5">
              <h4 className="text-muted">Your cart is empty</h4>
              <p className="text-secondary small">Add items from the store to proceed to checkout.</p>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="col-12 col-lg-3 bg-body-secondary rounded-2 p-3 mt-4 mt-lg-0 shadow-sm">
          <h4 className="fw-bold">Order Summary</h4>
          <hr />

          {/* Total Items Count */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="fw-semibold">Total Items:</span>
            <span className="badge bg-dark fs-6">{totalItems}</span>
          </div>
          <hr />

          {/* Subtotal, Delivery, Discount & Total */}
          <div className='d-flex justify-content-between'>
            <div>
              <p className="mb-2">Subtotal</p>
              <p className="mb-2">Delivery Charge</p>
              <p className='text-danger mb-2'>Discount</p>
              <hr />
              <h5 className="fw-bold">Total</h5>
            </div>
            <div className="text-end">
              <p className="mb-2">₹ {subtotal}</p>
              <p className="mb-2">₹ {cartItems && cartItems.length > 0 ? DELIVERY_CHARGE : 0}</p>
              <p className='text-danger mb-2'>₹ -{cartItems && cartItems.length > 0 ? DISCOUNT : 0}</p>
              <hr />
              <h5 className="fw-bold text-dark">₹ {total}</h5>
            </div>
          </div>

          {/* Checkout Button */}
          <button className='btn w-100 text-light fs-6 fw-bold mt-3 py-2'
                  style={{ backgroundColor: "orange" }}
                  onClick={handlePayment}
                  disabled={!cartItems || cartItems.length === 0}>CHECKOUT</button>
        </div>
      </div>
    </div>
  );
}