import { Router } from 'express';
import {
  dashboard, listCustomers, customerDetail,
  listEmployees, createEmployee, updateEmployee, deleteEmployee,
  serviceRead, createService, updateService, deleteService,
  listReviews, updateReview,
  listReminders, createReminder, updateReminder, deleteReminder,
  getSettings, updateSettings,
  globalSearch, reportsHandler, notifyAllStaff,
} from '../controllers/admin.controller';
import { protect } from '../middlewares/auth';
import { authorize, STAFF, MANAGER } from '../middlewares/role';
import { validate } from '../middlewares/validate';
import { employeeSchema, settingsSchema, reminderSchema, reviewResponseSchema, serviceSchema } from '../validators';
import { listEstimates, getEstimate, updateEstimate, decideEstimate } from '../controllers/estimate.controller';

const router = Router();
router.use(protect);
const staff = authorize(...STAFF);
const manager = authorize(...MANAGER);

router.get('/dashboard', staff, dashboard);

router.get('/customers', staff, listCustomers);
router.get('/customers/:id', staff, customerDetail);

router.get('/employees', staff, listEmployees);
router.post('/employees', manager, validate(employeeSchema), createEmployee);
router.put('/employees/:id', manager, validate(employeeSchema), updateEmployee);
router.delete('/employees/:id', manager, deleteEmployee);

router.get('/services', staff, serviceRead);
router.post('/services', manager, validate(serviceSchema), createService);
router.put('/services/:id', manager, validate(serviceSchema), updateService);
router.delete('/services/:id', manager, deleteService);

router.get('/reviews', staff, listReviews);
router.put('/reviews/:id', staff, validate(reviewResponseSchema), updateReview);

router.get('/estimates', staff, listEstimates);
router.get('/estimates/:id', staff, getEstimate);
router.put('/estimates/:id', staff, updateEstimate);
router.post('/estimates/:id/decision', staff, decideEstimate);

router.get('/reminders', staff, listReminders);
router.post('/reminders', manager, validate(reminderSchema), createReminder);
router.put('/reminders/:id', staff, validate(reminderSchema), updateReminder);
router.delete('/reminders/:id', staff, deleteReminder);

router.get('/settings', staff, getSettings);
router.put('/settings', manager, validate(settingsSchema), updateSettings);

router.get('/reports', staff, reportsHandler);
router.get('/search', staff, globalSearch);

router.post('/notify', manager, notifyAllStaff);

export default router;