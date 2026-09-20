import { Router } from 'express';
import { customerDashboard } from '../controllers/dashboard.controller';
import {
  myNotifications, unreadCount, markRead, markAllRead, deleteNotification,
} from '../controllers/notification.controller';
import { listServiceRecords, getServiceRecord } from '../controllers/record.controller';
import {
  listEstimates, getEstimate, decideEstimate,
} from '../controllers/estimate.controller';
import { vehicleHealth } from '../controllers/inspection.controller';
import {
  listReminders, createReminder, updateReminder, deleteReminder, refreshReminderStatuses,
} from '../controllers/admin.controller';
import { Review, Booking } from '../models';
import { protect } from '../middlewares/auth';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middlewares/validate';
import { reviewSchema, reminderSchema } from '../validators';

const router = Router();
router.use(protect);

router.get('/dashboard', customerDashboard);

router.get('/notifications', myNotifications);
router.get('/notifications/unread', unreadCount);
router.put('/notifications/read-all', markAllRead);
router.put('/notifications/:id/read', markRead);
router.delete('/notifications/:id', deleteNotification);

router.get('/service-records', listServiceRecords);
router.get('/service-records/:id', getServiceRecord);

router.get('/estimates', listEstimates);
router.get('/estimates/:id', getEstimate);
router.post('/estimates/:id/decision', asyncHandler(async (req: any, res: any) => {
  const r = require('../validators').estimateDecisionSchema.safeParse(req.body);
  if (!r.success) return res.status(400).json({ success: false, message: r.error.errors[0]?.message });
  req.body = r.data;
  return decideEstimate(req, res);
}));

router.get('/reminders', asyncHandler(async (req: any, res: any) => {
  await refreshReminderStatuses();
  req.query.customer = req.user._id;
  return listReminders(req, res);
}));
router.post('/reminders', asyncHandler(async (req: any, res: any) => {
  const r = reminderSchema.safeParse(req.body);
  if (!r.success) return res.status(400).json({ success: false, message: r.error.errors[0]?.message });
  req.body = r.data;
  return createReminder(req, res);
}));
router.put('/reminders/:id', asyncHandler(async (req: any, res: any) => {
  const r = reminderSchema.safeParse(req.body);
  if (!r.success) return res.status(400).json({ success: false, message: r.error.errors[0]?.message });
  req.body = r.data;
  return updateReminder(req, res);
}));
router.delete('/reminders/:id', deleteReminder);

router.get('/vehicles/:id/health', vehicleHealth);

router.post('/reviews', asyncHandler(async (req: any, res: any) => {
  const r = reviewSchema.safeParse(req.body);
  if (!r.success) return res.status(400).json({ success: false, message: r.error.errors[0]?.message });
  const { booking, ...rest } = r.data;
  if (booking) {
    const b = await Booking.findById(booking);
    if (!b) throw new ApiError(404, 'Booking not found');
    if (String(b.customer) !== String(req.user._id)) throw new ApiError(403, 'You can only review your own bookings');
    if (!['Completed', 'Closed'].includes(b.status)) throw new ApiError(400, 'Review can only be submitted after service completion');
  }
  const doc = await Review.create({ customer: req.user._id, booking: booking || null, ...rest, status: 'Pending' });
  res.status(201).json({ success: true, message: 'Thank you! Your review has been submitted.', data: doc });
}));

export default router;