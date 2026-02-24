import { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import './Inventory.css';

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [stockFilter, setStockFilter] = useState('all'); // all, instock, lowstock, outofstock
    const [showStockModal, setShowStockModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [stockAction, setStockAction] = useState('set');
    const [stockValue, setStockValue] = useState('');
    const [updating, setUpdating] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    // Auto-dismiss toast
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const fetchProducts = async () => {
        try {
            const response = await axiosInstance.get('/products');
            setProducts(response.data.products);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            showToast('Failed to load inventory', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const getStockStatus = (product) => {
        if (product.quantity === 0) return 'Out of Stock';
        if (product.quantity <= product.lowStockLimit) return 'Low Stock';
        return 'In Stock';
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'In Stock': return 'status-instock';
            case 'Low Stock': return 'status-lowstock';
            case 'Out of Stock': return 'status-outofstock';
            default: return '';
        }
    };

    // Compute stats
    const stats = [
        {
            label: 'Total Products',
            value: products.length,
            icon: '📦',
            color: '#3b82f6'
        },
        {
            label: 'In Stock',
            value: products.filter(p => p.quantity > p.lowStockLimit).length,
            icon: '✅',
            color: '#10b981'
        },
        {
            label: 'Low Stock',
            value: products.filter(p => p.quantity > 0 && p.quantity <= p.lowStockLimit).length,
            icon: '⚠️',
            color: '#f59e0b'
        },
        {
            label: 'Out of Stock',
            value: products.filter(p => p.quantity === 0).length,
            icon: '❌',
            color: '#ef4444'
        },
    ];

    // Filter products
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.productName.toLowerCase().includes(searchQuery.toLowerCase());
        const status = getStockStatus(product);
        const matchesFilter =
            stockFilter === 'all' ||
            (stockFilter === 'instock' && status === 'In Stock') ||
            (stockFilter === 'lowstock' && status === 'Low Stock') ||
            (stockFilter === 'outofstock' && status === 'Out of Stock');

        return matchesSearch && matchesFilter;
    });

    // Stock update modal handlers
    const openStockModal = (product) => {
        setSelectedProduct(product);
        setStockAction('set');
        setStockValue(product.quantity.toString());
        setShowStockModal(true);
    };

    const closeStockModal = () => {
        setShowStockModal(false);
        setSelectedProduct(null);
        setStockValue('');
        setStockAction('set');
    };

    const handleStockUpdate = async (e) => {
        e.preventDefault();
        if (!selectedProduct || stockValue === '') return;

        setUpdating(true);
        try {
            await axiosInstance.patch(`/products/${selectedProduct._id}/stock`, {
                quantity: Number(stockValue),
                action: stockAction
            });
            showToast(`Stock updated for "${selectedProduct.productName}"`, 'success');
            closeStockModal();
            fetchProducts();
        } catch (error) {
            console.error('Failed to update stock:', error);
            showToast(error.response?.data?.message || 'Failed to update stock', 'error');
        } finally {
            setUpdating(false);
        }
    };

    // Calculate the preview value for the stock update
    const getPreviewQuantity = () => {
        if (!selectedProduct || stockValue === '') return '—';
        const val = Number(stockValue);
        switch (stockAction) {
            case 'add': return selectedProduct.quantity + val;
            case 'subtract': return Math.max(0, selectedProduct.quantity - val);
            case 'set':
            default: return val;
        }
    };

    if (loading) {
        return (
            <div className="inventory-page">
                <div className="inventory-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading inventory...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="inventory-page">
            {/* Toast notification */}
            {toast && (
                <div className={`inventory-toast toast-${toast.type}`}>
                    <span>{toast.type === 'success' ? '✅' : '❌'}</span>
                    {toast.message}
                </div>
            )}

            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h2>Inventory Management</h2>
                    <p>Track and manage your stock levels</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className={`stat-card ${stockFilter === ['all', 'instock', 'lowstock', 'outofstock'][index] ? 'stat-active' : ''}`}
                        onClick={() => setStockFilter(['all', 'instock', 'lowstock', 'outofstock'][index])}
                        style={{ cursor: 'pointer' }}
                    >
                        <span className="stat-icon">{stat.icon}</span>
                        <div className="stat-info">
                            <h3 style={{ color: stat.color }}>{stat.value}</h3>
                            <p>{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Inventory Table */}
            <div className="inventory-table-container">
                <div className="table-header">
                    <h3>
                        Stock Overview
                        {stockFilter !== 'all' && (
                            <span className="filter-tag">
                                {stockFilter === 'instock' ? 'In Stock' :
                                    stockFilter === 'lowstock' ? 'Low Stock' : 'Out of Stock'}
                                <button className="clear-filter" onClick={() => setStockFilter('all')}>✕</button>
                            </span>
                        )}
                    </h3>
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="inventory-empty">
                        <span className="empty-icon">📦</span>
                        <h3>{searchQuery || stockFilter !== 'all' ? 'No matching products' : 'No products yet'}</h3>
                        <p>
                            {searchQuery || stockFilter !== 'all'
                                ? 'Try adjusting your search or clearing the filter.'
                                : 'Add products from the Products page to start tracking inventory.'}
                        </p>
                        {(searchQuery || stockFilter !== 'all') && (
                            <button
                                className="btn-secondary"
                                onClick={() => { setSearchQuery(''); setStockFilter('all'); }}
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <table className="inventory-table desktop-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Current Stock</th>
                                    <th>Low Stock Limit</th>
                                    <th>Status</th>
                                    <th>Stock Value</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product) => {
                                    const status = getStockStatus(product);
                                    const stockValue = product.quantity * product.costPrice;
                                    return (
                                        <tr key={product._id} className={status === 'Out of Stock' ? 'row-outofstock' : ''}>
                                            <td className="product-name">{product.productName}</td>
                                            <td className="stock-count">
                                                <span className={`stock-number ${status === 'Out of Stock' ? 'stock-zero' : status === 'Low Stock' ? 'stock-low' : ''}`}>
                                                    {product.quantity}
                                                </span>
                                            </td>
                                            <td className="min-stock">{product.lowStockLimit}</td>
                                            <td>
                                                <span className={`status-badge ${getStatusClass(status)}`}>
                                                    {status}
                                                </span>
                                            </td>
                                            <td className="stock-value">
                                                ₹{stockValue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn-stock-update"
                                                        title="Update Stock"
                                                        onClick={() => openStockModal(product)}
                                                    >
                                                        📝 Update
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Mobile Cards */}
                        <div className="inventory-cards mobile-cards">
                            {filteredProducts.map((product) => {
                                const status = getStockStatus(product);
                                return (
                                    <div key={product._id} className={`inventory-card ${status === 'Out of Stock' ? 'card-outofstock' : ''}`}>
                                        <div className="card-top">
                                            <span className="card-product-name">{product.productName}</span>
                                            <span className={`status-badge ${getStatusClass(status)}`}>{status}</span>
                                        </div>
                                        <div className="card-stats">
                                            <div className="card-stat">
                                                <span className="card-stat-label">Stock</span>
                                                <span className={`card-stat-value ${status === 'Out of Stock' ? 'stock-zero' : status === 'Low Stock' ? 'stock-low' : ''}`}>
                                                    {product.quantity}
                                                </span>
                                            </div>
                                            <div className="card-stat">
                                                <span className="card-stat-label">Limit</span>
                                                <span className="card-stat-value">{product.lowStockLimit}</span>
                                            </div>
                                            <div className="card-stat">
                                                <span className="card-stat-label">Value</span>
                                                <span className="card-stat-value">₹{(product.quantity * product.costPrice).toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>
                                        <button
                                            className="btn-stock-update card-btn"
                                            onClick={() => openStockModal(product)}
                                        >
                                            📝 Update Stock
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Stock Update Modal */}
            {showStockModal && selectedProduct && (
                <div className="modal-overlay" onClick={closeStockModal}>
                    <div className="stock-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Update Stock</h3>
                            <button className="modal-close" onClick={closeStockModal}>✕</button>
                        </div>

                        <div className="modal-product-info">
                            <span className="modal-product-name">{selectedProduct.productName}</span>
                            <span className="modal-current-stock">
                                Current: <strong>{selectedProduct.quantity}</strong> units
                            </span>
                        </div>

                        <form onSubmit={handleStockUpdate}>
                            <div className="stock-action-group">
                                <label className="stock-action-label">Action</label>
                                <div className="stock-action-buttons">
                                    <button
                                        type="button"
                                        className={`action-btn ${stockAction === 'set' ? 'active' : ''}`}
                                        onClick={() => { setStockAction('set'); setStockValue(selectedProduct.quantity.toString()); }}
                                    >
                                        Set to
                                    </button>
                                    <button
                                        type="button"
                                        className={`action-btn action-add ${stockAction === 'add' ? 'active' : ''}`}
                                        onClick={() => { setStockAction('add'); setStockValue(''); }}
                                    >
                                        + Add
                                    </button>
                                    <button
                                        type="button"
                                        className={`action-btn action-subtract ${stockAction === 'subtract' ? 'active' : ''}`}
                                        onClick={() => { setStockAction('subtract'); setStockValue(''); }}
                                    >
                                        − Remove
                                    </button>
                                </div>
                            </div>

                            <div className="stock-input-group">
                                <label>
                                    {stockAction === 'set' ? 'New quantity' :
                                        stockAction === 'add' ? 'Units to add' : 'Units to remove'}
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={stockValue}
                                    onChange={(e) => setStockValue(e.target.value)}
                                    placeholder="Enter quantity"
                                    autoFocus
                                    required
                                />
                            </div>

                            {stockValue !== '' && (
                                <div className="stock-preview">
                                    <span>Result:</span>
                                    <strong className="preview-value">{getPreviewQuantity()} units</strong>
                                </div>
                            )}

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={closeStockModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-confirm" disabled={updating || stockValue === ''}>
                                    {updating ? 'Updating...' : 'Update Stock'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
