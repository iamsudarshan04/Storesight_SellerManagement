import Sale from '../models/Sale.js';
import Product from '../models/Product.js';

// Calculate today's sales (exclude cancelled)
export const getTodaySales = async (userId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sales = await Sale.find({
        userId: userId,
        date: { $gte: today },
        status: { $ne: 'Cancelled' }
    });

    const total = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    return { count: sales.length, total };
};

// Calculate total revenue (exclude cancelled)
export const getTotalRevenue = async (userId) => {
    const sales = await Sale.find({
        userId: userId,
        status: { $ne: 'Cancelled' }
    });
    const total = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    return total;
};

// Calculate monthly revenue (exclude cancelled)
export const getMonthlyRevenue = async (userId) => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const sales = await Sale.find({
        userId: userId,
        date: { $gte: startOfMonth },
        status: { $ne: 'Cancelled' }
    });

    const total = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    return total;
};

// Calculate total orders (exclude cancelled)
export const getTotalOrders = async (userId) => {
    const count = await Sale.countDocuments({
        userId: userId,
        status: { $ne: 'Cancelled' }
    });
    return count;
};

// Get best selling products (exclude cancelled)
export const getBestSellingProducts = async (userId, limit = 5) => {
    try {
        const sales = await Sale.find({
            userId: userId,
            status: { $ne: 'Cancelled' }
        }).populate('productId', 'productName');

        // Group manually instead of using aggregate (avoids ObjectId casting issues)
        const productMap = {};
        sales.forEach(sale => {
            const pid = sale.productId?._id?.toString() || 'unknown';
            if (!productMap[pid]) {
                productMap[pid] = {
                    product: sale.productId?.productName || 'Unknown',
                    totalQuantity: 0,
                    totalRevenue: 0
                };
            }
            productMap[pid].totalQuantity += sale.quantitySold;
            productMap[pid].totalRevenue += sale.totalAmount;
        });

        return Object.values(productMap)
            .sort((a, b) => b.totalQuantity - a.totalQuantity)
            .slice(0, limit);
    } catch (error) {
        console.error('Error in getBestSellingProducts:', error);
        return [];
    }
};

// Get low stock products
export const getLowStockProducts = async (userId) => {
    const products = await Product.find({
        userId: userId
    });
    // Filter in JS to avoid $expr issues
    return products.filter(p => p.quantity <= p.lowStockLimit);
};

// Generate monthly report (exclude cancelled)
export const getMonthlyReport = async (userId) => {
    const sales = await Sale.find({
        userId: userId,
        status: { $ne: 'Cancelled' }
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
                estimatedProfit: 0,
                paidAmount: 0,
                pendingAmount: 0,
                unitsSold: 0,
                paymentMethods: {}
            };
        }

        monthlyData[monthKey].grossSales += sale.totalAmount;
        monthlyData[monthKey].totalOrders += 1;
        monthlyData[monthKey].unitsSold += sale.quantitySold;

        // Track paid vs pending
        if (sale.paymentStatus === 'Paid') {
            monthlyData[monthKey].paidAmount += sale.totalAmount;
        } else {
            monthlyData[monthKey].pendingAmount += sale.totalAmount;
        }

        // Track payment methods
        const method = sale.paymentMethod || 'Other';
        monthlyData[monthKey].paymentMethods[method] = (monthlyData[monthKey].paymentMethods[method] || 0) + 1;

        if (sale.productId) {
            const cost = sale.productId.costPrice * sale.quantitySold;
            const profit = sale.totalAmount - cost;
            monthlyData[monthKey].estimatedProfit += profit;
        }
    });

    return Object.values(monthlyData).sort((a, b) => b.month.localeCompare(a.month));
};
