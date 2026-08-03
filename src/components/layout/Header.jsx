import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useApp } from '../../context/AppContext'
import SearchBar from '../search/SearchBar'
import './Header.css'

function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('zenthora_theme')
    return saved !== null ? saved === 'dark' : true
  })
  const { user, isAuthenticated, logout } = useAuth()
  const { count } = useCart()
  const { wishlist, selectedCountry, setSelectedCountry } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  useEffect(() => { setMobileOpen(false) }, [location])
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('zenthora_theme', dark ? 'dark' : 'light')
  }, [dark])
  useEffect(() => {
    document.documentElement.removeAttribute('data-theme-color')
  }, [])

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.substring(0, 1).toUpperCase()
  }

  const getDashboardLink = () => {
    if (!user) return '/login'
    if (user.role === 'manager') return '/manager'
    if (user.role === 'staff') return '/staff'
    return '/dashboard'
  }

  const toggleTheme = () => setDark(prev => !prev)

  const isStaffManagerPage =
    location.pathname.startsWith('/staff') ||
    location.pathname.startsWith('/manager') ||
    location.pathname === '/staff-login' ||
    location.pathname === '/manager-login'

  if (isStaffManagerPage) {
    return (
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-inner">
          <Link to="/" className="brand">
            <span className="brand-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', background: '#f84750', borderRadius: '8px', color: 'white', fontSize: '22px', fontWeight: 'bold' }}>Z</span>
            <span className="brand-name">ENTHORA</span>
          </Link>
          <div className="header-actions" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="action-btn theme-btn" onClick={toggleTheme}>{dark ? '☀' : '🌙'}</button>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', background: '#f84750', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {user?.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'white', fontSize: '14px', fontWeight: '700' }}>{getInitials(user?.name)}</span>}
            </div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{user?.role === 'manager' ? 'Manager' : 'Staff'}</span>
            <button onClick={() => {
                const role = user?.role
                logout()
                if (role === 'manager') navigate('/manager-login')
                else if (role === 'staff') navigate('/staff-login')
                else navigate('/')
              }}
              style={{ color: '#EF4444', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-inner">
        <Link to="/" className="brand">
          <span className="brand-icon">
              <img
                src={import.meta.env.BASE_URL + 'assets/zenthora-z-icon.png'}
                alt="Zenthora"
                width="40"
                height="40"
                style={{ borderRadius: '8px', display: 'block' }}
              />
            </span>
          <span className="brand-name">ENTHORA</span>
        </Link>
        <nav className={`nav ${mobileOpen ? 'open' : ''}`}>
          <button className="mobile-nav-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation">×</button>
          <Link to="/" className={`nav-link ${isActive('/') && !isActive('/category') ? 'active' : ''}`}>Home</Link>
          <Link to="/category/movies" className={`nav-link ${isActive('/category/movies') ? 'active' : ''}`}>Movies</Link>
          <Link to="/category/books" className={`nav-link ${isActive('/category/books') ? 'active' : ''}`}>Books</Link>
          <Link to="/category/manga" className={`nav-link ${isActive('/category/manga') ? 'active' : ''}`}>Manga</Link>
          <Link to="/category/comics" className={`nav-link ${isActive('/category/comics') ? 'active' : ''}`}>Comics</Link>
          <div className="mobile-preferences">
            <label className="mobile-currency">
              Currency
              <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
                <option value="Nigeria">₦ NGN</option>
                <option value="Ghana">GH₵ GHS</option>
                <option value="United States">$ USD</option>
                <option value="United Kingdom">£ GBP</option>
                <option value="Europe">€ EUR</option>
              </select>
            </label>
          </div>
        </nav>
        <div className="header-actions">
          <button className="action-btn search-btn" onClick={() => setShowSearch(!showSearch)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </button>

          <button className="action-btn theme-btn" onClick={toggleTheme} title={dark ? 'Light Mode' : 'Dark Mode'}>
            {dark ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
            )}
          </button>

          <select
            className="country-select"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            style={{
              padding: '8px 12px',
              background: 'var(--bg-primary)',
              border: '2px solid var(--border)',
              borderRadius: '10px',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              minWidth: 'auto'
            }}
          >
            <option value="Nigeria">₦ NGN</option>
            <option value="Ghana">GH₵ GHS</option>
            <option value="United States">$ USD</option>
            <option value="United Kingdom">£ GBP</option>
            <option value="Europe">€ EUR</option>
          </select>

          <Link to="/wishlist" className="action-btn header-wishlist-btn" title="Wishlist">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            {wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}
          </Link>

          <Link to="/cart" className="action-btn cart-btn" title="Cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
            {count > 0 && <span className="badge">{count}</span>}
          </Link>

          {isAuthenticated ? (
            <div className="user-area">
              <Link to={getDashboardLink()} className="avatar-link" style={{ overflow: 'hidden' }}>
                {user?.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : getInitials(user?.name)}
              </Link>
              <button onClick={() => { logout(); navigate('/') }} className="logout-text">Logout</button>
            </div>
          ) : (
            <Link to="/login" className="login-link">Login</Link>
          )}

          <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen}>
            <span className={`hamburger ${mobileOpen ? 'open' : ''}`}>
              <span className="dot-dot"></span>
              <span className="dot-dot"></span>
              <span className="dot-dot"></span>
            </span>
          </button>
        </div>
      </div>
      {showSearch && <div className="search-overlay"><SearchBar onClose={() => setShowSearch(false)} /></div>}
    </header>
  )
}

export default Header