import { Request, Response } from 'express';
import { JobCard, Booking, ServiceRecord, Invoice, Vehicle, Estimate } from '../models';
import { nextId } from '../utils/idGenerator';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination, paginate, sortOptions } from '../utils/pagination';
import { assertOwnOrStaff, isStaffRole } from '../utils/access';
import { pushNotification } from '../services/notification';
import { changeStock } from '../services/inventory';

const pop = [
  { path: 'customer', select: 'name email phone address' },
  { path: 'vehicle', select: 'regNumber brand model type category fuelType year mileage' },
  { path: 'booking', select: 'bookingId status scheduledDate timeSlot' },
  { path: 'assignedMechanic', select: 'name role' },
  { path: 'serviceAdvisor', select: 'name role' },
  { path: 'parts.part', select: 'name partNumber' },
];

export function computeTotals(jc: any): void {
  const partsTotal = (jc.parts || []).reduce((s: number, p: any) => s + (p.amount || 0), 0);
  const labor = jc.laborCharges || 0;
  jc.subtotal = partsTotal + labor;
  jc.tax = Math.round((jc.subtotal * (jc.taxRate || 0)) / 100);
  jc.total = jc.subtotal - (jc.discount || 0) + jc.tax;
}

export const listJobCards = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter: any = {};
  if (!isStaffRole(req.user?.role)) filter.customer = req.user?._id;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.vehicle) filter.vehicle = req.query.vehicle;
  if (req.query.booking) filter.booking = req.query.booking;
  if (req.query.q) filter.$or = [{ jobCardId: new RegExp(String(req.query.q), 'i') }];
  const [docs, total] = await Promise.all([
    JobCard.find(filter).sort(sortOptions(req.query, '-createdAt')).skip(skip).limit(limit).populate(pop),
    JobCard.countDocuments(filter),
  ]);
  res.json({ success: true, data: paginate(docs, total, page, limit) });
});

export const getJobCard = asyncHandler(async (req: Request, res: Response) => {
  const jc = await JobCard.findById(req.params.id).populate(pop);
  if (!jc) throw new ApiError(404, 'Job card not found');
  assertOwnOrStaff(req, String(jc.customer), 'job card');
  res.json({ success: true, data: jc });
});

export const createJobCard = asyncHandler(async (req: Request, res: Response) => {
  const { booking, vehicle } = req.body;
  if (booking) {
    const b = await Booking.findById(booking);
    if (!b) throw new ApiError(404, 'Booking not found');
    req.body.customer = b.customer;
    if (!req.body.vehicle) req.body.vehicle = b.vehicle;
    req.body.laborCharges = 0;
    req.body.taxRate = req.body.taxRate ?? 0;
  } else {
    const v = (await Vehicle.findById(vehicle).lean()) as any;
    if (!v) throw new ApiError(404, 'Vehicle not found');
    req.body.customer = v.owner;
  }
  const jc = await JobCard.create({
    ...req.body,
    jobCardId: await nextId('jobcard'),
    status: 'Open',
    statusHistory: [{ status: 'Open', at: new Date() }],
  });
  if (booking) {
    const b = await Booking.findById(booking);
    if (b) {
      b.status = booking ? 'Vehicle Received' : b.status;
      b.statusHistory = [...(b.statusHistory || []), { status: 'Vehicle Received', at: new Date() }];
      await b.save();
      pushNotification({
        user: String(b.customer),
        type: 'vehicle_received',
        title: 'Vehicle Received',
        message: `Your vehicle has been received at the workshop. Job card ${jc.jobCardId} created.`,
        link: '/account/current-service',
        data: { jobCardId: jc._id },
      });
    }
  }
  res.status(201).json({ success: true, message: 'Job card created', data: jc });
});

export const getJobCardEstimate = asyncHandler(async (req: Request, res: Response) => {
  const e = await Estimate.findOne({ jobCard: req.params.id }).sort('-createdAt').select('-__v').lean();
  if (!e) throw new ApiError(404, 'No estimate for this job card yet');
  res.json({ success: true, data: e });
});

export const updateJobCardStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  const jc = await JobCard.findById(req.params.id);
  if (!jc) throw new ApiError(404, 'Job card not found');

  jc.status = status;
  jc.statusHistory = [...(jc.statusHistory || []), { status, at: new Date() }];
  if (status === 'In Progress') jc.estimatedCompletion = jc.estimatedCompletion || new Date(Date.now() + 24 * 3600 * 1000);
  if (status === 'Ready' || status === 'Closed' || status === 'Invoiced') jc.actualCompletion = new Date();
  await jc.save();

  pushNotification({
    user: String(jc.customer),
    type: 'job_status',
    title: `Job Card ${status}`,
    message: `Status of job card ${jc.jobCardId} is now "${status}".`,
    link: '/account/current-service',
    data: { jobCardId: jc._id },
  });
  res.json({ success: true, message: 'Status updated', data: jc });
});

export const assignStaff = asyncHandler(async (req: Request, res: Response) => {
  const { mechanic, serviceAdvisor } = req.body;
  const jc = await JobCard.findById(req.params.id);
  if (!jc) throw new ApiError(404, 'Job card not found');
  if (mechanic || mechanic === null) jc.assignedMechanic = mechanic || null;
  if (serviceAdvisor || serviceAdvisor === null) jc.serviceAdvisor = serviceAdvisor || null;
  await jc.save();
  res.json({ success: true, message: 'Staff assigned', data: jc });
});

