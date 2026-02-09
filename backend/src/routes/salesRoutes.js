import express from 'express';
import { recordSale, getSalesSummary, getAllSales, getSaleById, getMonthlyReportController, cancelSale } from '../controllers/salesController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// POST /api/sales - Record a sale
router.post('/', recordSale);

// GET /api/sales/monthly-reports - Get monthly reports
router.get('/monthly-reports', getMonthlyReportController);

// GET /api/sales/summary - Get sales summary
router.get('/summary', getSalesSummary);

// GET /api/sales - Get all sales
router.get('/', getAllSales);

// GET /api/sales/:id - Get single sale details
router.get('/:id', getSaleById);

// POST /api/sales/:id/cancel - Cancel a sale (order)
router.post('/:id/cancel', cancelSale);

export default router;
