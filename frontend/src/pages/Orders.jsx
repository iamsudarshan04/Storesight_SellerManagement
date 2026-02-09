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

    const handleRowClick = (id) => {
        navigate(`/orders/${id}`);
    };

    if (loading) return <div className="loading">Loading orders...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="orders-page">
            <div className="orders-header">
                <h2>Your Orders</h2>
                <div className="orders-actions">
                    <input type="text" placeholder="Search orders..." className="search-input" />
                    <button className="btn-filter">Filter</button>
                    <button className="btn-export">Export</button>
                </div>
            </div>

            <div className="table-container">
                {orders.length === 0 ? (
                    <div className="no-data" style={{
                        padding: '3rem',
                        textAlign: 'center',
                        color: '#64748b',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <div style={{ fontSize: '3rem' }}>🛒</div>
                        <h3>No orders yet!</h3>
                        <p>Ready to make your first sale? Record it now.</p>
                        <button
                            className="btn-primary"
                            onClick={() => navigate('/sales')}
                            style={{
                                background: '#3b82f6',
                                color: 'white',
                                padding: '0.75rem 1.5rem',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            Record First Sale
                        </button>
                    </div>
                ) : (
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Item</th>
                                <th>Date</th>
                                <th>Qty</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id} onClick={() => handleRowClick(order._id)} className="clickable-row">
                                    <td className="order-id">#{order._id.slice(-6).toUpperCase()}</td>
                                    <td>{order.productId?.productName || 'Unknown Product'}</td>
                                    <td>{new Date(order.date).toLocaleDateString()}</td>
                                    <td>{order.quantitySold}</td>
                                    <td className="amount-cell">{formatCurrency(order.totalAmount)}</td>
                                    <td>
                                        <span className="badge-success">Completed</span>
                                    </td>
                                    <td>
                                        <button className="btn-icon" onClick={(e) => { e.stopPropagation(); /* Add explicit action handler here */ }}>⋮</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Orders;
