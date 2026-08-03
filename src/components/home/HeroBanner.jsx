import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import './HeroBanner.css'

function HeroBanner() {
  const { products, formatPrice } = useApp()
  const [current, setCurrent] = useState(0)
  const [movies, setMovies] = useState([])

  useEffect(() => {
    const m = products.filter(p => p.category === 'Movies' && p.backdrop).slice(0, 5)
    setMovies(m)
  }, [products])

  const next = () => setCurrent(prev => (prev + 1) % movies.length)
  const prev = () => setCurrent(prev => (prev - 1 + movies.length) % movies.length)

  useEffect(() => {
    if (movies.length === 0) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [movies.length])

  if (movies.length === 0) return null

  const movie = movies[current]


  const formatRating = (rating) => {
    const num = parseFloat(rating)
    return num ? num.toFixed(1) : 'N/A'
  }

  return (
    <div className="hero">
      {movies.map((m, i) => (
        <div key={m.id} className={`hero-slide ${i === current ? 'active' : ''}`}>
          <div className="hero-bg">
            <img src={m.backdrop} alt="" />
            <div className="hero-gradient"></div>
          </div>
        </div>
      ))}

      <button className="hero-arrow hero-prev" onClick={prev}>‹</button>
      <button className="hero-arrow hero-next" onClick={next}>›</button>

      <div className="hero-content">
        <div className="hero-poster">
          <img src={movie.image || movie.backdrop} alt={movie.title} />
        </div>
        <div className="hero-text">
          <span className="hero-badge">{movie.category}</span>
          <h1 className="hero-title">{movie.title}</h1>
          <p className="hero-desc">{movie.description?.substring(0, 250)}...</p>
          <div className="hero-meta">
            <span className="hero-rating">★ {formatRating(movie.rating)}</span>
            <span className="hero-year">{movie.releaseYear}</span>
            <span className="hero-price">{formatPrice(movie.price)}</span>
          </div>
          <div className="hero-buttons">
            <Link to={`/product/${movie.id}`} className="hero-btn-primary">Watch Trailer</Link>
            <Link to={`/product/${movie.id}`} className="hero-btn-secondary">View Details</Link>
          </div>
        </div>
      </div>

      <div className="hero-dots">
        {movies.map((_, i) => (
          <button key={i} className={`dot ${i === current ? 'active' : ''}`} onClick={() => setCurrent(i)} />
        ))}
      </div>
    </div>
  )
}

export default HeroBanner