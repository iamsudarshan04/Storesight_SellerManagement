import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './StoreFront.css';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const StoreFront = () => {
    const { slug } = useParams();
    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cart, setCart] = useState({});

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

    const addToCart = (product) => {
        setCart(prev => ({
            ...prev,
            [product.id]: (prev[product.id] || 0) + 1
        }));
    };

    const removeFromCart = (productId) => {
        setCart(prev => {
            const updated = { ...prev };
            if (updated[productId] > 1) {
                updated[productId] -= 1;
            } else {
                delete updated[productId];
            }
            return updated;
        });
    };

    const cartItemCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
        const product = products.find(p => p.id === id);
        return sum + (product ? product.price * qty : 0);
    }, 0);

    const formatPrice = (price) => '₹' + Number(price).toLocaleString('en-IN');

    const handleWhatsAppOrder = () => {
        if (!store?.whatsapp) return;

        // Build order message
        const items = Object.entries(cart).map(([id, qty]) => {
            const product = products.find(p => p.id === id);
            return `• ${product?.name} × ${qty} = ${formatPrice(product.price * qty)}`;
        }).join('\n');

        const message = `Hi! I'd like to order from ${store.name}:\n\n${items}\n\nTotal: ${formatPrice(cartTotal)}\n\nPlease confirm! 🙏`;

        const phone = store.whatsapp.replace(/[^0-9]/g, '');
        const whatsappUrl = `https://wa.me/${phone.startsWith('91') ? phone : '91' + phone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
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

    return (
        <div className="sf-page">
            {/* Store Header */}
            <header className="sf-header">
                <div className="sf-header-bg"></div>
                <div className="sf-header-content">
                    <div className="sf-logo">
                        {(store.name || 'S').charAt(0).toUpperCase()}
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
                        {products.map(product => {
                            const inCart = cart[product.id] || 0;
                            return (
                                <div key={product.id} className="sf-product-card">
                                    {/* Product image placeholder */}
                                    <div className="sf-product-img">
                                        <span className="sf-product-emoji">🛍️</span>
                                    </div>

                                    <div className="sf-product-info">
                                        <h3 className="sf-product-name">{product.name}</h3>
                                        <div className="sf-product-bottom">
                                            <span className="sf-product-price">{formatPrice(product.price)}</span>
                                            {inCart === 0 ? (
                                                <button
                                                    className="sf-add-btn"
                                                    onClick={() => addToCart(product)}
                                                >
                                                    + Add
                                                </button>
                                            ) : (
                                                <div className="sf-qty-control">
                                                    <button className="sf-qty-btn" onClick={() => removeFromCart(product.id)}>−</button>
                                                    <span className="sf-qty-value">{inCart}</span>
                                                    <button className="sf-qty-btn" onClick={() => addToCart(product)}>+</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Footer */}
            <footer className="sf-footer">
                <p>Powered by <strong>StoreSight</strong></p>
            </footer>

            {/* Sticky Cart Bar */}
            {cartItemCount > 0 && (
                <div className="sf-cart-bar">
                    <div className="sf-cart-info">
                        <span className="sf-cart-count">{cartItemCount} item{cartItemCount > 1 ? 's' : ''}</span>
                        <span className="sf-cart-total">{formatPrice(cartTotal)}</span>
                    </div>
                    <button
                        className="sf-cart-btn"
                        onClick={store.whatsapp ? handleWhatsAppOrder : undefined}
                    >
                        {store.whatsapp ? (
                            <>
                                <svg className="sf-wa-icon-sm" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Order on WhatsApp
                            </>
                        ) : 'View Cart'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default StoreFront;
