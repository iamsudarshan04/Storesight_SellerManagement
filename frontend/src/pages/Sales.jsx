import { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { formatCurrency } from '../utils/formatCurrency';
import './Sales.css';

const Sales = () => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantitySold, setQuantitySold] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [paymentStatus, setPaymentStatus] = useState('Pending');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axiosInstance.get('/products');
            setProducts(response.data.products);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await axiosInstance.post('/sales', {
                productId: selectedProduct,
                quantitySold: parseInt(quantitySold),
                customerName,
                phoneNumber,
                paymentMethod,
                paymentStatus
            });

            setMessage({
                type: 'success',
                text: `Sale recorded! Remaining stock: ${response.data.remainingStock}`
            });

            // Reset form
            setSelectedProduct('');
            setQuantitySold('');
            setCustomerName('');
            setPhoneNumber('');
            setPaymentMethod('UPI');
            setPaymentStatus('Pending');

            // Refresh products to update stock
            fetchProducts();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to record sale'
            });
        } finally {
            setLoading(false);
        }
    };

    const getProductDetails = () => {
        const product = products.find(p => p._id === selectedProduct);
        if (!product) return null;

        return {
            name: product.productName,
            price: product.sellingPrice,
            stock: product.quantity,
            total: product.sellingPrice * (quantitySold || 0)
        };
    };

    const productDetails = getProductDetails();

    return (
        <div className="sales-page">


            <div className="sales-container">
                <div className="sales-form">
                    {message.text && (
                        <div className={`message ${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="customerName">Customer Name *</label>
                            <input
                                type="text"
                                id="customerName"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Enter customer name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phoneNumber">Phone Number (Optional)</label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="Enter phone number"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="product">Select Product</label>
                            <select
                                id="product"
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                required
                            >
                                <option value="">-- Choose a product --</option>
                                {products.map((product) => (
                                    <option key={product._id} value={product._id}>
                                        {product.productName} (Stock: {product.quantity})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="quantity">Quantity Sold</label>
                            <input
                                type="number"
                                id="quantity"
                                value={quantitySold}
                                onChange={(e) => setQuantitySold(e.target.value)}
                                min="1"
                                max={productDetails?.stock || 999999}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="paymentMethod">Payment Method</label>
                            <select
                                id="paymentMethod"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                required
                            >
                                <option value="UPI">UPI</option>
                                <option value="COD">COD</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="paymentStatus">Payment Status</label>
                            <select
                                id="paymentStatus"
                                value={paymentStatus}
                                onChange={(e) => setPaymentStatus(e.target.value)}
                                required
                            >
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                            </select>
                        </div>

                        {productDetails && quantitySold && (
                            <div className="sale-summary">
                                <h3>Sale Summary</h3>
                                <div className="summary-row">
                                    <span>Product:</span>
                                    <span>{productDetails.name}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Unit Price:</span>
                                    <span>{formatCurrency(productDetails.price)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Quantity:</span>
                                    <span>{quantitySold}</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Total Amount:</span>
                                    <span>{formatCurrency(productDetails.total)}</span>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading || !selectedProduct || !quantitySold}
                        >
                            {loading ? 'Recording...' : 'Record Sale'}
                        </button>
                    </form>
                </div>

                <div className="quick-info">
                    <h2>Quick Tips</h2>
                    <ul>
                        <li>✅ Select a product from the dropdown</li>
                        <li>✅ Enter the quantity sold</li>
                        <li>✅ Stock will be automatically updated</li>
                        <li>✅ Sale will appear in dashboard analytics</li>
                    </ul>

                    {products.length === 0 && (
                        <div className="alert-info">
                            ℹ️ No products available. Please add products first.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sales;
