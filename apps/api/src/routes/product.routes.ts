import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', productController.getProducts);
router.post('/', authenticate, authorize('seller'), productController.createProduct);
router.put('/', authenticate, authorize('seller'), productController.updateProduct);
router.delete('/', authenticate, authorize('seller'), productController.deleteProduct);

export default router;
