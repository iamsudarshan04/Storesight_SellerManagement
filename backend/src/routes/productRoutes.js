import express from 'express';
import { addProduct, getProducts, updateProduct, deleteProduct, updateStock } from '../controllers/productController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// POST /api/products - Add new product
router.post('/', addProduct);

// GET /api/products - Get all products
router.get('/', getProducts);

// PUT /api/products/:id - Update product
router.put('/:id', updateProduct);

// PATCH /api/products/:id/stock - Quick stock update
router.patch('/:id/stock', updateStock);

// DELETE /api/products/:id - Delete product
router.delete('/:id', deleteProduct);

export default router;

