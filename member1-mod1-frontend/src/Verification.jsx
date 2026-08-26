import React, { useState, useEffect } from 'react';
import './Verification.css';
import { Compass, CheckCircle2, XCircle } from "lucide-react";

const API_BASE = "http://localhost:1661/api/verification";

const Verification = () => {
  const [status, setStatus] = useState(null); // null | "loading" | "success" | "error"
  const [message, setMessage] = useState("");
  const [reviewStatus, setReviewStatus] = useState(null); // PENDING | APPROVED | REJECTED
  const [showPopup, setShowPopup] = useState(false);

  // On mount, check if there's a pending submission we're waiting on
  useEffect(() => {
    const savedId = localStorage.getItem('verificationRequestId');
    if (savedId) {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE}/status/${savedId}`);
          const data = await res.json();
          if (res.ok && data.data.status !== "PENDING") {
            setReviewStatus(data.data.status);
            setShowPopup(true);
            clearInterval(interval);
            localStorage.removeItem('verificationRequestId');
          }
        } catch (err) {
          console.error("Status check failed:", err);
        }
      }, 5000); // poll every 5s

      return () => clearInterval(interval);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    const formData = new FormData(e.target);

    try {
      const res = await fetch(`${API_BASE}/submit`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("Documents submitted successfully! An admin will review them soon.");
        localStorage.setItem('verificationRequestId', data.data.id);
        e.target.reset();
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Could not reach the server. Is the backend running?");
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand" style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <div style={{width:40,height:40,borderRadius:11,background:"linear-gradient(135deg,#15803d,#16a34a)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Compass size={22} color="#bbf7d0" />
          </div>
          Explore<span style={{color:"#16a34a"}}>BD</span>
        </div>
        <div className="nav-links">
          <span>Dashboard</span>
          <span>Explore Guides</span>
          <span className="active">Verification</span>
        </div>
        <div className="avatar-circle">MR</div>
      </nav>

      <div className="main-content">
        <div className="verification-card">
          <h2>Guide Document Verification</h2>

          {status === "success" && <p style={{ color: "#238b56", fontWeight: 600 }}>{message}</p>}
          {status === "error" && <p style={{ color: "#dc2626", fontWeight: 600 }}>{message}</p>}

          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="form-group">
              <label htmlFor="universityName">University Name *</label>
              <input type="text" id="universityName" name="universityName" required placeholder="e.g. BRAC University" />
            </div>

            <div className="form-group">
              <label htmlFor="studentIdNumber">Student ID Number *</label>
              <input
                type="text"
                id="studentIdNumber"
                name="studentIdNumber"
                required
                placeholder="Enter your Student ID (8 digits)"
                pattern="\d{8}"
                maxLength={8}
                inputMode="numeric"
                title="Student ID must be exactly 8 digits"
                onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 8); }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="studentIdCard">Student ID Picture *</label>
              <input type="file" id="studentIdCard" name="studentIdCard" accept="image/*" required />
            </div>

            <div className="form-group">
              <label htmlFor="nidOrPassportNumber">NID / Passport Number *</label>
              <input
                type="text"
                id="nidOrPassportNumber"
                name="nidOrPassportNumber"
                required
                placeholder="Enter NID Number (12 digits)"
                pattern="\d{12}"
                maxLength={12}
                inputMode="numeric"
                title="NID must be exactly 12 digits"
                onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 12); }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="nidOrPassport">NID / Passport Picture *</label>
              <input type="file" id="nidOrPassport" name="nidOrPassport" accept="image/*" required />
            </div>

            <button type="submit" className="submit-btn" disabled={status === "loading"}>
              {status === "loading" ? "Submitting..." : "Submit Verification"}
            </button>
          </form>
        </div>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-card">
            {reviewStatus === "APPROVED" ? (
              <>
                <CheckCircle2 size={64} color="#22c55e" />
                <h3>You're Verified!</h3>
                <p>Your guide documents have been approved. You can now start accepting bookings.</p>
              </>
            ) : (
              <>
                <XCircle size={64} color="#dc2626" />
                <h3>Verification Rejected</h3>
                <p>Your documents were not approved. Please review and resubmit.</p>
              </>
            )}
            <button className="submit-btn" onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Verification;