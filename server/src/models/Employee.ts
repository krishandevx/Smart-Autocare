import { Schema, model } from 'mongoose';
import { ROLES } from '../constants';

const employeeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    role: { type: String, enum: ROLES, required: true },
    specialization: { type: String, default: '' },
    experienceYears: { type: Number, default: 0 },
    joiningDate: { type: Date, default: null },
    status: { type: String, enum: ['active', 'inactive', 'on-leave'], default: 'active' },
    photo: { type: String, default: '' },
    address: { type: String, default: '' },
    salary: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Employee = model<any>('Employee', employeeSchema);