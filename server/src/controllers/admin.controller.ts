import { Request, Response } from 'express';
import { Booking, User, Vehicle, JobCard, Invoice, ServiceRecord, Employee, Review, Reminder, Part, Settings, Notification, Service, Appointment } from '../models';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination, paginate, sortOptions } from '../utils/pagination';
import * as reports from '../services/report';
import { pushNotification } from '../services/notification';
import { SETTINGS_DEFAULT } from '../constants';

export const dashboard = asyncHandler(async (req: Request, res: Response) => {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    todayAppointments, activeJobs, pendingApprovals, inShopVehicles,
    completedThisMonth, monthInvoices, pendingPayments, lowStockCount,
    newCustomersThisMonth, openBookings, thisMonthRevenue,
  ] = await Promise.all([
    Appointment.countDocuments({ date: { $gte: startOfToday, $lte: new Date(startOfToday.getTime() + 24 * 3600 * 1000) }, status: { $nin: ['Cancelled'] } }),
    JobCard.countDocuments({ status: { $in: ['Open', 'In Inspection', 'Estimate Pending', 'Awaiting Approval', 'In Progress', 'Parts Ordered', 'Quality Check'] } }),
    JobCard.countDocuments({ status: 'Awaiting Approval' }),
    Booking.countDocuments({ status: { $in: ['Vehicle Received', 'Inspection', 'Estimate Pending', 'Awaiting Customer Approval', 'Service In Progress', 'Quality Check'] } }),
    ServiceRecord.countDocuments({ date: { $gte: startOfMonth } }),
    Invoice.countDocuments({ issuedDate: { $gte: startOfMonth } }),
    Invoice.aggregate([{ $match: { remaining: { $gt: 0 } } }, { $group: { _id: null, total: { $sum: '$remaining' } } }]),
    Part.countDocuments({ $expr: { $lte: ['$stock', '$minStock'] } }),
    User.countDocuments({ role: 'customer', createdAt: { $gte: startOfMonth } }),
    Booking.countDocuments({ status: { $nin: ['Completed', 'Closed', 'Cancelled'] } }),
    Invoice.aggregate([{ $match: { paymentStatus: { $nin: ['Void'] } } }, { $group: { _id: null, total: { $sum: '$paidAmount' } } }]),
  ]);

  const revenueSeries = await reports.revenueReport('month');

  res.json({
    success: true,
    data: {
      todayAppointments,
      activeJobs,
      pendingApprovals,
      inShopVehicles,
      completedThisMonth,
      monthInvoices,
      pendingPaymentTotal: pendingPayments[0]?.total || 0,
      lowStockCount,
      newCustomersThisMonth,
      openBookings,
      thisMonthRevenue: thisMonthRevenue[0]?.total || 0,
      revenueSeries: revenueSeries.series,
      revenueTotal: revenueSeries.total,
    },
  });
});

export const listCustomers = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter: any = { role: 'customer' };
  if (req.query.q) {
    const q = new RegExp(String(req.query.q), 'i');
    filter.$or = [{ name: q }, { email: q }, { phone: q }];
  }
  const [docs, total] = await Promise.all([
    User.find(filter).sort(sortOptions(req.query, '-createdAt')).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  const withVehicles = (await Vehicle.aggregate([{ $group: { _id: '$owner', count: { $sum: 1 } } }])) as any[];
  const vMap: Record<string, number> = {};
  withVehicles.forEach((v: any) => (vMap[String(v._id)] = v.count));
  const withBookings = (await Booking.aggregate([{ $group: { _id: '$customer', count: { $sum: 1 } } }])) as any[];
  const bMap: Record<string, number> = {};
  withBookings.forEach((b: any) => (bMap[String(b._id)] = b.count));
  res.json({
    success: true,
    data: paginate(docs.map((d) => ({ ...d, vehicleCount: vMap[String(d._id)] || 0, bookingCount: bMap[String(d._id)] || 0 })), total, page, limit),
  });
});

