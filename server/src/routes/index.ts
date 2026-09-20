import { Router } from 'express';
import { protect } from '../middlewares/auth';
import { upload, filesToUrls } from '../middlewares/upload';
import { asyncHandler } from '../utils/asyncHandler';
import authRoutes from './auth.routes';
import publicRoutes from './public.routes';
import vehicleRoutes from './vehicle.routes';
import bookingRoutes from './booking.routes';
import appointmentRoutes from './appointment.routes';
import jobCardRoutes from './jobcard.routes';
import invoiceRoutes, { paymentsRouter } from './invoice.routes';
import inventoryRoutes from './inventory.routes';
import adminRoutes from './admin.routes';
import customerRoutes from './customer.routes';

const router = Router();

router.get('/health', (_req, res) => res.json({ success: true, message: 'Smart AutoCare API is healthy', time: new Date().toISOString() }));

router.post('/upload', protect, upload.array('files', 10), asyncHandler(async (req, res) => {
  res.json({ success: true, data: filesToUrls(req) });
}));
router.post('/upload-single', protect, upload.single('file'), asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  res.json({ success: true, data: `/uploads/${file.filename}` });
}));

router.use('/auth', authRoutes);
router.use('/public', publicRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/bookings', bookingRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/job-cards', jobCardRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/payments', paymentsRouter);
router.use('/inventory', inventoryRoutes);
router.use('/admin', adminRoutes);
router.use('/', customerRoutes);

export default router;