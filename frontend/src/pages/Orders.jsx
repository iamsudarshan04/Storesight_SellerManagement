import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatCurrency';
import axiosInstance from '../api/axios';
import './Orders.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axiosInstance.get('/sales');
                // Transform sales data to match table structure if needed or use directly
                // sales have: _id, productId (populated), quantitySold, totalAmount, date
                setOrders(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('Failed to load orders');
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const [activeDropdown, setActiveDropdown] = useState(null);

    const handleRowClick = (id) => {
        navigate(`/orders/${id}`);
    };

    const toggleDropdown = (e, id) => {
        e.stopPropagation();
        setActiveDropdown(activeDropdown === id ? null : id);
    };

    const handleCancelOrder = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to cancel this order? Stock will be restored.')) {
            try {
                await axiosInstance.put(`/sales/${id}/cancel`);
                setOrders(orders.map(order =>
                    order._id === id ? { ...order, status: 'Cancelled' } : order
                ));
                setActiveDropdown(null);
            } catch (err) {
                console.error('Error cancelling order:', err);
                alert('Failed to cancel order');
            }
        }
    };

    const handlePaymentToggle = async (e, orderId, currentStatus) => {
        e.stopPropagation();
        const newStatus = currentStatus === 'Paid' ? 'Pending' : 'Paid';

        // Optimistic update
        setOrders(orders.map(order =>
            order._id === orderId ? { ...order, paymentStatus: newStatus } : order
        ));

        try {
            await axiosInstance.patch(`/sales/${orderId}/payment-status`, {
                paymentStatus: newStatus
            });
        } catch (err) {
            console.error('Error updating payment status:', err);
            // Revert on failure
            setOrders(orders.map(order =>
                order._id === orderId ? { ...order, paymentStatus: currentStatus } : order
            ));
            alert('Failed to update payment status');
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveDropdown(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    if (loading) return <div className="loading">Loading orders...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="orders-page">
            <div className="orders-header">
                <div>
                    <h2>Orders</h2>
                    <p className="subtitle">Manage your sales and shipments</p>
                </div>
                <div className="orders-actions">
                    <input type="text" placeholder="Search..." className="search-input" />
                    <button className="btn-primary desktop-only" onClick={() => navigate('/orders/add')}>+ Add Order</button>
                </div>
            </div>

            {/* Mobile Add Order FAB */}
            <button className="fab-add-order mobile-only" onClick={() => navigate('/orders/add')}>
                +
            </button>

            {orders.length === 0 ? (
                <div className="no-data">
                    <div style={{ fontSize: '3rem' }}>🛒</div>
                    <h3>No orders yet!</h3>
                    <p>Ready to make your first sale?</p>
                    <button className="btn-primary" onClick={() => navigate('/orders/add')}>Record First Sale</button>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="table-container desktop-only">
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Product</th>
                                    <th>Amount</th>
                                    <th>Payment</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order._id} onClick={() => handleRowClick(order._id)} className="clickable-row">
                                        <td className="order-id">#{order._id.slice(-6).toUpperCase()}</td>
                                        <td className="font-medium">{order.customerName || 'Walk-in Customer'}</td>
                                        <td>
                                            <div className="product-cell">
                                                <span className="product-name">{order.productId?.productName || 'Unknown'}</span>
                                                <span className="product-qty">x{order.quantitySold}</span>
                                            </div>
                                        </td>
                                        <td className="amount-cell">{formatCurrency(order.totalAmount)}</td>
                                        <td>
                                            <span
                                                className={`status-badge ${order.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'} clickable-badge`}
                                                onClick={(e) => handlePaymentToggle(e, order._id, order.paymentStatus)}
                                                title="Click to toggle payment status"
                                            >
                                                {order.paymentStatus || 'Pending'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${order.status === 'New' ? 'badge-info' :
                                                order.status === 'Processing' ? 'badge-warning' :
                                                    order.status === 'Shipped' ? 'badge-primary' :
                                                        order.status === 'Delivered' ? 'badge-success' :
                                                            order.status === 'Cancelled' ? 'badge-danger' :
                                                                'badge-default'
                                                }`}>
                                                {order.status || 'New'}
                                            </span>
                                        </td>
                                        <td style={{ position: 'relative' }}>
                                            <button className="btn-icon" onClick={(e) => toggleDropdown(e, order._id)}>⋮</button>
                                            {activeDropdown === order._id && (
                                                <div className="action-dropdown">
                                                    <button
                                                        className="dropdown-item text-danger"
                                                        onClick={(e) => handleCancelOrder(e, order._id)}
                                                        disabled={order.status === 'Cancelled'}
                                                    >
                                                        {order.status === 'Cancelled' ? 'Cancelled' : 'Cancel Order'}
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="mobile-orders-list mobile-only">
                        {orders.map((order) => (
                            <div key={order._id} className="order-card" onClick={() => handleRowClick(order._id)}>
                                <div className="order-card-header">
                                    <span className="order-id">#{order._id.slice(-6).toUpperCase()}</span>
                                    <span className={`status-text ${order.status?.toLowerCase() || 'new'}`}>
                                        {order.status || 'New'}
                                    </span>
                                </div>
                                <div className="order-card-body">
                                    <div className="customer-info">
                                        <h4>{order.customerName || 'Walk-in Customer'}</h4>
                                        <p className="order-product">
                                            {order.productId?.productName} <span className="qty-badge">x{order.quantitySold}</span>
                                        </p>
                                    </div>
                                    <div className="order-meta">
                                        <span className="order-amount">{formatCurrency(order.totalAmount)}</span>
                                        <span
                                            className={`payment-pill ${order.paymentStatus === 'Paid' ? 'paid' : 'pending'} clickable-badge`}
                                            onClick={(e) => handlePaymentToggle(e, order._id, order.paymentStatus)}
                                        >
                                            {order.paymentStatus || 'Pending'}
                                        </span>
                                    </div>
                                </div>
                                <div className="order-card-actions">
                                    <button
                                        className="btn-cancel-sm"
                                        onClick={(e) => handleCancelOrder(e, order._id)}
                                        disabled={order.status === 'Cancelled'}
                                    >
                                        {order.status === 'Cancelled' ? 'Cancelled' : 'Cancel'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Orders;
