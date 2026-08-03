import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useApp } from '../../context/AppContext'
import './CartPage.css'

function CartPage() {
  const { cart, remove, update, clear, subtotal, count } = useCart()
  const { formatPrice, selectedCountry, currencyData, currency } = useApp()
  const navigate = useNavigate()

  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [couponSuccess, setCouponSuccess] = useState('')

  // Get bundle discount from localStorage
  const bundleDiscount = parseInt(localStorage.getItem('zenthora_bundle_discount') || '0')
  const bundleDiscountPercent = parseInt(localStorage.getItem('zenthora_bundle_discount_percent') || '0')

  const coupons = {
    'ZEN10': 10,
    'ZEN20': 20,
    'WELCOME': 15,
    'SAVE50': 50
  }

  const applyCoupon = () => {
    setCouponError('')
    setCouponSuccess('')
    
    if (!couponCode.trim()) {
      setCouponError('Enter a coupon code')
      return
    }
    
    const discountPct = coupons[couponCode.toUpperCase()]
    if (!discountPct) {
      setCouponError('Invalid coupon code')
      return
    }
    
    setDiscountPercent(discountPct)
    const discountAmount = Math.round(subtotal * discountPct / 100)
    setDiscount(discountAmount)
    setCouponApplied(true)
    setCouponSuccess(`Coupon applied! ${discountPct}% off`)
    
    localStorage.setItem('zenthora_discount', discountAmount.toString())
    localStorage.setItem('zenthora_discount_percent', discountPct.toString())
  }

  const totalDiscount = discount + bundleDiscount
  const finalTotal = subtotal - totalDiscount

  const clearAllDiscounts = () => {
    localStorage.removeItem('zenthora_discount')
    localStorage.removeItem('zenthora_discount_percent')
    localStorage.removeItem('zenthora_bundle_discount')
    localStorage.removeItem('zenthora_bundle_discount_percent')
    clear()
  }

  if (cart.items.length === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <Link to="/" className="cart-cta">Browse Products</Link>
      </div>
    )
  }

  const currencyInfo = currencyData[currency]

  return (
    <div className="cart-modern">
      <div className="cart-modern-header">
        <h1>Shopping Cart</h1>
        <span className="cart-count-badge">{count} items</span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {selectedCountry} • {currencyInfo?.symbol}
        </span>
      </div>

      <div className="cart-modern-layout">
        <div className="cart-items-list">
          {cart.items.map(item => (
            <div key={item.id} className="cart-item-modern">
              <div className="cart-item-modern-img">
                {item.image ? (
                  <img src={item.image} alt={item.title} />
                ) : (
                  <div className="cart-item-modern-placeholder">{item.title?.charAt(0)}</div>
                )}
              </div>
              <div className="cart-item-modern-details">
                <Link to={'/product/' + item.id} className="cart-item-modern-title">{item.title}</Link>
                <span className="cart-item-modern-cat">{item.category}</span>
                <span className="cart-item-modern-unit">{formatPrice(item.price)} each</span>
              </div>
              <div className="cart-item-modern-qty">
                <button onClick={() => update(item.id, item.qty - 1)}>−</button>
                <span>{item.qty}</span>
                <button onClick={() => update(item.id, item.qty + 1)}>+</button>
              </div>
              <div className="cart-item-modern-price">
                {formatPrice(Math.round(parseFloat(item.price)) * item.qty)}
              </div>
              <button onClick={() => remove(item.id)} className="cart-item-modern-remove" title="Remove">×</button>
            </div>
          ))}
          <button onClick={clearAllDiscounts} className="cart-clear-btn">Clear All Items</button>
        </div>

        <div className="cart-modern-summary">
          <div className="summary-card">
            <h3>Order Summary</h3>
            <div className="summary-lines">
              <div className="summary-line">
                <span>Subtotal ({count} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              
              {/* Bundle Discount */}
              {bundleDiscount > 0 && (
                <div className="summary-line" style={{ color: '#10B981' }}>
                  <span>Bundle Discount ({bundleDiscountPercent}%)</span>
                  <span>- {formatPrice(bundleDiscount)}</span>
                </div>
              )}
              
              {/* Coupon Discount */}
              {discount > 0 && (
                <div className="summary-line" style={{ color: '#10B981' }}>
                  <span>Coupon ({discountPercent}%)</span>
                  <span>- {formatPrice(discount)}</span>
                </div>
              )}
              
              <div className="summary-line muted">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="summary-line muted">
                <span>Tax</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            <div className="coupon-section">
              <div className="coupon-input-wrapper">
                <input 
                  type="text" 
                  value={couponCode} 
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())} 
                  placeholder="Enter coupon code" 
                  className="coupon-input"
                />
                <button onClick={applyCoupon} className="coupon-apply-btn" disabled={couponApplied}>
                  {couponApplied ? 'Applied' : 'Apply'}
                </button>
              </div>
              {couponError && <p className="coupon-error">{couponError}</p>}
              {couponSuccess && <p className="coupon-success">{couponSuccess}</p>}
            </div>

            <div className="summary-divider"></div>
            <div className="summary-total">
              <span>Total</span>
              <span>{formatPrice(finalTotal)}</span>
            </div>
            <button onClick={() => navigate('/checkout')} className="checkout-btn-modern">
              Proceed to Checkout
            </button>
            <Link to="/" className="continue-shopping-link">← Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage