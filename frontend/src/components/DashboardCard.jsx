import './DashboardCard.css';

const DashboardCard = ({ title, value, icon, color = 'blue' }) => {
    return (
        <div className={`dashboard-card ${color}`}>
            <div className="card-icon">{icon}</div>
            <div className="card-content">
                <h3>{title}</h3>
                <p className="card-value">{value}</p>
            </div>
        </div>
    );
};

export default DashboardCard;
