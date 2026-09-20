import { Request, Response } from 'express';
import { Vehicle } from '../models';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination, paginate, sortOptions } from '../utils/pagination';
import { assertOwnOrStaff, isStaffRole } from '../utils/access';

export const listVehicles = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter: any = {};

  if (!isStaffRole(req.user?.role)) filter.owner = req.user?._id;
  else {
    if (req.query.owner) filter.owner = req.query.owner as string;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.fuelType) filter.fuelType = req.query.fuelType;
    if (req.query.q) {
      const q = new RegExp(String(req.query.q), 'i');
      filter.$or = [{ brand: q }, { model: q }, { regNumber: q }, { vin: q }];
    }
  }

  const [docs, total] = await Promise.all([
    Vehicle.find(filter).sort(sortOptions(req.query, '-createdAt')).skip(skip).limit(limit).populate('owner', 'name email phone'),
    Vehicle.countDocuments(filter),
  ]);
  res.json({ success: true, data: paginate(docs, total, page, limit) });
});

export const getVehicle = asyncHandler(async (req: Request, res: Response) => {
  const v = (await Vehicle.findById(req.params.id).populate('owner', 'name email phone').lean()) as any;
  if (!v) throw new ApiError(404, 'Vehicle not found');
  assertOwnOrStaff(req, v.owner?._id as string, 'vehicle');
  res.json({ success: true, data: v });
});

export const createVehicle = asyncHandler(async (req: Request, res: Response) => {
  const owner = isStaffRole(req.user?.role) && req.body.owner ? req.body.owner : req.user?._id;
  const doc = await Vehicle.create({ ...req.body, owner });
  res.status(201).json({ success: true, message: 'Vehicle added to your garage', data: doc });
});

export const updateVehicle = asyncHandler(async (req: Request, res: Response) => {
  const v = await Vehicle.findById(req.params.id);
  if (!v) throw new ApiError(404, 'Vehicle not found');
  assertOwnOrStaff(req, String(v.owner), 'vehicle');
  Object.assign(v, req.body);
  await v.save();
  res.json({ success: true, message: 'Vehicle updated', data: v });
});

export const deleteVehicle = asyncHandler(async (req: Request, res: Response) => {
  const v = await Vehicle.findById(req.params.id);
  if (!v) throw new ApiError(404, 'Vehicle not found');
  assertOwnOrStaff(req, String(v.owner), 'vehicle');
  await v.deleteOne();
  res.json({ success: true, message: 'Vehicle deleted' });
});