import './Orders.css';

const Orders = () => {
    // Sample data - replace with API call later
    const orders = [
        { id: 'ORD-001', customer: 'John Doe', date: '2026-02-08', total: 2500, status: 'Completed' },
        { id: 'ORD-002', customer: 'Jane Smith', date: '2026-02-08', total: 1800, status: 'Pending' },
        { id: 'ORD-003', customer: 'Mike Johnson', date: '2026-02-07', total: 3200, status: 'Processing' },
        { id: 'ORD-004', customer: 'Sarah Williams', date: '2026-02-07', total: 950, status: 'Completed' },
        { id: 'ORD-005', customer: 'David Brown', date: '2026-02-06', total: 1500, status: 'Cancelled' },
    ];

    const getStatusClass = (status) => {
        switch (status) {
            case 'Completed':
                return 'status-completed';
            case 'Pending':
                return 'status-pending';
            case 'Processing':
                return 'status-processing';
            case 'Cancelled':
                return 'status-cancelled';
            default:
                return '';
        }
    };

    return (
        <div className="orders-page">
            <div className="page-header">
                <div>
                    <h2>Orders Management</h2>
                    <p>View and manage all customer orders</p>
                </div>
                <button className="btn-primary">+ New Order</button>
            </div>

            <div className="filters-bar">
                <div className="filter-group">
                    <input type="text" placeholder="Search orders..." className="search-filter" />
                </div>
                <div className="filter-group">
                    <select className="status-filter">
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="orders-table-container">
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td className="order-id">{order.id}</td>
                                <td>{order.customer}</td>
                                <td>{order.date}</td>
                                <td className="order-total">₹{order.total.toLocaleString()}</td>
                                <td>
                                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn-icon" title="View">👁️</button>
                                        <button className="btn-icon" title="Edit">✏️</button>
                                        <button className="btn-icon" title="Delete">🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Orders;
