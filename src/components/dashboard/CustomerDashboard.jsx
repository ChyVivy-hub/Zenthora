import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { useCart } from '../../context/CartContext'
import { supabase } from '../../services/supabase'
import ProfileSettings from './ProfileSettings'
import './CustomerDashboard.css'

function CustomerDashboard() {
  const { user, logout } = useAuth()
  const { orders, setOrders, wishlist, removeFromWishlist } = useApp()
  const { add } = useCart()
  
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('customer_tab') || 'orders'
  })

  useEffect(() => {
    localStorage.setItem('customer_tab', activeTab)
  }, [activeTab])

  // ========== REAL‑TIME ORDER UPDATES ==========
  useEffect(() => {
    if (!user) return

    const subscription = supabase
      .channel('orders-channel')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Update the orders state with the new payload
          setOrders(prevOrders =>
            prevOrders.map(order =>
              order.id === payload.new.id
                ? { ...order, ...payload.new }
                : order
            )
          )
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, setOrders])

  const formatPrice = (p) => {
    const num = Math.round(parseFloat(p)) || 0
    return '₦' + num.toLocaleString('en-NG')
  }

  return (
    <div className="dashboard">
      <h1>My Account</h1>
      <p className="dashboard-greeting">Welcome, {user?.name}</p>

      <div className="dashboard-layout">
        <div className="dashboard-sidebar">
          <button className={`sidebar-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>My Orders</button>
          <button className={`sidebar-btn ${activeTab === 'wishlist' ? 'active' : ''}`} onClick={() => setActiveTab('wishlist')}>Wishlist ({wishlist.length})</button>
          <button className={`sidebar-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profile Settings</button>
          <button className="sidebar-btn logout" onClick={logout}>Logout</button>
        </div>

        <div className="dashboard-content">
          {activeTab === 'orders' && (
            <div>
              <h2>My Orders</h2>
              {orders.length === 0 ? (
                <p className="empty-text">No orders yet. <Link to="/">Start shopping</Link></p>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <span className="order-id">{order.id}</span>
                      <span className="order-date">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                      <span className={`order-status ${order.status}`}>{order.status}</span>
                    </div>
                    {order.items?.map((item, i) => (
                      <div key={i} className="order-item">
                        <span>{item.title}</span>
                        <span>x{item.qty || item.quantity}</span>
                        <span>{formatPrice(Math.round(parseFloat(item.price)) * (item.qty || item.quantity))}</span>
                      </div>
                    ))}
                    <div className="order-total">Total: {formatPrice(order.total)}</div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              <h2>My Wishlist</h2>
              {wishlist.length === 0 ? (
                <p className="empty-text">Your wishlist is empty. <Link to="/">Browse products</Link></p>
              ) : (
                <div className="wishlist-grid">
                  {wishlist.map(item => (
                    <div key={item.id} className="wishlist-card">
                      <div className="wishlist-img">
                        {item.image ? <img src={item.image} alt={item.title} /> : <div className="wishlist-placeholder">{item.title?.charAt(0)}</div>}
                      </div>
                      <div className="wishlist-info">
                        <h3>{item.title}</h3>
                        <span>{item.category}</span>
                        <span className="wishlist-price">{formatPrice(item.price)}</span>
                        <div className="wishlist-actions">
                          <button onClick={() => { add(item); removeFromWishlist(item.id) }}>Move to Cart</button>
                          <button onClick={() => removeFromWishlist(item.id)} className="remove-btn">Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && <ProfileSettings />}
        </div>
      </div>
    </div>
  )
}

export default CustomerDashboard