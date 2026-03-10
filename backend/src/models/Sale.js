import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
    orderId: {
        type: String,
        unique: true,
        index: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantitySold: {
        type: Number,
        required: [true, 'Quantity sold is required'],
        min: 1
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: 0
    },
    date: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['New', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'New'
    },
    customerName: {
        type: String,
        required: [true, 'Customer name is required']
    },
    phoneNumber: {
        type: String,
        required: false
    },
    address: {
        type: String,
        trim: true,
        default: ''
    },
    paymentMethod: {
        type: String,
        enum: ['UPI', 'COD', 'Bank Transfer'],
        required: [true, 'Payment method is required']
    },
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Pending'],
        default: 'Pending'
    },
    source: {
        type: String,
        enum: ['dashboard', 'storefront'],
        default: 'dashboard'
    }
});

// Auto-generate short orderId before save
saleSchema.pre('save', async function () {
    if (!this.orderId) {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let id = 'SS-';
        for (let i = 0; i < 6; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        // Ensure uniqueness
        const existing = await mongoose.model('Sale').findOne({ orderId: id });
        if (existing) {
            // Retry with different random
            id = 'SS-';
            for (let i = 0; i < 6; i++) {
                id += chars.charAt(Math.floor(Math.random() * chars.length));
            }
        }
        this.orderId = id;
    }
});

const Sale = mongoose.model('Sale', saleSchema);

export default Sale;
