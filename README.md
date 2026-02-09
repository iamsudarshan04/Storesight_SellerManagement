# 📊 StoreSight - Shop Management System

A full-stack shop management application built with React and Node.js for inventory tracking, sales recording, and business analytics.

## 🚀 Features

- **User Authentication** - Secure signup and login with JWT
- **Product Management** - Add, edit, delete products with inventory tracking
- **Sales Recording** - Quick sale entry with automatic stock updates
- **Dashboard Analytics** - Real-time metrics, charts, and low stock alerts
- **Responsive Design** - Works on desktop and mobile devices

## 🛠️ Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React 19 with Vite
- React Router for navigation
- Recharts for data visualization
- Axios for API calls

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/storesight
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

4. Start the server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products (Protected)
- `GET /api/products` - Get all products
- `POST /api/products` - Add new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Sales (Protected)
- `POST /api/sales` - Record a sale
- `GET /api/sales/summary` - Get dashboard summary

## 📱 Usage

1. **Register/Login** - Create an account or login
2. **Add Products** - Navigate to Products page and add your inventory
3. **Record Sales** - Use the Sales page to record transactions
4. **View Analytics** - Check the Dashboard for business insights

## 🎨 Features Breakdown

### Dashboard
- Today's sales count and revenue
- Total revenue tracking
- Best selling products chart
- Low stock alerts

### Products
- Full CRUD operations
- Stock level monitoring
- Profit calculation per unit
- Low stock indicators

### Sales
- Quick sale entry form
- Real-time total calculation
- Automatic inventory updates
- Stock validation

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Happy Selling!** 🛒✨
