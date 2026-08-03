import React, { useState, useCallback, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { AppProvider } from './context/AppContext'
import { useAuth } from './context/AuthContext'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import HomePage from './components/home/HomePage'
import LoginPage from './components/auth/LoginPage'
import RegisterPage from './components/auth/RegisterPage'
import StaffLogin from './components/auth/StaffLogin'
import ManagerLogin from './components/auth/ManagerLogin'
import CartPage from './components/cart/CartPage'
import CheckoutPage from './components/checkout/CheckoutPage'
import ProductDetails from './components/product/ProductDetails'
import CategoryPage from './components/product/CategoryPage'
import SearchResults from './components/search/SearchResults'
import CustomerDashboard from './components/dashboard/CustomerDashboard'
import StaffDashboard from './components/dashboard/StaffDashboard'
import ManagerDashboard from './components/dashboard/ManagerDashboard'
import ProfileSettings from './components/dashboard/ProfileSettings'
import WishlistPage from './components/pages/WishlistPage'
import AboutPage from './components/pages/AboutPage'
import ContactPage from './components/pages/ContactPage'
import FAQPage from './components/pages/FAQPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import './App.css'

function AppContent() {
  const [toasts, setToasts] = useState([])
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, logout, loading, user } = useAuth()

  const justLoggedIn = localStorage.getItem('zenthora_just_logged_in') === 'true'

  const isPublicRoute = !location.pathname.startsWith('/manager') &&
                        !location.pathname.startsWith('/staff') &&
                        !location.pathname.startsWith('/staff-login') &&
                        !location.pathname.startsWith('/manager-login') &&
                        !location.pathname.startsWith('/dashboard') &&
                        !location.pathname.startsWith('/profile')

  useEffect(() => {
    if (loading) return
    if (isPublicRoute && isAuthenticated) {
      if (justLoggedIn) {
        localStorage.removeItem('zenthora_just_logged_in')
        return
      }
      if (user?.role === 'manager' || user?.role === 'staff') {
        logout()
        navigate('/')
      }
    }
  }, [location.pathname, isAuthenticated, loading, user])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-muted)',
        fontSize: '1.2rem'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <div className="app">
      {isPublicRoute && <Header />}

      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/staff-login" element={<StaffLogin />} />
          <Route path="/manager-login" element={<ManagerLogin />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/product/:id" element={<ProductDetails addToast={addToast} />} />
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
          <Route
            path="/staff"
            element={
              <ProtectedRoute requiredRole="staff">
                <StaffDashboard addToast={addToast} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager"
            element={
              <ProtectedRoute requiredRole="manager">
                <ManagerDashboard addToast={addToast} />
              </ProtectedRoute>
            }
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/manager/*" element={<Navigate to="/manager" replace />} />
          <Route path="/staff/*" element={<Navigate to="/staff" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {isPublicRoute && <Footer />}

      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>{t.message}</div>
        ))}
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App