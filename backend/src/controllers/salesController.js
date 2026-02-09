import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import { getTodaySales, getTotalRevenue, getBestSellingProducts, getLowStockProducts, getMonthlyRevenue, getTotalOrders, getMonthlyReport } from '../utils/calculateTotals.js';

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

        const [todaySales, totalRevenue, bestSelling, lowStock, monthlyRevenue, totalOrders] = await Promise.all([
            getTodaySales(userId),
            getTotalRevenue(userId),
            getBestSellingProducts(userId),
            getLowStockProducts(userId),
            getMonthlyRevenue(userId),
            getTotalOrders(userId)
        ]);

        res.json({
            todaySales: {
                count: todaySales.count,
                total: todaySales.total
            },
            totalRevenue,
            monthlyRevenue,
            totalOrders,
            paidOrders: totalOrders, // Assuming all sales are paid as per current model
            pendingOrders: 0,
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

// Get all sales (Orders)
export const getAllSales = async (req, res) => {
    try {
        const sales = await Sale.find({ userId: req.userId })
            .populate('productId', 'productName sellingPrice')
            .sort({ date: -1 });

        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get single sale details
export const getSaleById = async (req, res) => {
    try {
        const { id } = req.params;
        const sale = await Sale.findOne({ _id: id, userId: req.userId })
            .populate('productId', 'productName sellingPrice costPrice');

        if (!sale) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(sale);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
// Get monthly reports
export const getMonthlyReportController = async (req, res) => {
    try {
        const report = await getMonthlyReport(req.userId);
        res.json(report);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Cancel a sale
export const cancelSale = async (req, res) => {
    try {
        const { id } = req.params;
        const sale = await Sale.findOne({ _id: id, userId: req.userId });

        if (!sale) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (sale.status === 'cancelled') {
            return res.status(400).json({ message: 'Order is already cancelled' });
        }

        // Restore stock
        const product = await Product.findOne({ _id: sale.productId, userId: req.userId });

        if (product) {
            product.quantity += sale.quantitySold;
            await product.save();
        }

        // Mark sale as cancelled
        sale.status = 'cancelled';
        await sale.save();

        res.json({
            message: 'Order cancelled successfully',
            sale,
            restoredStock: product ? product.quantity : null
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
