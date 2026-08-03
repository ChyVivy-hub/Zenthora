import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import './SearchBar.css'

function SearchBar({ onClose }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [recentSearches, setRecentSearches] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const { products } = useApp()
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    const saved = JSON.parse(localStorage.getItem('zenthora_recent_searches') || '[]')
    setRecentSearches(saved)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    if (val.length >= 2) {
      const filtered = products.filter(p =>
        p.title.toLowerCase().includes(val.toLowerCase()) ||
        p.category.toLowerCase().includes(val.toLowerCase()) ||
        (p.author && p.author.toLowerCase().includes(val.toLowerCase())) ||
        (p.publisher && p.publisher.toLowerCase().includes(val.toLowerCase()))
      ).slice(0, 8)
      setSuggestions(filtered)
      setShowDropdown(true)
    } else {
      setSuggestions([])
      setShowDropdown(true)
    }
  }

  const saveSearch = (term) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('zenthora_recent_searches', JSON.stringify(updated))
  }

  const handleSearch = (term) => {
    const searchTerm = term || query
    if (searchTerm.trim()) {
      saveSearch(searchTerm.trim())
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`)
      setShowDropdown(false)
      onClose?.()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
    if (e.key === 'Escape') onClose?.()
  }

  return (
    <div className="search-container" ref={dropdownRef}>
      <div className="search-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search movies, books, manga, comics, authors, publishers..."
          className="search-input"
        />
        <button onClick={() => handleSearch()} className="search-submit-btn">Search</button>
        {onClose && <button onClick={onClose} className="search-close-btn">Cancel</button>}
      </div>

      {showDropdown && (
        <div className="search-dropdown">
          {query.length >= 2 && suggestions.length > 0 && (
            <div className="dropdown-section">
              <h4>Suggestions</h4>
              {suggestions.map(p => (
                <div key={p.id} className="dropdown-item" onClick={() => { navigate(`/product/${p.id}`); onClose?.() }}>
                  <span className="item-title">{p.title}</span>
                  <span className="item-meta">{p.category}{p.author ? ' • ' + p.author : ''}</span>
                </div>
              ))}
            </div>
          )}

          {query.length < 2 && recentSearches.length > 0 && (
            <div className="dropdown-section">
              <h4>Recent Searches</h4>
              {recentSearches.map((s, i) => (
                <div key={i} className="dropdown-item" onClick={() => { setQuery(s); handleSearch(s) }}>
                  <span className="item-title">{s}</span>
                </div>
              ))}
            </div>
          )}

          <div className="dropdown-section">
            <h4>Browse Categories</h4>
            <div className="category-chips">
              {['Movies', 'Books', 'Manga', 'Comics'].map(cat => (
                <span key={cat} className="chip" onClick={() => { navigate(`/category/${cat.toLowerCase()}`); onClose?.() }}>
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBar