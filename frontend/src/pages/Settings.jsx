import { useState } from 'react';
import './Settings.css';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', label: 'Profile', icon: '👤' },
        { id: 'notifications', label: 'Notifications', icon: '🔔' },
        { id: 'security', label: 'Security', icon: '🔒' },
        { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    ];

    return (
        <div className="settings-page">
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
                </aside>

                <div className="settings-content">
                    {activeTab === 'profile' && (
                        <div className="settings-section">
                            <h3>Profile Settings</h3>
                            <div className="form-group">
                                <label>Profile Picture</label>
                                <div className="avatar-upload">
                                    <div className="avatar-preview">👤</div>
                                    <button className="btn-upload">Upload Photo</button>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input type="text" placeholder="John" />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input type="text" placeholder="Doe" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" placeholder="john@example.com" />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input type="tel" placeholder="+91 98765 43210" />
                            </div>
                            <div className="form-group">
                                <label>Bio</label>
                                <textarea placeholder="Tell us about yourself..." rows="3"></textarea>
                            </div>
                            <button className="btn-save">Save Changes</button>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="settings-section">
                            <h3>Notification Preferences</h3>
                            <div className="notification-group">
                                <div className="notification-item">
                                    <div className="notification-info">
                                        <h4>Email Notifications</h4>
                                        <p>Receive order updates via email</p>
                                    </div>
                                    <label className="toggle">
                                        <input type="checkbox" defaultChecked />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                <div className="notification-item">
                                    <div className="notification-info">
                                        <h4>Push Notifications</h4>
                                        <p>Get instant alerts on your device</p>
                                    </div>
                                    <label className="toggle">
                                        <input type="checkbox" defaultChecked />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                <div className="notification-item">
                                    <div className="notification-info">
                                        <h4>SMS Alerts</h4>
                                        <p>Critical alerts via SMS</p>
                                    </div>
                                    <label className="toggle">
                                        <input type="checkbox" />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                <div className="notification-item">
                                    <div className="notification-info">
                                        <h4>Low Stock Alerts</h4>
                                        <p>Notify when inventory is low</p>
                                    </div>
                                    <label className="toggle">
                                        <input type="checkbox" defaultChecked />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                            </div>
                            <button className="btn-save">Save Preferences</button>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="settings-section">
                            <h3>Security Settings</h3>
                            <div className="form-group">
                                <label>Current Password</label>
                                <input type="password" placeholder="••••••••" />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>New Password</label>
                                    <input type="password" placeholder="••••••••" />
                                </div>
                                <div className="form-group">
                                    <label>Confirm Password</label>
                                    <input type="password" placeholder="••••••••" />
                                </div>
                            </div>
                            <button className="btn-save">Update Password</button>

                            <div className="security-section">
                                <h4>Two-Factor Authentication</h4>
                                <p>Add an extra layer of security to your account</p>
                                <button className="btn-secondary">Enable 2FA</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div className="settings-section">
                            <h3>App Preferences</h3>
                            <div className="form-group">
                                <label>Language</label>
                                <select>
                                    <option>English</option>
                                    <option>Hindi</option>
                                    <option>Spanish</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Currency</label>
                                <select>
                                    <option>INR (₹)</option>
                                    <option>USD ($)</option>
                                    <option>EUR (€)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Date Format</label>
                                <select>
                                    <option>DD/MM/YYYY</option>
                                    <option>MM/DD/YYYY</option>
                                    <option>YYYY-MM-DD</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Theme</label>
                                <div className="theme-options">
                                    <button className="theme-btn active">☀️ Light</button>
                                    <button className="theme-btn">🌙 Dark</button>
                                    <button className="theme-btn">💻 System</button>
                                </div>
                            </div>
                            <button className="btn-save">Save Preferences</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
