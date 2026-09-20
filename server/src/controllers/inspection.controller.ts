import { Request, Response } from 'express';
import { Inspection, JobCard, Booking } from '../models';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { assertOwnOrStaff, isStaffRole } from '../utils/access';
import { pushNotification } from '../services/notification';

const STATUS_WEIGHT: Record<string, number> = { Good: 100, 'Attention Needed': 70, Replace: 40, Critical: 10 };

export function computeHealth(sections: any[]): number {
  const items = sections.flatMap((s) => s.items || []);
  if (!items.length) return 100;
  const sum = items.reduce((acc, it) => acc + (STATUS_WEIGHT[it.status] ?? 100), 0);
  return Math.round(sum / items.length);
}

export const getInspection = asyncHandler(async (req: Request, res: Response) => {
  const insp = await Inspection.findOne({ jobCard: req.params.id }).populate('jobCard');
  if (!insp) {
    const jc = await JobCard.findById(req.params.id);
    if (!jc) throw new ApiError(404, 'Job card not found');
    return res.json({ success: true, data: null });
  }
  assertOwnOrStaff(req, String(insp.customer), 'inspection');
  res.json({ success: true, data: insp });
});

export const saveInspection = asyncHandler(async (req: Request, res: Response) => {
  const jc = await JobCard.findById(req.params.id);
  if (!jc) throw new ApiError(404, 'Job card not found');

  const healthScore = computeHealth(req.body.sections || []);

  const data = {
    booking: jc.booking,
    jobCard: jc._id,
    customer: jc.customer,
    vehicle: jc.vehicle,
    odometer: req.body.odometer ?? jc.mileageIn,
    sections: req.body.sections || [],
    overallNotes: req.body.overallNotes || '',
    evCheck: req.body.evCheck || {},
    healthScore,
    createdBy: req.user?._id,
    status: req.body.status === 'Completed' ? 'Completed' : 'Draft',
  };

  const insp = await Inspection.findOneAndUpdate({ jobCard: jc._id }, data, { new: true, upsert: true });

  if (data.status === 'Completed') {
    jc.inspectionNotes = insp.overallNotes;
    if (jc.status === 'Open' || jc.status === 'In Inspection') {
      jc.status = 'Estimate Pending';
      jc.statusHistory = [...(jc.statusHistory || []), { status: 'Estimate Pending', at: new Date() }];
    }
    await jc.save();
    pushNotification({
      user: String(jc.customer),
      type: 'inspection_completed',
      title: 'Inspection Completed',
      message: `Your vehicle inspection is complete with a health score of ${healthScore}%.`,
      link: '/account/current-service',
      data: { jobCardId: jc._id },
      });
  }
  res.json({ success: true, message: data.status === 'Completed' ? 'Inspection completed' : 'Inspection saved', data: insp });
});

export const completeInspection = asyncHandler(async (req: Request, res: Response) => {
  const insp = await Inspection.findOneAndUpdate(
    { jobCard: req.params.id },
    { status: 'Completed' },
    { new: true },
  );
  if (!insp) throw new ApiError(404, 'No inspection found for this job card');
  const jc = await JobCard.findById(req.params.id);
  if (jc) {
    jc.inspectionNotes = insp.overallNotes;
    jc.status = 'Estimate Pending';
    jc.statusHistory = [...(jc.statusHistory || []), { status: 'Estimate Pending', at: new Date() }];
    await jc.save();
  }
  res.json({ success: true, message: 'Inspection completed', data: insp });
});

export const vehicleHealth = asyncHandler(async (req: Request, res: Response) => {
  const vId = req.params.vehicle;
  const insp = await Inspection.findOne({ vehicle: vId }).sort({ updatedAt: -1 }).lean();
  if (!insp) return res.json({ success: true, data: null });
  res.json({ success: true, data: insp });
});