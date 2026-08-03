import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useApp } from '../../context/AppContext'
import './ProductCard.css'

function ProductCard({ product }) {
  const { add } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist, formatPrice } = useApp()
  const inWishlist = isInWishlist(product.id)

  const formatRating = (rating) => {
    const num = parseFloat(rating)
    return num ? num.toFixed(1) : 'N/A'
  }

  const showToast = (message, type) => {
    const toast = document.createElement('div')
    toast.textContent = message
    toast.style.cssText = `
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      padding: 14px 24px; border-radius: 12px; color: white;
      font-weight: 600; font-size: 14px;
      animation: slideIn 0.3s ease;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'}
    `
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 3000)
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    add(product)
    showToast(`${product.title} added to cart!`, 'success')
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (inWishlist) {
      removeFromWishlist(product.id)
      showToast('Removed from wishlist', 'info')
    } else {
      addToWishlist(product)
      showToast('Added to wishlist!', 'success')
    }
  }

  return (
    <Link
      to={`/product/${product.id}`}
      className="product-card"
    >
      <div className="card-image">
        {product.image && product.image.startsWith('http') ? (
          <img src={product.image} alt={product.title} />
        ) : (
          <div className="card-placeholder"><span>{product.title ? product.title.charAt(0) : '?'}</span></div>
        )}
        <div className="card-overlay">
          <button className="overlay-btn" onClick={handleWishlist}>
            {inWishlist ? 'Remove Wishlist' : 'Add to Wishlist'}
          </button>
          <button className="overlay-btn primary" onClick={handleAddToCart}>Add to Cart</button>
        </div>
        {product.country && <span className="country-tag">{product.country}</span>}
        <span className="rating-badge">★ {formatRating(product.rating)}</span>
      </div>
      <div className="card-info">
        <span className="card-cat">{product.category}</span>
        <h3 className="card-title">{product.title}</h3>
        <div className="card-meta">
          <span className="card-price">{formatPrice(product.price)}</span>
          <span className="card-year">{product.releaseYear}</span>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
