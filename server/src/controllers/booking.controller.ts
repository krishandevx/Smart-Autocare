import { Request, Response } from 'express';
import { Booking, Vehicle, User, Appointment, Service } from '../models';
import { nextId } from '../utils/idGenerator';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination, paginate, sortOptions } from '../utils/pagination';
import { assertOwnOrStaff, isStaffRole } from '../utils/access';
import { pushNotification } from '../services/notification';
import { sendEmail } from '../services/email';
import { BOOKING_STATUSES } from '../constants';

const ORDER = BOOKING_STATUSES.indexOf as (s: string) => number;

function bookingPopulate() {
  return [
    { path: 'customer', select: 'name email phone address' },
    { path: 'vehicle', select: 'regNumber brand model type category year fuelType' },
    { path: 'services', select: 'name category basePrice' },
    { path: 'serviceAdvisor', select: 'name' },
  ];
}

export const listBookings = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter: any = {};
  if (!isStaffRole(req.user?.role)) filter.customer = req.user?._id;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.customer) filter.customer = req.query.customer;
  if (req.query.vehicle) filter.vehicle = req.query.vehicle;
  if (req.query.from || req.query.to) {
    filter.scheduledDate = {};
    if (req.query.from) filter.scheduledDate.$gte = new Date(req.query.from as string);
    if (req.query.to) filter.scheduledDate.$lte = new Date(req.query.to as string);
  }
  if (req.query.q) {
    const q = new RegExp(String(req.query.q), 'i');
    filter.$or = [{ bookingId: q }];
  }

  const [docs, total] = await Promise.all([
    Booking.find(filter).sort(sortOptions(req.query, '-createdAt')).skip(skip).limit(limit).populate(bookingPopulate()),
    Booking.countDocuments(filter),
  ]);
  res.json({ success: true, data: paginate(docs, total, page, limit) });
});

export const getBooking = asyncHandler(async (req: Request, res: Response) => {
  const b = await Booking.findById(req.params.id).populate(bookingPopulate());
  if (!b) throw new ApiError(404, 'Booking not found');
  assertOwnOrStaff(req, String(b.customer), 'booking');
  res.json({ success: true, data: b });
});

export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  const { vehicle, services, scheduledDate, timeSlot, pickup, issueDescription, photos } = req.body;
  const doc = (await Vehicle.findById(vehicle).lean()) as any;
  if (!doc) throw new ApiError(404, 'Vehicle not found');
  assertOwnOrStaff(req, String(doc.owner), 'vehicle');

  const servicesMeta = await Service.find({ _id: { $in: services } }).lean();

  const bookingId = await nextId('booking');
  const booking = await Booking.create({
    bookingId,
    customer: req.user?._id,
    vehicle,
    services,
    serviceName: servicesMeta.map((s: any) => s.name).join(', '),
    scheduledDate,
    timeSlot,
    pickup: pickup || { enabled: false, mode: 'Workshop Visit' },
    issueDescription,
    photos: photos || [],
    status: 'Requested',
    statusHistory: [{ status: 'Requested', at: new Date() }],
  });

  await Appointment.create({
    appointmentId: await nextId('appointment'),
    booking: booking._id,
    customer: req.user?._id,
    vehicle,
    service: services[0] || null,
    date: scheduledDate,
    timeSlot,
    status: 'Scheduled',
  });

  pushNotification({
    user: String(req.user?._id),
    type: 'booking_confirmed',
    title: 'Booking Request Received',
    message: `Your booking ${bookingId} is confirmed. We'll contact you shortly.`,
    link: `/account/current-service`,
    data: { bookingId: booking._id },
  });

  const customer = (await User.findById(req.user?._id).lean()) as any;
  if (customer) {
    sendEmail({
      to: customer.email,
      subject: `Booking Confirmed — ${bookingId}`,
      template: 'bookingConfirmation',
      data: {
        subject: `Booking Confirmed — ${bookingId}`,
        name: customer.name,
        message: `Your ${booking.serviceName} for ${doc.brand} ${doc.model} is scheduled for ${new Date(scheduledDate).toLocaleDateString()} at ${timeSlot}.`,
        cta: 'View Booking',
        link: `${req.protocol}://${req.get('host')}/account/current-service`,
      },
    });
  }

  res.status(201).json({ success: true, message: 'Booking created', data: { ...booking.toObject(), vehicle: doc, services: servicesMeta } });
});

export const updateBookingStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status, notes } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found');

  const fromIdx = ORDER(booking.status);
  const toIdx = ORDER(status);
  const isStaff = isStaffRole(req.user?.role);

  if (!isStaff && !['Cancelled'].includes(status) && toIdx <= fromIdx) {
    throw new ApiError(400, 'Invalid status transition');
  }
  if (isStaff && !BOOKING_STATUSES.includes(status)) throw new ApiError(400, 'Invalid status');

  booking.status = status;
  booking.statusHistory = [...(booking.statusHistory || []), { status, at: new Date() }];
  if (notes) booking.notes = notes;
  await booking.save();

  pushNotification({
    user: String(booking.customer),
    type: 'booking_status',
    title: `Booking ${status}`,
    message: `Your booking ${booking.bookingId} is now "${status}".`,
    link: `/account/current-service`,
    data: { bookingId: booking._id },
  });

  res.json({ success: true, message: `Booking updated to ${status}`, data: booking });
});

export const rescheduleBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found');
  assertOwnOrStaff(req, String(booking.customer), 'booking');
  if (!req.body.scheduledDate && !req.body.timeSlot) throw new ApiError(400, 'Provide a new date or time');
  if (req.body.scheduledDate) booking.scheduledDate = new Date(req.body.scheduledDate);
  if (req.body.timeSlot) booking.timeSlot = req.body.timeSlot;
  booking.status = 'Rescheduled';
  booking.statusHistory = [...(booking.statusHistory || []), { status: 'Rescheduled', at: new Date() }];
  await booking.save();
  await Appointment.findOneAndUpdate({ booking: booking._id }, { date: booking.scheduledDate, timeSlot: booking.timeSlot, status: 'Rescheduled' });
  res.json({ success: true, message: 'Booking rescheduled', data: booking });
});