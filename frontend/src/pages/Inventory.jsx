import './Inventory.css';

const Inventory = () => {
    const inventoryData = [
        { id: 1, product: 'Product A', sku: 'SKU-001', category: 'Electronics', stock: 150, minStock: 50, status: 'In Stock' },
        { id: 2, product: 'Product B', sku: 'SKU-002', category: 'Accessories', stock: 25, minStock: 30, status: 'Low Stock' },
        { id: 3, product: 'Product C', sku: 'SKU-003', category: 'Electronics', stock: 0, minStock: 20, status: 'Out of Stock' },
        { id: 4, product: 'Product D', sku: 'SKU-004', category: 'Clothing', stock: 85, minStock: 40, status: 'In Stock' },
        { id: 5, product: 'Product E', sku: 'SKU-005', category: 'Home', stock: 12, minStock: 25, status: 'Low Stock' },
    ];

    const getStatusClass = (status) => {
        switch (status) {
            case 'In Stock': return 'status-instock';
            case 'Low Stock': return 'status-lowstock';
            case 'Out of Stock': return 'status-outofstock';
            default: return '';
        }
    };

    const stats = [
        { label: 'Total Products', value: '245', icon: '📦' },
        { label: 'In Stock', value: '180', icon: '✅' },
        { label: 'Low Stock', value: '45', icon: '⚠️' },
        { label: 'Out of Stock', value: '20', icon: '❌' },
    ];

    return (
        <div className="inventory-page">
            <div className="page-header">
                <div>
                    <h2>Inventory Management</h2>
                    <p>Track and manage your stock levels</p>
                </div>
                <button className="btn-primary">+ Add Stock</button>
            </div>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <span className="stat-icon">{stat.icon}</span>
                        <div className="stat-info">
                            <h3>{stat.value}</h3>
                            <p>{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="inventory-table-container">
                <div className="table-header">
                    <h3>Stock Overview</h3>
                    <input type="text" placeholder="Search products..." className="search-input" />
                </div>
                <table className="inventory-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>SKU</th>
                            <th>Category</th>
                            <th>Stock</th>
                            <th>Min. Stock</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventoryData.map((item) => (
                            <tr key={item.id}>
                                <td className="product-name">{item.product}</td>
                                <td className="sku">{item.sku}</td>
                                <td>{item.category}</td>
                                <td className="stock-count">{item.stock}</td>
                                <td>{item.minStock}</td>
                                <td>
                                    <span className={`status-badge ${getStatusClass(item.status)}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn-icon" title="Update Stock">📝</button>
                                        <button className="btn-icon" title="History">📊</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Inventory;
