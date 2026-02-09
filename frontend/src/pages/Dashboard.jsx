import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import DashboardCard from '../components/DashboardCard';
import { formatCurrency } from '../utils/formatCurrency';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        try {
            const response = await axiosInstance.get('/sales/summary');
            setSummary(response.data);
        } catch (error) {
            console.error('Failed to fetch summary:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading dashboard...</div>;
    }

    return (
        <div className="dashboard">


            <div className="cards-grid">
                <DashboardCard
                    title="Today's Sales"
                    value={summary?.todaySales?.count || 0}
                    icon="🛒"
                    color="blue"
                />

                <DashboardCard
                    title="Today's Revenue"
                    value={formatCurrency(summary?.todaySales?.total || 0)}
                    icon="💰"
                    color="green"
                />

                <DashboardCard
                    title="Total Revenue"
                    value={formatCurrency(summary?.totalRevenue || 0)}
                    icon="📊"
                    color="purple"
                />

                <DashboardCard
                    title="Low Stock Items"
                    value={summary?.lowStockProducts?.length || 0}
                    icon="⚠️"
                    color="orange"
                />
            </div>

            {summary?.bestSellingProducts && summary.bestSellingProducts.length > 0 && (
                <div className="chart-section">
                    <h2>Best Selling Products</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={summary.bestSellingProducts}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="product" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="totalQuantity" fill="#4F46E5" name="Quantity Sold" />
                            <Bar dataKey="totalRevenue" fill="#10B981" name="Revenue ($)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {summary?.lowStockProducts && summary.lowStockProducts.length > 0 && (
                <div className="low-stock-section">
                    <h2>⚠️ Low Stock Alert</h2>
                    <div className="low-stock-list">
                        {summary.lowStockProducts.map((product) => (
                            <div key={product.id} className="low-stock-item">
                                <span className="product-name">{product.name}</span>
                                <span className="stock-info">
                                    Stock: {product.quantity} / Limit: {product.lowStockLimit}
                                </span>
                                <button
                                    className="btn-restock"
                                    onClick={() => navigate('/products')}
                                >
                                    Restock
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
