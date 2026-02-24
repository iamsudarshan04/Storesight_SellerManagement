import User from '../models/User.js';
import Product from '../models/Product.js';

// Get public store data by slug (no auth required)
export const getPublicStore = async (req, res) => {
    try {
        const { slug } = req.params;

        // Find seller by store slug
        const seller = await User.findOne({ storeSlug: slug }).select(
            'name businessName storeDescription whatsappNumber storeActive storeSlug'
        );

        if (!seller) {
            return res.status(404).json({ message: 'Store not found' });
        }

        if (!seller.storeActive) {
            return res.status(404).json({ message: 'This store is currently unavailable' });
        }

        // Get seller's products (only in-stock ones)
        const products = await Product.find({
            userId: seller._id,
            quantity: { $gt: 0 }
        }).select('productName sellingPrice quantity').sort({ createdAt: -1 });

        res.json({
            store: {
                name: seller.businessName || seller.name,
                ownerName: seller.name,
                description: seller.storeDescription || '',
                whatsapp: seller.whatsappNumber || '',
                slug: seller.storeSlug
            },
            products: products.map(p => ({
                id: p._id,
                name: p.productName,
                price: p.sellingPrice,
                inStock: p.quantity > 0
            }))
        });
    } catch (error) {
        console.error('getPublicStore error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
