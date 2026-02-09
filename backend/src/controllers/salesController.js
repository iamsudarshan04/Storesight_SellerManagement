import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import { getTodaySales, getTotalRevenue, getBestSellingProducts, getLowStockProducts } from '../utils/calculateTotals.js';

// Record a sale
export const recordSale = async (req, res) => {
    try {
        const { productId, quantitySold } = req.body;

        // Find product
        const product = await Product.findOne({ _id: productId, userId: req.userId });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check stock availability
        if (product.quantity < quantitySold) {
            return res.status(400).json({
                message: 'Insufficient stock',
                available: product.quantity
            });
        }

        // Calculate total amount
        const totalAmount = product.sellingPrice * quantitySold;

        // Create sale record
        const sale = new Sale({
            productId,
            quantitySold,
            totalAmount,
            userId: req.userId
        });

        await sale.save();

        // Update product quantity
        product.quantity -= quantitySold;
        await product.save();

        res.status(201).json({
            message: 'Sale recorded successfully',
            sale,
            remainingStock: product.quantity
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get sales summary for dashboard
export const getSalesSummary = async (req, res) => {
    try {
        const userId = req.userId;

        const [todaySales, totalRevenue, bestSelling, lowStock] = await Promise.all([
            getTodaySales(userId),
            getTotalRevenue(userId),
            getBestSellingProducts(userId),
            getLowStockProducts(userId)
        ]);

        res.json({
            todaySales: {
                count: todaySales.count,
                total: todaySales.total
            },
            totalRevenue,
            bestSellingProducts: bestSelling,
            lowStockProducts: lowStock.map(p => ({
                id: p._id,
                name: p.productName,
                quantity: p.quantity,
                lowStockLimit: p.lowStockLimit
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
