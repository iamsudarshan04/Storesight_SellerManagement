import express from 'express';
import { getPublicStore, placePublicOrder, trackOrder } from '../controllers/storeController.js';

const router = express.Router();

// GET /api/store/track/:orderId - Track order (public, no auth)
router.get('/track/:orderId', trackOrder);

// GET /api/store/:slug - Public store page data (no auth)
router.get('/:slug', getPublicStore);

// POST /api/store/:slug/order - Place order from storefront (no auth)
router.post('/:slug/order', placePublicOrder);

export default router;
