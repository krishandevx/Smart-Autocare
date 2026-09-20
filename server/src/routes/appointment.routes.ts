import { Router } from 'express';
import {
  listAppointments, createAppointment, getAppointment, updateAppointment, deleteAppointment,
} from '../controllers/appointment.controller';
import { protect } from '../middlewares/auth';
import { authorize, STAFF } from '../middlewares/role';
import { validate } from '../middlewares/validate';
import { appointmentSchema } from '../validators';

const router = Router();
router.use(protect);
const staff = authorize(...STAFF);

router.get('/', listAppointments);
router.post('/', staff, validate(appointmentSchema), createAppointment);
router.get('/:id', getAppointment);
router.put('/:id', staff, validate(appointmentSchema), updateAppointment);
router.delete('/:id', staff, deleteAppointment);

export default router;