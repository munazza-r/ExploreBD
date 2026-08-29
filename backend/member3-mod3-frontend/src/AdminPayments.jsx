import React, { useState, useEffect } from 'react';
import './Payment.css';

const API_BASE = "http://localhost:1667/api/payments";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPayments = async () => {
    try {
      const res = await fetch(`${API_BASE}/all`);
      const data = await res.json();
      if (res.ok) {
        setPayments(data.payments || data.data || []);
      } else {
        setError(data.message || "Failed to load payments.");
      }
    } catch (err) {
      setError("Could not reach the payment server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const handleRelease = async (id) => {
    await fetch(`${API_BASE}/${id}/release`, { method: "PATCH" });
    fetchPayments();
  };

  const handleRefund = async (id) => {
    await fetch(`${API_BASE}/${id}/refund`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Admin-initiated refund" }),
    });
    fetchPayments();
  };

  const statusBadge = (status) => {
    const colors = {
      RELEASED: "#22c55e",
      REFUNDED: "#dc2626",
      ESCROW_HELD: "#d97706",
      CANCELLED: "#6b7280",
      INITIATED: "#3b82f6",
    };
    return <span style={{ color: colors[status] || "#6b7280", fontWeight: 600 }}>{status}</span>;
  };

  return (
    <div className="main-content" style={{ flexDirection: "column", alignItems: "center" }}>
      <div className="verification-card" style={{ maxWidth: 1100 }}>
        <h2>Admin — Escrow Payments</h2>

        {error && <p style={{ color: "#dc2626", fontWeight: 600 }}>{error}</p>}

        {loading ? (
          <p>Loading...</p>
        ) : payments.length === 0 ? (
          <p>No payments yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "2px solid var(--border-light)" }}>
                <th style={{ padding: "10px" }}>Booking</th>
                <th style={{ padding: "10px" }}>Tourist</th>
                <th style={{ padding: "10px" }}>Guide</th>
                <th style={{ padding: "10px" }}>Amount</th>
                <th style={{ padding: "10px" }}>Method</th>
                <th style={{ padding: "10px" }}>Status</th>
                <th style={{ padding: "10px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <td style={{ padding: "10px" }}>{p.bookingId}</td>
                  <td style={{ padding: "10px" }}>{p.touristId}</td>
                  <td style={{ padding: "10px" }}>{p.guideId}</td>
                  <td style={{ padding: "10px" }}>৳{p.amount}</td>
                  <td style={{ padding: "10px" }}>{p.method}</td>
                  <td style={{ padding: "10px" }}>{statusBadge(p.status)}</td>
                  <td style={{ padding: "10px", display: "flex", gap: 8 }}>
                    <button
                      className="submit-btn"
                      style={{ width: "auto", padding: "8px 14px", background: "#22c55e" }}
                      onClick={() => handleRelease(p.id)}
                      disabled={p.status !== "ESCROW_HELD"}
                    >
                      Release
                    </button>
                    <button
                      className="submit-btn"
                      style={{ width: "auto", padding: "8px 14px", background: "#dc2626" }}
                      onClick={() => handleRefund(p.id)}
                      disabled={p.status !== "ESCROW_HELD"}
                    >
                      Refund
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPayments;