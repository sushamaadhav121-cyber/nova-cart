import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    async function fetchOrders() {
      if (!loggedInUser) return;

      try {
        const response = await fetch(
          `http://localhost:8080/api/v1/customer/${loggedInUser.id}/orders`,
          {
            headers: {
              "Authorization": `Bearer ${loggedInUser.token}`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        } else {
          toast.error("Failed to load orders");
        }
      } catch (err) {
        console.error("Order fetch error:", err);
      }
    }

    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <span className="badge bg-primary me-2">Delivered</span>;
      case 'shipped':
        return <span className="badge bg-info text-dark me-2">Shipped</span>;
      case 'confirmed':
        return <span className="badge bg-secondary me-2">Confirmed</span>;
      case 'cancelled':
        return <span className="badge bg-danger me-2">Cancelled</span>;
      default:
        return <span className="badge bg-warning text-dark me-2">Pending</span>;
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <h3 className="fw-bold mb-3">My Orders</h3>
      <hr />

      {orders.length === 0 ? (
        <div className="text-center my-5">
          <h5 className="text-muted">No orders placed yet!</h5>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.orderId} className="card shadow-sm mb-4 border-0">
            <div className="card-header bg-dark text-light d-flex justify-content-between align-items-center py-3">
              <div>
                <span className="fw-bold me-3">Order #{order.orderId}</span>
                <span className="small text-secondary">
                  {order.orderDate ? new Date(order.orderDate).toLocaleString() : ""}
                </span>
              </div>
              <div className="d-flex align-items-center">
                
                <span className="badge bg-success me-2">{order.paymentStatus || 'PAID'}</span>
                
                {getStatusBadge(order.orderStatus)}

                <span className="fw-bold text-warning fs-6">₹{order.totalAmount}</span>
              </div>
            </div>

            <div className="card-body">
              <p className="small text-muted mb-3">Payment ID: {order.paymentId}</p>

              {order.items && order.items.map((item) => (
                <div key={item.id} className="d-flex align-items-center border-bottom py-2">
                  <img
                    src={`http://localhost:8080/api/v1/images/${item.product?.imageName}`}
                    alt={item.product?.name}
                    style={{ height: "60px", width: "60px", objectFit: "contain" }}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/60?text=No+Img";
                    }}
                  />
                  <div className="ms-3 flex-grow-1">
                    <h6 className="mb-0 text-capitalize">{item.product?.name}</h6>
                    <span className="small text-muted">Qty: {item.quantity} × ₹{item.price}</span>
                  </div>
                  <div className="fw-bold">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}