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
        enum: ['completed', 'cancelled'],
        default: 'completed'
    }
});

const Sale = mongoose.model('Sale', saleSchema);

export default Sale;
