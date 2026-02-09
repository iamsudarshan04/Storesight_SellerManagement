import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">📊 StoreSight</Link>
            </div>

            {isAuthenticated && (
                <>
                    <div className="navbar-links">
                        <Link to="/dashboard">Dashboard</Link>
                        <Link to="/products">Products</Link>
                        <Link to="/sales">Sales</Link>
                    </div>

                    <div className="navbar-user">
                        <span className="user-name">👤 {user?.name}</span>
                        <button onClick={handleLogout} className="btn-logout">
                            Logout
                        </button>
                    </div>
                </>
            )}
        </nav>
    );
};

export default Navbar;
