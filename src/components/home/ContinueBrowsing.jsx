import React from 'react'
import { useApp } from '../../context/AppContext'
import ProductCard from './ProductCard'
import './ContinueBrowsing.css'

function ContinueBrowsing() {
  const { products } = useApp()
  
  const recentIds = JSON.parse(localStorage.getItem('zenthora_recently_viewed') || '[]')
  const recentProducts = recentIds
    .map(id => products.find(p => p.id === id))
    .filter(Boolean)
    .slice(0, 5)

  if (recentProducts.length === 0) return null

  return (
    <div className="continue-section">
      <h2 className="section-title">Continue Browsing</h2>
      <div className="product-grid">
        {recentProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

export default ContinueBrowsing