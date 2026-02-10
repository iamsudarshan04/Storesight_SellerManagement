import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import AddOrder from './pages/AddOrder';
import Inventory from './pages/Inventory';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

import './App.css';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="app">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Protected Routes with MainLayout */}
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <MainLayout pageTitle="Dashboard">
                                    <Dashboard />
                                </MainLayout>
                            </ProtectedRoute>
                        } />

                        <Route path="/sales" element={
                            <ProtectedRoute>
                                <MainLayout pageTitle="New Sale">
                                    <Sales />
                                </MainLayout>
                            </ProtectedRoute>
                        } />

                        <Route path="/orders" element={
                            <ProtectedRoute>
                                <MainLayout pageTitle="Orders">
                                    <Orders />
                                </MainLayout>
                            </ProtectedRoute>
                        } />

                        <Route path="/orders/add" element={
                            <ProtectedRoute>
                                <MainLayout pageTitle="Add Order">
                                    <AddOrder />
                                </MainLayout>
                            </ProtectedRoute>
                        } />

                        <Route path="/orders/:id" element={
                            <ProtectedRoute>
                                <MainLayout pageTitle="Order Details">
                                    <OrderDetails />
                                </MainLayout>
                            </ProtectedRoute>
                        } />

                        <Route path="/products" element={
                            <ProtectedRoute>
                                <MainLayout pageTitle="Products">
                                    <Products />
                                </MainLayout>
                            </ProtectedRoute>
                        } />

                        <Route path="/inventory" element={
                            <ProtectedRoute>
                                <MainLayout pageTitle="Inventory">
                                    <Inventory />
                                </MainLayout>
                            </ProtectedRoute>
                        } />

                        <Route path="/payments" element={
                            <ProtectedRoute>
                                <MainLayout pageTitle="Payments">
                                    <Payments />
                                </MainLayout>
                            </ProtectedRoute>
                        } />

                        <Route path="/reports" element={
                            <ProtectedRoute>
                                <MainLayout pageTitle="Reports & Analytics">
                                    <Reports />
                                </MainLayout>
                            </ProtectedRoute>
                        } />

                        <Route path="/settings" element={
                            <ProtectedRoute>
                                <MainLayout pageTitle="Settings">
                                    <Settings />
                                </MainLayout>
                            </ProtectedRoute>
                        } />

                        {/* Default Redirect */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
