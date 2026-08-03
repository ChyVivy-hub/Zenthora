import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Sun, Moon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import Avatar from '../ui/Avatar'
import './DashboardHeader.css'

function DashboardHeader({ onSearch }) {
  const { user } = useAuth()
  const { selectedCountry, setSelectedCountry } = useApp()
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('zenthora_theme')
    return saved !== null ? saved === 'dark' : true
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('zenthora_theme', dark ? 'dark' : 'light')
  }, [dark])

  const toggleTheme = () => setDark(prev => !prev)

  const handleSearch = (e) => {
    e?.preventDefault()
    if (onSearch) onSearch(searchQuery)
    setShowResults(false)
  }

  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    if (query.length >= 2 && onSearch) {
      const results = onSearch(query)
      setSearchResults(results || [])
      setShowResults(true)
    } else {
      setShowResults(false)
    }
  }

  const countries = [
    { value: 'Nigeria', label: '₦ NGN' },
    { value: 'Ghana', label: 'GH₵ GHS' },
    { value: 'United States', label: '$ USD' },
    { value: 'United Kingdom', label: '£ GBP' },
    { value: 'Europe', label: '€ EUR' },
  ]

  return (
    <header className="dashboard-header">
      <div className="dashboard-header-inner">
        <form className="dashboard-search" onSubmit={handleSearch}>
          <Search size={18} className="dashboard-search-icon" />
          <input
            type="text"
            placeholder="Search orders, products, customers..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            className="dashboard-search-input"
          />
        </form>

        {showResults && searchResults.length > 0 && (
          <div className="dashboard-search-results">
            {searchResults.slice(0, 6).map((result, idx) => (
              <div key={idx} className="search-result-item">
                {result}
              </div>
            ))}
          </div>
        )}

        <div className="dashboard-actions">
          <button className="dashboard-action-btn" onClick={toggleTheme} title="Toggle theme">
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <select
            className="dashboard-currency-select"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
          >
            {countries.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          <div className="dashboard-profile">
            <Avatar src={user?.avatar} name={user?.name} size="sm" className="dashboard-profile-avatar" />
            <div className="dashboard-profile-info">
              <span className="dashboard-profile-name">{user?.name || 'User'}</span>
              <span className="dashboard-profile-role">{user?.role || 'Guest'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader