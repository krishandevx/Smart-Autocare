import { Request, Response } from 'express';
import { Appointment } from '../models';
import { nextId } from '../utils/idGenerator';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination, paginate, sortOptions } from '../utils/pagination';
import { assertOwnOrStaff, isStaffRole } from '../utils/access';

const pop = [
  { path: 'customer', select: 'name email phone' },
  { path: 'vehicle', select: 'regNumber brand model type category' },
  { path: 'service', select: 'name category' },
  { path: 'serviceAdvisor', select: 'name' },
  { path: 'mechanic', select: 'name' },
  { path: 'booking', select: 'bookingId status' },
];

export const listAppointments = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter: any = {};
  if (!isStaffRole(req.user?.role)) filter.customer = req.user?._id;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.customer) filter.customer = req.query.customer;
  if (req.query.vehicle) filter.vehicle = req.query.vehicle;
  if (req.query.service) filter.service = req.query.service;
  if (req.query.mechanic) filter.mechanic = req.query.mechanic;
  if (req.query.from || req.query.to) {
    filter.date = {};
    if (req.query.from) filter.date.$gte = new Date(req.query.from as string);
    if (req.query.to) filter.date.$lte = new Date(req.query.to as string);
  }
  const [docs, total] = await Promise.all([
    Appointment.find(filter).sort(sortOptions(req.query, '-date')).skip(skip).limit(limit).populate(pop),
    Appointment.countDocuments(filter),
  ]);
  res.json({ success: true, data: paginate(docs, total, page, limit) });
});

export const createAppointment = asyncHandler(async (req: Request, res: Response) => {
  const customer = isStaffRole(req.user?.role) ? req.body.customer || req.user?._id : req.user?._id;
  const doc = await Appointment.create({ ...req.body, customer, appointmentId: await nextId('appointment') });
  res.status(201).json({ success: true, message: 'Appointment created', data: doc });
});

export const getAppointment = asyncHandler(async (req: Request, res: Response) => {
  const a = await Appointment.findById(req.params.id).populate(pop);
  if (!a) throw new ApiError(404, 'Appointment not found');
  assertOwnOrStaff(req, String(a.customer), 'appointment');
  res.json({ success: true, data: a });
});

export const updateAppointment = asyncHandler(async (req: Request, res: Response) => {
  const a = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(pop);
  if (!a) throw new ApiError(404, 'Appointment not found');
  res.json({ success: true, message: 'Appointment updated', data: a });
});

export const deleteAppointment = asyncHandler(async (req: Request, res: Response) => {
  await Appointment.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Appointment deleted' });
});