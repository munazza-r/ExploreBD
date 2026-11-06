const prisma = require("../prisma");

async function processTouristCancellation(data, requesterId) {
  return prisma.cancellationRequest.create({
    data: {
      requestKind: "CANCELLATION",
      initiatedBy: "TOURIST",
      bookingId: data.bookingId,
      requesterId,
      reason: data.reason,
      bookingDate: new Date(data.bookingDate),
      totalPrice: parseFloat(data.totalPrice),
    },
  });
}

async function processGuideCancellation(data, requesterId) {
  return prisma.cancellationRequest.create({
    data: {
      requestKind: "CANCELLATION",
      initiatedBy: "GUIDE",
      bookingId: data.bookingId,
      requesterId,
      reason: data.reason,
      bookingDate: new Date(data.bookingDate),
      totalPrice: parseFloat(data.totalPrice || 0),
      resolutionType: data.resolutionType,
      suggestedGuideId: data.suggestedGuideId,
      suggestedGuideName: data.suggestedGuideName,
    },
  });
}

async function submitCompensationClaim(data, requesterId, initiatedBy) {
  return prisma.cancellationRequest.create({
    data: {
      requestKind: "COMPENSATION_CLAIM",
      initiatedBy,
      bookingId: data.bookingId,
      requesterId,
      reason: data.reason,
      bookingDate: new Date(data.bookingDate || Date.now()),
      totalPrice: parseFloat(data.totalPrice || 0),
      category: data.category,
      claimAmount: data.claimAmount ? parseFloat(data.claimAmount) : null,
    },
  });
}

async function submitSosRequest(data, requesterId, initiatedBy) {
  const { bookingId, category, contactNumber, claimDetails } = data;
  return prisma.sosRequest.create({
    data: { bookingId, initiatedBy, requesterId, category, contactNumber, claimDetails },
  });
}

async function resolveCompensationByAdmin({ requestId, status, resolvedBy }) {
  return prisma.cancellationRequest.update({
    where: { id: requestId },
    data: { status, resolvedBy, resolvedAt: new Date() },
  });
}

async function fetchRequests(query) {
  return prisma.cancellationRequest.findMany({ where: query, orderBy: { createdAt: "desc" } });
}

async function fetchMyRequests(requesterId) {
  const [cancellations, sos] = await Promise.all([
    prisma.cancellationRequest.findMany({ where: { requesterId }, orderBy: { createdAt: "desc" } }),
    prisma.sosRequest.findMany({ where: { requesterId }, orderBy: { createdAt: "desc" } }),
  ]);
  return { cancellations, sos };
}

async function fetchAllSosRequests() {
    return prisma.sosRequest.findMany({ orderBy: { createdAt: "desc" } });
}

module.exports = {
    processTouristCancellation, processGuideCancellation, submitCompensationClaim,
    submitSosRequest, resolveCompensationByAdmin, fetchRequests, fetchMyRequests, fetchAllSosRequests,
};