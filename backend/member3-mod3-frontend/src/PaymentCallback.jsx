import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './Payment.css';
import { Compass, CheckCircle2, XCircle, Loader2 } from "lucide-react";

const API_BASE = "http://localhost:1667/api/payments";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    const urlStatus = searchParams.get('status'); // success | fail | cancel | error
    const paymentId = searchParams.get('paymentId');

    if (urlStatus !== "success") {
      setStatus(urlStatus || "error");
      return;
    }

    if (!paymentId) {
      setStatus("error");
      return;
    }

    fetch(`${API_BASE}/${paymentId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setPayment(data.payment);
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [searchParams]);

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">
          <Compass size={22} color="#bbf7d0" />
          Explore<span style={{ color: "#34D399" }}>BD</span>
        </div>
        <div className="nav-links"><span>Dashboard</span></div>
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
                    <p><strong>Card/Method:</strong> {payment.sslczCardType || "N/A"}</p>
                  </div>
                )}
              </>
            )}

            {(status === "fail" || status === "cancel" || status === "error") && (
              <>
                <XCircle size={64} color="#dc2626" style={{ margin: "0 auto" }} />
                <h3 style={{ marginTop: 16 }}>
                  {status === "cancel" ? "Payment Cancelled" : "Payment Not Completed"}
                </h3>
                <p>You can try again from the checkout page.</p>
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