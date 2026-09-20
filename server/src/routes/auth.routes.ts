import { Router } from 'express';
import {
  register, login, logout, me, verifyEmail, forgotPassword, resetPassword, changePassword, updateProfile,
} from '../controllers/auth.controller';
import { protect } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { authLimiter } from '../middlewares/rateLimit';
import {
  registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema, updateProfileSchema,
} from '../validators';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', protect, logout);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword);
router.get('/me', protect, me);
router.put('/me', protect, validate(updateProfileSchema), updateProfile);
router.post('/change-password', protect, validate(changePasswordSchema), changePassword);

export default router;