import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const CartContext = createContext(null)

function reducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const exists = state.items.find(i => i.id === action.payload.id)
      if (exists) {
        return { items: state.items.map(i => i.id === action.payload.id ? { ...i, qty: i.qty + 1 } : i) }
      }
      return { items: [...state.items, { ...action.payload, qty: 1 }] }
    }
    case 'REMOVE':
      return { items: state.items.filter(i => i.id !== action.payload) }
    case 'UPDATE':
      if (action.payload.qty <= 0) return { items: state.items.filter(i => i.id !== action.payload.id) }
      return { items: state.items.map(i => i.id === action.payload.id ? { ...i, qty: action.payload.qty } : i) }
    case 'CLEAR':
      return { items: [] }
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [saved, setSaved] = useLocalStorage('zenthora_cart', { items: [] })
  const [cart, dispatch] = useReducer(reducer, saved)

  useEffect(() => { setSaved(cart) }, [cart])

  const add = (p) => dispatch({ type: 'ADD', payload: p })
  const remove = (id) => dispatch({ type: 'REMOVE', payload: id })
  const update = (id, qty) => dispatch({ type: 'UPDATE', payload: { id, qty } })
  const clear = () => dispatch({ type: 'CLEAR' })

  const subtotal = cart.items.reduce((t, i) => t + (Math.round(parseFloat(i.price)) * i.qty), 0)
  const count = cart.items.reduce((t, i) => t + i.qty, 0)

  return (
    <CartContext.Provider value={{ cart, add, remove, update, clear, subtotal, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be inside CartProvider')
  return ctx
}