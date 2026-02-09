import express from 'express';
import { recordSale, getSalesSummary, getAllSales, getSaleById } from '../controllers/salesController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// POST /api/sales - Record a sale
router.post('/', recordSale);

// GET /api/sales/summary - Get sales summary
router.get('/summary', getSalesSummary);

// GET /api/sales - Get all sales
router.get('/', getAllSales);

// GET /api/sales/:id - Get single sale details
router.get('/:id', getSaleById);

export default router;
