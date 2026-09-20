import { Schema, model } from 'mongoose';
import { ROLES } from '../constants';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ROLES, default: 'customer' },
    address: { type: String, default: '' },
    avatar: { type: String, default: '' },
    isEmailVerified: { type: Boolean, default: false },
    emailVerifiedAt: { type: Date, default: null },
    verificationToken: { type: String, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    lastLoginAt: { type: Date, default: null },
    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      notifications: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });

export const User = model<any>('User', userSchema);