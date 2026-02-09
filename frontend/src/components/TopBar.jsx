import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './TopBar.css';

const TopBar = ({ pageTitle }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="topbar">
            <div className="topbar-left">
                <h1 className="page-title">{pageTitle || 'Dashboard'}</h1>
            </div>

            <div className="topbar-right">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search..."
                        className="search-input"
                    />
                </div>

                <button className="icon-btn" title="Notifications">
                    <span className="notification-badge">3</span>
                    🔔
                </button>

                <div className="user-menu">
                    <button
                        className="user-btn"
                        onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                        <span className="user-avatar">👤</span>
                        <span className="user-name">{user?.name || 'User'}</span>
                        <span className="dropdown-arrow">▼</span>
                    </button>

                    {showUserMenu && (
                        <div className="user-dropdown">
                            <div className="dropdown-item">
                                <span>👤</span> Profile
                            </div>
                            <div className="dropdown-item" onClick={() => navigate('/settings')}>
                                <span>⚙️</span> Settings
                            </div>
                            <div className="dropdown-divider"></div>
                            <div className="dropdown-item" onClick={handleLogout}>
                                <span>🚪</span> Logout
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default TopBar;
