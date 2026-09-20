import { Schema, model } from 'mongoose';
import { INSPECTION_STATUSES, INSPECTION_SECTIONS } from '../constants';

const inspectionItemSchema = new Schema(
  {
    item: { type: String, required: true },
    status: { type: String, enum: INSPECTION_STATUSES, default: 'Good' },
    comment: { type: String, default: '' },
    image: { type: String, default: '' },
  },
  { _id: false },
);

const inspectionSectionSchema = new Schema(
  {
    section: { type: String, enum: INSPECTION_SECTIONS, required: true },
    items: { type: [inspectionItemSchema], default: [] },
  },
  { _id: false },
);

const inspectionSchema = new Schema(
  {
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', default: null },
    jobCard: { type: Schema.Types.ObjectId, ref: 'JobCard', default: null, index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    odometer: { type: Number, default: 0 },
    sections: { type: [inspectionSectionSchema], default: [] },
    healthScore: { type: Number, default: 0, min: 0, max: 100 },
    overallNotes: { type: String, default: '' },
    evCheck: {
      batteryHealth: { type: Number, default: null },
      cellVoltageImbalance: { type: Number, default: null },
      chargingSystem: { type: String, default: '' },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: ['Draft', 'Completed'], default: 'Draft' },
  },
  { timestamps: true },
);

export const Inspection = model<any>('Inspection', inspectionSchema);