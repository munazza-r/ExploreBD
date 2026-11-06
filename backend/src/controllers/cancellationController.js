const {
    processTouristCancellation, processGuideCancellation, submitCompensationClaim,
    submitSosRequest, resolveCompensationByAdmin, fetchRequests, fetchMyRequests, fetchAllSosRequests,
  } = require("../services/cancellationService");
  
  async function handleTouristCancellation(req, res) {
    try {
      const data = await processTouristCancellation(req.body, req.user.id);
      res.status(200).json({ success: true, message: "Tourist cancellation processed.", data });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
  
  async function handleGuideCancellation(req, res) {
    try {
      const data = await processGuideCancellation(req.body, req.user.id);
      res.status(200).json({ success: true, message: "Guide cancellation processed.", data });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
  
  async function handleCompensationClaim(req, res) {
    try {
      const data = await submitCompensationClaim(req.body, req.user.id, req.user.role);
      res.status(201).json({ success: true, message: "Compensation claim submitted for platform policy evaluation.", data });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
  
  async function handleSosRequest(req, res) {
    try {
      const data = await submitSosRequest(req.body, req.user.id, req.user.role);
      res.status(201).json({ success: true, message: "🚨 URGENT SOS ALERT SENT! Safety dispatch team has been notified.", data });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
  
  async function handleAdminResolve(req, res) {
    try {
      const data = await resolveCompensationByAdmin({ ...req.body, resolvedBy: req.user.id });
      res.status(200).json({ success: true, message: "Compensation claim status updated by admin.", data });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
  
  async function handleGetRequests(req, res) {
    try {
      const data = await fetchRequests(req.query);
      res.status(200).json({ success: true, data });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
  
  async function handleGetMyRequests(req, res) {
    try {
      const data = await fetchMyRequests(req.user.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async function handleGetAllSos(req, res) {
    try {
      const data = await fetchAllSosRequests();
      res.status(200).json({ success: true, data });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
  
  module.exports = {
    handleTouristCancellation, handleGuideCancellation, handleCompensationClaim,
    handleSosRequest, handleAdminResolve, handleGetRequests, handleGetMyRequests, handleGetAllSos,
  };