import { useState, useEffect } from 'react';
import DashboardCard from '../components/DashboardCard';
import { formatCurrency } from '../utils/formatCurrency';
import axiosInstance from '../api/axios';
import './Dashboard.css';

const Dashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axiosInstance.get('/sales/summary');
                const data = response.data;

                // Transform backend data to match UI structure
                setMetrics({
                    revenue: {
                        value: data.monthlyRevenue || 0,
                        trend: { value: '0%', isPositive: true }, // Trends require historical data not yet available
                    },
                    orders: {
                        value: data.totalOrders || 0,
                        trend: { value: '0%', isPositive: true },
                    },
                    paid: {
                        value: data.totalOrders > 0 ? '100%' : '0%', // Assuming all sales are paid
                        pending: '0%',
                        count: data.paidOrders,
                        pendingCount: data.pendingOrders
                    },
                    lowStock: {
                        count: data.lowStockProducts.length,
                        items: data.lowStockProducts.map(p => p.name)
                    },
                    recentActivity: [] // Placeholder for now
                });
                setLoading(false);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load dashboard data');
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div className="loading">Loading dashboard...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!metrics) return null;

    return (
        <div className="dashboard">
            <div className="dashboard-grid">
                {/* 1. This Month Revenue */}
                <DashboardCard
                    title="This Month Revenue"
                    value={formatCurrency(metrics.revenue.value)}
                    icon="💰"
                    trend={metrics.revenue.trend}
                    color="blue"
                />

                {/* 2. Total Orders */}
                <DashboardCard
                    title="Total Orders"
                    value={metrics.orders.value.toLocaleString()}
                    icon="📦"
                    trend={metrics.orders.trend}
                    color="purple"
                />

                {/* 3. Paid vs Pending */}
                <div className="dashboard-card green">
                    <div className="card-header">
                        <span className="card-title">Payment Status</span>
                        <div className="card-icon-wrapper green-icon">💳</div>
                    </div>
                    <div className="card-body">
                        <h2 className="card-value">
                            {metrics.paid.value}
                            <span style={{ fontSize: '1rem', color: '#64748b', marginLeft: '8px' }}>Paid</span>
                        </h2>
                        <div className="progress-bar-container">
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: metrics.paid.value }}></div>
                            </div>
                            <div className="progress-labels">
                                <span>{metrics.paid.pending} Pending</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Low Stock Alert */}
                <div className="dashboard-card orange">
                    <div className="card-header">
                        <span className="card-title">Low Stock Alert</span>
                        <div className="card-icon-wrapper orange-icon">⚠️</div>
                    </div>
                    <div className="card-body">
                        <h2 className="card-value" style={{ color: '#d97706' }}>{metrics.lowStock.count}</h2>
                        <div className="low-stock-items">
                            {metrics.lowStock.items.length > 0 ? (
                                metrics.lowStock.items.slice(0, 3).map((item, index) => (
                                    <span key={index} className="low-stock-chip">{item}</span>
                                ))
                            ) : (
                                <span className="no-alert">No low stock items</span>
                            )}
                            {metrics.lowStock.items.length > 3 && (
                                <span className="low-stock-chip">+{metrics.lowStock.items.length - 3} more</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity - Placeholder/Static for now as backend doesn't provide it yet */}
            <div className="recent-activity-section">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                    <div className="activity-item">
                        <div className="activity-icon blue-bg">🛒</div>
                        <div className="activity-details">
                            <h4>System Ready</h4>
                            <p>Dashboard connected to live data</p>
                        </div>
                        <span className="activity-time">Just now</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
