import { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import './Reports.css';

const Reports = () => {
    const [monthlyReports, setMonthlyReports] = useState([]);
    const [summary, setSummary] = useState(null);
    const [allSales, setAllSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // overview, monthly, products, customers

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const [reportsRes, summaryRes, salesRes, productsRes] = await Promise.all([
                axiosInstance.get('/sales/monthly-reports'),
                axiosInstance.get('/sales/summary'),
                axiosInstance.get('/sales'),
                axiosInstance.get('/products')
            ]);
            setMonthlyReports(reportsRes.data);
            setSummary(summaryRes.data);
            setAllSales(salesRes.data);
            setProducts(productsRes.data.products);
        } catch (err) {
            console.error('Error fetching reports:', err);
            setError('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const formatAmount = (amount) => {
        return '₹' + Number(amount || 0).toLocaleString('en-IN');
    };

    const formatMonth = (monthKey) => {
        const [year, month] = monthKey.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    };

    // ============ Derived Data ============

    // Active sales (non-cancelled)
    const activeSales = allSales.filter(s => s.status !== 'Cancelled');

    // Overall stats
    const totalRevenue = activeSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalOrders = activeSales.length;
    const totalProfit = monthlyReports.reduce((sum, r) => sum + (r.estimatedProfit || 0), 0);
    const totalUnitsSold = activeSales.reduce((sum, s) => sum + s.quantitySold, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const paidAmount = activeSales.filter(s => s.paymentStatus === 'Paid').reduce((sum, s) => sum + s.totalAmount, 0);
    const pendingAmount = activeSales.filter(s => s.paymentStatus === 'Pending').reduce((sum, s) => sum + s.totalAmount, 0);
    const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0;

    // Top products by revenue
    const productRevenueMap = {};
    activeSales.forEach(sale => {
        const name = sale.productId?.productName || 'Unknown';
        if (!productRevenueMap[name]) {
            productRevenueMap[name] = { name, revenue: 0, units: 0, orders: 0 };
        }
        productRevenueMap[name].revenue += sale.totalAmount;
        productRevenueMap[name].units += sale.quantitySold;
        productRevenueMap[name].orders += 1;
    });
    const topProducts = Object.values(productRevenueMap).sort((a, b) => b.revenue - a.revenue);

    // Customer breakdown
    const customerMap = {};
    activeSales.forEach(sale => {
        const name = sale.customerName || 'Walk-in';
        if (!customerMap[name]) {
            customerMap[name] = { name, spent: 0, orders: 0, lastOrder: sale.date };
        }
        customerMap[name].spent += sale.totalAmount;
        customerMap[name].orders += 1;
        if (new Date(sale.date) > new Date(customerMap[name].lastOrder)) {
            customerMap[name].lastOrder = sale.date;
        }
    });
    const topCustomers = Object.values(customerMap).sort((a, b) => b.spent - a.spent);

    // Payment method breakdown
    const methodMap = {};
    activeSales.forEach(sale => {
        const m = sale.paymentMethod || 'Other';
        if (!methodMap[m]) methodMap[m] = { method: m, count: 0, amount: 0 };
        methodMap[m].count += 1;
        methodMap[m].amount += sale.totalAmount;
    });
    const paymentMethods = Object.values(methodMap).sort((a, b) => b.amount - a.amount);

    // Bar chart max value for scaling
    const maxRevenue = monthlyReports.length > 0
        ? Math.max(...monthlyReports.map(r => r.grossSales))
        : 1;

    if (loading) {
        return (
            <div className="reports-page">
                <div className="rpt-loading">
                    <div className="rpt-spinner"></div>
                    <p>Loading reports...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="reports-page">
                <div className="rpt-error">{error}</div>
            </div>
        );
    }

    return (
        <div className="reports-page">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h2>Business Insights</h2>
                    <p>See how your business is doing</p>
                </div>
            </div>

            {/* Overview Stat Cards */}
            <div className="rpt-stats-grid">
                <div className="rpt-stat-card" style={{ borderLeftColor: '#10b981' }}>
                    <span className="rpt-stat-icon">💰</span>
                    <div className="rpt-stat-info">
                        <h3 style={{ color: '#10b981' }}>{formatAmount(totalRevenue)}</h3>
                        <p>Total Revenue</p>
                    </div>
                </div>
                <div className="rpt-stat-card" style={{ borderLeftColor: '#3b82f6' }}>
                    <span className="rpt-stat-icon">📦</span>
                    <div className="rpt-stat-info">
                        <h3 style={{ color: '#3b82f6' }}>{totalOrders}</h3>
                        <p>Total Orders</p>
                    </div>
                </div>
                <div className="rpt-stat-card" style={{ borderLeftColor: '#8b5cf6' }}>
                    <span className="rpt-stat-icon">📈</span>
                    <div className="rpt-stat-info">
                        <h3 style={{ color: '#8b5cf6' }}>{formatAmount(totalProfit)}</h3>
                        <p>Estimated Profit ({profitMargin}%)</p>
                    </div>
                </div>
                <div className="rpt-stat-card" style={{ borderLeftColor: '#f59e0b' }}>
                    <span className="rpt-stat-icon">🛒</span>
                    <div className="rpt-stat-info">
                        <h3 style={{ color: '#f59e0b' }}>{formatAmount(avgOrderValue)}</h3>
                        <p>Avg Order Value</p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="rpt-tabs">
                {[
                    { key: 'overview', label: '📊 Overview' },
                    { key: 'monthly', label: '📅 Monthly' },
                    { key: 'products', label: '📦 Products' },
                    { key: 'customers', label: '👥 Customers' },
                ].map(tab => (
                    <button
                        key={tab.key}
                        className={`rpt-tab ${activeTab === tab.key ? 'rpt-tab-active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ============ OVERVIEW TAB ============ */}
            {activeTab === 'overview' && (
                <div className="rpt-tab-content">
                    {/* Revenue Chart */}
                    <div className="rpt-card">
                        <h3>Monthly Revenue</h3>
                        {monthlyReports.length === 0 ? (
                            <div className="rpt-empty-chart">
                                <span>📉</span>
                                <p>No sales data yet. Start selling to see your revenue chart!</p>
                            </div>
                        ) : (
                            <div className="rpt-bar-chart">
                                <div className="rpt-bars">
                                    {[...monthlyReports].reverse().slice(-6).map((report, index) => {
                                        const heightPct = maxRevenue > 0 ? (report.grossSales / maxRevenue) * 100 : 0;
                                        return (
                                            <div key={index} className="rpt-bar-col">
                                                <div className="rpt-bar-amount">{formatAmount(report.grossSales)}</div>
                                                <div
                                                    className="rpt-bar"
                                                    style={{ height: `${Math.max(heightPct, 4)}%` }}
                                                ></div>
                                                <div className="rpt-bar-label">
                                                    {formatMonth(report.month).split(' ')[0].slice(0, 3)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Two Column: Payment Breakdown + Collection Status */}
                    <div className="rpt-two-col">
                        {/* Payment Methods */}
                        <div className="rpt-card">
                            <h3>Payment Methods</h3>
                            {paymentMethods.length === 0 ? (
                                <div className="rpt-empty-small">No data yet</div>
                            ) : (
                                <div className="rpt-method-list">
                                    {paymentMethods.map((pm, i) => {
                                        const pct = totalRevenue > 0 ? ((pm.amount / totalRevenue) * 100).toFixed(0) : 0;
                                        return (
                                            <div key={i} className="rpt-method-item">
                                                <div className="rpt-method-header">
                                                    <span className="rpt-method-name">
                                                        {pm.method === 'UPI' ? '📱' : pm.method === 'COD' ? '💵' : '🏦'}{' '}
                                                        {pm.method}
                                                    </span>
                                                    <span className="rpt-method-amount">{formatAmount(pm.amount)}</span>
                                                </div>
                                                <div className="rpt-progress-bar">
                                                    <div
                                                        className="rpt-progress-fill"
                                                        style={{ width: `${pct}%` }}
                                                    ></div>
                                                </div>
                                                <div className="rpt-method-meta">
                                                    <span>{pm.count} orders</span>
                                                    <span>{pct}%</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Collection Status */}
                        <div className="rpt-card">
                            <h3>Collection Status</h3>
                            <div className="rpt-collection">
                                <div className="rpt-collection-item rpt-collected">
                                    <div className="rpt-collection-label">
                                        <span className="rpt-dot rpt-dot-green"></span> Collected
                                    </div>
                                    <div className="rpt-collection-value">{formatAmount(paidAmount)}</div>
                                    <div className="rpt-collection-pct">
                                        {totalRevenue > 0 ? ((paidAmount / totalRevenue) * 100).toFixed(0) : 0}%
                                    </div>
                                </div>
                                <div className="rpt-collection-item rpt-pending">
                                    <div className="rpt-collection-label">
                                        <span className="rpt-dot rpt-dot-yellow"></span> Pending
                                    </div>
                                    <div className="rpt-collection-value">{formatAmount(pendingAmount)}</div>
                                    <div className="rpt-collection-pct">
                                        {totalRevenue > 0 ? ((pendingAmount / totalRevenue) * 100).toFixed(0) : 0}%
                                    </div>
                                </div>
                                <div className="rpt-collection-bar">
                                    <div
                                        className="rpt-collection-fill-green"
                                        style={{ width: totalRevenue > 0 ? `${(paidAmount / totalRevenue) * 100}%` : '0%' }}
                                    ></div>
                                    <div
                                        className="rpt-collection-fill-yellow"
                                        style={{ width: totalRevenue > 0 ? `${(pendingAmount / totalRevenue) * 100}%` : '0%' }}
                                    ></div>
                                </div>
                                <div className="rpt-collection-summary">
                                    <span>Total: {formatAmount(totalRevenue)}</span>
                                    <span>{totalUnitsSold} units sold</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ============ MONTHLY TAB ============ */}
            {activeTab === 'monthly' && (
                <div className="rpt-tab-content">
                    <div className="rpt-card">
                        <h3>Monthly Breakdown</h3>
                        {monthlyReports.length === 0 ? (
                            <div className="rpt-empty-chart">
                                <span>📉</span>
                                <p>No reports yet. Start selling to see your growth here!</p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop table */}
                                <div className="rpt-table-wrap rpt-desktop-only">
                                    <table className="rpt-table">
                                        <thead>
                                            <tr>
                                                <th>Month</th>
                                                <th>Revenue</th>
                                                <th>Orders</th>
                                                <th>Units Sold</th>
                                                <th>Collected</th>
                                                <th>Pending</th>
                                                <th>Profit</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {monthlyReports.map((report, index) => (
                                                <tr key={index}>
                                                    <td className="rpt-month-cell">{formatMonth(report.month)}</td>
                                                    <td className="rpt-revenue-cell">{formatAmount(report.grossSales)}</td>
                                                    <td>{report.totalOrders}</td>
                                                    <td>{report.unitsSold || 0}</td>
                                                    <td className="rpt-paid-cell">{formatAmount(report.paidAmount || 0)}</td>
                                                    <td className="rpt-pending-cell">{formatAmount(report.pendingAmount || 0)}</td>
                                                    <td className="rpt-profit-cell">{formatAmount(report.estimatedProfit)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td><strong>Total</strong></td>
                                                <td className="rpt-revenue-cell"><strong>{formatAmount(totalRevenue)}</strong></td>
                                                <td><strong>{totalOrders}</strong></td>
                                                <td><strong>{totalUnitsSold}</strong></td>
                                                <td className="rpt-paid-cell"><strong>{formatAmount(paidAmount)}</strong></td>
                                                <td className="rpt-pending-cell"><strong>{formatAmount(pendingAmount)}</strong></td>
                                                <td className="rpt-profit-cell"><strong>{formatAmount(totalProfit)}</strong></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                {/* Mobile cards */}
                                <div className="rpt-mobile-only">
                                    {monthlyReports.map((report, index) => (
                                        <div key={index} className="rpt-month-card">
                                            <div className="rpt-month-card-header">
                                                <span className="rpt-month-name">{formatMonth(report.month)}</span>
                                                <span className="rpt-month-revenue">{formatAmount(report.grossSales)}</span>
                                            </div>
                                            <div className="rpt-month-card-stats">
                                                <div className="rpt-mc-stat">
                                                    <span className="rpt-mc-label">Orders</span>
                                                    <span className="rpt-mc-value">{report.totalOrders}</span>
                                                </div>
                                                <div className="rpt-mc-stat">
                                                    <span className="rpt-mc-label">Units</span>
                                                    <span className="rpt-mc-value">{report.unitsSold || 0}</span>
                                                </div>
                                                <div className="rpt-mc-stat">
                                                    <span className="rpt-mc-label">Profit</span>
                                                    <span className="rpt-mc-value rpt-profit-cell">{formatAmount(report.estimatedProfit)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ============ PRODUCTS TAB ============ */}
            {activeTab === 'products' && (
                <div className="rpt-tab-content">
                    <div className="rpt-card">
                        <h3>Product Performance</h3>
                        {topProducts.length === 0 ? (
                            <div className="rpt-empty-chart">
                                <span>📦</span>
                                <p>No product sales data yet.</p>
                            </div>
                        ) : (
                            <>
                                <div className="rpt-table-wrap rpt-desktop-only">
                                    <table className="rpt-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Product</th>
                                                <th>Revenue</th>
                                                <th>Units Sold</th>
                                                <th>Orders</th>
                                                <th>Share</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topProducts.map((p, i) => {
                                                const share = totalRevenue > 0 ? ((p.revenue / totalRevenue) * 100).toFixed(1) : 0;
                                                return (
                                                    <tr key={i}>
                                                        <td className="rpt-rank">{i + 1}</td>
                                                        <td className="rpt-product-name">{p.name}</td>
                                                        <td className="rpt-revenue-cell">{formatAmount(p.revenue)}</td>
                                                        <td>{p.units}</td>
                                                        <td>{p.orders}</td>
                                                        <td>
                                                            <div className="rpt-share-bar-wrap">
                                                                <div className="rpt-share-bar">
                                                                    <div className="rpt-share-fill" style={{ width: `${share}%` }}></div>
                                                                </div>
                                                                <span>{share}%</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="rpt-mobile-only">
                                    {topProducts.map((p, i) => (
                                        <div key={i} className="rpt-product-card">
                                            <div className="rpt-product-card-top">
                                                <span className="rpt-product-rank">#{i + 1}</span>
                                                <span className="rpt-product-card-name">{p.name}</span>
                                                <span className="rpt-product-card-revenue">{formatAmount(p.revenue)}</span>
                                            </div>
                                            <div className="rpt-product-card-stats">
                                                <span>{p.units} units</span>
                                                <span>{p.orders} orders</span>
                                                <span>{totalRevenue > 0 ? ((p.revenue / totalRevenue) * 100).toFixed(1) : 0}% share</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Inventory Summary */}
                    <div className="rpt-card">
                        <h3>Inventory Summary</h3>
                        <div className="rpt-inv-stats">
                            <div className="rpt-inv-stat">
                                <span className="rpt-inv-value">{products.length}</span>
                                <span className="rpt-inv-label">Total Products</span>
                            </div>
                            <div className="rpt-inv-stat">
                                <span className="rpt-inv-value rpt-text-green">
                                    {products.filter(p => p.quantity > p.lowStockLimit).length}
                                </span>
                                <span className="rpt-inv-label">In Stock</span>
                            </div>
                            <div className="rpt-inv-stat">
                                <span className="rpt-inv-value rpt-text-yellow">
                                    {products.filter(p => p.quantity > 0 && p.quantity <= p.lowStockLimit).length}
                                </span>
                                <span className="rpt-inv-label">Low Stock</span>
                            </div>
                            <div className="rpt-inv-stat">
                                <span className="rpt-inv-value rpt-text-red">
                                    {products.filter(p => p.quantity === 0).length}
                                </span>
                                <span className="rpt-inv-label">Out of Stock</span>
                            </div>
                            <div className="rpt-inv-stat">
                                <span className="rpt-inv-value">
                                    {formatAmount(products.reduce((sum, p) => sum + p.quantity * p.costPrice, 0))}
                                </span>
                                <span className="rpt-inv-label">Stock Value</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ============ CUSTOMERS TAB ============ */}
            {activeTab === 'customers' && (
                <div className="rpt-tab-content">
                    <div className="rpt-card">
                        <h3>Customer Overview</h3>
                        <div className="rpt-customer-stats">
                            <div className="rpt-cust-stat">
                                <span className="rpt-cust-value">{topCustomers.length}</span>
                                <span className="rpt-cust-label">Total Customers</span>
                            </div>
                            <div className="rpt-cust-stat">
                                <span className="rpt-cust-value">{formatAmount(avgOrderValue)}</span>
                                <span className="rpt-cust-label">Avg Order Value</span>
                            </div>
                            <div className="rpt-cust-stat">
                                <span className="rpt-cust-value">
                                    {topCustomers.filter(c => c.orders > 1).length}
                                </span>
                                <span className="rpt-cust-label">Repeat Buyers</span>
                            </div>
                        </div>
                    </div>

                    <div className="rpt-card">
                        <h3>Top Customers</h3>
                        {topCustomers.length === 0 ? (
                            <div className="rpt-empty-chart">
                                <span>👥</span>
                                <p>No customer data yet.</p>
                            </div>
                        ) : (
                            <>
                                <div className="rpt-table-wrap rpt-desktop-only">
                                    <table className="rpt-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Customer</th>
                                                <th>Total Spent</th>
                                                <th>Orders</th>
                                                <th>Avg Order</th>
                                                <th>Last Order</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topCustomers.slice(0, 20).map((c, i) => (
                                                <tr key={i}>
                                                    <td className="rpt-rank">{i + 1}</td>
                                                    <td className="rpt-customer-name">{c.name}</td>
                                                    <td className="rpt-revenue-cell">{formatAmount(c.spent)}</td>
                                                    <td>{c.orders}</td>
                                                    <td>{formatAmount(c.spent / c.orders)}</td>
                                                    <td className="rpt-date-cell">
                                                        {new Date(c.lastOrder).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="rpt-mobile-only">
                                    {topCustomers.slice(0, 20).map((c, i) => (
                                        <div key={i} className="rpt-customer-card">
                                            <div className="rpt-customer-card-top">
                                                <div>
                                                    <span className="rpt-product-rank">#{i + 1}</span>
                                                    <span className="rpt-customer-card-name">{c.name}</span>
                                                </div>
                                                <span className="rpt-customer-card-spent">{formatAmount(c.spent)}</span>
                                            </div>
                                            <div className="rpt-product-card-stats">
                                                <span>{c.orders} orders</span>
                                                <span>Avg: {formatAmount(c.spent / c.orders)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
