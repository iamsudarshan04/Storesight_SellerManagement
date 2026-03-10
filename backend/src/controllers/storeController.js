import User from '../models/User.js';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';

// Get public store data by slug (no auth required)
export const getPublicStore = async (req, res) => {
    try {
        const { slug } = req.params;

        // Find seller by store slug
        const seller = await User.findOne({ storeSlug: slug }).select(
            'name businessName storeDescription whatsappNumber storeActive storeSlug themeColor showWhatsapp storeLogo'
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
                whatsapp: (seller.showWhatsapp !== false && seller.whatsappNumber) ? seller.whatsappNumber : '',
                slug: seller.storeSlug,
                themeColor: seller.themeColor || '#6366f1',
                logo: seller.storeLogo || ''
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

// Place order from public storefront (no auth required)
export const placePublicOrder = async (req, res) => {
    try {
        const { slug } = req.params;
        const { productId, quantity, customerName, phoneNumber, address, paymentMethod } = req.body;

        // Validate required fields
        if (!productId || !quantity || !customerName || !phoneNumber || !paymentMethod) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Find seller
        const seller = await User.findOne({ storeSlug: slug, storeActive: true });
        if (!seller) {
            return res.status(404).json({ message: 'Store not found' });
        }

        // Find product belonging to this seller
        const product = await Product.findOne({ _id: productId, userId: seller._id });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check stock
        if (product.quantity < quantity) {
            return res.status(400).json({
                message: 'Not enough stock available',
                available: product.quantity
            });
        }

        // Calculate total
        const totalAmount = product.sellingPrice * quantity;

        // Create sale (order)
        const sale = new Sale({
            productId,
            quantitySold: quantity,
            totalAmount,
            userId: seller._id,
            customerName,
            phoneNumber,
            address: address || '',
            paymentMethod,
            paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Pending',
            source: 'storefront'
        });

        await sale.save();

        // Update product stock
        product.quantity -= quantity;
        await product.save();

        res.status(201).json({
            message: 'Order placed successfully!',
            orderId: sale.orderId,
            order: {
                orderId: sale.orderId,
                productName: product.productName,
                quantity: sale.quantitySold,
                total: sale.totalAmount,
                paymentMethod: sale.paymentMethod,
                status: sale.status
            }
        });
    } catch (error) {
        console.error('placePublicOrder error:', error);
        res.status(500).json({ message: 'Something went wrong. Please try again.', error: error.message });
    }
};

// Track order by orderId (public, no auth)
export const trackOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        const sale = await Sale.findOne({ orderId: orderId.toUpperCase() })
            .populate('productId', 'productName sellingPrice');

        if (!sale) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Get seller info for contact
        const seller = await User.findOne({ _id: sale.userId }).select(
            'businessName name whatsappNumber storeSlug'
        );

        res.json({
            order: {
                orderId: sale.orderId,
                productName: sale.productId?.productName || 'Product',
                quantity: sale.quantitySold,
                totalAmount: sale.totalAmount,
                customerName: sale.customerName,
                paymentMethod: sale.paymentMethod,
                paymentStatus: sale.paymentStatus,
                status: sale.status,
                date: sale.date,
                address: sale.address || ''
            },
            seller: {
                name: seller?.businessName || seller?.name || 'Seller',
                whatsapp: seller?.whatsappNumber || '',
                storeSlug: seller?.storeSlug || ''
            }
        });
    } catch (error) {
        console.error('trackOrder error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
