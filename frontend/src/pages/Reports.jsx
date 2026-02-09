import './Reports.css';

const Reports = () => {
    const reportCards = [
        { title: 'Sales Report', description: 'View detailed sales analytics', icon: '📈', color: '#3b82f6' },
        { title: 'Inventory Report', description: 'Stock levels and movements', icon: '📦', color: '#10b981' },
        { title: 'Revenue Report', description: 'Income and expense analysis', icon: '💰', color: '#f59e0b' },
        { title: 'Customer Report', description: 'Customer behavior insights', icon: '👥', color: '#8b5cf6' },
    ];

    const recentReports = [
        { name: 'Monthly Sales Report - January 2026', date: '2026-02-01', type: 'Sales', size: '2.4 MB' },
        { name: 'Inventory Summary Q4 2025', date: '2026-01-15', type: 'Inventory', size: '1.8 MB' },
        { name: 'Annual Revenue Report 2025', date: '2026-01-05', type: 'Revenue', size: '4.2 MB' },
        { name: 'Customer Analysis Report', date: '2025-12-20', type: 'Customer', size: '3.1 MB' },
    ];

    return (
        <div className="reports-page">
            <div className="page-header">
                <div>
                    <h2>Reports & Analytics</h2>
                    <p>Generate and view business reports</p>
                </div>
                <button className="btn-primary">+ Generate Report</button>
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
                <h3>Recent Reports</h3>
                <div className="reports-list">
                    {recentReports.map((report, index) => (
                        <div key={index} className="report-item">
                            <div className="report-icon">📄</div>
                            <div className="report-info">
                                <h4>{report.name}</h4>
                                <p>{report.type} • {report.date} • {report.size}</p>
                            </div>
                            <div className="report-actions">
                                <button className="btn-download">⬇️ Download</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Reports;
