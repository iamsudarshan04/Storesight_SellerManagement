import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import './Settings.css';

const Settings = () => {
    const { user, login, logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('profile');
    const [toast, setToast] = useState(null);
    const [saving, setSaving] = useState(false);

    // Profile state
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        businessName: ''
    });
    const [profileLoading, setProfileLoading] = useState(true);

    // Password state
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Notification preferences (localStorage-based)
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('ss_notifications');
        return saved ? JSON.parse(saved) : {
            emailNotifications: true,
            pushNotifications: true,
            smsAlerts: false,
            lowStockAlerts: true
        };
    });

    // App preferences (localStorage-based)
    const [preferences, setPreferences] = useState(() => {
        const saved = localStorage.getItem('ss_preferences');
        return saved ? JSON.parse(saved) : {
            language: 'English',
            currency: 'INR (₹)',
            dateFormat: 'DD/MM/YYYY',
            theme: 'light'
        };
    });

    const tabs = [
        { id: 'profile', label: 'Profile', icon: '👤' },
        { id: 'notifications', label: 'Notifications', icon: '🔔' },
        { id: 'security', label: 'Security', icon: '🔒' },
        { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    ];

    // Auto-dismiss toast
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // Fetch profile on mount
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await axiosInstance.get('/user/profile');
            setProfile({
                name: response.data.name || '',
                email: response.data.email || '',
                phone: response.data.phone || '',
                businessName: response.data.businessName || ''
            });
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            // Fall back to auth context data
            if (user) {
                setProfile({
                    name: user.name || '',
                    email: user.email || '',
                    phone: '',
                    businessName: ''
                });
            }
        } finally {
            setProfileLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    // Save profile
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!profile.name.trim()) {
            showToast('Name is required', 'error');
            return;
        }

        setSaving(true);
        try {
            const response = await axiosInstance.patch('/user/profile', {
                name: profile.name,
                phone: profile.phone,
                businessName: profile.businessName
            });

            // Update auth context with new name
            const updatedUser = response.data.user;
            const token = localStorage.getItem('token');
            login(updatedUser, token);

            showToast('Profile updated successfully!');
        } catch (error) {
            console.error('Failed to update profile:', error);
            showToast(error.response?.data?.message || 'Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Change password
    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
            showToast('Please fill in all password fields', 'error');
            return;
        }

        if (passwords.newPassword.length < 6) {
            showToast('New password must be at least 6 characters', 'error');
            return;
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }

        setSaving(true);
        try {
            await axiosInstance.patch('/user/change-password', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });

            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            showToast('Password changed successfully!');
        } catch (error) {
            console.error('Failed to change password:', error);
            showToast(error.response?.data?.message || 'Failed to change password', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Save notification preferences
    const handleSaveNotifications = () => {
        localStorage.setItem('ss_notifications', JSON.stringify(notifications));
        showToast('Notification preferences saved!');
    };

    const toggleNotification = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Save app preferences
    const handleSavePreferences = () => {
        localStorage.setItem('ss_preferences', JSON.stringify(preferences));
        showToast('Preferences saved!');
    };

    // Handle logout
    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    // Member since
    const memberSince = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
        : 'Recently';

    return (
        <div className="settings-page">
            {/* Toast */}
            {toast && (
                <div className={`set-toast set-toast-${toast.type}`}>
                    <span>{toast.type === 'success' ? '✅' : '❌'}</span>
                    {toast.message}
                </div>
            )}

            <div className="page-header">
                <h2>Settings</h2>
                <p>Manage your account preferences</p>
            </div>

            <div className="settings-container">
                <aside className="settings-sidebar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className="tab-icon">{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                    <div className="sidebar-divider"></div>
                    <button className="tab-button set-logout-btn" onClick={handleLogout}>
                        <span className="tab-icon">🚪</span>
                        <span>Logout</span>
                    </button>
                </aside>

                <div className="settings-content">
                    {/* ===== PROFILE ===== */}
                    {activeTab === 'profile' && (
                        <div className="settings-section">
                            <h3>Profile Settings</h3>

                            {profileLoading ? (
                                <div className="set-loading">Loading profile...</div>
                            ) : (
                                <form onSubmit={handleSaveProfile}>
                                    <div className="form-group">
                                        <label>Profile Picture</label>
                                        <div className="avatar-upload">
                                            <div className="avatar-preview">
                                                {profile.name ? profile.name.charAt(0).toUpperCase() : '👤'}
                                            </div>
                                            <div className="avatar-info">
                                                <span className="avatar-name">{profile.name || 'Your Name'}</span>
                                                <span className="avatar-email">{profile.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="set-name">Name *</label>
                                            <input
                                                id="set-name"
                                                type="text"
                                                value={profile.name}
                                                onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                                                placeholder="Your name"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="set-business">Business Name</label>
                                            <input
                                                id="set-business"
                                                type="text"
                                                value={profile.businessName}
                                                onChange={(e) => setProfile(p => ({ ...p, businessName: e.target.value }))}
                                                placeholder="Your store name"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="set-email">Email Address</label>
                                        <input
                                            id="set-email"
                                            type="email"
                                            value={profile.email}
                                            disabled
                                            className="set-input-disabled"
                                        />
                                        <span className="set-help-text">Email cannot be changed</span>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="set-phone">Phone Number</label>
                                        <input
                                            id="set-phone"
                                            type="tel"
                                            value={profile.phone}
                                            onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))}
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>

                                    <button type="submit" className="btn-save" disabled={saving}>
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* ===== NOTIFICATIONS ===== */}
                    {activeTab === 'notifications' && (
                        <div className="settings-section">
                            <h3>Notification Preferences</h3>
                            <div className="notification-group">
                                {[
                                    { key: 'emailNotifications', title: 'Email Notifications', desc: 'Receive order updates via email' },
                                    { key: 'pushNotifications', title: 'Push Notifications', desc: 'Get instant alerts on your device' },
                                    { key: 'smsAlerts', title: 'SMS Alerts', desc: 'Critical alerts via SMS' },
                                    { key: 'lowStockAlerts', title: 'Low Stock Alerts', desc: 'Notify when inventory is low' },
                                ].map(item => (
                                    <div className="notification-item" key={item.key}>
                                        <div className="notification-info">
                                            <h4>{item.title}</h4>
                                            <p>{item.desc}</p>
                                        </div>
                                        <label className="toggle">
                                            <input
                                                type="checkbox"
                                                checked={notifications[item.key]}
                                                onChange={() => toggleNotification(item.key)}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <button className="btn-save" onClick={handleSaveNotifications}>
                                Save Preferences
                            </button>
                        </div>
                    )}

                    {/* ===== SECURITY ===== */}
                    {activeTab === 'security' && (
                        <div className="settings-section">
                            <h3>Security Settings</h3>
                            <form onSubmit={handleChangePassword}>
                                <div className="form-group">
                                    <label htmlFor="set-current-pw">Current Password</label>
                                    <input
                                        id="set-current-pw"
                                        type="password"
                                        value={passwords.currentPassword}
                                        onChange={(e) => setPasswords(p => ({ ...p, currentPassword: e.target.value }))}
                                        placeholder="Enter current password"
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="set-new-pw">New Password</label>
                                        <input
                                            id="set-new-pw"
                                            type="password"
                                            value={passwords.newPassword}
                                            onChange={(e) => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                                            placeholder="At least 6 characters"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="set-confirm-pw">Confirm Password</label>
                                        <input
                                            id="set-confirm-pw"
                                            type="password"
                                            value={passwords.confirmPassword}
                                            onChange={(e) => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
                                            placeholder="Re-enter new password"
                                        />
                                    </div>
                                </div>

                                {passwords.newPassword && passwords.confirmPassword && (
                                    <div className={`set-pw-match ${passwords.newPassword === passwords.confirmPassword ? 'set-match-ok' : 'set-match-err'}`}>
                                        {passwords.newPassword === passwords.confirmPassword
                                            ? '✅ Passwords match'
                                            : '❌ Passwords do not match'}
                                    </div>
                                )}

                                <button type="submit" className="btn-save" disabled={saving}>
                                    {saving ? 'Updating...' : 'Update Password'}
                                </button>
                            </form>

                            <div className="security-section">
                                <h4>Account Info</h4>
                                <div className="set-account-info">
                                    <div className="set-info-row">
                                        <span className="set-info-label">Email</span>
                                        <span className="set-info-value">{profile.email || user?.email}</span>
                                    </div>
                                    <div className="set-info-row">
                                        <span className="set-info-label">Member since</span>
                                        <span className="set-info-value">{memberSince}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="security-section set-danger-zone">
                                <h4>Danger Zone</h4>
                                <p>Logging out will clear your session.</p>
                                <button className="btn-danger" onClick={handleLogout}>
                                    🚪 Logout
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ===== PREFERENCES ===== */}
                    {activeTab === 'preferences' && (
                        <div className="settings-section">
                            <h3>App Preferences</h3>
                            <div className="form-group">
                                <label htmlFor="set-lang">Language</label>
                                <select
                                    id="set-lang"
                                    value={preferences.language}
                                    onChange={(e) => setPreferences(p => ({ ...p, language: e.target.value }))}
                                >
                                    <option>English</option>
                                    <option>Hindi</option>
                                    <option>Tamil</option>
                                    <option>Telugu</option>
                                    <option>Kannada</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="set-currency">Currency</label>
                                <select
                                    id="set-currency"
                                    value={preferences.currency}
                                    onChange={(e) => setPreferences(p => ({ ...p, currency: e.target.value }))}
                                >
                                    <option>INR (₹)</option>
                                    <option>USD ($)</option>
                                    <option>EUR (€)</option>
                                    <option>GBP (£)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="set-date">Date Format</label>
                                <select
                                    id="set-date"
                                    value={preferences.dateFormat}
                                    onChange={(e) => setPreferences(p => ({ ...p, dateFormat: e.target.value }))}
                                >
                                    <option>DD/MM/YYYY</option>
                                    <option>MM/DD/YYYY</option>
                                    <option>YYYY-MM-DD</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Theme</label>
                                <div className="theme-options">
                                    {[
                                        { value: 'light', label: '☀️ Light' },
                                        { value: 'dark', label: '🌙 Dark' },
                                        { value: 'system', label: '💻 System' },
                                    ].map(t => (
                                        <button
                                            key={t.value}
                                            type="button"
                                            className={`theme-btn ${preferences.theme === t.value ? 'active' : ''}`}
                                            onClick={() => setPreferences(p => ({ ...p, theme: t.value }))}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button className="btn-save" onClick={handleSavePreferences}>
                                Save Preferences
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
