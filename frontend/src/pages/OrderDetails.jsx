import { useParams, useNavigate } from 'react-router-dom';
import './OrderDetails.css';

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Sample data - replace with API call later
    const orderData = {
        id: id || 'ORD-001',
        customer: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+91 98765 43210',
        date: '2026-02-08',
        status: 'Completed',
        paymentMethod: 'Credit Card',
        total: 2500,
        items: [
            { id: 1, product: 'Product A', quantity: 2, price: 800, total: 1600 },
            { id: 2, product: 'Product B', quantity: 1, price: 900, total: 900 }
        ],
        timeline: [
            { status: 'Order Placed', date: '2026-02-08 10:30 AM', completed: true },
            { status: 'Payment Confirmed', date: '2026-02-08 10:32 AM', completed: true },
            { status: 'Processing', date: '2026-02-08 11:00 AM', completed: true },
            { status: 'Shipped', date: '2026-02-08 02:00 PM', completed: true },
            { status: 'Delivered', date: '2026-02-09 10:00 AM', completed: true }
        ]
    };

    return (
        <div className="order-details-page">
            <div className="page-header">
                <button className="btn-back" onClick={() => navigate('/orders')}>
                    ← Back to Orders
                </button>
                <h2>Order Details: {orderData.id}</h2>
            </div>

            <div className="details-grid">
                <div className="details-section">
                    <div className="section-card">
                        <h3>Customer Information</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Name</label>
                                <p>{orderData.customer}</p>
                            </div>
                            <div className="info-item">
                                <label>Email</label>
                                <p>{orderData.email}</p>
                            </div>
                            <div className="info-item">
                                <label>Phone</label>
                                <p>{orderData.phone}</p>
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
                                {orderData.items.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.product}</td>
                                        <td>{item.quantity}</td>
                                        <td>₹{item.price}</td>
                                        <td>₹{item.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="3" className="total-label">Total Amount</td>
                                    <td className="total-amount">₹{orderData.total}</td>
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
                                <strong>{orderData.date}</strong>
                            </div>
                            <div className="summary-item">
                                <span>Status</span>
                                <span className="status-badge status-completed">{orderData.status}</span>
                            </div>
                            <div className="summary-item">
                                <span>Payment Method</span>
                                <strong>{orderData.paymentMethod}</strong>
                            </div>
                            <div className="summary-item">
                                <span>Total</span>
                                <strong className="total-price">₹{orderData.total}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="section-card">
                        <h3>Order Timeline</h3>
                        <div className="timeline">
                            {orderData.timeline.map((event, index) => (
                                <div key={index} className={`timeline-item ${event.completed ? 'completed' : ''}`}>
                                    <div className="timeline-marker"></div>
                                    <div className="timeline-content">
                                        <strong>{event.status}</strong>
                                        <span>{event.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
