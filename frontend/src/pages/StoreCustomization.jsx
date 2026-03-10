import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import './StoreCustomization.css';

const THEME_PRESETS = [
    { name: 'Indigo', color: '#6366f1' },
    { name: 'Purple', color: '#8b5cf6' },
    { name: 'Blue', color: '#3b82f6' },
    { name: 'Emerald', color: '#10b981' },
    { name: 'Rose', color: '#f43f5e' },
    { name: 'Amber', color: '#f59e0b' },
    { name: 'Teal', color: '#14b8a6' },
    { name: 'Slate', color: '#475569' },
];

const StoreCustomization = () => {
    const { user, login } = useContext(AuthContext);
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [linkCopied, setLinkCopied] = useState(false);

    const [store, setStore] = useState({
        businessName: '',
        storeDescription: '',
        whatsappNumber: '',
        storeActive: true,
        themeColor: '#6366f1',
        showWhatsapp: true,
        storeLogo: '',
        storeSlug: ''
    });

    // Sample products for preview
    const [sampleProducts] = useState([
        { name: 'Product 1', price: 499 },
        { name: 'Product 2', price: 799 },
        { name: 'Product 3', price: 1299 },
        { name: 'Product 4', price: 349 },
    ]);

    useEffect(() => {
        fetchStore();
    }, []);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const fetchStore = async () => {
        try {
            const response = await axiosInstance.get('/user/profile');
            setStore({
                businessName: response.data.businessName || '',
                storeDescription: response.data.storeDescription || '',
                whatsappNumber: response.data.whatsappNumber || '',
                storeActive: response.data.storeActive !== false,
                themeColor: response.data.themeColor || '#6366f1',
                showWhatsapp: response.data.showWhatsapp !== false,
                storeLogo: response.data.storeLogo || '',
                storeSlug: response.data.storeSlug || ''
            });
        } catch (error) {
            console.error('Failed to fetch store:', error);
            showToast('Failed to load store settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const handleChange = (field, value) => {
        setStore(prev => ({ ...prev, [field]: value }));
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (max 500KB)
        if (file.size > 500 * 1024) {
            showToast('Logo must be under 500KB', 'error');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast('Please upload an image file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            handleChange('storeLogo', reader.result);
        };
        reader.readAsDataURL(file);
    };

    const removeLogo = () => {
        handleChange('storeLogo', '');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSave = async () => {
        if (!store.businessName.trim()) {
            showToast('Store name is required', 'error');
            return;
        }

        setSaving(true);
        try {
            const response = await axiosInstance.patch('/user/profile', {
                businessName: store.businessName,
                storeDescription: store.storeDescription,
                whatsappNumber: store.whatsappNumber,
                storeActive: store.storeActive,
                themeColor: store.themeColor,
                showWhatsapp: store.showWhatsapp,
                storeLogo: store.storeLogo
            });

            const updatedUser = response.data.user;
            const token = localStorage.getItem('token');
            login(updatedUser, token);

            showToast('Store saved! Your changes are live 🎉');
        } catch (error) {
            console.error('Failed to save store:', error);
            showToast(error.response?.data?.message || 'Failed to save store', 'error');
        } finally {
            setSaving(false);
        }
    };

    const copyStoreLink = () => {
        const link = `${window.location.origin}/store/${store.storeSlug}`;
        navigator.clipboard.writeText(link);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    const formatPrice = (price) => '₹' + Number(price).toLocaleString('en-IN');

    const storeLetter = (store.businessName || 'S').charAt(0).toUpperCase();

    if (loading) {
        return (
            <div className="sc-page">
                <div className="sc-loading">
                    <div className="sc-spinner"></div>
                    <p>Loading your store...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="sc-page">
            {/* Toast */}
            {toast && (
                <div className={`sc-toast sc-toast-${toast.type}`}>
                    <span>{toast.type === 'success' ? '✅' : '❌'}</span>
                    {toast.message}
                </div>
            )}

            <div className="sc-header">
                <div>
                    <h2>Store Customization</h2>
                    <p>Design your public store — make it yours! ✨</p>
                </div>
                <button className="sc-save-btn" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : '💾 Save Changes'}
                </button>
            </div>

            <div className="sc-layout">
                {/* ===== LEFT: Settings Form ===== */}
                <div className="sc-form-panel">
                    {/* Store Link */}
                    {store.storeSlug && (
                        <div className="sc-link-card">
                            <div className="sc-link-header">
                                <span className="sc-link-icon">🔗</span>
                                <div>
                                    <h4>Your Store Link</h4>
                                    <p>Share this link on Instagram, WhatsApp, etc.</p>
                                </div>
                            </div>
                            <div className="sc-link-row">
                                <code className="sc-link-url">
                                    {window.location.origin}/store/{store.storeSlug}
                                </code>
                                <button className="sc-copy-btn" onClick={copyStoreLink}>
                                    {linkCopied ? '✅ Copied!' : '📋 Copy'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Store Active Toggle */}
                    <div className="sc-card">
                        <div className="sc-toggle-row">
                            <div>
                                <h4>Store Active</h4>
                                <p>Turn off to hide your store temporarily</p>
                            </div>
                            <label className="sc-toggle">
                                <input
                                    type="checkbox"
                                    checked={store.storeActive}
                                    onChange={() => handleChange('storeActive', !store.storeActive)}
                                />
                                <span className="sc-slider"></span>
                            </label>
                        </div>
                    </div>

                    {/* Logo Upload */}
                    <div className="sc-card">
                        <h3 className="sc-card-title">Store Logo</h3>
                        <div className="sc-logo-upload">
                            <div
                                className="sc-logo-preview"
                                style={{ background: store.storeLogo ? 'none' : store.themeColor }}
                            >
                                {store.storeLogo ? (
                                    <img src={store.storeLogo} alt="Store logo" />
                                ) : (
                                    <span>{storeLetter}</span>
                                )}
                            </div>
                            <div className="sc-logo-actions">
                                <button
                                    className="sc-upload-btn"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    📷 Upload Logo
                                </button>
                                {store.storeLogo && (
                                    <button className="sc-remove-btn" onClick={removeLogo}>
                                        Remove
                                    </button>
                                )}
                                <span className="sc-hint">Max 500KB · JPG, PNG</span>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>

                    {/* Store Name & Description */}
                    <div className="sc-card">
                        <h3 className="sc-card-title">Store Info</h3>
                        <div className="sc-form-group">
                            <label htmlFor="sc-name">Store Name *</label>
                            <input
                                id="sc-name"
                                type="text"
                                value={store.businessName}
                                onChange={(e) => handleChange('businessName', e.target.value)}
                                placeholder="Your store name"
                            />
                        </div>
                        <div className="sc-form-group">
                            <label htmlFor="sc-desc">Short Description</label>
                            <textarea
                                id="sc-desc"
                                value={store.storeDescription}
                                onChange={(e) => handleChange('storeDescription', e.target.value)}
                                placeholder="We sell handmade earrings & accessories ✨"
                                rows={3}
                                maxLength={200}
                            />
                            <span className="sc-char-count">{store.storeDescription.length}/200</span>
                        </div>
                    </div>

                    {/* Theme Color */}
                    <div className="sc-card">
                        <h3 className="sc-card-title">Theme Color</h3>
                        <p className="sc-card-desc">Choose a color that matches your brand</p>
                        <div className="sc-color-grid">
                            {THEME_PRESETS.map(preset => (
                                <button
                                    key={preset.color}
                                    className={`sc-color-swatch ${store.themeColor === preset.color ? 'sc-swatch-active' : ''}`}
                                    style={{ '--swatch-color': preset.color }}
                                    onClick={() => handleChange('themeColor', preset.color)}
                                    title={preset.name}
                                >
                                    {store.themeColor === preset.color && (
                                        <span className="sc-swatch-check">✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="sc-custom-color">
                            <label>Custom Color</label>
                            <div className="sc-custom-color-input">
                                <input
                                    type="color"
                                    value={store.themeColor}
                                    onChange={(e) => handleChange('themeColor', e.target.value)}
                                    className="sc-color-picker"
                                />
                                <input
                                    type="text"
                                    value={store.themeColor}
                                    onChange={(e) => handleChange('themeColor', e.target.value)}
                                    className="sc-color-hex"
                                    placeholder="#6366f1"
                                    maxLength={7}
                                />
                            </div>
                        </div>
                    </div>

                    {/* WhatsApp Settings */}
                    <div className="sc-card">
                        <h3 className="sc-card-title">WhatsApp Contact</h3>
                        <div className="sc-toggle-row" style={{ marginBottom: '1rem' }}>
                            <div>
                                <h4>Show WhatsApp Button</h4>
                                <p>Let customers contact you on WhatsApp</p>
                            </div>
                            <label className="sc-toggle">
                                <input
                                    type="checkbox"
                                    checked={store.showWhatsapp}
                                    onChange={() => handleChange('showWhatsapp', !store.showWhatsapp)}
                                />
                                <span className="sc-slider"></span>
                            </label>
                        </div>
                        {store.showWhatsapp && (
                            <div className="sc-form-group">
                                <label htmlFor="sc-whatsapp">WhatsApp Number</label>
                                <input
                                    id="sc-whatsapp"
                                    type="tel"
                                    value={store.whatsappNumber}
                                    onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                                    placeholder="9876543210"
                                    maxLength={15}
                                />
                                <span className="sc-hint">10-digit number without country code</span>
                            </div>
                        )}
                    </div>

                    {/* Mobile Save Button */}
                    <button className="sc-save-btn sc-save-mobile" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : '💾 Save Changes'}
                    </button>
                </div>

                {/* ===== RIGHT: Live Preview ===== */}
                <div className="sc-preview-panel">
                    <div className="sc-preview-header">
                        <span className="sc-preview-dot"></span>
                        <span className="sc-preview-label">Live Preview</span>
                        <span className="sc-preview-dot"></span>
                    </div>

                    <div className="sc-phone-frame">
                        <div className="sc-phone-notch"></div>
                        <div className="sc-phone-screen">
                            {/* Preview Store Header */}
                            <div
                                className="sc-prev-header"
                                style={{ background: `linear-gradient(135deg, ${store.themeColor} 0%, ${adjustColor(store.themeColor, 30)} 100%)` }}
                            >
                                <div className="sc-prev-logo" style={{ color: store.themeColor }}>
                                    {store.storeLogo ? (
                                        <img src={store.storeLogo} alt="Logo" />
                                    ) : (
                                        storeLetter
                                    )}
                                </div>
                                <h3 className="sc-prev-name">{store.businessName || 'Your Store Name'}</h3>
                                {store.storeDescription && (
                                    <p className="sc-prev-desc">{store.storeDescription}</p>
                                )}
                                <div className="sc-prev-badges">
                                    <span className="sc-prev-badge">✅ Verified</span>
                                    <span className="sc-prev-badge">📦 4 Products</span>
                                </div>
                                {store.showWhatsapp && store.whatsappNumber && (
                                    <button className="sc-prev-wa-btn">
                                        💬 Chat on WhatsApp
                                    </button>
                                )}
                            </div>

                            {/* Preview Products */}
                            <div className="sc-prev-products">
                                <h4 className="sc-prev-section-title">Our Products</h4>
                                <div className="sc-prev-grid">
                                    {sampleProducts.map((p, i) => (
                                        <div key={i} className="sc-prev-card">
                                            <div className="sc-prev-card-img">🛍️</div>
                                            <div className="sc-prev-card-info">
                                                <span className="sc-prev-card-name">{p.name}</span>
                                                <div className="sc-prev-card-bottom">
                                                    <span className="sc-prev-card-price">{formatPrice(p.price)}</span>
                                                    <span
                                                        className="sc-prev-card-btn"
                                                        style={{ background: store.themeColor }}
                                                    >
                                                        Tap
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Preview Footer */}
                            <div className="sc-prev-footer">
                                Powered by <strong style={{ color: store.themeColor }}>StoreSight</strong>
                            </div>
                        </div>
                    </div>

                    {store.storeSlug && (
                        <a
                            href={`/store/${store.storeSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="sc-open-store-btn"
                        >
                            🌐 Open Live Store →
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper to lighten/shift a hex color
function adjustColor(hex, amount) {
    try {
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);
        r = Math.min(255, r + amount);
        g = Math.min(255, g + amount);
        b = Math.min(255, b + amount);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    } catch {
        return hex;
    }
}

export default StoreCustomization;
