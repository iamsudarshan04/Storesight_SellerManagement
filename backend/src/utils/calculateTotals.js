import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

// Calculate today's sales
export const getTodaySales = async (userId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sales = await Sale.find({
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: today },
        status: 'completed'
    });

    const total = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    return { count: sales.length, total };
};

// Calculate total revenue
export const getTotalRevenue = async (userId) => {
    const sales = await Sale.find({
        userId: new mongoose.Types.ObjectId(userId),
        status: 'completed'
    });
    const total = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    return total;
};

// Calculate monthly revenue
export const getMonthlyRevenue = async (userId) => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const sales = await Sale.find({
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startOfMonth },
        status: 'completed'
    });

    const total = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    return total;
};

// Calculate total orders
export const getTotalOrders = async (userId) => {
    const count = await Sale.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
        status: 'completed'
    });
    return count;
};

// Get best selling products
export const getBestSellingProducts = async (userId, limit = 5) => {
    const sales = await Sale.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                status: 'completed'
            }
        },
        {
            $group: {
                _id: '$productId',
                totalQuantity: { $sum: '$quantitySold' },
                totalRevenue: { $sum: '$totalAmount' }
            }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: limit }
    ]);

    // Populate product details
    const productsWithDetails = await Promise.all(
        sales.map(async (sale) => {
            const product = await Product.findById(sale._id);
            return {
                product: product?.productName || 'Unknown',
                totalQuantity: sale.totalQuantity,
                totalRevenue: sale.totalRevenue
            };
        })
    );

    return productsWithDetails;
};

// Get low stock products
export const getLowStockProducts = async (userId) => {
    const products = await Product.find({
        userId: new mongoose.Types.ObjectId(userId),
        $expr: { $lte: ["$quantity", "$lowStockLimit"] }
    });
    return products;
};

// Generate monthly report
export const getMonthlyReport = async (userId) => {
    const sales = await Sale.find({
        userId: new mongoose.Types.ObjectId(userId),
        status: 'completed'
    })
        .populate('productId');

    const monthlyData = {};

    sales.forEach(sale => {
        const date = new Date(sale.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
                month: monthKey,
                grossSales: 0,
                totalOrders: 0,
                refunds: 0,
                estimatedProfit: 0
            };
        }

        monthlyData[monthKey].grossSales += sale.totalAmount;
        monthlyData[monthKey].totalOrders += 1;

        if (sale.productId) {
            const cost = sale.productId.costPrice * sale.quantitySold;
            const profit = sale.totalAmount - cost;
            monthlyData[monthKey].estimatedProfit += profit;
        }
    });

    return Object.values(monthlyData).sort((a, b) => b.month.localeCompare(a.month));
};
