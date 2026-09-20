import { Router } from 'express';
import {
  listBookings, getBooking, createBooking, updateBookingStatus, rescheduleBooking,
} from '../controllers/booking.controller';
import { protect } from '../middlewares/auth';
import { STAFF } from '../middlewares/role';
import { validate } from '../middlewares/validate';
import { bookingSchema, bookingStatusSchema } from '../validators';

const router = Router();
router.use(protect);

router.get('/', listBookings);
router.post('/', validate(bookingSchema), createBooking);
router.get('/:id', getBooking);
router.put('/:id/status', validate(bookingStatusSchema), updateBookingStatus);
router.put('/:id/reschedule', rescheduleBooking);

export default router;