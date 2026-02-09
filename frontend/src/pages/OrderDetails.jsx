import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { formatCurrency } from '../utils/formatCurrency';
import './OrderDetails.css';

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const response = await axiosInstance.get(`/sales/${id}`);
                setOrder(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching order details:', err);
                setError('Failed to load order details');
                setLoading(false);
            }
        };

        if (id) {
            fetchOrderDetails();
        }
    }, [id]);

    if (loading) return <div className="loading">Loading details...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!order) return <div className="error-message">Order not found</div>;

    // Synthesize data not present in simple Sale model
    const orderDate = new Date(order.date);
    const formattedDate = orderDate.toLocaleDateString() + ' ' + orderDate.toLocaleTimeString();

    return (
        <div className="order-details-page">
            <div className="page-header">
                <button className="btn-back" onClick={() => navigate('/orders')}>
                    ← Back to Orders
                </button>
                <h2>Order Details: #{order._id.slice(-6).toUpperCase()}</h2>
            </div>

            <div className="details-grid">
                <div className="details-section">
                    <div className="section-card">
                        <h3>Customer Information</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Name</label>
                                <p>Walk-in Customer</p>
                            </div>
                            <div className="info-item">
                                <label>Email</label>
                                <p>N/A</p>
                            </div>
                            <div className="info-item">
                                <label>Phone</label>
                                <p>N/A</p>
                            </div>
                        </div>
                    </div>

                    <div className="section-card">
                        <h3>Order Items</h3>
                        <table className="items-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{order.productId?.productName || 'Unknown Product'}</td>
                                    <td>{order.quantitySold}</td>
                                    <td>{formatCurrency(order.productId?.sellingPrice || 0)}</td>
                                    <td>{formatCurrency(order.totalAmount)}</td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="3" className="total-label">Total Amount</td>
                                    <td className="total-amount">{formatCurrency(order.totalAmount)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <div className="sidebar-section">
                    <div className="section-card">
                        <h3>Order Summary</h3>
                        <div className="summary-items">
                            <div className="summary-item">
                                <span>Order Date</span>
                                <strong>{orderDate.toLocaleDateString()}</strong>
                            </div>
                            <div className="summary-item">
                                <span>Status</span>
                                <span className="status-badge status-completed">Completed</span>
                            </div>
                            <div className="summary-item">
                                <span>Payment Method</span>
                                <strong>Cash / UPI</strong>
                            </div>
                            <div className="summary-item">
                                <span>Total</span>
                                <strong className="total-price">{formatCurrency(order.totalAmount)}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="section-card">
                        <h3>Order Timeline</h3>
                        <div className="timeline">
                            <div className="timeline-item completed">
                                <div className="timeline-marker"></div>
                                <div className="timeline-content">
                                    <strong>Order Placed</strong>
                                    <span>{formattedDate}</span>
                                </div>
                            </div>
                            <div className="timeline-item completed">
                                <div className="timeline-marker"></div>
                                <div className="timeline-content">
                                    <strong>Payment Confirmed</strong>
                                    <span>{formattedDate}</span>
                                </div>
                            </div>
                            <div className="timeline-item completed">
                                <div className="timeline-marker"></div>
                                <div className="timeline-content">
                                    <strong>Completed</strong>
                                    <span>{formattedDate}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
