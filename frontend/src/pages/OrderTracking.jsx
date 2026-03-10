import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import './OrderTracking.css';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const STATUS_STEPS = [
    { key: 'New', label: 'Order Confirmed', icon: '✅', description: 'Your order has been received!' },
    { key: 'Processing', label: 'Processing', icon: '📦', description: 'Seller is preparing your order' },
    { key: 'Shipped', label: 'Shipped', icon: '🚚', description: 'Your order is on the way' },
    { key: 'Delivered', label: 'Delivered', icon: '🎉', description: 'Order delivered successfully!' }
];

const OrderTracking = () => {
    const { orderId } = useParams();
    const location = useLocation();
    const justPlaced = location.state?.justPlaced || false;

    const [order, setOrder] = useState(null);
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const fetchOrder = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE}/store/track/${orderId}`);
            setOrder(response.data.order);
            setSeller(response.data.seller);
            setError(null);
        } catch (err) {
            if (err.response?.status === 404) {
                setError('notfound');
            } else {
                setError('server');
            }
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        fetchOrder();

        // Auto-refresh every 30 seconds for live updates
        const interval = setInterval(fetchOrder, 30000);
        return () => clearInterval(interval);
    }, [fetchOrder]);

    const formatPrice = (price) => '₹' + Number(price).toLocaleString('en-IN');

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const copyOrderId = () => {
        navigator.clipboard.writeText(order.orderId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getStatusIndex = (status) => {
        if (status === 'Cancelled') return -1;
        return STATUS_STEPS.findIndex(s => s.key === status);
    };

    const getEstimatedDelivery = () => {
        if (!order) return '';
        const orderDate = new Date(order.date);
        const estimatedDate = new Date(orderDate);
        estimatedDate.setDate(estimatedDate.getDate() + 5); // 3-5 business days

        if (order.status === 'Delivered') return 'Delivered! 🎉';
        if (order.status === 'Cancelled') return 'Order cancelled';

        return `Expected by ${estimatedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
    };

    const handleWhatsAppContact = () => {
        if (!seller?.whatsapp) return;
        const phone = seller.whatsapp.replace(/[^0-9]/g, '');
        const message = `Hi! I have a question about my order ${order.orderId}`;
        const whatsappUrl = `https://wa.me/${phone.startsWith('91') ? phone : '91' + phone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    // Loading
    if (loading) {
        return (
            <div className="ot-page">
                <div className="ot-loading">
                    <div className="ot-loading-pulse"></div>
                    <div className="ot-loading-pulse ot-pulse-2"></div>
                    <div className="ot-loading-pulse ot-pulse-3"></div>
                </div>
            </div>
        );
    }

    // Error: not found
    if (error === 'notfound') {
        return (
            <div className="ot-page">
                <div className="ot-error-card">
                    <span className="ot-error-icon">🔍</span>
                    <h2>Order Not Found</h2>
                    <p>We couldn't find an order with this ID. Please double-check and try again.</p>
                </div>
            </div>
        );
    }

    // Error: server
    if (error) {
        return (
            <div className="ot-page">
                <div className="ot-error-card">
                    <span className="ot-error-icon">😵</span>
                    <h2>Something went wrong</h2>
                    <p>Please try again in a moment.</p>
                    <button className="ot-retry-btn" onClick={() => { setError(null); setLoading(true); fetchOrder(); }}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const currentStepIndex = getStatusIndex(order.status);
    const isCancelled = order.status === 'Cancelled';

    return (
        <div className="ot-page">
            <div className="ot-container">
                {/* === Thank You Hero === */}
                {justPlaced && (
                    <div className="ot-hero">
                        <div className="ot-hero-emoji">🎉</div>
                        <h1 className="ot-hero-title">Order Placed!</h1>
                        <p className="ot-hero-subtitle">Thank you for your order. You're awesome! 💜</p>
                    </div>
                )}

                {!justPlaced && (
                    <div className="ot-hero ot-hero--track">
                        <h1 className="ot-hero-title">Order Tracking</h1>
                        <p className="ot-hero-subtitle">Stay updated on your order status</p>
                    </div>
                )}

                {/* === Order ID Card === */}
                <div className="ot-card ot-order-id-card">
                    <div className="ot-order-id-row">
                        <div>
                            <span className="ot-label">Order ID</span>
                            <span className="ot-order-id">{order.orderId}</span>
                        </div>
                        <button className="ot-copy-btn" onClick={copyOrderId}>
                            {copied ? (
                                <><span className="ot-copy-icon">✓</span> Copied!</>
                            ) : (
                                <><span className="ot-copy-icon">📋</span> Copy</>
                            )}
                        </button>
                    </div>
                    <span className="ot-order-date">Placed on {formatDate(order.date)}</span>
                </div>

                {/* === Product Summary === */}
                <div className="ot-card">
                    <h3 className="ot-card-title">Order Summary</h3>
                    <div className="ot-product-row">
                        <div className="ot-product-thumb">🛍️</div>
                        <div className="ot-product-details">
                            <span className="ot-product-name">{order.productName}</span>
                            <span className="ot-product-qty">Qty: {order.quantity}</span>
                        </div>
                        <span className="ot-product-price">{formatPrice(order.totalAmount)}</span>
                    </div>
                    {order.address && (
                        <div className="ot-address-row">
                            <span className="ot-address-label">📍 Delivery Address</span>
                            <span className="ot-address-text">{order.address}</span>
                        </div>
                    )}
                </div>

                {/* === Status Badges === */}
                <div className="ot-card ot-status-card">
                    <div className="ot-status-badges">
                        <div className={`ot-status-badge ot-badge--payment ${order.paymentStatus === 'Paid' ? 'ot-badge--paid' : 'ot-badge--pending'}`}>
                            <span className="ot-badge-icon">{order.paymentStatus === 'Paid' ? '💳' : '⏳'}</span>
                            <div>
                                <span className="ot-badge-label">Payment</span>
                                <span className="ot-badge-value">
                                    {order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}
                                    {' · '}
                                    {order.paymentStatus}
                                </span>
                            </div>
                        </div>
                        <div className={`ot-status-badge ot-badge--delivery ${isCancelled ? 'ot-badge--cancelled' : ''}`}>
                            <span className="ot-badge-icon">{isCancelled ? '❌' : '📦'}</span>
                            <div>
                                <span className="ot-badge-label">Delivery</span>
                                <span className="ot-badge-value">{getEstimatedDelivery()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* === Delivery Timeline === */}
                <div className="ot-card">
                    <h3 className="ot-card-title">Delivery Progress</h3>

                    {isCancelled ? (
                        <div className="ot-cancelled-notice">
                            <span className="ot-cancelled-icon">❌</span>
                            <h4>Order Cancelled</h4>
                            <p>This order has been cancelled. If you have questions, please contact the seller.</p>
                        </div>
                    ) : (
                        <div className="ot-timeline">
                            {STATUS_STEPS.map((step, index) => {
                                const isComplete = index <= currentStepIndex;
                                const isCurrent = index === currentStepIndex;
                                return (
                                    <div
                                        key={step.key}
                                        className={`ot-timeline-step ${isComplete ? 'ot-step--complete' : ''} ${isCurrent ? 'ot-step--current' : ''}`}
                                    >
                                        <div className="ot-timeline-line-area">
                                            <div className={`ot-timeline-dot ${isComplete ? 'ot-dot--complete' : ''} ${isCurrent ? 'ot-dot--current' : ''}`}>
                                                {isComplete ? (
                                                    <span className="ot-dot-icon">{step.icon}</span>
                                                ) : (
                                                    <span className="ot-dot-number">{index + 1}</span>
                                                )}
                                            </div>
                                            {index < STATUS_STEPS.length - 1 && (
                                                <div className={`ot-timeline-line ${isComplete && index < currentStepIndex ? 'ot-line--complete' : ''}`}></div>
                                            )}
                                        </div>
                                        <div className="ot-timeline-content">
                                            <span className={`ot-timeline-label ${isComplete ? 'ot-label--complete' : ''}`}>
                                                {step.label}
                                            </span>
                                            {isCurrent && (
                                                <span className="ot-timeline-desc">{step.description}</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* === Seller Contact === */}
                {seller && (
                    <div className="ot-card ot-contact-card">
                        <h3 className="ot-card-title">Need help?</h3>
                        <p className="ot-contact-text">Questions about your order? Reach out to <strong>{seller.name}</strong></p>

                        {seller.whatsapp && (
                            <button className="ot-whatsapp-btn" onClick={handleWhatsAppContact}>
                                <svg className="ot-wa-icon" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Contact Seller on WhatsApp
                            </button>
                        )}

                        {seller.storeSlug && (
                            <Link to={`/store/${seller.storeSlug}`} className="ot-back-store">
                                ← Back to store
                            </Link>
                        )}
                    </div>
                )}

                {/* === Auto-refresh notice === */}
                <div className="ot-auto-refresh">
                    <span>🔄</span> This page updates automatically
                </div>

                {/* Footer */}
                <footer className="ot-footer">
                    <p>Powered by <strong>StoreSight</strong></p>
                </footer>
            </div>
        </div>
    );
};

export default OrderTracking;
