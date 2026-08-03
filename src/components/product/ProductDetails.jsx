import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import ProductCard from '../home/ProductCard'
import TrailerModal from '../trailer/TrailerModal'
import ReviewSection from './ReviewSection'
import './ProductDetails.css'

function ProductDetails({ addToast }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { products, loading, addToWishlist, removeFromWishlist, isInWishlist, formatPrice } = useApp()
  const { add } = useCart()
  const { isAuthenticated } = useAuth()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [related, setRelated] = useState([])
  const [showTrailer, setShowTrailer] = useState(false)

  useEffect(() => {
    if (products.length > 0) {
      const found = products.find(p => p.id === id)
      setProduct(found)
      if (found) {
        const relatedItems = products.filter(p => p.category === found.category && p.id !== found.id).slice(0, 6)
        setRelated(relatedItems)
      }
    }
  }, [id, products])

  useEffect(() => {
    if (product) {
      const recent = JSON.parse(localStorage.getItem('zenthora_recently_viewed') || '[]')
      const updated = [product.id, ...recent.filter(rid => rid !== product.id)].slice(0, 10)
      localStorage.setItem('zenthora_recently_viewed', JSON.stringify(updated))
    }
  }, [product])

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) add(product)
      if (addToast) addToast(`${product.title} added to cart!`, 'success')
      navigate('/cart')
    }
  }

  const handleAddBundleToCart = () => {
    const bundleItems = related.slice(0, 3)
    bundleItems.forEach(p => add(p))
    
    // Calculate and save bundle discount (10% off)
    const bundleTotal = bundleItems.reduce((sum, p) => sum + Math.round(parseFloat(p.price)), 0)
    const bundleDiscount = Math.round(bundleTotal * 0.05)
    
    localStorage.setItem('zenthora_bundle_discount', bundleDiscount.toString())
    localStorage.setItem('zenthora_bundle_discount_percent', '5')
    
    if (addToast) addToast('Bundle added to cart! 10% discount applied', 'success')
    navigate('/cart')
  }

  const handleWishlist = () => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
      if (addToast) addToast('Removed from wishlist', 'info')
    } else {
      addToWishlist(product)
      if (addToast) addToast('Added to wishlist!', 'success')
    }
  }

  if (loading) return <p style={{ textAlign: 'center', padding: '40px' }}>Loading...</p>

  if (!product) {
    return <div style={{ textAlign: 'center', padding: '60px' }}><h2>Product Not Found</h2><Link to="/">Back to Home</Link></div>
  }

  const inWishlist = isInWishlist(product.id)
  const itemTotal = (Math.round(parseFloat(product.price)) || 0) * quantity
  const hasTrailer = product.tmdbId
  const bundleTotal = related.slice(0, 3).reduce((sum, p) => sum + Math.round(parseFloat(p.price)), 0)

  return (
    <div className="product-details">
      <div className="details-layout">
        <div className="details-image-section">
          <div className="details-main-image">
            {product.image ? (
              <img src={product.image} alt={product.title} />
            ) : (
              <div className="details-placeholder">{product.title?.charAt(0)}</div>
            )}
          </div>
          {hasTrailer && (
            <button className="watch-trailer-btn" onClick={() => setShowTrailer(true)}>
              ▶ Watch Trailer
            </button>
          )}
          {product.country && <div className="details-country">{product.country}</div>}
        </div>

        <div className="details-info">
          <span className="details-cat">{product.category}</span>
          <h1 className="details-title">{product.title}</h1>
          <div className="details-meta">
            <div><span>Rating</span><span>★ {parseFloat(product.rating).toFixed(1)}/10</span></div>
            <div><span>Year</span><span>{product.releaseYear}</span></div>
            {product.genre && <div><span>Genre</span><span>{product.genre}</span></div>}
            {product.publisher && <div><span>Publisher</span><span>{product.publisher}</span></div>}
            {product.author && <div><span>Author</span><span>{product.author}</span></div>}
            <div><span>Stock</span><span>{product.stock} units</span></div>
          </div>
          <div className="details-price">{formatPrice(product.price)}</div>
          <p className="details-desc">{product.description || 'No description available.'}</p>
          <div className="details-actions">
            <div className="qty-selector">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} disabled={quantity >= product.stock}>+</button>
            </div>
            <button className="add-cart-btn" onClick={handleAddToCart} disabled={!product.stock}>
              Add to Cart - {formatPrice(itemTotal)}
            </button>
            <button className={`wishlist-btn ${inWishlist ? 'active' : ''}`} onClick={handleWishlist}>
              {inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
          </div>
        </div>
      </div>

      {related.length >= 3 && (
        <div className="bundle-section">
          <h2>Frequently Bought Together</h2>
          <div className="bundle-products">
            <div className="bundle-items">
              {related.slice(0, 3).map((p, i) => (
                <div key={p.id} className="bundle-item">
                  <ProductCard product={p} />
                  {i < 2 && <span className="bundle-plus">+</span>}
                </div>
              ))}
            </div>
            <div className="bundle-total">
              <p>Bundle Price:</p>
              <span className="bundle-price">{formatPrice(Math.round(bundleTotal * 0.95))}</span>
              <span className="bundle-save">Save 5%</span>
              <button className="bundle-add-btn" onClick={handleAddBundleToCart}>Add Bundle to Cart</button>
            </div>
          </div>
        </div>
      )}

      {related.length > 0 && (
        <div className="related-section">
          <h2>Related Products</h2>
          <div className="related-grid">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      <ReviewSection productId={product.id} />
      {showTrailer && (
        <TrailerModal tmdbId={product.tmdbId} title={product.title} onClose={() => setShowTrailer(false)} />
      )}
    </div>
  )
}

export default ProductDetails