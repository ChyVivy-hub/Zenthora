import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import './CheckoutPage.css'

const PAYSTACK_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

// =============================================
// CITY/STATE MAPPING
// =============================================
const stateCities = {
  Lagos: ['Ikeja', 'Lekki', 'Victoria Island', 'Ikoyi', 'Surulere', 'Yaba', 'Apapa', 'Ajah', 'Badagry', 'Epe', 'Ikorodu', 'Oshodi', 'Mushin', 'Agege', 'Alimosho'],
  'Abuja FCT': ['Garki', 'Wuse', 'Maitama', 'Asokoro', 'Gwarinpa', 'Kubwa', 'Jabi', 'Utako', 'Wuye', 'Lugbe', 'Nyanya', 'Karu', 'Bwari', 'Apo'],
  Rivers: ['Port Harcourt', 'Obio-Akpor', 'Eleme', 'Bonny', 'Okrika', 'Oyigbo', 'Tai', 'Gokana', 'Khana', 'Etche'],
  Enugu: ['Enugu North', 'Enugu South', 'Nsukka', 'Agbani', 'Awgu', 'Oji River', 'Udi'],
  Delta: ['Asaba', 'Warri', 'Sapele', 'Ughelli', 'Agbor', 'Oleh', 'Kwale', 'Abraka'],
  Edo: ['Benin City', 'Auchi', 'Ekpoma', 'Uromi', 'Irrua', 'Sabongida-Ora'],
  Imo: ['Owerri', 'Orlu', 'Okigwe', 'Mbaise', 'Oguta', 'Mgbidi'],
  Abia: ['Aba', 'Umuahia', 'Ohafia', 'Arochukwu', 'Bende', 'Isuikwuato'],
  Anambra: ['Awka', 'Onitsha', 'Nnewi', 'Ekwulobia', 'Agulu', 'Ihiala'],
  Oyo: ['Ibadan North', 'Ibadan South', 'Ibadan East', 'Ibadan West', 'Ogbomosho', 'Oyo'],
  Kano: ['Kano Municipal', 'Fagge', 'Dala', 'Gwale', 'Kumbotso', 'Nassarawa'],
  Kaduna: ['Kaduna North', 'Kaduna South', 'Zaria', 'Kafanchan'],
  'Akwa Ibom': ['Uyo', 'Eket', 'Ikot Ekpene', 'Oron'],
  Ogun: ['Abeokuta', 'Ijebu-Ode', 'Sagamu', 'Ilaro', 'Ota'],
}

const allShippingOptions = {
  Nigeria: [
    { name: 'Standard Delivery (2-5 days)', price: 2500 },
    { name: 'Express Delivery (1-2 days)', price: 5000 },
  ],
  Ghana: [
    { name: 'Standard Shipping (5-7 days)', price: 5000 },
    { name: 'Express Shipping (2-3 days)', price: 10000 },
  ],
  'United States': [
    { name: 'International Standard (7-14 days)', price: 30000 },
    { name: 'International Express (3-5 days)', price: 50000 },
  ],
  'United Kingdom': [
    { name: 'International Standard (7-14 days)', price: 28000 },
    { name: 'International Express (3-5 days)', price: 45000 },
  ],
  Europe: [
    { name: 'International Standard (7-14 days)', price: 25000 },
    { name: 'International Express (3-5 days)', price: 42000 },
  ],
}

function CheckoutPage() {
  const navigate = useNavigate()
  const { cart, subtotal, clear } = useCart()
  const { addOrder, formatPrice, selectedCountry } = useApp()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [savedOrder, setSavedOrder] = useState(null)
  const [paymentError, setPaymentError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const savedDiscount = parseInt(localStorage.getItem('zenthora_discount') || '0')
  const bundleDiscount = parseInt(localStorage.getItem('zenthora_bundle_discount') || '0')
  const totalDiscount = savedDiscount + bundleDiscount

  const countryOptions = allShippingOptions[selectedCountry] || allShippingOptions.Nigeria
  const [shipping, setShipping] = useState(countryOptions[0])
  const [cities, setCities] = useState([])

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'state') {
      setForm((prev) => ({ ...prev, state: value, city: '' }))
      setCities(stateCities[value] || [])
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  useEffect(() => {
    setShipping(countryOptions[0])
  }, [selectedCountry])

  const subtotalAfterDiscount = subtotal - totalDiscount
  const tax = Math.round(subtotalAfterDiscount * 0.025)
  const total = subtotalAfterDiscount + (shipping?.price || 0) + tax

  const isAfricanCountry = ['Nigeria', 'Ghana', 'Kenya', 'South Africa'].includes(selectedCountry)

  // =============================================
  // ORDER COMPLETION – Immediate success, background saving
  // =============================================
  const completeOrder = (reference, status) => {
    // Prepare order data
    const orderData = {
      orderSubtotal: subtotal,
      orderDiscount: totalDiscount,
      orderShipping: shipping?.price || 0,
      orderShippingName: shipping?.name || '',
      orderTax: tax,
      orderTotal: total,
      paymentRef: reference,
    }

    // Show success page IMMEDIATELY
    setSavedOrder(orderData)
    clear()
    localStorage.removeItem('zenthora_discount')
    localStorage.removeItem('zenthora_discount_percent')
    localStorage.removeItem('zenthora_bundle_discount')
    localStorage.removeItem('zenthora_bundle_discount_percent')
    setStep(3)
    setIsProcessing(false)

    // =============================================
    // SAVE ORDER IN BACKGROUND (don't wait)
    // =============================================
    const saveOrder = async () => {
      try {
        await addOrder({
          items: cart.items,
          subtotal,
          discount: totalDiscount,
          shipping: shipping?.price || 0,
          tax,
          total,
          shippingInfo: { ...form, country: selectedCountry, shippingName: shipping?.name },
          payment: { reference, status },
        })
        console.log('✅ Order saved to Supabase (background)')
      } catch (dbError) {
        console.error('❌ Supabase save failed (background):', dbError)
        // Fallback to localStorage
        try {
          const fallbackOrders = JSON.parse(localStorage.getItem('zenthora_orders') || '[]')
          fallbackOrders.unshift({
            id: reference,
            items: cart.items,
            total: total,
            status: status,
            created_at: new Date().toISOString(),
            shipping_info: { ...form, country: selectedCountry, shippingName: shipping?.name },
          })
          localStorage.setItem('zenthora_orders', JSON.stringify(fallbackOrders))
          console.log('✅ Order saved to localStorage fallback')
        } catch (fallbackError) {
          console.error('❌ Fallback save failed:', fallbackError)
        }
      }
    }

    // Fire and forget
    saveOrder()

    // Send email in background
    try {
      fetch(`${BACKEND_URL}/api/send-order-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: form.email,
          name: form.firstName,
          orderId: reference,
          total: total,
          items: cart.items,
          status: status,
        }),
      })
    } catch (emailError) {
      console.error('Email failed:', emailError)
    }
  }

  // =============================================
  // PAYSTACK – DIRECT INTEGRATION (No react-paystack)
  // =============================================
  const handlePaystackPayment = () => {
    setIsProcessing(true)
    setPaymentError('')

    // Check if Paystack script is loaded
    if (typeof window.PaystackPop === 'undefined') {
      console.warn('⚠️ Paystack script not loaded. Loading it manually...')
      const script = document.createElement('script')
      script.src = 'https://js.paystack.co/v1/inline.js'
      script.onload = () => {
        console.log('✅ Paystack script loaded. Retrying...')
        handlePaystackPayment()
      }
      script.onerror = () => {
        setIsProcessing(false)
        setPaymentError('⚠️ Unable to reach Paystack. Please check your internet connection and try again.')
      }
      document.head.appendChild(script)
      return
    }

    // Direct Paystack popup using the native API
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_KEY,
      email: form.email,
      amount: total * 100,
      currency: selectedCountry === 'Nigeria' ? 'NGN' : selectedCountry === 'Ghana' ? 'GHS' : 'USD',
      ref: 'ZEN-' + Date.now(),
      callback: (response) => {
        // This runs on successful payment
        console.log('✅ Paystack success (direct):', response)
        completeOrder(response.reference, 'paid')
      },
      onClose: () => {
        // This runs when the user closes the popup without paying
        console.log('❌ Paystack popup closed without payment')
        setIsProcessing(false)
        setPaymentError('Payment was not completed. Please try again.')
      }
    })
    handler.openIframe()
  }

  // =============================================
  // STRIPE
  // =============================================
  const handleStripePayment = async () => {
    setIsProcessing(true)
    setPaymentError('')

    try {
      const safeItems = cart.items.map((item) => ({
        title: item.title || 'Product',
        price: parseFloat(item.price) || 0,
        qty: item.qty || 1,
        category: item.category || '',
      }))

      let currency = 'usd'
      if (selectedCountry === 'United Kingdom') currency = 'gbp'
      else if (selectedCountry === 'Europe') currency = 'eur'

      const response = await fetch(`${BACKEND_URL}/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: safeItems,
          total: total,
          email: form.email,
          currency,
          selectedCountry,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Payment initiation failed')
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received from server')
      }
    } catch (error) {
      setIsProcessing(false)
      setPaymentError(error.message || 'Payment failed. Please try again.')
    }
  }

  // Handle Stripe redirect callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === 'true') {
      completeOrder('stripe_' + Date.now(), 'paid')
      window.history.replaceState({}, document.title, window.location.pathname)
    }
    if (params.get('canceled') === 'true') {
      setPaymentError('Payment was cancelled.')
      window.history.replaceState({}, document.title, window.location.pathname)
      setIsProcessing(false)
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setPaymentError('')
    if (step < 2) {
      setStep(step + 1)
      window.scrollTo(0, 0)
    } else if (step === 2) {
      if (isAfricanCountry) {
        handlePaystackPayment()
      } else {
        handleStripePayment()
      }
    }
  }

  // =============================================
  // RENDER
  // =============================================
  if (cart.items.length === 0 && step !== 3) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <h2>No items to checkout</h2>
        <button onClick={() => navigate('/')} className="back-shop-btn">
          Continue Shopping
        </button>
      </div>
    )
  }

  if (step === 3 && savedOrder) {
    return (
      <div className="success-page">
        <div className="success-icon">✅</div>
        <h1>Order Confirmed!</h1>
        <p>Thank you for your purchase. A confirmation email has been sent to you.</p>
        {savedOrder.paymentRef && (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Reference: <strong>{savedOrder.paymentRef}</strong>
          </p>
        )}
        <div
          style={{
            margin: '20px auto',
            background: 'var(--bg-card)',
            padding: '24px',
            borderRadius: '16px',
            maxWidth: '400px',
            textAlign: 'left',
          }}
        >
          <p><strong>Subtotal:</strong> {formatPrice(savedOrder.orderSubtotal)}</p>
          {savedOrder.orderDiscount > 0 && (
            <p style={{ color: '#10B981' }}><strong>Discount:</strong> -{formatPrice(savedOrder.orderDiscount)}</p>
          )}
          <p><strong>Shipping:</strong> {formatPrice(savedOrder.orderShipping)}</p>
          <p><strong>Tax:</strong> {formatPrice(savedOrder.orderTax)}</p>
          <div style={{ borderTop: '2px solid var(--border)', marginTop: '12px', paddingTop: '12px' }}>
            <p style={{ fontSize: '22px', fontWeight: '800', color: '#10B981' }}>
              Total: {formatPrice(savedOrder.orderTotal)}
            </p>
          </div>
        </div>
        <button onClick={() => navigate('/')} className="back-shop-btn">
          Back to Home
        </button>
      </div>
    )
  }

  return (
    <div className="checkout-modern">
      <h1>Checkout</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
        Shipping to: <strong>{selectedCountry}</strong> • Payment:{' '}
        <strong>{isAfricanCountry ? 'Paystack' : 'Stripe (International)'}</strong>
      </p>

      <div className="checkout-steps-bar">
        {['Shipping', 'Payment'].map((s, i) => (
          <div
            key={s}
            className={`step-item ${step > i + 1 ? 'done' : ''} ${step === i + 1 ? 'current' : ''}`}
          >
            <div className="step-circle">{step > i + 1 ? '✓' : i + 1}</div>
            <span>{s}</span>
          </div>
        ))}
      </div>

      <div className="checkout-grid">
        <form onSubmit={handleSubmit} className="checkout-form-card">
          {step === 1 && (
            <div>
              <h2>Shipping Address</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" name="lastName" value={form.lastName} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input type="text" name="address" value={form.address} onChange={handleChange} required />
              </div>
              {selectedCountry === 'Nigeria' ? (
                <div className="form-row">
                  <div className="form-group">
                    <label>State</label>
                    <select name="state" value={form.state} onChange={handleChange} required>
                      <option value="">Select state</option>
                      {Object.keys(stateCities).map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    {cities.length > 0 ? (
                      <select name="city" value={form.city} onChange={handleChange} required>
                        <option value="">Select city</option>
                        {cities.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    ) : (
                      <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="City" required />
                    )}
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label>City</label>
                  <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="Enter your city" required />
                </div>
              )}
              <div className="form-group">
                <label>Shipping Method</label>
                <select
                  value={shipping?.name || ''}
                  onChange={(e) =>
                    setShipping(countryOptions.find((r) => r.name === e.target.value))
                  }
                >
                  {countryOptions.map((r) => (
                    <option key={r.name} value={r.name}>
                      {r.name} - {formatPrice(r.price)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2>Payment</h2>
              {paymentError && <div className="checkout-error">{paymentError}</div>}
              {isProcessing && (
                <div className="checkout-processing">⏳ Processing your payment...</div>
              )}
              <div
                style={{
                  padding: '24px',
                  background: 'rgba(16,185,129,0.05)',
                  border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: '12px',
                  marginBottom: '20px',
                }}
              >
                <p>
                  <strong>Total to Pay:</strong>{' '}
                  <span style={{ fontSize: '28px', color: '#10B981', fontWeight: '800' }}>
                    {formatPrice(total)}
                  </span>
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  {isAfricanCountry
                    ? 'You will be redirected to Paystack for secure payment.'
                    : 'You will be redirected to Stripe for secure international payment.'}
                </p>
              </div>
            </div>
          )}

          <div className="checkout-buttons">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="checkout-back-btn"
                disabled={isProcessing}
              >
                Back
              </button>
            )}
            <button
              type="submit"
              className="next-btn"
              disabled={isProcessing}
            >
              {isProcessing
                ? 'Processing...'
                : step === 2
                ? `Pay ${formatPrice(total)}`
                : 'Continue'}
            </button>
          </div>
        </form>

        <div className="order-summary-card">
          <h3>Order Summary</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Country: {selectedCountry}
          </p>
          {cart.items.map((item) => (
            <div key={item.id} className="summary-item">
              <span>{item.title} x{item.qty}</span>
              <span>{formatPrice(Math.round(parseFloat(item.price)) * item.qty)}</span>
            </div>
          ))}
          <div className="summary-divider"></div>
          <div className="summary-line">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {totalDiscount > 0 && (
            <div className="summary-line" style={{ color: '#10B981' }}>
              <span>Discount</span>
              <span>- {formatPrice(totalDiscount)}</span>
            </div>
          )}
          <div className="summary-line">
            <span>Shipping</span>
            <span>{formatPrice(shipping?.price || 0)}</span>
          </div>
          <div className="summary-line">
            <span>Tax (2.5%)</span>
            <span>{formatPrice(tax)}</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-line total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage