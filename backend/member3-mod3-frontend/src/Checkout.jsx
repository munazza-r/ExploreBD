import React, { useState } from 'react';
import './Payment.css';
import { Compass, CheckCircle2 } from "lucide-react";

const API_BASE = "http://localhost:1667/api/payments";

const Checkout = () => {
  const [form, setForm] = useState({
    bookingId: "",
    touristId: "",
    guideId: "",
    amount: "",
    method: "BKASH",
  });
  const [status, setStatus] = useState(null); // null | "loading" | "error" | "nagad-success"
  const [message, setMessage] = useState("");
  const [nagadReceipt, setNagadReceipt] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.message || "Payment initiation failed.");
        return;
      }

      if (form.method === "BKASH") {
        if (data.bkashURL) {
          window.location.href = data.bkashURL;
        } else {
          setStatus("error");
          setMessage("bKash did not return a checkout URL.");
        }
      } else {
        setStatus("nagad-success");
        setNagadReceipt(data.payment);
      }
    } catch (err) {
      setStatus("error");
      setMessage("Could not reach the payment server. Is it running on port 1667?");
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">
          <Compass size={22} color="#bbf7d0" />
          Explore<span style={{ color: "#34D399" }}>BD</span>
        </div>
        <div className="nav-links">
          <span>Dashboard</span>
          <span className="active">Checkout</span>
        </div>
        <div className="avatar-circle">MR</div>
      </nav>

      <div className="main-content">
        <div className="verification-card">
          <h2>Secure Escrow Payment</h2>

          {status === "error" && (
            <p style={{ color: "#dc2626", fontWeight: 600 }}>{message}</p>
          )}

          {status === "nagad-success" && nagadReceipt ? (
            <div className="status-box">
              <CheckCircle2 size={64} color="#22c55e" style={{ margin: "0 auto" }} />
              <h3 style={{ marginTop: 16 }}>Payment Held in Escrow</h3>
              <p>Your Nagad payment (simulated) was successful.</p>
              <div className="receipt-box">
                <p><strong>Payment ID:</strong> {nagadReceipt.id}</p>
                <p><strong>Amount:</strong> ৳{nagadReceipt.amount}</p>
                <p><strong>Method:</strong> {nagadReceipt.method}</p>
                <p><strong>Status:</strong> {nagadReceipt.status}</p>
                <p><strong>Booking:</strong> {nagadReceipt.bookingId}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="method-toggle">
                <div
                  className={`method-btn ${form.method === "BKASH" ? "active" : ""}`}
                  onClick={() => setForm({ ...form, method: "BKASH" })}
                >
                  bKash
                </div>
                <div
                  className={`method-btn ${form.method === "NAGAD" ? "active" : ""}`}
                  onClick={() => setForm({ ...form, method: "NAGAD" })}
                >
                  Nagad
                </div>
              </div>

              <div className="form-group">
                <label>Booking ID *</label>
                <input type="text" name="bookingId" required placeholder="e.g. BOOK-2026-001" onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Your Tourist ID *</label>
                <input type="text" name="touristId" required placeholder="e.g. tourist123" onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Guide ID *</label>
                <input type="text" name="guideId" required placeholder="e.g. guide456" onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Amount (BDT) *</label>
                <input type="number" name="amount" required min="1" placeholder="e.g. 1500" onChange={handleChange} />
              </div>

              <button type="submit" className="submit-btn" disabled={status === "loading"}>
                {status === "loading"
                  ? "Processing..."
                  : form.method === "BKASH"
                  ? "Pay with bKash"
                  : "Pay with Nagad"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default Checkout;