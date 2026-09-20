import { Schema, model } from 'mongoose';
import { JOB_STATUSES } from '../constants';

const partUsedSchema = new Schema(
  {
    part: { type: Schema.Types.ObjectId, ref: 'Part', default: null },
    name: { type: String, required: true },
    partNumber: { type: String, default: '' },
    sku: { type: String, default: '' },
    qty: { type: Number, required: true, min: 0 },
    price: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
  },
  { _id: false },
);

const jobCardSchema = new Schema(
  {
    jobCardId: { type: String, required: true, unique: true },
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', default: null },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    mileageIn: { type: Number, default: 0 },
    fuelLevel: { type: Number, default: 0 },
    customerComplaint: { type: String, default: '' },
    inspectionNotes: { type: String, default: '' },
    assignedMechanic: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    serviceAdvisor: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: JOB_STATUSES, default: 'Open' },
    statusHistory: [{ status: String, at: Date, _id: false }],
    estimatedCompletion: { type: Date, default: null },
    actualCompletion: { type: Date, default: null },
    parts: { type: [partUsedSchema], default: [] },
    laborCharges: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    images: [{ type: String }],
    videos: [{ type: String }],
    notes: [{ text: String, by: { type: Schema.Types.ObjectId, ref: 'User' }, at: Date }],
  },
  { timestamps: true },
);

jobCardSchema.index({ jobCardId: 1 });
jobCardSchema.index({ status: 1 });
jobCardSchema.index({ booking: 1 });
jobCardSchema.index({ vehicle: 1 });

export const JobCard = model<any>('JobCard', jobCardSchema);
export type PartUsedDoc = { part?: string; name: string; partNumber?: string; qty: number; price: number; amount: number };