import { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { formatCurrency } from '../utils/formatCurrency';
import './Reports.css';

const Reports = () => {
    const [monthlyReports, setMonthlyReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await axiosInstance.get('/sales/monthly-reports');
                setMonthlyReports(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching reports:", err);
                setError("Failed to load reports");
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    const reportCards = [
        { title: 'Sales Report', description: 'Your sales numbers', icon: '📈', color: '#3b82f6' },
        { title: 'Inventory Report', description: 'What you have in stock', icon: '📦', color: '#10b981' },
        { title: 'Revenue Report', description: 'Money in vs Money out', icon: '💰', color: '#f59e0b' },
        { title: 'Customer Report', description: 'Who is buying', icon: '👥', color: '#8b5cf6' },
    ];

    return (
        <div className="reports-page">
            <div className="page-header">
                <div>
                    <h2>Business Insights</h2>
                    <p>See how your business is doing</p>
                </div>
            </div>

            <div className="report-cards-grid">
                {reportCards.map((card, index) => (
                    <div key={index} className="report-card" style={{ '--accent-color': card.color }}>
                        <div className="card-icon" style={{ background: `${card.color}20` }}>
                            <span>{card.icon}</span>
                        </div>
                        <h3>{card.title}</h3>
                        <p>{card.description}</p>
                        <button className="btn-view">View Report →</button>
                    </div>
                ))}
            </div>

            <div className="charts-section">
                <div className="chart-card">
                    <h3>Sales Overview</h3>
                    <div className="chart-placeholder">
                        <div className="chart-bars">
                            <div className="bar" style={{ height: '60%' }}><span>Jan</span></div>
                            <div className="bar" style={{ height: '80%' }}><span>Feb</span></div>
                            <div className="bar" style={{ height: '45%' }}><span>Mar</span></div>
                            <div className="bar" style={{ height: '90%' }}><span>Apr</span></div>
                            <div className="bar" style={{ height: '70%' }}><span>May</span></div>
                            <div className="bar" style={{ height: '85%' }}><span>Jun</span></div>
                        </div>
                    </div>
                </div>
                <div className="chart-card">
                    <h3>Revenue Distribution</h3>
                    <div className="chart-placeholder pie-chart">
                        <div className="pie-segment segment-1"></div>
                        <div className="pie-legend">
                            <div className="legend-item"><span className="dot" style={{ background: '#3b82f6' }}></span> Products (45%)</div>
                            <div className="legend-item"><span className="dot" style={{ background: '#10b981' }}></span> Services (30%)</div>
                            <div className="legend-item"><span className="dot" style={{ background: '#f59e0b' }}></span> Subscriptions (25%)</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="recent-reports-section">
                <h3>Monthly Breakdown</h3>
                {loading ? (
                    <div className="loading-state">Loading reports...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : (
                    <div className="reports-table-container">
                        <table className="reports-table">
                            <thead>
                                <tr>
                                    <th>Month</th>
                                    <th>Total Sales</th>
                                    <th>Orders</th>
                                    <th>Returns</th>
                                    <th>Profit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthlyReports.length > 0 ? (
                                    monthlyReports.map((report, index) => (
                                        <tr key={index}>
                                            <td>{report.month}</td>
                                            <td>{formatCurrency(report.grossSales)}</td>
                                            <td>{report.totalOrders}</td>
                                            <td>{formatCurrency(report.refunds)}</td>
                                            <td style={{ color: '#10b981', fontWeight: '600' }}>
                                                {formatCurrency(report.estimatedProfit)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>
                                            <div style={{ color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontSize: '2rem' }}>📉</span>
                                                <span style={{ fontWeight: '500' }}>No reports yet. Start selling to see your growth here!</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
