import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // सुरक्षितपणे Admin Token मिळवण्यासाठी Helper Function
  function getAdminToken() {
    let token = localStorage.getItem("token");

    if (!token) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          token =
            parsedUser.token ||
            parsedUser.jwt ||
            parsedUser.accessToken ||
            parsedUser.access_token;
        } catch (e) {
          token = storedUser;
        }
      }
    }
    return token;
  }

  // 1. Fetch All Orders (Admin API)
  async function fetchAllOrders() {
    setLoading(true);
    const token = getAdminToken();

    if (!token) {
      toast.error("Authentication token missing! Please login again.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/v1/admin/orders", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.status === 403) {
        toast.error("Access Denied (403): Admin authorization failed!");
        setLoading(false);
        return;
      }

      const responseObject = await response.json().catch(() => ({}));

      if (response.ok) {
        setOrders(responseObject.data || responseObject || []);
      } else {
        toast.error(responseObject.message || "Failed to load orders");
      }
    } catch (error) {
      console.error("Fetch orders error:", error);
      toast.error("Unable to connect to orders service!");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAllOrders();
  }, []);

  // 2. Update Order Delivery Status
  async function handleStatusChange(orderId, newStatus) {
    const token = getAdminToken();

    if (!token) {
      toast.error("Authentication token missing! Please login again.");
      return;
    }

    try {
      setUpdatingId(orderId);
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/orders/${orderId}/status?status=${newStatus}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );

      const responseObject = await response.json().catch(() => ({}));

      if (response.ok) {
        toast.success(`Order #${orderId} marked as ${newStatus}!`);
        setOrders((prevOrders) =>
          prevOrders.map((o) =>
            o.id === orderId ? { ...o, orderStatus: newStatus } : o
          )
        );
      } else {
        toast.error(responseObject.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Server error while updating status");
    } finally {
      setUpdatingId(null);
    }
  }

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case "DELIVERED":
        return <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">Delivered</span>;
      case "SHIPPED":
        return <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">Shipped</span>;
      case "CONFIRMED":
        return <span className="badge bg-info-subtle text-info border border-info-subtle px-2 py-1">Confirmed</span>;
      case "CANCELLED":
        return <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">Cancelled</span>;
      default:
        return <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1">Pending</span>;
    }
  };

  // 3. Metric Calculations
  const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);
  const deliveredCount = orders.filter((o) => o.orderStatus?.toUpperCase() === "DELIVERED").length;
  const pendingCount = orders.filter((o) => o.orderStatus?.toUpperCase() === "PENDING").length;

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id?.toString().includes(searchTerm) ||
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      order.orderStatus?.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container-fluid px-4 py-4 bg-light min-vh-100">
      
      {/* 1. Header & Metric Cards */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1">Customer Orders</h4>
          <p className="text-muted small mb-0">Track transactions, update shipment states, and view buyer invoices</p>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={fetchAllOrders}>
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh Data
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <p className="text-muted small mb-1 fw-semibold">Total Orders</p>
                <h4 className="fw-bold mb-0 text-dark">{orders.length}</h4>
              </div>
              <div className="bg-primary-subtle text-primary p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: "48px", height: "48px" }}>
                <i className="bi bi-receipt fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <p className="text-muted small mb-1 fw-semibold">Pending Delivery</p>
                <h4 className="fw-bold mb-0 text-warning">{pendingCount}</h4>
              </div>
              <div className="bg-warning-subtle text-warning p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: "48px", height: "48px" }}>
                <i className="bi bi-clock-history fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <p className="text-muted small mb-1 fw-semibold">Completed Orders</p>
                <h4 className="fw-bold mb-0 text-success">{deliveredCount}</h4>
              </div>
              <div className="bg-success-subtle text-success p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: "48px", height: "48px" }}>
                <i className="bi bi-check-circle fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <p className="text-muted small mb-1 fw-semibold">Total Revenue</p>
                <h4 className="fw-bold mb-0 text-dark">₹{totalRevenue}</h4>
              </div>
              <div className="bg-info-subtle text-info p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: "48px", height: "48px" }}>
                <i className="bi bi-currency-rupee fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Controls & Orders Table */}
      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        
        <div className="card-header bg-white border-0 py-3 px-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-2">
            <h6 className="fw-bold mb-0">Order Logs</h6>
            <span className="badge bg-light text-secondary border">
              Showing {filteredOrders.length}
            </span>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            <select
              className="form-select form-select-sm"
              style={{ width: "150px" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <div className="input-group input-group-sm" style={{ width: "240px" }}>
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Order ID / Customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-uppercase small text-muted">
              <tr>
                <th className="ps-4" style={{ width: "90px" }}>Order ID</th>
                <th>Customer</th>
                <th>Payment Mode</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Change Status</th>
                <th className="text-end pe-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                    Loading customer orders...
                  </td>
                </tr>
              ) : filteredOrders && filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="ps-4 fw-semibold text-secondary">
                      #{order.id}
                    </td>

                    <td>
                      <div>
                        <p className="fw-semibold mb-0 text-dark">
                          {order.customer?.name || "Anonymous Customer"}
                        </p>
                        <small className="text-muted">
                          {order.customer?.email || order.customer?.mobileNumber || "No contact info"}
                        </small>
                      </div>
                    </td>

                    <td>
                      <span className="badge bg-light text-dark border">
                        {order.paymentMode || "RAZORPAY"}
                      </span>
                    </td>

                    <td className="fw-bold text-dark">
                      ₹{order.totalAmount}
                    </td>

                    <td>{getStatusBadge(order.orderStatus)}</td>

                    <td>
                      <select
                        className="form-select form-select-sm"
                        style={{ width: "135px" }}
                        value={order.orderStatus || "PENDING"}
                        disabled={updatingId === order.id}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>

                    <td className="text-end pe-4">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        data-bs-toggle="modal"
                        data-bs-target="#orderDetailsModal"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <i className="bi bi-eye me-1"></i> View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <i className="bi bi-inbox fs-2 d-block mb-2 text-secondary"></i>
                    {orders.length === 0
                      ? "No customer orders placed yet."
                      : "No orders matching your search filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Order Details Modal */}
      <div
        className="modal fade"
        id="orderDetailsModal"
        tabIndex="-1"
        aria-labelledby="orderDetailsModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content rounded-4 border-0 shadow">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-bold" id="orderDetailsModalLabel">
                Order #{selectedOrder?.id} Details
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            
            <div className="modal-body p-4">
              {selectedOrder && (
                <div className="row g-3">
                  <div className="col-12 col-md-6 border-end">
                    <h6 className="fw-bold text-muted small text-uppercase">Customer Information</h6>
                    <p className="mb-1 fw-semibold">{selectedOrder.customer?.name}</p>
                    <p className="mb-1 text-muted small"><i className="bi bi-envelope me-1"></i>{selectedOrder.customer?.email}</p>
                    <p className="text-muted small"><i className="bi bi-telephone me-1"></i>{selectedOrder.customer?.mobileNumber || "Not provided"}</p>

                    <h6 className="fw-bold text-muted small text-uppercase mt-3">Shipping Address</h6>
                    <p className="text-secondary small mb-0">
                      {selectedOrder.shippingAddress || "Doorstep standard delivery registered."}
                    </p>
                  </div>

                  <div className="col-12 col-md-6 ps-md-4">
                    <h6 className="fw-bold text-muted small text-uppercase">Order Overview</h6>
                    <div className="d-flex justify-content-between mb-2 small">
                      <span className="text-muted">Payment Method:</span>
                      <span className="fw-semibold">{selectedOrder.paymentMode || "Online (Razorpay)"}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2 small">
                      <span className="text-muted">Current Status:</span>
                      <span>{getStatusBadge(selectedOrder.orderStatus)}</span>
                    </div>
                    <div className="d-flex justify-content-between pt-2 border-top">
                      <span className="fw-bold">Total Bill:</span>
                      <span className="fw-bold text-success fs-5">₹{selectedOrder.totalAmount}</span>
                    </div>
                  </div>

                  <div className="col-12 mt-3">
                    <h6 className="fw-bold text-muted small text-uppercase mb-2">Purchased Items</h6>
                    <div className="border rounded-3 p-2 bg-light">
                      {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? (
                        selectedOrder.orderItems.map((item, idx) => (
                          <div key={idx} className="d-flex align-items-center justify-content-between py-2 border-bottom last-border-none">
                            <div className="d-flex align-items-center gap-2">
                              <span className="text-muted small">#{idx + 1}</span>
                              <span className="fw-semibold small">{item.product?.name || item.productName || "Product"}</span>
                            </div>
                            <div className="small">
                              <span className="text-muted me-3">Qty: {item.quantity || 1}</span>
                              <span className="fw-semibold">₹{item.price || item.product?.price}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted small mb-0 text-center py-2">No detailed items found in record.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer border-0 pt-0">
              <button type="button" className="btn btn-secondary btn-sm px-3" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}