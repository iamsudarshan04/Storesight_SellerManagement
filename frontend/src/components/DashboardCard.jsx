import './DashboardCard.css';

const DashboardCard = ({ title, value, icon, trend, color = 'blue' }) => {
    return (
        <div className={`dashboard-card ${color}`}>
            <div className="card-header">
                <span className="card-title">{title}</span>
                <span className={`card-icon-wrapper ${color}-icon`}>{icon}</span>
            </div>
            <div className="card-body">
                <h2 className="card-value">{value}</h2>
                {trend && (
                    <div className={`card-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
                        <span>{trend.isPositive ? '↑' : '↓'} {trend.value}</span>
                        <span className="trend-label">vs last month</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardCard;