export const customerDetail = asyncHandler(async (req: Request, res: Response) => {
  const user = (await User.findById(req.params.id).lean()) as any;
  if (!user) throw new ApiError(404, 'Customer not found');
  const [vehicles, bookings, invoices] = await Promise.all([
    Vehicle.find({ owner: user._id }).lean(),
    Booking.find({ customer: user._id }).sort('-createdAt').limit(10).lean(),
    Invoice.find({ customer: user._id }).sort('-issuedDate').limit(10).lean(),
  ]);
  res.json({ success: true, data: { ...user, vehicles, recentBookings: bookings, recentInvoices: invoices } });
});

export const listEmployees = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter: any = {};
  if (req.query.q) filter.name = new RegExp(String(req.query.q), 'i');
  if (req.query.role) {
    const roles = Array.isArray(req.query.role) ? req.query.role.map(String) : [String(req.query.role)];
    if (roles.length === 1) filter.role = roles[0];
    else filter.role = { $in: roles };
  }
  const [docs, total] = await Promise.all([
    Employee.find(filter).sort(sortOptions(req.query, '-createdAt')).skip(skip).limit(limit),
    Employee.countDocuments(filter),
  ]);
  res.json({ success: true, data: paginate(docs, total, page, limit) });
});

export const createEmployee = asyncHandler(async (req: Request, res: Response) => {
  const emp = await Employee.create(req.body);
  res.status(201).json({ success: true, message: 'Employee added', data: emp });
});

export const updateEmployee = asyncHandler(async (req: Request, res: Response) => {
  const emp = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!emp) throw new ApiError(404, 'Employee not found');
  res.json({ success: true, message: 'Employee updated', data: emp });
});

export const deleteEmployee = asyncHandler(async (req: Request, res: Response) => {
  await Employee.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Employee removed' });
});

export const listReviews = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter: any = {};
  if (req.query.status) filter.status = req.query.status;
  const [docs, total] = await Promise.all([
    Review.find(filter).sort('-createdAt').skip(skip).limit(limit).populate('customer', 'name'),
    Review.countDocuments(filter),
  ]);
  res.json({ success: true, data: paginate(docs, total, page, limit) });
});

export const updateReview = asyncHandler(async (req: Request, res: Response) => {
  const r = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!r) throw new ApiError(404, 'Review not found');
  res.json({ success: true, message: 'Review updated', data: r });
});

export const listReminders = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter: any = {};
  if (req.query.customer) filter.customer = req.query.customer;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.vehicle) filter.vehicle = req.query.vehicle;
  const [docs, total] = await Promise.all([
    Reminder.find(filter).sort('dueDate').skip(skip).limit(limit).populate('vehicle', 'brand model regNumber').populate('customer', 'name'),
    Reminder.countDocuments(filter),
  ]);
  res.json({ success: true, data: paginate(docs, total, page, limit) });
});

export async function refreshReminderStatuses(): Promise<number> {
  const now = Date.now();
  const res = await Reminder.updateMany(
    { status: { $in: ['Pending', 'Due Soon'] }, dueDate: { $lt: new Date(now - 7 * 24 * 3600 * 1000) } },
    { status: 'Overdue' },
  );
  await Reminder.updateMany(
    { status: 'Pending', dueDate: { $gte: new Date(now - 7 * 24 * 3600 * 1000), $lte: new Date(now + 7 * 24 * 3600 * 1000) } },
    { status: 'Due Soon' },
  );
  return res.modifiedCount;
}

export const createReminder = asyncHandler(async (req: Request, res: Response) => {
  const customer = req.user?.role === 'customer' ? req.user?._id : req.body.customer;
  const r = await Reminder.create({ ...req.body, customer });
  res.status(201).json({ success: true, message: 'Reminder created', data: r });
});

export const updateReminder = asyncHandler(async (req: Request, res: Response) => {
  const r = await Reminder.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!r) throw new ApiError(404, 'Reminder not found');
  res.json({ success: true, message: 'Reminder updated', data: r });
});

