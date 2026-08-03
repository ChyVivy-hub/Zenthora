import React, { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'
import HeroBanner from './HeroBanner'
import ProductCard from './ProductCard'
import ContinueBrowsing from './ContinueBrowsing'
import './HomePage.css'

function HomePage() {
  const { products, loading } = useApp()
  const [sections, setSections] = useState([])
  const [hasRecent, setHasRecent] = useState(false)

  useEffect(() => {
    if (products.length > 0) {
      const movies = products.filter(p => p.category === 'Movies')
      const books = products.filter(p => p.category === 'Books')
      const manga = products.filter(p => p.category === 'Manga')
      const comics = products.filter(p => p.category === 'Comics')

      setSections([
        { title: 'Trending Movies', items: movies.filter(m => parseFloat(m.rating) >= 7).slice(0, 5) },
        { title: 'Popular Books', items: books.slice(0, 5) },
        { title: 'Trending Manga', items: manga.slice(0, 5) },
        { title: 'Best Comics', items: comics.slice(0, 5) }
      ])

      const recent = JSON.parse(localStorage.getItem('zenthora_recently_viewed') || '[]')
      setHasRecent(recent.length > 0)
    }
  }, [products])

  if (loading) {
    return (
      <div className="home-page">
        <HeroBanner />
        <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading products...</p>
      </div>
    )
  }

  return (
    <div className="home-page">
      <HeroBanner />
      {hasRecent && <ContinueBrowsing />}
      {sections.map((section, i) => (
        section.items.length > 0 && (
          <div key={i} className="section">
            <h2 className="section-title">{section.title}</h2>
            <div className="product-grid">
              {section.items.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  )
}

export default HomePage