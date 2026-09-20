import { Schema, model } from 'mongoose';
import { VEHICLE_TYPES, FUEL_TYPES, TRANSMISSIONS } from '../constants';

const vehicleSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    regNumber: { type: String, required: true, trim: true, uppercase: true },
    type: { type: String, enum: VEHICLE_TYPES, required: true },
    category: { type: String, required: true },
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    variant: { type: String, default: '' },
    year: { type: Number, required: true },
    fuelType: { type: String, enum: FUEL_TYPES, required: true },
    transmission: { type: String, enum: TRANSMISSIONS, default: 'Manual' },
    vin: { type: String, trim: true, uppercase: true, default: '' },
    engineNumber: { type: String, trim: true, uppercase: true, default: '' },
    mileage: { type: Number, default: 0 },
    purchaseDate: { type: Date, default: null },
    insuranceExpiry: { type: Date, default: null },
    pucExpiry: { type: Date, default: null },
    registrationExpiry: { type: Date, default: null },
    batteryCapacity: { type: Number, default: null },
    chargingType: { type: String, default: '' },
    rangeKm: { type: Number, default: null },
    batteryHealth: { type: Number, default: null },
    image: { type: String, default: '' },
    notes: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

vehicleSchema.index({ regNumber: 1 }, { unique: true });
vehicleSchema.index({ vin: 1 });
vehicleSchema.index({ owner: 1, brand: 1, model: 1 });

export const Vehicle = model<any>('Vehicle', vehicleSchema);