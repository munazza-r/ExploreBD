import React, { useState } from 'react';
import './Verification.css';

const Verification = () => {
  const [status, setStatus] = useState(null); // null | "loading" | "success" | "error"
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    const formData = new FormData(e.target);

    try {
      const res = await fetch("http://localhost:5052/api/verification/submit", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("Documents submitted successfully! An admin will review them soon.");
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
        <div className="nav-brand">ExploreBD</div>
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
              <input type="text" id="studentIdNumber" name="studentIdNumber" required placeholder="Enter your Student ID" />
            </div>

            <div className="form-group">
              <label htmlFor="studentIdCard">Student ID Picture *</label>
              <input type="file" id="studentIdCard" name="studentIdCard" accept="image/*" required />
            </div>

            <div className="form-group">
              <label htmlFor="nidOrPassportNumber">NID / Passport Number *</label>
              <input type="text" id="nidOrPassportNumber" name="nidOrPassportNumber" required placeholder="Enter NID or Passport No." />
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
    </>
  );
};

export default Verification;