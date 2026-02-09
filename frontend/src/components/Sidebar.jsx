import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    const navItems = [
        { path: '/dashboard', icon: '📊', label: 'Dashboard' },
        { path: '/sales', icon: '🛒', label: 'New Sale' },
        { path: '/orders', icon: '📦', label: 'Orders' },
        { path: '/products', icon: '🏷️', label: 'Products' },
        { path: '/inventory', icon: '📋', label: 'Inventory' },
        { path: '/payments', icon: '💳', label: 'Payments' },
        { path: '/reports', icon: '📈', label: 'Reports' },
        { path: '/settings', icon: '⚙️', label: 'Settings' }
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2 className="sidebar-logo">📊 StoreSight</h2>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? 'active' : ''}`
                        }
                    >
                        <span className="sidebar-icon">{item.icon}</span>
                        <span className="sidebar-label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
