import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5001/api/v1/cancellation';

export default function App() {
  const [userRole, setUserRole] = useState(null); // 'USER' | 'GUIDE' | null
  const [activeTab, setActiveTab] = useState('');

  // User Form States
  const [bookingId, setBookingId] = useState('B101');
  const [requesterId] = useState('USR-001');
  const [reason, setReason] = useState('Emergency scheduling conflict');
  const [bookingDate, setBookingDate] = useState('2026-09-01T10:00:00');
  const [totalPrice] = useState(4500);

  // Guide Form States
  const [guideName, setGuideName] = useState('');
  const [guideId, setGuideId] = useState('GD-202');
  const [guideBookingId, setGuideBookingId] = useState('B101');
  const [guideBookingDate, setGuideBookingDate] = useState('2026-09-01T10:00:00');
  const [guideReason, setGuideReason] = useState('Personal emergency');

  // Refund Form States
  const [refundBookingId, setRefundBookingId] = useState('B101');
  const [refundAmount, setRefundAmount] = useState(4500);
  const [paymentChannel, setPaymentChannel] = useState('bKash');
  const [accountNumber, setAccountNumber] = useState('01700000000');
  const [refundReason, setRefundReason] = useState('Service cancelled prior to departure');

  // SOS Emergency Claim States
  const [category, setCategory] = useState('NO_SHOW');
  const [contactNumber, setContactNumber] = useState('01700000000');
  const [claimDetails, setClaimDetails] = useState('');

  const [message, setMessage] = useState('');

  const handleSelectRole = (role) => {
    setUserRole(role);
    setMessage('');
    if (role === 'USER') {
      setActiveTab('USER_CANCEL');
      setCategory('NO_SHOW');
    } else {
      setActiveTab('GUIDE_CANCEL');
      setCategory('USER_NO_SHOW');
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/cancel/tourist`, {
        bookingId,
        requesterId,
        reason,
        bookingDate,
        totalPrice: Number(totalPrice)
      });
      setMessage(`Success: ${res.data.message}`);
    } catch (err) {
      setMessage(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleGuideSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/cancel/guide`, {
        bookingId: guideBookingId,
        requesterId: guideId,
        guideName,
        reason: guideReason,
        bookingDate: guideBookingDate,
        resolutionType: 'REFUND'
      });
      setMessage(`Success: ${res.data.message}`);
    } catch (err) {
      setMessage(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/compensation/request`, {
        bookingId: refundBookingId,
        initiatedBy: userRole,
        requesterId: userRole === 'USER' ? requesterId : guideId,
        reason: `Refund Request (${paymentChannel} - ${accountNumber}): ${refundReason}`,
        bookingDate,
        totalPrice: Number(refundAmount),
        category: 'REFUND_REQUEST',
        claimAmount: Number(refundAmount)
      });
      setMessage(`Success: ${res.data.message || 'Refund request submitted successfully!'}`);
    } catch (err) {
      setMessage(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/sos/request`, {
        bookingId: userRole === 'USER' ? bookingId : guideBookingId,
        initiatedBy: userRole,
        requesterId: userRole === 'USER' ? requesterId : guideId,
        category,
        contactNumber,
        claimDetails
      });
      setMessage(`🚨 URGENT SOS ALERT SENT! Safety dispatch team has been notified for immediate response.`);
    } catch (err) {
      setMessage(`Error submitting SOS: ${err.response?.data?.error || err.message}`);
    }
  };

  // Initial Role Selection Screen
  if (!userRole) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f4f5f7',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '450px',
          width: '100%'
        }}>
          <h1 style={{
            fontFamily: 'Times New Roman, serif',
            color: '#27ae60',
            fontSize: '32px',
            marginBottom: '8px'
          }}>ExploreBD</h1>
          <h2 style={{ fontSize: '18px', color: '#374151', marginBottom: '24px' }}>
            Booking & Safety Management
          </h2>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '28px' }}>
            Please select your account portal to continue:
          </p>
          <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
            <button
              onClick={() => handleSelectRole('USER')}
              style={{
                backgroundColor: '#27ae60',
                color: '#ffffff',
                border: 'none',
                padding: '14px',
                fontSize: '16px',
                fontWeight: 'bold',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              I am a User
            </button>
            <button
              onClick={() => handleSelectRole('GUIDE')}
              style={{
                backgroundColor: '#374151',
                color: '#ffffff',
                border: 'none',
                padding: '14px',
                fontSize: '16px',
                fontWeight: 'bold',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              I am a Guide
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="explorebd-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div>
          <div className="sidebar-brand">ExploreBD</div>
          <ul className="sidebar-nav">
            {userRole === 'USER' && (
              <>
                <li
                  className={activeTab === 'USER_CANCEL' ? 'active' : ''}
                  onClick={() => { setActiveTab('USER_CANCEL'); setMessage(''); }}
                >
                  • Cancel Booking
                </li>
                <li
                  className={activeTab === 'REFUND' ? 'active' : ''}
                  onClick={() => { setActiveTab('REFUND'); setMessage(''); }}
                >
                  • Refund
                </li>
              </>
            )}

            {userRole === 'GUIDE' && (
              <li
                className={activeTab === 'GUIDE_CANCEL' ? 'active' : ''}
                onClick={() => { setActiveTab('GUIDE_CANCEL'); setMessage(''); }}
              >
                • Cancel Booking
              </li>
            )}

            <li
              className={activeTab === 'CLAIM' ? 'active' : ''}
              style={{ color: activeTab === 'CLAIM' ? '#ffffff' : '#ffeb3b', fontWeight: 'bold' }}
              onClick={() => { setActiveTab('CLAIM'); setMessage(''); }}
            >
              • 🚨 SOS Support Center
            </li>
          </ul>
        </div>

        <div className="sidebar-footer">
          <p style={{ marginBottom: '8px', fontWeight: 'bold' }}>
            Portal: {userRole === 'USER' ? 'User Portal' : 'Guide Portal'}
          </p>
          <button
            onClick={() => setUserRole(null)}
            style={{
              backgroundColor: '#ffffff',
              color: '#1f2937',
              border: 'none',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              borderRadius: '2px',
              width: '100%'
            }}
          >
            ← Switch Role
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="header-bar">
          <div className="header-title">
            <h1>Booking & Safety Management Dashboard</h1>
            <h2>
              {activeTab === 'USER_CANCEL' && 'CANCEL BOOKING'}
              {activeTab === 'GUIDE_CANCEL' && 'CANCEL BOOKING'}
              {activeTab === 'REFUND' && userRole === 'USER' && 'REFUND REQUEST'}
              {activeTab === 'CLAIM' && 'SOS SUPPORT CENTER'}
            </h2>
          </div>
        </header>

        {message && (
          <div style={{
            backgroundColor: message.includes('🚨') ? '#ef4444' : '#e2cc00',
            color: message.includes('🚨') ? '#ffffff' : '#1f2937',
            padding: '10px 14px',
            marginBottom: '20px',
            fontWeight: 'bold',
            borderRadius: '4px'
          }}>
            {message}
          </div>
        )}

        <div className="content-grid">
          {/* USER CANCEL BOOKING FORM */}
          {activeTab === 'USER_CANCEL' && userRole === 'USER' && (
            <form onSubmit={handleUserSubmit} className="form-card">
              <div className="form-group">
                <label className="form-label">BOOKING ID</label>
                <input
                  className="form-input"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">SCHEDULED TOUR DATE</label>
                <input
                  className="form-input"
                  type="datetime-local"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">CANCELLATION REASON</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-primary">Cancel Booking</button>
            </form>
          )}

          {/* GUIDE CANCEL FORM */}
          {activeTab === 'GUIDE_CANCEL' && userRole === 'GUIDE' && (
            <form onSubmit={handleGuideSubmit} className="form-card">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">GUIDE NAME</label>
                  <input
                    className="form-input"
                    value={guideName}
                    onChange={(e) => setGuideName(e.target.value)}
                    placeholder="Enter Guide Name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">GUIDE ID</label>
                  <input
                    className="form-input"
                    value={guideId}
                    onChange={(e) => setGuideId(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">BOOKING ID</label>
                <input
                  className="form-input"
                  value={guideBookingId}
                  onChange={(e) => setGuideBookingId(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">SCHEDULED TOUR DATE</label>
                <input
                  className="form-input"
                  type="datetime-local"
                  value={guideBookingDate}
                  onChange={(e) => setGuideBookingDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">REASON FOR CANCELLATION</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  value={guideReason}
                  onChange={(e) => setGuideReason(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-primary">Process Cancellation</button>
            </form>
          )}

          {/* REFUND FORM (USER ONLY) */}
          {activeTab === 'REFUND' && userRole === 'USER' && (
            <form onSubmit={handleRefundSubmit} className="form-card">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">BOOKING ID</label>
                  <input
                    className="form-input"
                    value={refundBookingId}
                    onChange={(e) => setRefundBookingId(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">REFUND AMOUNT (TK)</label>
                  <input
                    className="form-input"
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">PAYMENT CHANNEL</label>
                  <select
                    className="form-select"
                    value={paymentChannel}
                    onChange={(e) => setPaymentChannel(e.target.value)}
                  >
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Rocket">Rocket</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">ACCOUNT / PHONE NUMBER</label>
                  <input
                    className="form-input"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">REFUND REASON</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-primary">Process Refund Request</button>
            </form>
          )}

          {/* URGENT SOS SUPPORT CENTER FORM */}
          {activeTab === 'CLAIM' && (
            <form
              onSubmit={handleClaimSubmit}
              className="form-card"
              style={{
                borderLeft: '6px solid #dc2626',
                backgroundColor: '#fff5f5'
              }}
            >
              <div style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                padding: '10px 14px',
                borderRadius: '4px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                  🚨 URGENT SAFETY & DISPUTE SOS
                </span>
                <span style={{ fontSize: '11px', background: '#991b1b', padding: '2px 8px', borderRadius: '2px', fontWeight: 'bold' }}>
                  EMERGENCY DISPATCH
                </span>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" style={{ color: '#dc2626' }}>CLAIM / EMERGENCY CATEGORY</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {userRole === 'USER' ? (
                      <>
                        <option value="NO_SHOW">🚨 Guide No-Show</option>
                        <option value="INCOMPLETE_TOUR">⚠️ Incomplete Tour</option>
                        <option value="SERVICE_QUALITY_ISSUE">⚠️ Quality Concern</option>
                        <option value="SAFETY_CONCERN">🚨 Immediate Safety Threat</option>
                      </>
                    ) : (
                      <>
                        <option value="USER_NO_SHOW">🚨 User No-Show</option>
                        <option value="MEDICAL_EMERGENCY">🚑 Medical Emergency</option>
                        <option value="SAFETY_THREAT">🚨 Immediate Safety Threat</option>
                        <option value="PAYMENT_DISPUTE">⚠️ Payment Dispute</option>
                        <option value="WEATHER_HAZARD">🌧️ Extreme Weather / Route Hazard</option>
                        <option value="OTHER">⚠️ Other Emergency</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#dc2626' }}>CONTACT NUMBER</label>
                  <input
                    className="form-input"
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#dc2626' }}>
                  {userRole === 'USER' ? 'USER ID' : 'GUIDE ID'}
                </label>
                <input
                  className="form-input"
                  value={userRole === 'USER' ? requesterId : guideId}
                  readOnly
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#dc2626' }}>DETAILS</label>
                <textarea
                  className="form-textarea"
                  rows="4"
                  value={claimDetails}
                  onChange={(e) => setClaimDetails(e.target.value)}
                  placeholder="Describe the urgent emergency, dispute, or issue..."
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 24px',
                  fontWeight: 'bold',
                  fontSize: '15px',
                  cursor: 'pointer',
                  borderRadius: '2px',
                  width: '100%'
                }}
              >
                Process SOS request
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}