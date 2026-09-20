import { Schema, model } from 'mongoose';
import { ESTIMATE_STATUSES } from '../constants';

const estimateItemSchema = new Schema(
  {
    type: { type: String, enum: ['Part', 'Labour', 'Misc'], required: true },
    description: { type: String, required: true },
    part: { type: Schema.Types.ObjectId, ref: 'Part', default: null },
    qty: { type: Number, default: 1 },
    rate: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
  },
  { _id: false },
);

const estimateSchema = new Schema(
  {
    estimateId: { type: String, required: true, unique: true },
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', default: null },
    jobCard: { type: Schema.Types.ObjectId, ref: 'JobCard', default: null },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    items: { type: [estimateItemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: { type: String, enum: ESTIMATE_STATUSES, default: 'Draft' },
    note: { type: String, default: '' },
    customerNote: { type: String, default: '' },
    customerDecisionAt: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    approvedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

estimateSchema.index({ estimateId: 1 });
estimateSchema.index({ status: 1, customer: 1 });

export const Estimate = model<any>('Estimate', estimateSchema);