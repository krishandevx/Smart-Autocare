import { Request, Response } from 'express';
import { Service, Review, Settings, Booking } from '../models';
import { asyncHandler } from '../utils/asyncHandler';
import {
  VEHICLE_TYPES, VEHICLE_CATEGORIES, FUEL_TYPES, TRANSMISSIONS,
  SERVICE_CATEGORIES, BOOKING_STATUSES, JOB_STATUSES, ESTIMATE_STATUSES,
  INVOICE_STATUSES, PAYMENT_METHODS, INSPECTION_SECTIONS, ROLES,
} from '../constants';

export const publicServices = asyncHandler(async (req: Request, res: Response) => {
  const filter: any = { isActive: true };
  if (req.query.category) filter.category = req.query.category;
  const docs = await Service.find(filter).sort({ category: 1, name: 1 });
  res.json({ success: true, data: docs });
});

export const publicMeta = asyncHandler(async (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: { VEHICLE_TYPES, VEHICLE_CATEGORIES, FUEL_TYPES, TRANSMISSIONS, SERVICE_CATEGORIES },
  });
});

export const statusMeta = asyncHandler(async (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: { BOOKING_STATUSES, JOB_STATUSES, ESTIMATE_STATUSES, INVOICE_STATUSES, PAYMENT_METHODS, INSPECTION_SECTIONS, ROLES },
  });
});

export const publicSettings = asyncHandler(async (_req: Request, res: Response) => {
  const s = await Settings.findOne({ key: 'default' }).lean();
  res.json({ success: true, data: s });
});

export const publicReviews = asyncHandler(async (_req: Request, res: Response) => {
  const reviews = await Review.find({ status: 'Published' }).sort('-createdAt').limit(12).populate('customer', 'name');
  res.json({ success: true, data: reviews });
});

export const timeSlots = asyncHandler(async (req: Request, res: Response) => {
  const s = await Settings.findOne({ key: 'default' });
  const { open = '09:00', close = '19:00', slotDuration = 60 } = s?.businessHours || {};
  const date = req.query.date ? new Date(req.query.date as string) : new Date();
  const day = date.getDay();
  const workingDays = s?.businessHours?.days || [1, 2, 3, 4, 5, 6];
  if (!workingDays.includes(day)) {
    return res.json({ success: true, data: { available: false, slots: [], message: 'Workshop is closed on this day' } });
  }
  const holiday = (s?.holidays || []).some((h: Date) => new Date(h).toDateString() === date.toDateString());
  if (holiday) return res.json({ success: true, data: { available: false, slots: [], message: 'Workshop is closed (holiday)' } });

  const booked = await Booking.find(findBookedSlots(date)).distinct('timeSlot');
  const slots: string[] = [];
  const [h1, m1] = open.split(':').map(Number);
  const [h2, m2] = close.split(':').map(Number);
  let cur = h1 * 60 + m1;
  const end = h2 * 60 + m2;
  while (cur + slotDuration <= end) {
    const s = `${String(Math.floor(cur / 60)).padStart(2, '0')}:${String(cur % 60).padStart(2, '0')}`;
    if (!booked.includes(s)) slots.push(s);
    cur += slotDuration;
  }
  res.json({ success: true, data: { available: true, slots, message: '' } });
});

function findBookedSlots(date: Date): any {
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayEnd = new Date(dayStart.getTime() + 24 * 3600 * 1000);
  return {
    scheduledDate: { $gte: dayStart, $lte: dayEnd },
    status: { $nin: ['Cancelled', 'Closed', 'Completed'] },
  };
}