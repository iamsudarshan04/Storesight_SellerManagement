import Product from '../models/Product.js';

// Add new product
export const addProduct = async (req, res) => {
    try {
        const { productName, sellingPrice, costPrice, quantity, lowStockLimit } = req.body;

        const product = new Product({
            productName,
            sellingPrice,
            costPrice,
            quantity,
            lowStockLimit,
            userId: req.userId
        });

        await product.save();

        res.status(201).json({
            message: 'Product added successfully',
            product
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all products for logged-in user
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({ userId: req.userId }).sort({ createdAt: -1 });

        res.json({
            products,
            count: products.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update product
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { productName, sellingPrice, costPrice, quantity, lowStockLimit } = req.body;

        const product = await Product.findOne({ _id: id, userId: req.userId });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update fields
        if (productName) product.productName = productName;
        if (sellingPrice !== undefined) product.sellingPrice = sellingPrice;
        if (costPrice !== undefined) product.costPrice = costPrice;
        if (quantity !== undefined) product.quantity = quantity;
        if (lowStockLimit !== undefined) product.lowStockLimit = lowStockLimit;

        await product.save();

        res.json({
            message: 'Product updated successfully',
            product
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete product
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findOneAndDelete({ _id: id, userId: req.userId });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
