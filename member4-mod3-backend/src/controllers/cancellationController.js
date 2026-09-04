import {
  processTouristCancellation,
  processGuideCancellation,
  submitCompensationClaim,
  resolveCompensationByAdmin,
  fetchRequests,
  submitSosRequest
} from '../services/cancellationService.js';

export const handleTouristCancellation = async (req, res) => {
  try {
    const data = await processTouristCancellation(req.body);
    res.status(200).json({ success: true, message: 'Tourist cancellation processed.', data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const handleGuideCancellation = async (req, res) => {
  try {
    const data = await processGuideCancellation(req.body);
    res.status(200).json({ success: true, message: 'Guide cancellation processed.', data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const handleCompensationClaim = async (req, res) => {
  try {
    const data = await submitCompensationClaim(req.body);
    res.status(201).json({ success: true, message: 'Compensation claim submitted for platform policy evaluation.', data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const handleSosRequest = async (req, res) => {
  try {
    const data = await submitSosRequest(req.body);
    res.status(201).json({ success: true, message: '🚨 URGENT SOS ALERT SENT! Safety dispatch team has been notified.', data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const handleAdminResolve = async (req, res) => {
  try {
    const data = await resolveCompensationByAdmin(req.body);
    res.status(200).json({ success: true, message: 'Compensation claim status updated by admin.', data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const handleGetRequests = async (req, res) => {
  try {
    const data = await fetchRequests(req.query);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};