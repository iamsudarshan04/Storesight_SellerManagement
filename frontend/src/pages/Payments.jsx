import './Payments.css';

const Payments = () => {
    const payments = [
        { id: 'PAY-001', order: 'ORD-001', customer: 'John Doe', date: '2026-02-08', amount: 2500, method: 'Credit Card', status: 'Completed' },
        { id: 'PAY-002', order: 'ORD-002', customer: 'Jane Smith', date: '2026-02-08', amount: 1800, method: 'UPI', status: 'Pending' },
        { id: 'PAY-003', order: 'ORD-003', customer: 'Mike Johnson', date: '2026-02-07', amount: 3200, method: 'Debit Card', status: 'Completed' },
        { id: 'PAY-004', order: 'ORD-004', customer: 'Sarah Williams', date: '2026-02-07', amount: 950, method: 'Cash', status: 'Completed' },
        { id: 'PAY-005', order: 'ORD-005', customer: 'David Brown', date: '2026-02-06', amount: 1500, method: 'UPI', status: 'Failed' },
    ];

    const getStatusClass = (status) => {
        switch (status) {
            case 'Completed': return 'status-completed';
            case 'Pending': return 'status-pending';
            case 'Failed': return 'status-failed';
            default: return '';
        }
    };

    const getMethodIcon = (method) => {
        switch (method) {
            case 'Credit Card': return '💳';
            case 'Debit Card': return '💳';
            case 'UPI': return '📱';
            case 'Cash': return '💵';
            default: return '💰';
        }
    };

    const stats = [
        { label: 'Total Revenue', value: '₹1,25,000', icon: '💰', color: '#10b981' },
        { label: 'Pending', value: '₹8,500', icon: '⏳', color: '#f59e0b' },
        { label: 'Completed', value: '₹1,16,500', icon: '✅', color: '#3b82f6' },
        { label: 'Failed', value: '₹2,500', icon: '❌', color: '#ef4444' },
    ];

    return (
        <div className="payments-page">
            <div className="page-header">
                <div>
                    <h2>Payments</h2>
                    <p>Track all payment transactions</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary">Export</button>
                    <button className="btn-primary">+ Record Payment</button>
                </div>
            </div>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
                        <span className="stat-icon">{stat.icon}</span>
                        <div className="stat-info">
                            <h3>{stat.value}</h3>
                            <p>{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="payments-table-container">
                <div className="table-header">
                    <h3>Recent Transactions</h3>
                    <div className="table-filters">
                        <select className="filter-select">
                            <option value="">All Methods</option>
                            <option value="card">Card</option>
                            <option value="upi">UPI</option>
                            <option value="cash">Cash</option>
                        </select>
                        <select className="filter-select">
                            <option value="">All Status</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                </div>
                <table className="payments-table">
                    <thead>
                        <tr>
                            <th>Payment ID</th>
                            <th>Order</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map((payment) => (
                            <tr key={payment.id}>
                                <td className="payment-id">{payment.id}</td>
                                <td className="order-link">{payment.order}</td>
                                <td>{payment.customer}</td>
                                <td>{payment.date}</td>
                                <td className="amount">₹{payment.amount.toLocaleString()}</td>
                                <td className="method">
                                    <span className="method-badge">
                                        {getMethodIcon(payment.method)} {payment.method}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-badge ${getStatusClass(payment.status)}`}>
                                        {payment.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn-icon" title="View">👁️</button>
                                        <button className="btn-icon" title="Receipt">🧾</button>
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

export default Payments;
