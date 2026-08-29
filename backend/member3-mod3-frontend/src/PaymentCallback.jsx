import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './Payment.css';
import { Compass, CheckCircle2, XCircle, Loader2 } from "lucide-react";

const API_BASE = "http://localhost:1667/api/payments";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading | success | failed | error
  const [message, setMessage] = useState("");
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    const paymentID = searchParams.get('paymentID');
    const bkashStatus = searchParams.get('status'); // "success" | "cancel" | "failure" per bKash docs

    if (!paymentID) {
      setStatus("error");
      setMessage("No payment reference found in the callback URL.");
      return;
    }

    const confirmPayment = async () => {
      try {
        const res = await fetch(`${API_BASE}/callback?paymentID=${paymentID}&status=${bkashStatus || ''}`);
        const data = await res.json();

        if (data.success) {
          setStatus("success");
          setPayment(data.payment);
        } else {
          setStatus("failed");
          setMessage(data.message || "Payment was not completed.");
          setPayment(data.payment || null);
        }
      } catch (err) {
        setStatus("error");
        setMessage("Could not confirm payment with the server.");
      }
    };

    confirmPayment();
  }, [searchParams]);

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">
          <Compass size={22} color="#bbf7d0" />
          Explore<span style={{ color: "#34D399" }}>BD</span>
        </div>
        <div className="nav-links">
          <span>Dashboard</span>
        </div>
        <div className="avatar-circle">MR</div>
      </nav>

      <div className="main-content">
        <div className="verification-card">
          <h2>Payment Confirmation</h2>

          <div className="status-box">
            {status === "loading" && (
              <>
                <Loader2 size={64} color="#047857" style={{ margin: "0 auto" }} />
                <h3 style={{ marginTop: 16 }}>Confirming your payment...</h3>
                <p>Please wait, this only takes a moment.</p>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle2 size={64} color="#22c55e" style={{ margin: "0 auto" }} />
                <h3 style={{ marginTop: 16 }}>Payment Captured Into Escrow!</h3>
                <p>The platform is holding your payment until the tour is completed.</p>
                {payment && (
                  <div className="receipt-box">
                    <p><strong>Payment ID:</strong> {payment.id}</p>
                    <p><strong>Amount:</strong> ৳{payment.amount}</p>
                    <p><strong>Status:</strong> {payment.status}</p>
                    <p><strong>Transaction ID:</strong> {payment.bkashTrxID}</p>
                  </div>
                )}
              </>
            )}

            {(status === "failed" || status === "error") && (
              <>
                <XCircle size={64} color="#dc2626" style={{ margin: "0 auto" }} />
                <h3 style={{ marginTop: 16 }}>Payment Not Completed</h3>
                <p>{message}</p>
              </>
            )}

            <Link to="/" style={{ display: "inline-block", marginTop: 24, color: "#047857", fontWeight: 600 }}>
              ← Back to Checkout
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentCallback;