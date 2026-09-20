import { Schema, model } from 'mongoose';
import { SERVICE_CATEGORIES, VEHICLE_TYPES } from '../constants';

const serviceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: SERVICE_CATEGORIES, required: true },
    description: { type: String, default: '' },
    basePrice: { type: Number, default: 0 },
    estimatedHours: { type: Number, default: 1 },
    includes: [{ type: String }],
    vehicleTypes: [{ type: String, enum: VEHICLE_TYPES }],
    isPopular: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    icon: { type: String, default: 'Wrench' },
  },
  { timestamps: true },
);

serviceSchema.index({ category: 1, name: 1 });

export const Service = model<any>('Service', serviceSchema);