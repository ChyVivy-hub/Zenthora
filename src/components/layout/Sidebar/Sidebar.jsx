import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Package,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Home,
  BarChart3,
  UserCog,
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import './Sidebar.css'

function Sidebar({ isOpen = true, onToggle, activeTab, onTabChange }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [expandedMenus, setExpandedMenus] = useState(() => {
    const saved = localStorage.getItem('sidebar_expanded')
    if (saved) {
      try { return JSON.parse(saved) } catch { return {} }
    }
    return {}
  })

  const toggleMenu = (key) => {
    setExpandedMenus(prev => {
      const newState = { ...prev, [key]: !prev[key] }
      localStorage.setItem('sidebar_expanded', JSON.stringify(newState))
      return newState
    })
  }

  const isActive = (tabKey) => activeTab === tabKey

  const handleTabClick = (tabKey) => {
    if (onTabChange) onTabChange(tabKey)
    if (window.innerWidth <= 768 && onToggle) onToggle()
  }

  const handleLogout = () => {
    logout()
    navigate(user?.role === 'manager' ? '/manager-login' : '/staff-login')
  }

  const handleVisitWebsite = () => {
    logout()
    navigate('/')
  }

  const isStaff = user?.role === 'staff'

  const managerNavItems = [
    { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} />, tab: 'overview' },
    {
      key: 'commerce',
      label: 'Commerce',
      icon: <ShoppingBag size={20} />,
      children: [
        { key: 'orders', label: 'Orders', tab: 'orders' },
        { key: 'products', label: 'Products', tab: 'products' },
        { key: 'customers', label: 'Customers', tab: 'customers' },
      ],
    },
    { key: 'staff', label: 'Staff', icon: <UserCog size={20} />, tab: 'staff' },
    { key: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} />, tab: 'analytics' },
    { key: 'profile', label: 'Settings', icon: <Settings size={20} />, tab: 'profile' },
  ]

  const staffNavItems = [
    { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} />, tab: 'overview' },
    {
      key: 'commerce',
      label: 'Commerce',
      icon: <ShoppingBag size={20} />,
      children: [
        { key: 'orders', label: 'Orders', tab: 'orders' },
        { key: 'products', label: 'Products', tab: 'products' },
        { key: 'customers', label: 'Customers', tab: 'customers' },
      ],
    },
    { key: 'profile', label: 'Settings', icon: <Settings size={20} />, tab: 'profile' },
  ]

  const navItems = isStaff ? staffNavItems : managerNavItems

  const renderNavItem = (item) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedMenus[item.key] || false
    const isItemActive = hasChildren
      ? item.children.some((child) => isActive(child.tab))
      : isActive(item.tab)

    if (hasChildren) {
      return (
        <div key={item.key} className="sidebar-nav-group">
          <button
            className={`sidebar-nav-link ${isItemActive ? 'active' : ''}`}
            onClick={() => toggleMenu(item.key)}
            aria-expanded={isExpanded}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            <span className="sidebar-nav-label">{item.label}</span>
            <span className="sidebar-nav-chevron">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          </button>
          {isExpanded && (
            <div className="sidebar-nav-children">
              {item.children.map((child) => (
                <button
                  key={child.key}
                  className={`sidebar-nav-child-link ${isActive(child.tab) ? 'active' : ''}`}
                  onClick={() => handleTabClick(child.tab)}
                >
                  {child.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <button
        key={item.key}
        className={`sidebar-nav-link ${isActive(item.tab) ? 'active' : ''}`}
        onClick={() => handleTabClick(item.tab)}
      >
        <span className="sidebar-nav-icon">{item.icon}</span>
        <span className="sidebar-nav-label">{item.label}</span>
      </button>
    )
  }

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand">
            <span className="sidebar-brand-icon">
              <img
                src={import.meta.env.BASE_URL + 'assets/zenthora-z-icon.png'}
                alt="Zenthora"
                width="40"
                height="40"
                style={{ borderRadius: '8px' }}
              />
            </span>
            <span className="sidebar-brand-name">ENTHORA</span>
          </Link>
          <button className="sidebar-toggle" onClick={onToggle} aria-label="Toggle sidebar">
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(renderNavItem)}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-nav-link" onClick={handleVisitWebsite}>
            <span className="sidebar-nav-icon"><Home size={20} /></span>
            <span className="sidebar-nav-label">Visit Website</span>
          </button>
          <button className="sidebar-nav-link logout" onClick={handleLogout}>
            <span className="sidebar-nav-icon"><LogOut size={20} /></span>
            <span className="sidebar-nav-label">Logout</span>
          </button>
        </div>
      </aside>

      {!isOpen && (
        <button className="sidebar-floating-toggle" onClick={onToggle} aria-label="Open sidebar">
          <Menu size={20} />
        </button>
      )}
    </>
  )
}

export default Sidebar