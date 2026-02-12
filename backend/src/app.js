import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import salesRoutes from './routes/salesRoutes.js';

const app = express();

// Middleware
app.use(cors({
    origin: ["https://storesight-seller-management.vercel.app", "http://localhost:3000"],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'StoreSight API is running' });
});

export default app;