export const deleteReminder = asyncHandler(async (req: Request, res: Response) => {
  await Reminder.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Reminder deleted' });
});

const getSettingsDoc = async () => {
  let s = await Settings.findOne({ key: 'default' });
  if (!s) s = await Settings.create({ ...SETTINGS_DEFAULT, key: 'default' });
  return s;
};

export const getSettings = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: await getSettingsDoc() });
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const s = await getSettingsDoc();
  Object.assign(s, req.body);
  await s.save();
  res.json({ success: true, message: 'Settings saved', data: s });
});

export const globalSearch = asyncHandler(async (req: Request, res: Response) => {
  const q = new RegExp(String(req.query.q), 'i');
  const [customers, vehicles, bookings, jobCards, invoices, parts] = await Promise.all([
    User.find({ $or: [{ name: q }, { email: q }, { phone: q }] }).limit(5).select('name email phone role'),
    Vehicle.find({ $or: [{ regNumber: q }, { vin: q }, { brand: q }, { model: q }] }).limit(8).populate('owner', 'name'),
    Booking.find({ $or: [{ bookingId: q }] }).limit(8).populate('customer', 'name'),
    JobCard.find({ $or: [{ jobCardId: q }] }).limit(8).populate('vehicle', 'regNumber brand model'),
    Invoice.find({ $or: [{ invoiceNumber: q }] }).limit(8).populate('customer', 'name'),
    Part.find({ $or: [{ partNumber: q }, { name: q }, { sku: q }] }).limit(8),
  ]);
  res.json({
    success: true,
    data: {
      customers,
      vehicles,
      bookings,
      jobCards,
      invoices,
      parts,
      query: req.query.q,
    },
  });
});

export const serviceRead = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter: any = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.active === 'true') filter.isActive = true;
  if (req.query.q) filter.name = new RegExp(String(req.query.q), 'i');
  const [docs, total] = await Promise.all([
    Service.find(filter).sort(sortOptions(req.query, 'category')).skip(skip).limit(limit),
    Service.countDocuments(filter),
  ]);
  res.json({ success: true, meta2: { categories: {} }, data: paginate(docs, total, page, limit) });
});

export const createService = asyncHandler(async (req: Request, res: Response) => {
  const s = await Service.create(req.body);
  res.status(201).json({ success: true, message: 'Service added to catalog', data: s });
});

export const updateService = asyncHandler(async (req: Request, res: Response) => {
  const s = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!s) throw new ApiError(404, 'Service not found');
  res.json({ success: true, message: 'Service updated', data: s });
});

export const deleteService = asyncHandler(async (req: Request, res: Response) => {
  await Service.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Service deactivated' });
});

export const reportsHandler = asyncHandler(async (req: Request, res: Response) => {
  const unit = (req.query.unit as 'day' | 'week' | 'month' | 'year') || 'month';
  const [revenue, servicesRep, customersRep, inventoryRep, vehicleRep, crm] = await Promise.all([
    reports.revenueReport(unit, req.query.to ? new Date(req.query.to as string) : undefined, req.query.from ? new Date(req.query.from as string) : undefined),
    reports.servicesReport(),
    reports.customersReport(),
    reports.inventoryReport(),
    reports.vehicleReport(),
    reports.crmReport(),
  ]);
  res.json({ success: true, data: { revenue, services: servicesRep, customers: customersRep, inventory: inventoryRep, vehicles: vehicleRep, crm } });
});

export const notifyAllStaff = asyncHandler(async (req: Request, res: Response) => {
  const staff = await User.find({ role: { $nin: ['customer'] } }).select('_id');
  const { title, message, link = '/admin' } = req.body;
  await Promise.all(
    staff.map((u) => pushNotification({ user: String(u._id), type: 'announcement', title, message, link, data: {} })),
  );
  res.json({ success: true, message: `Notified ${staff.length} staff members` });
});