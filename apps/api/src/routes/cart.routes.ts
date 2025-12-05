import { Router } from 'express';
import * as cartController from '../controllers/cart.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, cartController.getCart);
router.post('/', authenticate, cartController.addToCart);
router.put('/', authenticate, cartController.updateCartItem);
router.delete('/', authenticate, cartController.removeFromCart);
router.get('/count', authenticate, cartController.getCartCount);

export default router;
