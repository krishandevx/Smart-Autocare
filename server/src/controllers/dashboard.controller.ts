import { Request, Response } from 'express';
import { Booking, Vehicle, Invoice, Reminder, Inspection, ServiceRecord } from '../models';
import { asyncHandler } from '../utils/asyncHandler';

export const customerDashboard = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user?._id;
  const now = new Date();

  const [vehicles, bookings, invoices, reminders] = await Promise.all([
    Vehicle.find({ owner: uid }).sort('-createdAt'),
    Booking.find({ customer: uid }).sort('-createdAt').limit(8).populate('vehicle', 'regNumber brand model'),
    Invoice.find({ customer: uid }).sort('-issuedDate').limit(8).populate('vehicle', 'regNumber brand model').populate('jobCard', 'jobCardId'),
    Reminder.find({ customer: uid }).sort('dueDate'),
  ]);

  const upcoming = bookings.find(
    (b) => b.status === 'Confirmed' || b.status === 'Requested' || b.status === 'Rescheduled' || (b.status === 'Requested' && b.scheduledDate >= now),
  );
  const active = bookings.find((b) =>
    ['Vehicle Pickup', 'Vehicle Received', 'Inspection', 'Estimate Pending', 'Awaiting Customer Approval', 'Service In Progress', 'Quality Check', 'Ready for Delivery'].includes(b.status),
  );

  const totalSpend = await Invoice.aggregate([
    { $match: { customer: Object(uid as string), paymentStatus: { $nin: ['Void'] } } },
    { $group: { _id: null, paid: { $sum: '$paidAmount' }, pending: { $sum: '$remaining' } } },
  ]);

  const vehiclesWithHealth = await Promise.all(
    vehicles.map(async (v) => {
      const latest = (await Inspection.findOne({ vehicle: v._id, status: 'Completed' }).sort({ updatedAt: -1 }).lean()) as any;
      const lastService = (await ServiceRecord.findOne({ vehicle: v._id }).sort({ date: -1 }).lean()) as any;
      return {
        ...v.toObject(),
        healthScore: latest?.healthScore ?? null,
        lastServiceDate: lastService?.date ?? null,
        lastServiceId: lastService?._id ?? null,
      };
    }),
  );

  const invoicesWithStatus = invoices.map((i) => ({ _id: i._id, invoiceNumber: i.invoiceNumber, grandTotal: i.grandTotal, paidAmount: i.paidAmount, remaining: i.remaining, paymentStatus: i.paymentStatus, issuedDate: i.issuedDate, vehicle: i.vehicle, jobCard: i.jobCard }));

  res.json({
    success: true,
    data: {
      vehicleCount: vehicles.length,
      upcoming,
      active,
      totalSpend: totalSpend[0]?.paid || 0,
      pendingPayments: totalSpend[0]?.pending || 0,
      recentBookings: bookings,
      invoices: invoicesWithStatus,
      reminders,
      vehicles: vehiclesWithHealth,
    },
  });
});