import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setDarkMode } from './store/slices/uiSlice';
import { getCurrentUser } from './store/slices/authSlice';
import SocketService from './services/socketService';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

function App() {
  const dispatch = useDispatch();
  const { darkMode } = useSelector(state => state.ui);
  const { isAuthenticated, user } = useSelector(state => state.auth);

  // Load dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    dispatch(setDarkMode(savedDarkMode));
  }, [dispatch]);

  // Check for existing auth token on load
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) dispatch(getCurrentUser());
  }, [dispatch]);

  // Initialize Socket.IO connection when user is logged in
  useEffect(() => {
    if (isAuthenticated && user) SocketService.connect();
    else SocketService.disconnect();

    return () => SocketService.disconnect();
  }, [isAuthenticated, user]);

  // Update document class for dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Router>
        <Navbar />
        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            
            <Route
              path="/login"
              element={
                <ProtectedRoute requireAuth={false}>
                  <Login />
                </ProtectedRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <ProtectedRoute requireAuth={false}>
                  <Signup />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />

            {/* Seller Routes */}
            <Route
              path="/seller/*"
              element={
                <ProtectedRoute roles={['seller', 'admin']}>
                  <div>Seller Dashboard - Coming Soon</div>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute roles={['admin']}>
                  <div>Admin Dashboard - Coming Soon</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </Router>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;
