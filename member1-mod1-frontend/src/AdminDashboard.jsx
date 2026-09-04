import React, { useState, useEffect } from 'react';
import './Verification.css';
import { CheckCircle2, XCircle, Clock } from "lucide-react";

const API_BASE = "http://localhost:1661/api/verification";

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_BASE}/all`);
      const data = await res.json();
      if (res.ok) setRequests(data.data);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (id, status) => {
    try {
      await fetch(`${API_BASE}/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      fetchRequests();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const statusBadge = (status) => {
    if (status === "APPROVED") return <span style={{color:"#22c55e", fontWeight:600, display:"flex", alignItems:"center", gap:4}}><CheckCircle2 size={16}/> Approved</span>;
    if (status === "REJECTED") return <span style={{color:"#dc2626", fontWeight:600, display:"flex", alignItems:"center", gap:4}}><XCircle size={16}/> Rejected</span>;
    return <span style={{color:"#d97706", fontWeight:600, display:"flex", alignItems:"center", gap:4}}><Clock size={16}/> Pending</span>;
  };

  return (
    <div className="main-content" style={{flexDirection:"column", alignItems:"center"}}>
      <div className="verification-card" style={{maxWidth:900}}>
        <h2>Admin — Guide Verification Requests</h2>

        {loading ? (
          <p>Loading requests...</p>
        ) : requests.length === 0 ? (
          <p>No verification requests yet.</p>
        ) : (
          <table style={{width:"100%", borderCollapse:"collapse"}}>
            <thead>
              <tr style={{textAlign:"left", borderBottom:"2px solid var(--border-light)"}}>
                <th style={{padding:"10px"}}>University</th>
                <th style={{padding:"10px"}}>Student ID</th>
                <th style={{padding:"10px"}}>ID Card</th>
                <th style={{padding:"10px"}}>NID/Passport</th>
                <th style={{padding:"10px"}}>Status</th>
                <th style={{padding:"10px"}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} style={{borderBottom:"1px solid var(--border-light)"}}>
                  <td style={{padding:"10px"}}>{r.universityName}</td>
                  <td style={{padding:"10px"}}>{r.studentIdNumber}</td>
                  <td style={{padding:"10px"}}>
                    <a href={`http://localhost:1661/attachments/${r.studentIdCardUrl}`} target="_blank" rel="noreferrer">
                      <img
                        src={`http://localhost:1661/attachments/${r.studentIdCardUrl}`}
                        alt="Student ID"
                        style={{width:60, height:40, objectFit:"cover", borderRadius:4, border:"1px solid var(--border-light)"}}
                      />
                    </a>
                  </td>
                  <td style={{padding:"10px"}}>
                    <a href={`http://localhost:1661/attachments/${r.nidOrPassportUrl}`} target="_blank" rel="noreferrer">
                      <img
                        src={`http://localhost:1661/attachments/${r.nidOrPassportUrl}`}
                        alt="NID/Passport"
                        style={{width:60, height:40, objectFit:"cover", borderRadius:4, border:"1px solid var(--border-light)"}}
                      />
                    </a>
                  </td>
                  <td style={{padding:"10px"}}>{statusBadge(r.status)}</td>
                  <td style={{padding:"10px", display:"flex", gap:8}}>
                    <button
                      className="submit-btn"
                      style={{width:"auto", padding:"8px 14px", background:"#22c55e"}}
                      onClick={() => handleAction(r.id, "APPROVED")}
                      disabled={r.status === "APPROVED"}
                    >
                      Approve
                    </button>
                    <button
                      className="submit-btn"
                      style={{width:"auto", padding:"8px 14px", background:"#dc2626"}}
                      onClick={() => handleAction(r.id, "REJECTED")}
                      disabled={r.status === "REJECTED"}
                    >
                      Reject
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

export default AdminDashboard;