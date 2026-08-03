import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// ========== USERS ==========
export async function createUser(user) {
  const { data, error } = await supabase.from('users').insert([user]).select()
  return { data, error }
}

export async function getUserByEmail(email) {
  const { data } = await supabase.from('users').select('*').eq('email', email).single()
  return data
}

export async function getAllUsers() {
  const { data } = await supabase.from('users').select('*')
  return data || []
}

export async function updateUserStatus(id, status) {
  const { error } = await supabase.from('users').update({ status }).eq('id', id)
  return { error }
}

// ========== PRODUCTS ==========
export async function getAllProducts() {
  const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
  return data || []
}

export async function addProduct(product) {
  const { data, error } = await supabase.from('products').insert([product]).select()
  return { data, error }
}

export async function updateProduct(id, updates) {
  const { data, error } = await supabase.from('products').update(updates).eq('id', id).select()
  return { data, error }
}

export async function deleteProductFromDB(id) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  return { error }
}

// ========== ORDERS ==========
export async function createOrderInDB(order) {
  const { data, error } = await supabase.from('orders').insert([order]).select()
  return { data, error }
}

export async function getAllOrders() {
  const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
  return data || []
}

export async function updateOrderInDB(id, status) {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id)
  return { error }
}

// ========== WISHLIST ==========
export async function getWishlistByUser(userId) {
  const { data } = await supabase.from('wishlist').select('*, products(*)').eq('user_id', userId)
  return data || []
}

export async function addToWishlistInDB(userId, productId) {
  const { error } = await supabase.from('wishlist').insert([{ user_id: userId, product_id: productId }])
  return { error }
}

export async function removeFromWishlistInDB(id) {
  const { error } = await supabase.from('wishlist').delete().eq('id', id)
  return { error }
}