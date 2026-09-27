import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const getWishlistItems = async () => {
    if (!loggedInUser || !loggedInUser.token) {
      toast.warning("Please login to view your wishlist");
      setLoading(false);
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("https://novacart-backend-ppkb.onrender.com/api/v1/wishlist", {
        headers: {
          "Authorization": `Bearer ${loggedInUser.token}`
        }
      });
      const data = await response.json();

      if (response.ok) {
        setWishlistItems(data || []);
      } else {
        toast.error("Failed to load wishlist");
      }
    } catch (error) {
      console.error("Wishlist fetch error:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getWishlistItems();
  }, []);

  const removeFromWishlist = async (productId) => {
    try {
      const response = await fetch(`https://novacart-backend-ppkb.onrender.com/api/v1/wishlist/remove/${productId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${loggedInUser.token}`
        }
      });

      const message = await response.text();
      if (response.ok) {
        toast.success(message);
        setWishlistItems(wishlistItems.filter(item => item.product?.id !== productId));
      } else {
        toast.error("Failed to remove item");
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Error removing item");
    }
  };

  const moveToCart = async (productId) => {
    try {
      const response = await fetch(`https://novacart-backend-ppkb.onrender.com/api/v1/customer/\({loggedInUser.id}/cart?productId=\){productId}&quantity=1`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${loggedInUser.token}`
        }
      });

      if (response.ok) {
        toast.success("Item moved to cart successfully!");
        removeFromWishlist(productId);
      } else {
        toast.error("Failed to add product to cart");
      }
    } catch (error) {
      console.error("Cart error:", error);
      toast.error("Error adding to cart");
    }
  };

  return (
    React.createElement("div", { className: "container mt-5 mb-5 min-vh-100" },
      React.createElement("div", { className: "d-flex justify-content-between align-items-center mb-3" },
        React.createElement("h3", { className: "fw-bold" }, "My Wishlist"),
        React.createElement("span", { className: "badge bg-danger fs-6" }, `${wishlistItems ? wishlistItems.length : 0} Items`)
      ),
      React.createElement("hr", null),
      loading
        ? React.createElement("div", { className: "text-center py-5" },
            React.createElement("div", { className: "spinner-border text-danger", role: "status" },
              React.createElement("span", { className: "visually-hidden" }, "Loading...")
            )
          )
        : wishlistItems && wishlistItems.length > 0
        ? React.createElement("div", { className: "row g-4" },
            wishlistItems.map(({ id, product }) =>
              React.createElement("div", { key: id, className: "col-12 col-sm-6 col-md-4 col-lg-3" },
                React.createElement("div", { className: "card h-100 border rounded-2 p-3 shadow-sm bg-white position-relative" },
                  React.createElement("div", {
                    className: "bg-body-secondary p-2 d-flex align-items-center justify-content-center rounded position-absolute top-0 end-0 m-2",
                    style: { cursor: "pointer", width: "32px", height: "32px" },
                    onClick: () => removeFromWishlist(product?.id),
                    title: "Remove item"
                  },
                    React.createElement("h6", { className: "mb-0 text-danger fw-bold" }, "x")
                  ),
                  React.createElement("div", { className: "text-center my-3" },
                    React.createElement("img", {
                      src: `https://novacart-backend-ppkb.onrender.com/api/v1/images/${product?.imageName}`,
                      alt: product?.name,
                      style: { height: "130px", width: "100%", objectFit: "contain" },
                      onError: (e) => { e.target.src = "https://via.placeholder.com/130?text=No+Image"; }
                    })
                  ),
                  React.createElement("div", { className: "d-flex flex-column justify-content-between flex-grow-1" },
                    React.createElement("div", null,
                      React.createElement("p", { className: "text-capitalize small text-muted mb-1" }, product?.brand || "Brand"),
                      React.createElement("h6", { className: "text-capitalize fw-bold text-truncate", title: product?.name }, product?.name),
                      React.createElement("h6", { className: "mt-2 fw-bold text-primary" }, `₹ ${product?.price}`)
                    ),
                    React.createElement("button", {
                      className: "btn w-100 text-light fs-6 fw-bold mt-3 py-2",
                      style: { backgroundColor: "orange" },
                      onClick: () => moveToCart(product?.id)
                    }, "Move to Cart")
                  )
                )
              )
            )
          )
        : React.createElement("div", { className: "text-center my-5 py-5 bg-white border rounded-2 shadow-sm" },
            React.createElement("h4", { className: "text-muted" }, "Your wishlist is empty"),
            React.createElement("p", { className: "text-secondary small" }, "Explore items and save your favorites here."),
            React.createElement(Link, {
              to: "/",
              className: "btn text-light px-4 py-2 mt-2 fw-bold",
              style: { backgroundColor: "orange" }
            }, "Explore Products")
          )
    )
  );
}