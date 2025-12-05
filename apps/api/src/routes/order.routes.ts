import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, orderController.getOrders);
router.post('/', authenticate, authorize('buyer'), orderController.createOrder);
router.get('/seller', authenticate, authorize('seller'), orderController.getSellerOrders);
router.get('/:id', authenticate, orderController.getOrderById);
router.put('/:id', authenticate, orderController.updateOrderStatus);

export default router;
