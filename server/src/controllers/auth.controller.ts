import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User } from '../models';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { sendEmail } from '../services/email';

const cookieOpts = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.NODE_ENV === 'production' ? ('none' as const) : ('lax' as const),
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function signToken(user: { _id: string; role: string; name: string; email: string }): string {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name, email: user.email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as any },
  );
}

function publicUser(u: any) {
  return {
    _id: u._id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    address: u.address,
    avatar: u.avatar,
    isEmailVerified: u.isEmailVerified,
    status: u.status,
    preferences: u.preferences,
    createdAt: u.createdAt,
  };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, password, address } = req.body;
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  const hash = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const user = await User.create({
    name, email, phone, password: hash, address, role: 'customer',
    verificationToken,
  });
  const token = signToken(user.toObject() as any);
  res.cookie('sac_token', token, cookieOpts);

  await sendEmail({
    to: email,
    subject: 'Welcome to Smart AutoCare 🚗',
    template: 'welcome',
    data: {
      subject: 'Welcome to Smart AutoCare!',
      name,
      message: `Your account has been created. We're excited to help with all your vehicle care needs.`,
      cta: 'Book Your First Service',
      link: `${env.CLIENT_URL}/book`,
    },
  });

  res.status(201).json({ success: true, message: 'Account created', data: publicUser(user) });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;
  const user = await User.findOneAndUpdate(
    { verificationToken: token },
    { isEmailVerified: true, emailVerifiedAt: new Date(), verificationToken: null },
    { new: true },
  );
  if (!user) throw new ApiError(400, 'Invalid verification token');
  res.json({ success: true, message: 'Email verified', data: publicUser(user) });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (user.status !== 'active') throw new ApiError(403, 'Your account is suspended. Contact support.');

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken(user.toObject() as any);
  res.cookie('sac_token', token, cookieOpts);
  res.json({ success: true, message: 'Logged in', data: publicUser(user) });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie('sac_token', { httpOnly: true, sameSite: 'lax' as const, secure: cookieOpts.secure });
  res.json({ success: true, message: 'Logged out' });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user?._id);
  if (!user) throw new ApiError(401, 'Not authenticated');
  res.json({ success: true, data: publicUser(user) });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();
    await sendEmail({
      to: email,
      subject: 'Reset your password',
      template: 'passwordReset',
      data: {
        subject: 'Reset your Smart AutoCare password',
        name: user.name,
        message: 'Click the button below to reset your password. This link expires in 30 minutes.',
        cta: 'Reset Password',
        link: `${env.CLIENT_URL}/reset-password?token=${resetToken}`,
      },
    });
  }
  res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: new Date() } });
  if (!user) throw new ApiError(400, 'Reset link is invalid or has expired');
  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();
  res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id).select('+password');
  if (!user) throw new ApiError(401, 'Not authenticated');
  if (!(await bcrypt.compare(currentPassword, user.password))) throw new ApiError(400, 'Current password is incorrect');
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ success: true, message: 'Password changed successfully' });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(req.user?._id, req.body, { new: true, runValidators: true });
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ success: true, message: 'Profile updated', data: publicUser(user) });
});