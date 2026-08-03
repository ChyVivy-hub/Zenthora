import React from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useCart } from '../../context/CartContext'
import './PageStyles.css'

function WishlistPage() {
  const { wishlist, removeFromWishlist, formatPrice } = useApp()
  const { add } = useCart()

  const handleMoveToCart = (item) => {
    add(item)
    removeFromWishlist(item.id)
  }

  if (wishlist.length === 0) {
    return (
      <div className="info-page" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h1>My Wishlist</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px', marginTop: '20px' }}>Your wishlist is empty.</p>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Browse products and add items you love!</p>
        <Link to="/" className="submit-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>Browse Products</Link>
      </div>
    )
  }

  return (
    <div className="info-page">
      <h1>My Wishlist</h1>
      <p className="subtitle">{wishlist.length} items saved</p>

      <div className="wishlist-grid">
        {wishlist.map(item => (
          <div key={item.id} className="wishlist-card">
            {/* Clickable image */}
            <Link to={`/product/${item.id}`} className="wishlist-image">
              {item.image ? (
                <img src={item.image} alt={item.title} />
              ) : (
                <div className="wishlist-placeholder">
                  {item.title?.charAt(0) || '?'}
                </div>
              )}
            </Link>
            <div className="wishlist-card-body">
              <span className="wishlist-category">{item.category}</span>
              {/* Clickable title */}
              <Link to={`/product/${item.id}`} className="wishlist-title-link">
                <h3>{item.title}</h3>
              </Link>
              <p className="wishlist-price">{formatPrice(item.price)}</p>
              <div className="wishlist-actions">
                <button
                  onClick={() => handleMoveToCart(item)}
                  className="wishlist-move-btn"
                >
                  Move to Cart
                </button>
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="wishlist-remove-btn"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WishlistPage
