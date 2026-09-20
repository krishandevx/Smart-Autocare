import { Request, Response } from 'express';
import { ServiceRecord, Booking } from '../models';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination, paginate, sortOptions } from '../utils/pagination';
import { assertOwnOrStaff, isStaffRole } from '../utils/access';

export const listServiceRecords = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter: any = {};
  if (!isStaffRole(req.user?.role)) filter.customer = req.user?._id;
  if (req.query.vehicle) filter.vehicle = req.query.vehicle;
  if (req.query.branch) filter.customer = req.query.branch;
  const [docs, total] = await Promise.all([
    ServiceRecord.find(filter)
      .sort(sortOptions(req.query, '-date')).skip(skip).limit(limit)
      .populate('vehicle', 'regNumber brand model type category')
      .populate('jobCard', 'jobCardId status'),
    ServiceRecord.countDocuments(filter),
  ]);
  res.json({ success: true, data: paginate(docs, total, page, limit) });
});

export const getServiceRecord = asyncHandler(async (req: Request, res: Response) => {
  const rec = await ServiceRecord.findById(req.params.id)
    .populate('vehicle', 'regNumber brand model type category year fuelType')
    .populate('jobCard', 'jobCardId status')
    .populate('booking', 'bookingId status');
if (!rec) throw new ApiError(404, 'Service record not found');
  assertOwnOrStaff(req, String(rec.customer), 'record');
  res.json({ success: true, data: rec });
});