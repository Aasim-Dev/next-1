import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/stats', authenticate, authorize('admin'), adminController.getStats);
router.get('/buyers', authenticate, authorize('admin'), adminController.getBuyers);
router.get('/sellers', authenticate, authorize('admin'), adminController.getSellers);

export default router;
