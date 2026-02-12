import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import { getTodaySales, getTotalRevenue, getBestSellingProducts, getLowStockProducts, getMonthlyRevenue, getTotalOrders, getMonthlyReport } from '../utils/calculateTotals.js';

// Record a sale
export const recordSale = async (req, res) => {
    try {
        const { productId, quantitySold, customerName, phoneNumber, paymentMethod, paymentStatus } = req.body;

        // Log incoming request for debugging
        console.log('📝 Recording sale:', { productId, quantitySold, customerName, phoneNumber, paymentMethod, paymentStatus, userId: req.userId });

        // Find product
        const product = await Product.findOne({ _id: productId, userId: req.userId });

        if (!product) {
            console.log('❌ Product not found:', productId);
            return res.status(404).json({ message: 'Product not found' });
        }

        console.log('✅ Product found:', product.productName);

        // Check stock availability
        if (product.quantity < quantitySold) {
            console.log('❌ Insufficient stock:', { available: product.quantity, requested: quantitySold });
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
            userId: req.userId,
            customerName,
            phoneNumber,
            paymentMethod,
            paymentStatus: paymentStatus || 'Pending'
        });

        console.log('💾 Saving sale...');
        await sale.save();
        console.log('✅ Sale saved successfully');

        // Update product quantity
        product.quantity -= quantitySold;
        await product.save();
        console.log('✅ Product quantity updated');

        res.status(201).json({
            message: 'Sale recorded successfully',
            sale,
            remainingStock: product.quantity
        });
    } catch (error) {
        console.error('❌ Error recording sale:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({
            message: 'Server error',
            error: error.message,
            details: error.name === 'ValidationError' ? error.errors : undefined
        });
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
// Update payment status (Toggle Paid/Pending)
export const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentStatus } = req.body;

        const sale = await Sale.findOne({ _id: id, userId: req.userId });

        if (!sale) {
            return res.status(404).json({ message: 'Order not found' });
        }

        sale.paymentStatus = paymentStatus;
        await sale.save();

        res.json({
            message: 'Payment status updated successfully',
            sale
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
