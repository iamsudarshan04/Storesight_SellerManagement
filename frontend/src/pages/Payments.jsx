import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import './Payments.css';

const Payments = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [methodFilter, setMethodFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSales();
    }, []);

    // Auto-dismiss toast
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const fetchSales = async () => {
        try {
            const response = await axiosInstance.get('/sales');
            setSales(response.data);
        } catch (error) {
            console.error('Failed to fetch sales:', error);
            showToast('Failed to load payments', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    // Toggle payment status
    const handlePaymentToggle = async (saleId, currentStatus) => {
        const newStatus = currentStatus === 'Paid' ? 'Pending' : 'Paid';

        // Optimistic update
        setSales(prev =>
            prev.map(s => s._id === saleId ? { ...s, paymentStatus: newStatus } : s)
        );

        try {
            await axiosInstance.patch(`/sales/${saleId}/payment-status`, {
                paymentStatus: newStatus
            });
            showToast(`Payment marked as ${newStatus}`, 'success');
        } catch (error) {
            console.error('Failed to update payment status:', error);
            // Revert
            setSales(prev =>
                prev.map(s => s._id === saleId ? { ...s, paymentStatus: currentStatus } : s)
            );
            showToast('Failed to update payment status', 'error');
        }
    };

    const getMethodIcon = (method) => {
        switch (method) {
            case 'UPI': return '📱';
            case 'COD': return '💵';
            case 'Bank Transfer': return '🏦';
            default: return '💰';
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatAmount = (amount) => {
        return '₹' + Number(amount).toLocaleString('en-IN');
    };

    // Exclude cancelled orders from payment calculations
    const activeSales = sales.filter(s => s.status !== 'Cancelled');

    // Compute stats from real data
    const totalRevenue = activeSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const paidAmount = activeSales.filter(s => s.paymentStatus === 'Paid').reduce((sum, s) => sum + s.totalAmount, 0);
    const pendingAmount = activeSales.filter(s => s.paymentStatus === 'Pending').reduce((sum, s) => sum + s.totalAmount, 0);
    const pendingCount = activeSales.filter(s => s.paymentStatus === 'Pending').length;

    const stats = [
        { label: 'Total Revenue', value: formatAmount(totalRevenue), icon: '💰', color: '#10b981' },
        { label: 'Received', value: formatAmount(paidAmount), icon: '✅', color: '#3b82f6' },
        { label: 'Pending', value: formatAmount(pendingAmount), icon: '⏳', color: '#f59e0b', count: pendingCount },
        { label: 'Total Orders', value: activeSales.length, icon: '📦', color: '#8b5cf6' },
    ];

    // Filter sales
    const filteredSales = sales.filter(sale => {
        // Exclude cancelled from the payments view
        if (sale.status === 'Cancelled') return false;

        const matchesMethod = !methodFilter || sale.paymentMethod === methodFilter;
        const matchesStatus = !statusFilter || sale.paymentStatus === statusFilter;

        return matchesMethod && matchesStatus;
    });

    if (loading) {
        return (
            <div className="payments-page">
                <div className="payments-loading">
                    <div className="pay-loading-spinner"></div>
                    <p>Loading payments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="payments-page">
            {/* Toast */}
            {toast && (
                <div className={`pay-toast pay-toast-${toast.type}`}>
                    <span>{toast.type === 'success' ? '✅' : '❌'}</span>
                    {toast.message}
                </div>
            )}

            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h2>Payments</h2>
                    <p>Track all payment transactions</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
                        <span className="stat-icon">{stat.icon}</span>
                        <div className="stat-info">
                            <h3 style={{ color: stat.color }}>{stat.value}</h3>
                            <p>
                                {stat.label}
                                {stat.count !== undefined && stat.count > 0 && (
                                    <span className="stat-count"> ({stat.count})</span>
                                )}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Payments Table */}
            <div className="payments-table-container">
                <div className="table-header">
                    <h3>
                        Transactions
                        {(methodFilter || statusFilter) && (
                            <span className="pay-filter-tag">
                                Filtered
                                <button
                                    className="pay-clear-filter"
                                    onClick={() => { setMethodFilter(''); setStatusFilter(''); }}
                                >✕</button>
                            </span>
                        )}
                    </h3>
                    <div className="table-filters">
                        <select
                            className="filter-select"
                            value={methodFilter}
                            onChange={(e) => setMethodFilter(e.target.value)}
                        >
                            <option value="">All Methods</option>
                            <option value="UPI">UPI</option>
                            <option value="COD">Cash on Delivery</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                        </select>
                        <select
                            className="filter-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
                        </select>
                    </div>
                </div>

                {filteredSales.length === 0 ? (
                    <div className="payments-empty">
                        <span className="pay-empty-icon">💸</span>
                        <h3>{methodFilter || statusFilter ? 'No matching transactions' : 'No payments yet'}</h3>
                        <p>
                            {methodFilter || statusFilter
                                ? 'Try changing the filters to see more results.'
                                : 'Payments will show up here once you record sales.'}
                        </p>
                        {(methodFilter || statusFilter) && (
                            <button
                                className="btn-secondary"
                                onClick={() => { setMethodFilter(''); setStatusFilter(''); }}
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <table className="payments-table pay-desktop-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Product</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSales.map((sale) => (
                                    <tr key={sale._id}>
                                        <td
                                            className="order-link"
                                            onClick={() => navigate(`/orders/${sale._id}`)}
                                        >
                                            #{sale._id.slice(-6).toUpperCase()}
                                        </td>
                                        <td className="customer-name">{sale.customerName || 'Walk-in'}</td>
                                        <td className="product-col">
                                            <span>{sale.productId?.productName || 'Unknown'}</span>
                                            <span className="qty-badge">×{sale.quantitySold}</span>
                                        </td>
                                        <td className="date-col">{formatDate(sale.date)}</td>
                                        <td className="amount">{formatAmount(sale.totalAmount)}</td>
                                        <td>
                                            <span className="method-badge">
                                                {getMethodIcon(sale.paymentMethod)} {sale.paymentMethod}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={`status-badge pay-clickable ${sale.paymentStatus === 'Paid' ? 'status-completed' : 'status-pending'}`}
                                                onClick={() => handlePaymentToggle(sale._id, sale.paymentStatus)}
                                                title="Click to toggle"
                                            >
                                                {sale.paymentStatus || 'Pending'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-icon"
                                                    title="View Order"
                                                    onClick={() => navigate(`/orders/${sale._id}`)}
                                                >
                                                    👁️
                                                </button>
                                                {sale.paymentStatus === 'Pending' && (
                                                    <button
                                                        className="btn-mark-paid"
                                                        title="Mark as Paid"
                                                        onClick={() => handlePaymentToggle(sale._id, sale.paymentStatus)}
                                                    >
                                                        ✅ Paid
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Mobile Cards */}
                        <div className="pay-mobile-cards">
                            {filteredSales.map((sale) => (
                                <div key={sale._id} className="pay-card">
                                    <div className="pay-card-top">
                                        <div className="pay-card-left">
                                            <span
                                                className="pay-card-order-id"
                                                onClick={() => navigate(`/orders/${sale._id}`)}
                                            >
                                                #{sale._id.slice(-6).toUpperCase()}
                                            </span>
                                            <span className="pay-card-customer">{sale.customerName || 'Walk-in'}</span>
                                        </div>
                                        <span className="pay-card-amount">{formatAmount(sale.totalAmount)}</span>
                                    </div>

                                    <div className="pay-card-details">
                                        <div className="pay-card-detail">
                                            <span className="pay-card-label">Product</span>
                                            <span>{sale.productId?.productName || 'Unknown'} ×{sale.quantitySold}</span>
                                        </div>
                                        <div className="pay-card-detail">
                                            <span className="pay-card-label">Date</span>
                                            <span>{formatDate(sale.date)}</span>
                                        </div>
                                        <div className="pay-card-detail">
                                            <span className="pay-card-label">Method</span>
                                            <span className="method-badge">
                                                {getMethodIcon(sale.paymentMethod)} {sale.paymentMethod}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pay-card-footer">
                                        <span
                                            className={`status-badge pay-clickable ${sale.paymentStatus === 'Paid' ? 'status-completed' : 'status-pending'}`}
                                            onClick={() => handlePaymentToggle(sale._id, sale.paymentStatus)}
                                        >
                                            {sale.paymentStatus || 'Pending'}
                                        </span>
                                        {sale.paymentStatus === 'Pending' && (
                                            <button
                                                className="btn-mark-paid"
                                                onClick={() => handlePaymentToggle(sale._id, sale.paymentStatus)}
                                            >
                                                ✅ Mark Paid
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Payments;
