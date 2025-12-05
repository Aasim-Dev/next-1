import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

router.get('/stats', adminController.getStats);
router.get('/buyers', adminController.getBuyers);
router.get('/sellers', adminController.getSellers);

export default router;
