import { Invoice, ServiceRecord, User, Vehicle, Booking, Part, InventoryTransaction, JobCard } from '../models';

const START = new Date('2020-01-01');

function periodFloor(date: Date, unit: 'day' | 'week' | 'month' | 'year'): Date {
  const d = new Date(date);
  if (unit === 'day') return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (unit === 'week') {
    const day = d.getDay() || 7;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() - day + 1);
  }
  if (unit === 'month') return new Date(d.getFullYear(), d.getMonth(), 1);
  return new Date(d.getFullYear(), 0, 1);
}

function labelOf(d: Date, unit: string): string {
  const y = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  if (unit === 'day' || unit === 'week') return `${y}-${mm}-${dd}`;
  if (unit === 'month') return `${y}-${mm}`;
  return String(y);
}

export async function revenueReport(unit: 'day' | 'week' | 'month' | 'year' = 'month', to = new Date(), from = START) {
  const invoices = await Invoice.find({ issuedDate: { $gte: from, $lte: to }, paymentStatus: { $nin: ['Void'] } }).lean();
  const payments = await Invoice.aggregate([
    { $match: { issuedDate: { $gte: from, $lte: to }, paymentStatus: { $nin: ['Void'] } } },
    { $group: { _id: null, paid: { $sum: '$paidAmount' }, billed: { $sum: '$grandTotal' }, pending: { $sum: '$remaining' } } },
  ]);
  const buckets: Record<string, { label: string; revenue: number; services: number }> = {};
  for (const inv of invoices) {
    const k = labelOf(periodFloor(inv.issuedDate, unit), unit);
    if (!buckets[k]) buckets[k] = { label: k, revenue: 0, services: 0 };
    buckets[k].revenue += inv.paidAmount || inv.grandTotal || 0;
    buckets[k].services += 1;
  }
  const series = Object.values(buckets).sort((a, b) => a.label.localeCompare(b.label));
  const total = payments[0]
    ? { paid: payments[0].paid, billed: payments[0].billed, pending: payments[0].pending }
    : { paid: 0, billed: 0, pending: 0 };
  return { unit, series, total };
}

export async function servicesReport(to = new Date(), from = START) {
  const records = await ServiceRecord.find({ date: { $gte: from, $lte: to } }).lean();
  const perService: Record<string, { name: string; count: number; revenue: number }> = {};
  for (const r of records) {
    const name = r.serviceName || 'General Service';
    if (!perService[name]) perService[name] = { name, count: 0, revenue: 0 };
    perService[name].count += 1;
    perService[name].revenue += r.total || 0;
  }
  const mostRequested = Object.values(perService).sort((a, b) => b.count - a.count).slice(0, 10);
  const byDay: Record<string, number> = {};
  for (const r of records) {
    const k = labelOf(periodFloor(r.date, 'day'), 'day');
    byDay[k] = (byDay[k] || 0) + 1;
  }
  return {
    totalServices: records.length,
    totalRevenue: records.reduce((s, r) => s + (r.total || 0), 0),
    mostRequested,
    timeline: Object.entries(byDay)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  };
}

export async function customersReport() {
  const [total, newThisMonth] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    User.countDocuments({ role: 'customer', createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }),
  ]);
  const withBookings = await Booking.distinct('customer');
  const returning = await Booking.aggregate([
    { $group: { _id: '$customer', count: { $sum: 1 } } },
    { $match: { count: { $gte: 2 } } },
    { $project: { _id: 0, g: '$_id' } },
  ]);
  const vehicles = await Vehicle.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 } } },
    { $project: { _id: 0, type: '$_id', count: 1 } },
  ]);
  const brands = await Vehicle.aggregate([
    { $group: { _id: '$brand', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 8 },
    { $project: { _id: 0, brand: '$_id', count: 1 } },
  ]);
  return {
    totalCustomers: total,
    newThisMonth,
    activeCustomers: withBookings.length,
    returningCustomers: returning.length,
    retentionRate: total ? Math.round((returning.length / total) * 100) : 0,
    vehicles,
    brands,
  };
}

export async function inventoryReport() {
  const parts = await Part.find().lean();
  const lowStock = parts
    .filter((p) => p.stock <= p.minStock)
    .map((p) => ({ id: p._id, name: p.name, partNumber: p.partNumber, stock: p.stock, minStock: p.minStock }));
  const usage = await InventoryTransaction.aggregate([
    { $match: { type: 'USED' } },
    { $group: { _id: '$part', qty: { $sum: '$qty' } } },
    { $sort: { qty: -1 } },
    { $limit: 10 },
    { $lookup: { from: 'parts', localField: '_id', foreignField: '_id', as: 'part' } },
    { $unwind: '$part' },
    { $project: { _id: 0, name: '$part.name', partNumber: '$part.partNumber', qty: 1 } },
  ]);
  return {
    totalParts: parts.length,
    totalStockValue: parts.reduce((s, p) => s + p.costPrice * p.stock, 0),
    lowStockCount: lowStock.length,
    lowStock,
    fastMoving: usage,
  };
}

export async function vehicleReport() {
  const types = await Vehicle.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]);
  const fuels = await Vehicle.aggregate([{ $group: { _id: '$fuelType', count: { $sum: 1 } } }]);
  const brands = await Vehicle.aggregate([
    { $group: { _id: '$brand', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $project: { _id: 0, name: '$_id', count: 1 } },
  ]);
  const mostServiced = await ServiceRecord.aggregate([
    { $group: { _id: '$vehicle', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    { $lookup: { from: 'vehicles', localField: '_id', foreignField: '_id', as: 'v' } },
    { $unwind: '$v' },
    { $project: { _id: 0, name: { $concat: ['$v.brand', ' ', '$v.model'] }, regNumber: '$v.regNumber', count: 1 } },
  ]);
  return { types, fuels, brands, mostServiced };
}

export async function crmReport() {
  const [bookings, jobs, paid] = await Promise.all([
    Booking.find().lean(),
    JobCard.find().lean(),
    Invoice.find({ paymentStatus: { $in: ['Paid', 'Partially Paid'] } }).lean(),
  ]);
  return {
    bookingsTotal: bookings.length,
    openBookings: bookings.filter((b) => !['Completed', 'Closed', 'Cancelled'].includes(b.status)).length,
    jobsTotal: jobs.length,
    revenueCollected: paid.reduce((s, inv) => s + (inv.paidAmount || 0), 0),
    pendingRevenue: paid.reduce((s, inv) => s + (inv.remaining || 0), 0),
  };
}