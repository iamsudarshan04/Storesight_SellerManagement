import { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { formatCurrency } from '../utils/formatCurrency';
import './Products.css';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [formData, setFormData] = useState({
        productName: '',
        sellingPrice: '',
        costPrice: '',
        quantity: '',
        lowStockLimit: '10'
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axiosInstance.get('/products');
            setProducts(response.data.products);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingProduct) {
                await axiosInstance.put(`/products/${editingProduct._id}`, formData);
            } else {
                await axiosInstance.post('/products', formData);
            }

            setShowForm(false);
            setEditingProduct(null);
            setFormData({
                productName: '',
                sellingPrice: '',
                costPrice: '',
                quantity: '',
                lowStockLimit: '10'
            });

            fetchProducts();
        } catch (error) {
            console.error('Failed to save product:', error);
            alert(error.response?.data?.message || 'Failed to save product');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            productName: product.productName,
            sellingPrice: product.sellingPrice,
            costPrice: product.costPrice,
            quantity: product.quantity,
            lowStockLimit: product.lowStockLimit
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            await axiosInstance.delete(`/products/${id}`);
            fetchProducts();
        } catch (error) {
            console.error('Failed to delete product:', error);
            alert('Failed to delete product');
        }
    };

    const calculateProfit = (product) => {
        return product.sellingPrice - product.costPrice;
    };

    if (loading) {
        return <div className="loading">Loading products...</div>;
    }

    return (
        <div className="products-page">
            <div className="page-header" style={{ justifyContent: 'flex-end' }}>
                <button
                    className="btn-primary"
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditingProduct(null);
                        setFormData({
                            productName: '',
                            sellingPrice: '',
                            costPrice: '',
                            quantity: '',
                            lowStockLimit: '10'
                        });
                    }}
                >
                    {showForm ? 'Cancel' : '+ Add Product'}
                </button>
            </div>

            {showForm && (
                <div className="product-form">
                    <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Product Name</label>
                                <input
                                    type="text"
                                    name="productName"
                                    value={formData.productName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Selling Price</label>
                                <input
                                    type="number"
                                    name="sellingPrice"
                                    value={formData.sellingPrice}
                                    onChange={handleInputChange}
                                    step="0.01"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Cost Price</label>
                                <input
                                    type="number"
                                    name="costPrice"
                                    value={formData.costPrice}
                                    onChange={handleInputChange}
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Quantity</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Low Stock Limit</label>
                                <input
                                    type="number"
                                    name="lowStockLimit"
                                    value={formData.lowStockLimit}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary">
                            {editingProduct ? 'Update Product' : 'Add Product'}
                        </button>
                    </form>
                </div>
            )}

            <div className="products-table">
                <table>
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th>Selling Price</th>
                            <th>Cost Price</th>
                            <th>Profit/Unit</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="no-data">
                                    No products found. Add your first product!
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product._id}>
                                    <td>{product.productName}</td>
                                    <td>{formatCurrency(product.sellingPrice)}</td>
                                    <td>{formatCurrency(product.costPrice)}</td>
                                    <td className="profit">{formatCurrency(calculateProfit(product))}</td>
                                    <td>{product.quantity}</td>
                                    <td>
                                        <span className={`status ${product.quantity <= product.lowStockLimit ? 'low' : 'good'}`}>
                                            {product.quantity <= product.lowStockLimit ? 'Low Stock' : 'In Stock'}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        <button
                                            className="btn-edit"
                                            onClick={() => handleEdit(product)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDelete(product._id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Products;
