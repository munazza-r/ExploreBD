import express from 'express';
import {
  handleTouristCancellation,
  handleGuideCancellation,
  handleCompensationClaim,
  handleAdminResolve,
  handleGetRequests,
  handleSosRequest
} from '../controllers/cancellationController.js';

const router = express.Router();

// Tourist cancels booking
router.post('/cancel/tourist', handleTouristCancellation);

// Guide cancels booking (Refund or Reassignment)
router.post('/cancel/guide', handleGuideCancellation);

// Submit compensation claim (No-show, service issue, safety, etc.)
router.post('/compensation/request', handleCompensationClaim);

// Submit SOS emergency support claim (New SosRequest table)
router.post('/sos/request', handleSosRequest);

// Admin resolves compensation claim
router.post('/compensation/admin-resolve', handleAdminResolve);

// Get all requests
router.get('/requests', handleGetRequests);

export default router;