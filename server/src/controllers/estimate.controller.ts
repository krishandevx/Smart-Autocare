import { Request, Response } from 'express';
import { Estimate, JobCard, Booking } from '../models';
import { nextId } from '../utils/idGenerator';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination, paginate, sortOptions } from '../utils/pagination';
import { assertOwnOrStaff, isStaffRole } from '../utils/access';
import { pushNotification } from '../services/notification';

function computeEstimate(doc: any): void {
  const subtotal = (doc.items || []).reduce((s: number, it: any) => s + (it.amount || 0), 0);
  doc.subtotal = subtotal;
  doc.tax = Math.round((subtotal * (doc.taxRate || 0)) / 100);
  doc.total = Math.max(0, subtotal - (doc.discount || 0)) + doc.tax;
}

export const listEstimates = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter: any = {};
  if (!isStaffRole(req.user?.role)) filter.customer = req.user?._id;
  if (req.query.status) filter.status = req.query.status;
  const [docs, total] = await Promise.all([
    Estimate.find(filter)
      .sort(sortOptions(req.query, '-createdAt'))
      .skip(skip).limit(limit)
      .populate('customer', 'name email phone')
      .populate('vehicle', 'regNumber brand model')
      .populate('jobCard', 'jobCardId status'),
    Estimate.countDocuments(filter),
  ]);
  res.json({ success: true, data: paginate(docs, total, page, limit) });
});

export const getEstimate = asyncHandler(async (req: Request, res: Response) => {
  const e = await Estimate.findById(req.params.id)
    .populate('customer', 'name email phone address')
    .populate('vehicle', 'regNumber brand model type')
    .populate('jobCard', 'jobCardId status')
    .populate('booking', 'bookingId status');
  if (!e) throw new ApiError(404, 'Estimate not found');
  assertOwnOrStaff(req, String(e.customer), 'estimate');
  res.json({ success: true, data: e });
});

export async function createEstimateForJobCard(req: Request, res: Response, jcId: string): Promise<unknown> {
  const jc = await JobCard.findById(jcId);
  if (!jc) throw new ApiError(404, 'Job card not found');

  const items = req.body.items.map((it: any) => ({ ...it, amount: it.qty * it.rate }));
  const estimate = new Estimate({
    estimateId: await nextId('estimate'),
    booking: jc.booking,
    jobCard: jc._id,
    customer: jc.customer,
    vehicle: jc.vehicle,
    items,
    discount: req.body.discount || 0,
    taxRate: req.body.taxRate ?? 0,
    note: req.body.note || '',
    status: 'Sent',
    createdBy: req.user?._id,
  });
  computeEstimate(estimate);
  await estimate.save();

  jc.status = 'Awaiting Approval';
  jc.statusHistory = [...(jc.statusHistory || []), { status: 'Awaiting Approval', at: new Date() }];
  jc.taxRate = req.body.taxRate ?? 0;
  await jc.save();

  if (jc.booking) {
    const b = await Booking.findById(jc.booking);
    if (b) {
      b.status = 'Awaiting Customer Approval';
      b.statusHistory = [...(b.statusHistory || []), { status: 'Awaiting Customer Approval', at: new Date() }];
      await b.save();
    }
  }

  pushNotification({
    user: String(jc.customer),
    type: 'estimate_created',
    title: 'Estimate Ready',
    message: `An estimate of ${`\u20B9`}${estimate.total.toLocaleString('en-IN')} is waiting for your approval.`,
    link: '/account/current-service',
    data: { estimateId: estimate._id },
  });
  return estimate;
}

export const createEstimate = asyncHandler(async (req: Request, res: Response) => {
  const estimate = await createEstimateForJobCard(req, res, String(req.params.id));
  res.status(201).json({ success: true, message: 'Estimate sent for approval', data: estimate });
});

export const updateEstimate = asyncHandler(async (req: Request, res: Response) => {
  const e = await Estimate.findById(req.params.id);
  if (!e) throw new ApiError(404, 'Estimate not found');
  if (req.body.items) e.items = req.body.items.map((it: any) => ({ ...it, amount: it.qty * it.rate }));
  if (req.body.discount !== undefined) e.discount = req.body.discount;
  if (req.body.taxRate !== undefined) e.taxRate = req.body.taxRate;
  if (req.body.note !== undefined) e.note = req.body.note;
  computeEstimate(e);
  if (e.status !== 'Approved') e.status = 'Sent';
  await e.save();
  res.json({ success: true, message: 'Estimate updated', data: e });
});

export const decideEstimate = asyncHandler(async (req: Request, res: Response) => {
  const { decision, customerNote } = req.body;
  const e = await Estimate.findById(req.params.id);
  if (!e) throw new ApiError(404, 'Estimate not found');
  assertOwnOrStaff(req, String(e.customer), 'estimate');
  if (decision === 'Approved' && !isStaffRole(req.user?.role) && e.status !== 'Sent') {
    throw new ApiError(400, 'Estimate is not awaiting approval');
  }

  e.status = decision;
  e.customerNote = customerNote || e.customerNote;
  e.customerDecisionAt = new Date();
  if (decision === 'Approved') {
    e.approvedBy = req.user?._id;
    e.approvedAt = new Date();
  }
  await e.save();

  if (e.jobCard) {
    const jc = await JobCard.findById(e.jobCard);
    if (jc) {
      jc.status = decision === 'Approved' ? 'In Progress' : 'Awaiting Approval';
      jc.statusHistory = [...(jc.statusHistory || []), { status: jc.status, at: new Date() }];
      jc.taxRate = e.taxRate;
      await jc.save();
    }
  }
  if (e.booking) {
    const b = await Booking.findById(e.booking);
    if (b) {
      b.status = decision === 'Approved' ? 'Service In Progress' : 'Awaiting Customer Approval';
      b.statusHistory = [...(b.statusHistory || []), { status: b.status, at: new Date() }];
      await b.save();
    }
  }

  pushNotification({
    user: String(e.createdBy || req.user?._id),
    type: decision === 'Approved' ? 'estimate_approved' : 'estimate_rejected',
    title: decision === 'Approved' ? 'Estimate Approved' : 'Estimate Rejected',
    message: `Customer ${decision === 'Approved' ? 'approved' : 'rejected'} estimate ${e.estimateId}.`,
    link: '/admin/job-cards',
    data: { estimateId: e._id },
  });

  res.json({ success: true, message: `Estimate ${decision.toLowerCase()}`, data: e });
});