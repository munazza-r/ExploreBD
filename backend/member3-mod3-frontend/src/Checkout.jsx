import React, { useState } from 'react';
import './Payment.css';
import { Compass, CreditCard } from "lucide-react";

const API_BASE = "http://localhost:1667/api/payments";

const Checkout = () => {
  const [form, setForm] = useState({
    bookingId: "",
    touristId: "",
    guideId: "",
    amount: "",
  });
  const [status, setStatus] = useState(null); // null | "loading" | "error"
  const [message, setMessage] = useState("");

  const handleDigitInput = (e, maxLen) => {
    const clean = e.target.value.replace(/\D/g, '').slice(0, maxLen);
    setForm({ ...form, [e.target.name]: clean });
  };

  const handleAmountChange = (e) => setForm({ ...form, amount: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.bookingId.length !== 8) {
      setStatus("error");
      setMessage("Booking ID must be exactly 8 digits.");
      return;
    }
    if (form.touristId.length !== 5) {
      setStatus("error");
      setMessage("Tourist ID must be exactly 5 digits.");
      return;
    }
    if (form.guideId.length !== 4) {
      setStatus("error");
      setMessage("Guide ID must be exactly 4 digits.");
      return;
    }

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

      if (data.gatewayURL) {
        window.location.href = data.gatewayURL;
      } else {
        setStatus("error");
        setMessage("Payment gateway did not return a checkout URL.");
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

          <div className="gateway-note">
            <CreditCard size={18} />
            <span>Pay securely via bKash, Nagad, Rocket, or Visa/Mastercard/Amex</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Booking ID * (8 digits)</label>
              <input
                type="text" name="bookingId" required placeholder="e.g. 23555000"
                value={form.bookingId} maxLength={8} inputMode="numeric"
                onChange={(e) => handleDigitInput(e, 8)}
              />
            </div>
            <div className="form-group">
              <label>Your Tourist ID * (5 digits)</label>
              <input
                type="text" name="touristId" required placeholder="e.g. 12345"
                value={form.touristId} maxLength={5} inputMode="numeric"
                onChange={(e) => handleDigitInput(e, 5)}
              />
            </div>
            <div className="form-group">
              <label>Guide ID * (4 digits)</label>
              <input
                type="text" name="guideId" required placeholder="e.g. 4567"
                value={form.guideId} maxLength={4} inputMode="numeric"
                onChange={(e) => handleDigitInput(e, 4)}
              />
            </div>
            <div className="form-group">
              <label>Amount (BDT) *</label>
              <input type="number" name="amount" required min="1" placeholder="e.g. 1500" onChange={handleAmountChange} />
            </div>

            <button type="submit" className="submit-btn btn-sslcz" disabled={status === "loading"}>
              {status === "loading" ? "Redirecting to secure checkout..." : "Proceed to Payment"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Checkout;