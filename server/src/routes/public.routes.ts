import { Router } from 'express';
import {
  publicServices, publicMeta, statusMeta, publicSettings, publicReviews, timeSlots,
} from '../controllers/public.controller';

const router = Router();

router.get('/services', publicServices);
router.get('/meta', publicMeta);
router.get('/status-meta', statusMeta);
router.get('/settings', publicSettings);
router.get('/reviews', publicReviews);
router.get('/time-slots', timeSlots);

export default router;