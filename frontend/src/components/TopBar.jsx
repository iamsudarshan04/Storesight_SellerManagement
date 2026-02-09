import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './TopBar.css';

const TopBar = ({ pageTitle }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
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

                <div className="notification-wrapper">
                    <button className="icon-btn" title="Notifications">
                        🔔
                    </button>
                    <span className="notification-badge">3</span>
                </div>

                <div className="user-menu" ref={menuRef}>
                    <button
                        className="user-btn"
                        onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                        <div className="user-avatar-circle">
                            {getInitials(user?.name)}
                        </div>
                        <div className="user-info">
                            <span className="user-name">{user?.name || 'User'}</span>
                            <span className="user-role">Admin</span>
                        </div>
                        <span className={`dropdown-arrow ${showUserMenu ? 'open' : ''}`}>▼</span>
                    </button>

                    {showUserMenu && (
                        <div className="user-dropdown">
                            <div className="dropdown-header">
                                <span className="dropdown-username">{user?.name}</span>
                                <span className="dropdown-email">{user?.email || 'user@example.com'}</span>
                            </div>
                            <div className="dropdown-divider"></div>
                            <div className="dropdown-item">
                                <span>👤</span> Profile
                            </div>
                            <div className="dropdown-item" onClick={() => navigate('/settings')}>
                                <span>⚙️</span> Settings
                            </div>
                            <div className="dropdown-divider"></div>
                            <div className="dropdown-item logout" onClick={handleLogout}>
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
