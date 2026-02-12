import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { formatCurrency } from '../utils/formatCurrency';
import './AddOrder.css';

const AddOrder = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        customerName: '',
        phoneNumber: '',
        productId: '',
        quantity: 1,
        paymentMethod: 'UPI',
        paymentStatus: 'Pending'
    });

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get('/products');
                // Filter only products with stock > 0
                const availableProducts = response.data.products.filter(p => p.quantity > 0);
                setProducts(availableProducts);
            } catch (error) {
                console.error('Failed to fetch products', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const selectedProduct = products.find(p => p._id === formData.productId);
    const totalAmount = selectedProduct ? selectedProduct.sellingPrice * formData.quantity : 0;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError('');
    };

    const handlePaymentStatus = (status) => {
        setFormData(prev => ({ ...prev, paymentStatus: status }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            await axiosInstance.post('/sales', {
                productId: formData.productId,
                quantitySold: Number(formData.quantity),
                customerName: formData.customerName,
                phoneNumber: formData.phoneNumber,
                paymentMethod: formData.paymentMethod,
                paymentStatus: formData.paymentStatus
            });

            // Success - navigate back to orders immediately
            navigate('/orders');
        } catch (error) {
            console.error('Error creating order:', error);
            console.error('Error response:', error.response?.data);

            let errorMessage = 'Failed to create order';

            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            // Show validation errors if present
            if (error.response?.data?.details) {
                console.error('Validation errors:', error.response.data.details);
                errorMessage += ' - Check console for details';
            }

            setError(errorMessage);
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading products...</div>;
    }

    return (
        <div className="add-order-page">
            <div className="add-order-card">
                <div className="form-header">
                    <h2>New Order</h2>
                </div>

                {error && <div className="error-message" style={{ marginBottom: '1rem', color: '#ef4444', background: '#fee2e2', padding: '0.5rem', borderRadius: '8px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Customer Name</label>
                        <input
                            type="text"
                            name="customerName"
                            value={formData.customerName}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Name"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>Phone (Optional)</label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Mobile Number"
                        />
                    </div>

                    <div className="form-group">
                        <label>Product</label>
                        <select
                            name="productId"
                            value={formData.productId}
                            onChange={handleChange}
                            className="form-control"
                            required
                        >
                            <option value="">Select Product needed</option>
                            {products.map(product => (
                                <option key={product._id} value={product._id}>
                                    {product.productName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label>Qty</label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                min="1"
                                max={selectedProduct?.quantity || 999}
                                className="form-control"
                                required
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label>Payment</label>
                            <select
                                name="paymentMethod"
                                value={formData.paymentMethod}
                                onChange={handleChange}
                                className="form-control"
                            >
                                <option value="UPI">UPI</option>
                                <option value="COD">COD</option>
                                <option value="Bank Transfer">Bank</option>
                            </select>
                        </div>
                    </div>

                    {totalAmount > 0 && (
                        <div className="amount-display" style={{ padding: '1rem', margin: '1rem 0' }}>
                            <span className="amount-label" style={{ marginBottom: '0' }}>Total: <span className="amount-value" style={{ fontSize: '1.5rem' }}>{formatCurrency(totalAmount)}</span></span>
                        </div>
                    )}

                    <div className="form-group">
                        <div className="payment-toggle">
                            <div
                                className={`toggle-option pending ${formData.paymentStatus === 'Pending' ? 'active' : ''}`}
                                onClick={() => handlePaymentStatus('Pending')}
                            >
                                Pending
                            </div>
                            <div
                                className={`toggle-option paid ${formData.paymentStatus === 'Paid' ? 'active' : ''}`}
                                onClick={() => handlePaymentStatus('Paid')}
                            >
                                Paid
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-large"
                        disabled={submitting || !formData.productId || !formData.customerName}
                        style={{ marginTop: '1rem' }}
                    >
                        {submitting ? 'Saving...' : 'Save Order'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddOrder;
