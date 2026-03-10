import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './StoreFront.css';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const StoreFront = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Product detail modal
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);

    // Checkout state
    const [showCheckout, setShowCheckout] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [checkoutForm, setCheckoutForm] = useState({
        customerName: '',
        phoneNumber: '',
        address: '',
        paymentMethod: 'COD'
    });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        fetchStore();
    }, [slug]);

    const fetchStore = async () => {
        try {
            const response = await axios.get(`${API_BASE}/store/${slug}`);
            setStore(response.data.store);
            setProducts(response.data.products);
        } catch (err) {
            if (err.response?.status === 404) {
                setError('notfound');
            } else {
                setError('server');
            }
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => '₹' + Number(price).toLocaleString('en-IN');

    const openProduct = (product) => {
        setSelectedProduct(product);
        setQuantity(1);
        setShowCheckout(false);
        setFormErrors({});
        setCheckoutForm({
            customerName: '',
            phoneNumber: '',
            address: '',
            paymentMethod: 'COD'
        });
    };

    const closeProduct = () => {
        setSelectedProduct(null);
        setShowCheckout(false);
        setFormErrors({});
    };

    const handleCheckoutChange = (e) => {
        const { name, value } = e.target;
        setCheckoutForm(prev => ({ ...prev, [name]: value }));
        // Clear error on change
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!checkoutForm.customerName.trim()) errors.customerName = 'Please enter your name';
        if (!checkoutForm.phoneNumber.trim()) {
            errors.phoneNumber = 'Phone number is required';
        } else if (!/^[6-9]\d{9}$/.test(checkoutForm.phoneNumber.replace(/\s/g, ''))) {
            errors.phoneNumber = 'Enter a valid 10-digit phone number';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handlePlaceOrder = async () => {
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const response = await axios.post(`${API_BASE}/store/${slug}/order`, {
                productId: selectedProduct.id,
                quantity,
                customerName: checkoutForm.customerName.trim(),
                phoneNumber: checkoutForm.phoneNumber.trim(),
                address: checkoutForm.address.trim(),
                paymentMethod: checkoutForm.paymentMethod
            });

            // Navigate to tracking page
            const orderId = response.data.orderId;
            navigate(`/track/${orderId}`, { state: { justPlaced: true } });
        } catch (err) {
            setSubmitting(false);
            const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
            setFormErrors({ submit: msg });
        }
    };

    const handleWhatsAppContact = () => {
        if (!store?.whatsapp) return;
        const phone = store.whatsapp.replace(/[^0-9]/g, '');
        const whatsappUrl = `https://wa.me/${phone.startsWith('91') ? phone : '91' + phone}?text=${encodeURIComponent(`Hi! I'm browsing your store ${store.name} 👋`)}`;
        window.open(whatsappUrl, '_blank');
    };

    // Loading
    if (loading) {
        return (
            <div className="sf-page">
                <div className="sf-loading">
                    <div className="sf-loading-pulse"></div>
                    <div className="sf-loading-pulse sf-pulse-2"></div>
                    <div className="sf-loading-pulse sf-pulse-3"></div>
                </div>
            </div>
        );
    }

    // Error: not found
    if (error === 'notfound') {
        return (
            <div className="sf-page">
                <div className="sf-error-card">
                    <span className="sf-error-icon">🏪</span>
                    <h2>Store Not Found</h2>
                    <p>This store doesn't exist or might have been removed.</p>
                </div>
            </div>
        );
    }

    // Error: server
    if (error) {
        return (
            <div className="sf-page">
                <div className="sf-error-card">
                    <span className="sf-error-icon">😵</span>
                    <h2>Something went wrong</h2>
                    <p>Please try again in a moment.</p>
                    <button className="sf-retry-btn" onClick={() => { setError(null); setLoading(true); fetchStore(); }}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const themeColor = store.themeColor || '#6366f1';

    return (
        <div className="sf-page" style={{ '--sf-theme': themeColor, '--sf-theme-light': themeColor + '20' }}>
            {/* Store Header */}
            <header className="sf-header">
                <div className="sf-header-bg" style={{ background: `linear-gradient(135deg, ${themeColor} 0%, ${adjustColor(themeColor, 30)} 100%)` }}></div>
                <div className="sf-header-content">
                    <div className="sf-logo" style={{ color: themeColor }}>
                        {store.logo ? (
                            <img src={store.logo} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        ) : (
                            (store.name || 'S').charAt(0).toUpperCase()
                        )}
                    </div>
                    <h1 className="sf-store-name">{store.name}</h1>
                    {store.description && (
                        <p className="sf-store-desc">{store.description}</p>
                    )}

                    {/* Trust badges */}
                    <div className="sf-trust-badges">
                        <span className="sf-badge">✅ Verified Seller</span>
                        <span className="sf-badge">📦 {products.length} Products</span>
                    </div>

                    {/* WhatsApp Contact */}
                    {store.whatsapp && (
                        <button className="sf-whatsapp-btn" onClick={handleWhatsAppContact}>
                            <svg className="sf-wa-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Chat on WhatsApp
                        </button>
                    )}
                </div>
            </header>

            {/* Products Section */}
            <section className="sf-products-section">
                <h2 className="sf-section-title">Our Products</h2>

                {products.length === 0 ? (
                    <div className="sf-no-products">
                        <span>🛍️</span>
                        <p>Products coming soon!</p>
                    </div>
                ) : (
                    <div className="sf-product-grid">
                        {products.map(product => (
                            <div
                                key={product.id}
                                className="sf-product-card"
                                onClick={() => openProduct(product)}
                                role="button"
                                tabIndex={0}
                            >
                                {/* Product image placeholder */}
                                <div className="sf-product-img">
                                    <span className="sf-product-emoji">🛍️</span>
                                </div>

                                <div className="sf-product-info">
                                    <h3 className="sf-product-name">{product.name}</h3>
                                    <div className="sf-product-bottom">
                                        <span className="sf-product-price">{formatPrice(product.price)}</span>
                                        <span className="sf-tap-hint">Tap to buy</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Footer */}
            <footer className="sf-footer">
                <p>Powered by <strong>StoreSight</strong></p>
            </footer>

            {/* ===== Product Detail Modal / Checkout ===== */}
            {selectedProduct && (
                <div className="sf-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeProduct(); }}>
                    <div className={`sf-modal ${showCheckout ? 'sf-modal--checkout' : ''}`}>
                        {/* Close button */}
                        <button className="sf-modal-close" onClick={closeProduct}>✕</button>

                        {submitting ? (
                            /* ===== Submitting / Loading State ===== */
                            <div className="sf-submitting">
                                <div className="sf-submitting-spinner"></div>
                                <h3>Placing your order...</h3>
                                <p>Just a moment ✨</p>
                            </div>
                        ) : !showCheckout ? (
                            /* ===== Product Detail View ===== */
                            <>
                                <div className="sf-modal-product-img">
                                    <span>🛍️</span>
                                </div>
                                <div className="sf-modal-body">
                                    <h2 className="sf-modal-product-name">{selectedProduct.name}</h2>
                                    <p className="sf-modal-product-price">{formatPrice(selectedProduct.price)}</p>

                                    {/* Quantity Selector */}
                                    <div className="sf-modal-qty">
                                        <span className="sf-modal-qty-label">Quantity</span>
                                        <div className="sf-modal-qty-control">
                                            <button
                                                className="sf-modal-qty-btn"
                                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                                disabled={quantity <= 1}
                                            >−</button>
                                            <span className="sf-modal-qty-value">{quantity}</span>
                                            <button
                                                className="sf-modal-qty-btn"
                                                onClick={() => setQuantity(q => q + 1)}
                                            >+</button>
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="sf-modal-total">
                                        <span>Total</span>
                                        <strong>{formatPrice(selectedProduct.price * quantity)}</strong>
                                    </div>

                                    <button
                                        className="sf-place-order-btn"
                                        onClick={() => setShowCheckout(true)}
                                    >
                                        Place Order — {formatPrice(selectedProduct.price * quantity)}
                                    </button>
                                </div>
                            </>
                        ) : (
                            /* ===== Checkout Form ===== */
                            <div className="sf-checkout">
                                <h2 className="sf-checkout-title">Almost there! 🎉</h2>

                                <div className="sf-checkout-summary">
                                    <span className="sf-checkout-product">{selectedProduct.name} × {quantity}</span>
                                    <span className="sf-checkout-amount">{formatPrice(selectedProduct.price * quantity)}</span>
                                </div>

                                <div className="sf-checkout-form">
                                    {/* Customer Name */}
                                    <div className={`sf-form-group ${formErrors.customerName ? 'sf-form-error' : ''}`}>
                                        <label htmlFor="sf-name">Your Name</label>
                                        <input
                                            id="sf-name"
                                            type="text"
                                            name="customerName"
                                            placeholder="Enter your name"
                                            value={checkoutForm.customerName}
                                            onChange={handleCheckoutChange}
                                            autoFocus
                                        />
                                        {formErrors.customerName && <span className="sf-error-text">{formErrors.customerName}</span>}
                                    </div>

                                    {/* Phone Number */}
                                    <div className={`sf-form-group ${formErrors.phoneNumber ? 'sf-form-error' : ''}`}>
                                        <label htmlFor="sf-phone">Phone Number <span className="sf-required">*</span></label>
                                        <input
                                            id="sf-phone"
                                            type="tel"
                                            name="phoneNumber"
                                            placeholder="10-digit mobile number"
                                            value={checkoutForm.phoneNumber}
                                            onChange={handleCheckoutChange}
                                            maxLength={10}
                                            inputMode="numeric"
                                        />
                                        {formErrors.phoneNumber && <span className="sf-error-text">{formErrors.phoneNumber}</span>}
                                    </div>

                                    {/* Address */}
                                    <div className="sf-form-group">
                                        <label htmlFor="sf-address">Delivery Address <span className="sf-optional">(optional)</span></label>
                                        <textarea
                                            id="sf-address"
                                            name="address"
                                            placeholder="Your delivery address"
                                            value={checkoutForm.address}
                                            onChange={handleCheckoutChange}
                                            rows={2}
                                        />
                                    </div>

                                    {/* Payment Method */}
                                    <div className="sf-form-group">
                                        <label>Payment Method</label>
                                        <div className="sf-payment-options">
                                            <button
                                                type="button"
                                                className={`sf-payment-btn ${checkoutForm.paymentMethod === 'COD' ? 'sf-payment-active' : ''}`}
                                                onClick={() => setCheckoutForm(prev => ({ ...prev, paymentMethod: 'COD' }))}
                                            >
                                                <span className="sf-pay-icon">💵</span>
                                                <span>Cash on Delivery</span>
                                            </button>
                                            <button
                                                type="button"
                                                className={`sf-payment-btn ${checkoutForm.paymentMethod === 'UPI' ? 'sf-payment-active' : ''}`}
                                                onClick={() => setCheckoutForm(prev => ({ ...prev, paymentMethod: 'UPI' }))}
                                            >
                                                <span className="sf-pay-icon">📱</span>
                                                <span>UPI Payment</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Submit Error */}
                                    {formErrors.submit && (
                                        <div className="sf-submit-error">
                                            <span>⚠️</span> {formErrors.submit}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="sf-checkout-actions">
                                        <button
                                            className="sf-back-btn"
                                            onClick={() => { setShowCheckout(false); setFormErrors({}); }}
                                        >
                                            ← Back
                                        </button>
                                        <button
                                            className="sf-confirm-btn"
                                            onClick={handlePlaceOrder}
                                        >
                                            Confirm Order 🚀
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
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

export default StoreFront;