const transition = (target: string) =>
  asyncHandler(async (req: Request, res: Response) => {
    const jc = await JobCard.findById(req.params.id);
    if (!jc) throw new ApiError(404, 'Job card not found');
    jc.status = target;
    jc.statusHistory = [...(jc.statusHistory || []), { status: target, at: new Date() }];
    if (target === 'In Progress') jc.estimatedCompletion = jc.estimatedCompletion || new Date(Date.now() + 24 * 3600 * 1000);
    if (target === 'Quality Check') jc.estimatedCompletion = jc.estimatedCompletion || new Date(Date.now() + 2 * 3600 * 1000);
    await jc.save();
    pushNotification({
      user: String(jc.customer),
      type: 'job_status',
      title: `Job card in "${target}"`,
      message: `Your job card ${jc.jobCardId} is now at "${target}".`,
      link: '/account/service',
      data: { jobCardId: jc._id },
    });
    res.json({ success: true, message: `Job card moved to ${target}`, data: jc });
  });

export const sendForInspection = transition('In Inspection');
export const startJob = transition('In Progress');
export const markQualityCheck = transition('Quality Check');

export const addNote = asyncHandler(async (req: Request, res: Response) => {
  const jc = await JobCard.findById(req.params.id);
  if (!jc) throw new ApiError(404, 'Job card not found');
  jc.notes = [...(jc.notes || []), { text: req.body.text, by: req.user?._id, at: new Date() }];
  await jc.save();
  res.json({ success: true, message: 'Note added', data: jc });
});

export const addPart = asyncHandler(async (req: Request, res: Response) => {
  const { part, name, partNumber, qty, price } = req.body;
  const jc = await JobCard.findById(req.params.id);
  if (!jc) throw new ApiError(404, 'Job card not found');

  const pk = part || partNumber || name;
  const existing = jc.parts.find((p: any) => p._id?.toString?.() === String(pk));
  if (existing) {
    existing.name = name || existing.name;
    existing.partNumber = partNumber || existing.partNumber;
    existing.qty += qty;
    existing.price = price;
    existing.amount = existing.qty * price;
  } else {
    jc.parts.push({ part: part || null, name, partNumber: partNumber || '', qty, price, amount: qty * price });
  }
  if (part) {
    await changeStock({ partId: part, qty, type: 'USED', reason: `Job card ${jc.jobCardId}`, reference: jc.jobCardId, user: String(req.user?._id) });
  }
  computeTotals(jc);
  await jc.save();
  res.json({ success: true, message: 'Part added', data: jc });
});

export const removePart = asyncHandler(async (req: Request, res: Response) => {
  const { index } = req.params;
  const jc = await JobCard.findById(req.params.id);
  if (!jc) throw new ApiError(404, 'Job card not found');
  const i = parseInt(index, 10);
  const removed = (jc.parts || [])[i];
  if (removed && removed.part) {
    await changeStock({ partId: String(removed.part), qty: removed.qty, type: 'RETURN', reason: `Removed from job card ${jc.jobCardId}`, reference: jc.jobCardId, user: String(req.user?._id) });
  }
  jc.parts.splice(i, 1);
  computeTotals(jc);
  await jc.save();
  res.json({ success: true, message: 'Part removed', data: jc });
});

export const setLabor = asyncHandler(async (req: Request, res: Response) => {
  const { laborCharges, discount, taxRate } = req.body;
  const jc = await JobCard.findById(req.params.id);
  if (!jc) throw new ApiError(404, 'Job card not found');
  if (laborCharges !== undefined) jc.laborCharges = laborCharges;
  if (discount !== undefined) jc.discount = discount;
  if (taxRate !== undefined) jc.taxRate = taxRate;
  computeTotals(jc);
  await jc.save();
  res.json({ success: true, data: jc });
});

export const closeJobCard = asyncHandler(async (req: Request, res: Response) => {
  const jc = await JobCard.findById(req.params.id);
  if (!jc) throw new ApiError(404, 'Job card not found');

  const invoice = (await Invoice.findOne({ jobCard: jc._id }).lean()) as any;
  if (invoice) {
    jc.status = 'Invoiced';
    jc.statusHistory = [...(jc.statusHistory || []), { status: 'Invoiced', at: new Date() }];
  } else {
    jc.status = 'Closed';
    jc.statusHistory = [...(jc.statusHistory || []), { status: 'Closed', at: new Date() }];
  }
  jc.actualCompletion = new Date();
  await jc.save();

  if (jc.booking) {
    const b = await Booking.findById(jc.booking);
    if (b) {
      b.status = 'Completed';
      b.statusHistory = [...(b.statusHistory || []), { status: 'Completed', at: new Date() }];
      await b.save();
    }
  }

  const rec = await ServiceRecord.create({
    customer: jc.customer,
    vehicle: jc.vehicle,
    booking: jc.booking,
    jobCard: jc._id,
    invoice: invoice?._id || null,
    serviceName: '',
    date: new Date(),
    mileage: jc.mileageIn,
    parts: (jc.parts || []).map((p: any) => ({ name: p.name, partNumber: p.partNumber, qty: p.qty, price: p.price, amount: p.amount })),
    laborCharges: jc.laborCharges,
    total: jc.total,
    invoiceNumber: invoice?.invoiceNumber || '',
    technician: '',
    notes: jc.inspectionNotes,
  });

  pushNotification({
    user: String(jc.customer),
    type: 'service_completed',
    title: 'Service Completed',
    message: `Your service for job card ${jc.jobCardId} is complete.`,
    link: '/account/current-service',
    data: { jobCardId: jc._id },
  });

  res.json({ success: true, message: 'Job card closed', data: { jobCard: jc, serviceRecord: rec } });
});