import React from 'react';
import './Verification.css';

const Verification = () => {
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
          
          <form action="http://localhost:5000/api/verification/upload" method="POST" encType="multipart/form-data">
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

            <button type="submit" className="submit-btn">Submit Verification</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Verification;
