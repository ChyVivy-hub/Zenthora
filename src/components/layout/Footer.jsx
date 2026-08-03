import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Footer.css'

function Footer() {
  const { user } = useAuth()
  const location = useLocation()

  const isStaffManagerPage = 
    location.pathname.startsWith('/staff') || 
    location.pathname.startsWith('/manager')

  const getDashboardLink = () => {
    if (!user) return '/login'
    if (user.role === 'manager') return '/manager'
    if (user.role === 'staff') return '/staff'
    return '/dashboard'
  }

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-col">
            <h3 className="footer-logo">Zenthora</h3>
            <p>Premium entertainment marketplace for Movies, Books, Manga, and Comics.</p>
          </div>
          <div className="footer-col">
            <h4>Shop</h4>
            <Link to="/category/movies">Movies</Link>
            <Link to="/category/books">Books</Link>
            <Link to="/category/manga">Manga</Link>
            <Link to="/category/comics">Comics</Link>
          </div>
          
          {isStaffManagerPage ? (
            <div className="footer-col">
              <h4>Panel</h4>
              <Link to={getDashboardLink()}>Dashboard</Link>
              <button 
                onClick={() => {
                  const { logout } = require('../../context/AuthContext').useAuth()
                  logout()
                  window.location.href = '/'
                }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px', padding: 0, textAlign: 'left' }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="footer-col">
              <h4>Account</h4>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
              <Link to={getDashboardLink()}>Dashboard</Link>
            </div>
          )}
          
          <div className="footer-col">
            <h4>Support</h4>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/faq">FAQ</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Zenthora. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer