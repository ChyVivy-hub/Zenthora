import React, { createContext, useContext, useState, useEffect } from 'react'
import { fetchAllProducts } from '../services/api'
import { supabase } from '../services/supabase'

const AppContext = createContext(null)

const currencyData = {
  NGN: { symbol: '₦', name: 'Nigerian Naira', rate: 1, country: 'Nigeria' },
  GHS: { symbol: 'GH₵', name: 'Ghanaian Cedi', rate: 0.010, country: 'Ghana' },
  USD: { symbol: '$', name: 'US Dollar', rate: 0.00065, country: 'United States' },
  GBP: { symbol: '£', name: 'British Pound', rate: 0.00052, country: 'United Kingdom' },
  EUR: { symbol: '€', name: 'Euro', rate: 0.00060, country: 'Europe' },
}

const shippingByCountry = {
  Nigeria: [
    { name: 'Standard Delivery', price: 2500 },
    { name: 'Express Delivery', price: 5000 },
  ],
  Ghana: [
    { name: 'Standard Shipping', price: 5000 },
    { name: 'Express Shipping', price: 10000 },
  ],
  'United States': [
    { name: 'International Standard', price: 30000 },
    { name: 'International Express', price: 50000 },
  ],
  'United Kingdom': [
    { name: 'International Standard', price: 28000 },
    { name: 'International Express', price: 45000 },
  ],
  Europe: [
    { name: 'International Standard', price: 25000 },
    { name: 'International Express', price: 42000 },
  ],
}

export function AppProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [wishlist, setWishlist] = useState([])
  const [orders, setOrders] = useState([])

  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('zenthora_currency') || 'NGN'
  })

  const [selectedCountry, setSelectedCountry] = useState(() => {
    return localStorage.getItem('zenthora_country') || 'Nigeria'
  })

  useEffect(() => { loadAll(); loadWishlist() }, [])
  useEffect(() => { localStorage.setItem('zenthora_currency', currency) }, [currency])
  useEffect(() => { localStorage.setItem('zenthora_country', selectedCountry) }, [selectedCountry])

  useEffect(() => {
    const countryCurrencyMap = {
      Nigeria: 'NGN',
      Ghana: 'GHS',
      'United States': 'USD',
      'United Kingdom': 'GBP',
      Europe: 'EUR',
    }
    const autoCurrency = countryCurrencyMap[selectedCountry]
    if (autoCurrency) setCurrency(autoCurrency)
  }, [selectedCountry])

  const loadAll = async () => {
    setLoading(true)
    await Promise.all([loadProducts(), loadOrdersFromSupabase()])
    setLoading(false)
  }

  const loadProducts = async () => {
    try {
      const apiProducts = await fetchAllProducts()
      if (apiProducts && apiProducts.length > 0) {
        const savedProducts = localStorage.getItem('zenthora_products')
        if (savedProducts) {
          try {
            const saved = JSON.parse(savedProducts)
            const merged = apiProducts.map((p) => {
              const found = saved.find((s) => s.id === p.id)
              return found ? { ...p, stock: found.stock } : p
            })
            setProducts(merged)
            localStorage.setItem('zenthora_products', JSON.stringify(merged))
            return
          } catch {}
        }
        setProducts(apiProducts)
        localStorage.setItem('zenthora_products', JSON.stringify(apiProducts))
        return
      }
    } catch (e) {}

    try {
      const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
      if (data && data.length > 0) {
        const savedProducts = localStorage.getItem('zenthora_products')
        if (savedProducts) {
          try {
            const saved = JSON.parse(savedProducts)
            const merged = data.map((p) => {
              const found = saved.find((s) => s.id === p.id)
              return found ? { ...p, stock: found.stock } : p
            })
            setProducts(merged)
            localStorage.setItem('zenthora_products', JSON.stringify(merged))
            return
          } catch {}
        }
        setProducts(data)
        localStorage.setItem('zenthora_products', JSON.stringify(data))
        return
      }
    } catch (e) {}

    const saved = localStorage.getItem('zenthora_products')
    if (saved) setProducts(JSON.parse(saved))
  }

  const loadOrdersFromSupabase = async () => {
    try {
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
      if (data && data.length > 0) {
        setOrders(data)
        localStorage.setItem('zenthora_orders', JSON.stringify(data))
        return
      }
    } catch (e) {}
    const saved = localStorage.getItem('zenthora_orders')
    if (saved) setOrders(JSON.parse(saved))
  }

  const loadWishlist = () => {
    const saved = localStorage.getItem('zenthora_wishlist')
    if (saved) setWishlist(JSON.parse(saved))
  }

  const addToWishlist = (p) => {
    if (!wishlist.find((i) => i.id === p.id)) {
      const updated = [...wishlist, p]
      setWishlist(updated)
      localStorage.setItem('zenthora_wishlist', JSON.stringify(updated))
    }
  }

  const removeFromWishlist = (id) => {
    const updated = wishlist.filter((i) => i.id !== id)
    setWishlist(updated)
    localStorage.setItem('zenthora_wishlist', JSON.stringify(updated))
  }

  const isInWishlist = (id) => wishlist.some((i) => i.id === id)

  // =============================================
  // ADD ORDER – with detailed logging
  // =============================================
  const addOrder = async (order) => {
    const user = JSON.parse(localStorage.getItem('zenthora_user') || '{}')
    const newOrder = {
      id: 'ORD-' + Date.now(),
      user_id: user.id || null,
      items: order.items,
      total: order.total?.toString(),
      status: 'pending',
      shipping_info: order.shippingInfo,
      created_at: new Date().toISOString(),
    }

    console.log('📦 [addOrder] Saving order to Supabase:', newOrder)

    try {
      const { data, error } = await supabase.from('orders').insert([newOrder])
      if (error) {
        console.error('❌ [addOrder] Supabase insert error:', error)
        throw error
      }
      console.log('✅ [addOrder] Supabase insert succeeded:', data)
    } catch (error) {
      console.error('❌ [addOrder] Failed to insert into Supabase:', error)
      throw error
    }

    const updated = [newOrder, ...orders]
    setOrders(updated)
    localStorage.setItem('zenthora_orders', JSON.stringify(updated))
    console.log('📦 [addOrder] Local state updated.')
    return newOrder
  }

  // =============================================
  // UPDATE ORDER STATUS – optimistic
  // =============================================
  const updateOrderStatus = async (id, status) => {
    const updatedOrders = orders.map((o) => (o.id === id ? { ...o, status } : o))
    setOrders(updatedOrders)
    localStorage.setItem('zenthora_orders', JSON.stringify(updatedOrders))

    try {
      await supabase.from('orders').update({ status }).eq('id', id)
      console.log('✅ Order status updated in Supabase')
    } catch (error) {
      console.error('❌ Failed to update order status in Supabase:', error)
      await loadOrdersFromSupabase()
    }
  }

  const refreshOrders = async () => {
    await loadOrdersFromSupabase()
  }

  const formatPrice = (price) => {
    const num = Math.round(parseFloat(price)) || 0
    const rate = currencyData[currency]?.rate || 1
    const symbol = currencyData[currency]?.symbol || '₦'
    const converted = Math.round(num * rate)

    if (currency === 'NGN' || currency === 'GHS') {
      return symbol + converted.toLocaleString('en-NG')
    }
    if (converted < 1) {
      return symbol + (num * rate).toFixed(2)
    }
    return symbol + converted.toFixed(2)
  }

  const getShippingOptions = (country) => {
    return shippingByCountry[country] || shippingByCountry.Nigeria
  }

  return (
    <AppContext.Provider
      value={{
        products,
        setProducts,
        loading,
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        orders,
        setOrders,
        addOrder,
        updateOrderStatus,
        refreshOrders,
        currency,
        setCurrency,
        formatPrice,
        selectedCountry,
        setSelectedCountry,
        getShippingOptions,
        currencyData,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}