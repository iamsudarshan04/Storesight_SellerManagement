import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
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
    paymentMethod: {
        type: String,
        enum: ['UPI', 'COD', 'Bank Transfer'],
        required: [true, 'Payment method is required']
    },
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Pending'],
        default: 'Pending'
    }
});

const Sale = mongoose.model('Sale', saleSchema);

export default Sale;
