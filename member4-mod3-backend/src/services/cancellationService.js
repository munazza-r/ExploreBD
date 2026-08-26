import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const processTouristCancellation = async (data) => {
  return await prisma.cancellationRequest.create({
    data: {
      requestKind: 'CANCELLATION',
      initiatedBy: 'TOURIST',
      bookingId: data.bookingId,
      requesterId: data.requesterId,
      reason: data.reason,
      bookingDate: new Date(data.bookingDate),
      totalPrice: parseFloat(data.totalPrice)
    }
  });
};

export const processGuideCancellation = async (data) => {
  return await prisma.cancellationRequest.create({
    data: {
      requestKind: 'CANCELLATION',
      initiatedBy: 'GUIDE',
      bookingId: data.bookingId,
      requesterId: data.requesterId,
      reason: data.reason,
      bookingDate: new Date(data.bookingDate),
      totalPrice: parseFloat(data.totalPrice || 0),
      resolutionType: data.resolutionType
    }
  });
};

export const submitCompensationClaim = async (data) => {
  return await prisma.cancellationRequest.create({
    data: {
      requestKind: 'COMPENSATION_CLAIM',
      initiatedBy: data.initiatedBy === 'USER' ? 'TOURIST' : 'GUIDE',
      bookingId: data.bookingId,
      requesterId: data.requesterId,
      reason: data.reason,
      bookingDate: new Date(data.bookingDate || Date.now()),
      totalPrice: parseFloat(data.totalPrice || 0),
      category: data.category,
      claimAmount: data.claimAmount ? parseFloat(data.claimAmount) : null
    }
  });
};

export const submitSosRequest = async (payload) => {
  const { bookingId, initiatedBy, requesterId, category, contactNumber, claimDetails } = payload;

  return await prisma.sosRequest.create({
    data: {
      bookingId,
      initiatedBy,
      requesterId,
      category,
      contactNumber,
      claimDetails
    }
  });
};

export const resolveCompensationByAdmin = async (data) => {
  const { requestId, status, resolvedBy } = data;
  return await prisma.cancellationRequest.update({
    where: { id: requestId },
    data: {
      status,
      resolvedBy,
      resolvedAt: new Date()
    }
  });
};

export const fetchRequests = async (query) => {
  return await prisma.cancellationRequest.findMany({
    where: query,
    orderBy: { createdAt: 'desc' }
  });
};