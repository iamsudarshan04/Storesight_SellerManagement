import express from 'express';
import { getPublicStore } from '../controllers/storeController.js';

const router = express.Router();

// GET /api/store/:slug - Public store page data (no auth)
router.get('/:slug', getPublicStore);

export default router;
