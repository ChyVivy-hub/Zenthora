import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext(null)

const getUserFromStorage = () => {
  try {
    const saved = localStorage.getItem('zenthora_user')
    if (saved) return JSON.parse(saved)
  } catch {}
  return null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getUserFromStorage())
  const [isAuthenticated, setIsAuthenticated] = useState(!!getUserFromStorage())
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('zenthora_users')
      if (saved) return JSON.parse(saved)
    } catch {}
    return []
  })
  const [loading, setLoading] = useState(true)

  const loadUsers = useCallback(async () => {
    try {
      const { data } = await supabase.from('users').select('*')
      if (data && data.length > 0) {
        setUsers(data)
        localStorage.setItem('zenthora_users', JSON.stringify(data))
        return
      }
    } catch (e) {
      console.error('Failed to load users from Supabase:', e)
    }
    const saved = localStorage.getItem('zenthora_users')
    if (saved) {
      try { setUsers(JSON.parse(saved)) } catch {}
    }
  }, [])

  const refreshUser = useCallback((userId) => {
    if (!userId) return
    const found = users.find(u => u.id === userId)
    if (found) {
      const { password: _, ...safeUser } = found
      setUser(safeUser)
      setIsAuthenticated(true)
      localStorage.setItem('zenthora_user', JSON.stringify(safeUser))
    }
  }, [users])

  const handleOAuthUser = async (supabaseUser) => {
    const existing = users.find(u => u.email === supabaseUser.email)
    if (existing) {
      const { password: _, ...safeUser } = existing
      setUser(safeUser)
      setIsAuthenticated(true)
      localStorage.setItem('zenthora_user', JSON.stringify(safeUser))
      return
    }

    const newUser = {
      id: supabaseUser.id || 'user-' + Date.now(),
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.full_name ||
            supabaseUser.user_metadata?.name ||
            supabaseUser.email?.split('@')[0] ||
            'User',
      role: 'customer',
      status: 'active',
      created_at: new Date().toISOString(),
      avatar: supabaseUser.user_metadata?.avatar_url || null,
    }

    try {
      await supabase.from('users').insert([newUser])
    } catch (e) {
      console.error('Failed to create user from OAuth:', e)
    }

    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    localStorage.setItem('zenthora_users', JSON.stringify(updatedUsers))
    const { password: _, ...safeUser } = newUser
    setUser(safeUser)
    setIsAuthenticated(true)
    localStorage.setItem('zenthora_user', JSON.stringify(safeUser))
  }

  useEffect(() => {
    const init = async () => {
      await loadUsers()

      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await handleOAuthUser(session.user)
      }

      if (!session) {
        const savedUser = localStorage.getItem('zenthora_user')
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser)
            refreshUser(parsed.id)
          } catch {}
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  const socialLogin = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin + '/dashboard',
      },
    })
    if (error) {
      console.error('Social login error:', error)
      return { success: false, message: error.message }
    }
    return { success: true }
  }

  const login = (email, password, role) => {
    const found = users.find(u =>
      u.email === email.toLowerCase().trim() &&
      u.password === password &&
      u.role === role
    )
    if (!found) return { success: false, message: 'Invalid email or password.' }
    if (found.status === 'pending') return { success: false, message: 'Account pending approval.' }
    if (found.status === 'rejected') return { success: false, message: 'Application rejected.' }
    if (found.status === 'suspended') return { success: false, message: 'Account suspended.' }
    if (found.status === 'banned') return { success: false, message: 'Account banned.' }

    const { password: _, ...safeUser } = found
    setUser(safeUser)
    setIsAuthenticated(true)
    localStorage.setItem('zenthora_user', JSON.stringify(safeUser))
    return { success: true }
  }

  const register = async (name, email, password, role) => {
    if (users.find(u => u.email === email.toLowerCase().trim())) {
      return { success: false, message: 'Email already exists.' }
    }
    if (role === 'manager' && users.some(u => u.role === 'manager')) {
      return { success: false, message: 'Manager already exists.' }
    }
    if (!name || name.trim().length < 2) {
      return { success: false, message: 'Enter a valid name.' }
    }
    if (!email || !email.includes('@')) {
      return { success: false, message: 'Enter a valid email.' }
    }
    if (!password || password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' }
    }

    const newUser = {
      id: 'user-' + Date.now(),
      email: email.toLowerCase().trim(),
      password,
      name: name.trim(),
      role,
      status: role === 'staff' ? 'pending' : 'active',
      created_at: new Date().toISOString(),
      permissions: role === 'staff' ? {
        canEditOrders: true,
        canEditProducts: true,
        canViewCustomers: true,
      } : undefined,
    }

    try {
      const { error } = await supabase.from('users').insert([newUser])
      if (error) {
        console.error('Supabase insert error:', error)
        return { success: false, message: error.message || 'Failed to create account.' }
      }
      const updatedUsers = [...users, newUser]
      setUsers(updatedUsers)
      localStorage.setItem('zenthora_users', JSON.stringify(updatedUsers))
      loadUsers()

      if (role === 'staff') {
        return { success: true, message: 'Registration submitted. Awaiting approval.', pending: true }
      }
      if (role === 'manager') {
        return { success: true, message: 'Manager account created! Please login now.' }
      }
      const { password: _, ...safeUser } = newUser
      setUser(safeUser)
      setIsAuthenticated(true)
      localStorage.setItem('zenthora_user', JSON.stringify(safeUser))
      return { success: true, message: 'Welcome to Zenthora!' }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, message: 'Could not connect to database.' }
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('zenthora_user')
  }

  // ============================================================
  //  ULTIMATE FIX: updateCurrentUser with upsert + maybeSingle
  // ============================================================
  const updateCurrentUser = async (updates) => {
    if (!user?.id) {
      console.error('updateCurrentUser: No user.id found')
      return
    }

    console.log('Updating user with ID:', user.id)
    console.log('Updates:', updates)

    try {
      // 1. Check if the user exists using maybeSingle()
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (fetchError) {
        console.error('Fetch error:', fetchError)
        throw fetchError
      }

      // 2. Prepare user data
      const userData = {
        id: user.id,
        email: user.email,
        name: user.name || 'User',
        role: user.role || 'customer',
        status: user.status || 'active',
        created_at: user.created_at || new Date().toISOString(),
        avatar: user.avatar || null,
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
        password: user.password || '',
        ...updates,
      }

      // 3. Insert or update
      if (!existingUser) {
        console.log('User not found in DB, inserting...')
        const { error: insertError } = await supabase
          .from('users')
          .insert([userData])
        if (insertError) throw insertError
      } else {
        console.log('User found, updating...')
        const { error: updateError } = await supabase
          .from('users')
          .update(updates)
          .eq('id', user.id)
        if (updateError) throw updateError
      }

      // 4. Fetch fresh data
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (error) throw error

      if (!data) {
        console.warn('No data returned after upsert, using local data')
        const updatedLocal = { ...user, ...updates }
        setUser(updatedLocal)
        localStorage.setItem('zenthora_user', JSON.stringify(updatedLocal))
        await loadUsers()
        return updatedLocal
      }

      // 5. Update context
      const { password, ...safeUser } = data
      setUser(safeUser)
      localStorage.setItem('zenthora_user', JSON.stringify(safeUser))
      await loadUsers()

      console.log('Update successful:', safeUser)
      return safeUser
    } catch (err) {
      console.error('UpdateCurrentUser error:', err)
      // Fallback
      const updated = { ...user, ...updates }
      setUser(updated)
      localStorage.setItem('zenthora_user', JSON.stringify(updated))
      await loadUsers()
    }
  }

  // All other functions (approveStaff, rejectStaff, etc.) remain exactly as they were.
  // I'll include them for completeness but they are unchanged.

  const approveStaff = async (id) => {
    const updatedUsers = users.map(u =>
      u.id === id ? { ...u, status: 'approved' } : u
    )
    setUsers(updatedUsers)
    localStorage.setItem('zenthora_users', JSON.stringify(updatedUsers))
    try {
      await supabase.from('users').update({ status: 'approved' }).eq('id', id)
    } catch (e) { console.error('Approval error:', e) }
    await loadUsers()
  }

  const rejectStaff = async (id) => {
    const updatedUsers = users.map(u =>
      u.id === id ? { ...u, status: 'rejected' } : u
    )
    setUsers(updatedUsers)
    localStorage.setItem('zenthora_users', JSON.stringify(updatedUsers))
    try {
      await supabase.from('users').update({ status: 'rejected' }).eq('id', id)
    } catch (e) { console.error('Reject error:', e) }
    await loadUsers()
  }

  const suspendUser = async (id) => {
    const updatedUsers = users.map(u =>
      u.id === id ? { ...u, status: 'suspended' } : u
    )
    setUsers(updatedUsers)
    localStorage.setItem('zenthora_users', JSON.stringify(updatedUsers))
    try {
      await supabase.from('users').update({ status: 'suspended' }).eq('id', id)
    } catch (e) { console.error('Suspend error:', e) }
    await loadUsers()
  }

  const banUser = async (id) => {
    const updatedUsers = users.map(u =>
      u.id === id ? { ...u, status: 'banned' } : u
    )
    setUsers(updatedUsers)
    localStorage.setItem('zenthora_users', JSON.stringify(updatedUsers))
    try {
      await supabase.from('users').update({ status: 'banned' }).eq('id', id)
    } catch (e) { console.error('Ban error:', e) }
    await loadUsers()
  }

  const restoreUser = async (id) => {
    const updatedUsers = users.map(u =>
      u.id === id ? { ...u, status: 'active' } : u
    )
    setUsers(updatedUsers)
    localStorage.setItem('zenthora_users', JSON.stringify(updatedUsers))
    try {
      await supabase.from('users').update({ status: 'active' }).eq('id', id)
    } catch (e) { console.error('Restore error:', e) }
    await loadUsers()
  }

  const removeUser = async (id) => {
    const updatedUsers = users.filter(u => u.id !== id)
    setUsers(updatedUsers)
    localStorage.setItem('zenthora_users', JSON.stringify(updatedUsers))
    try {
      await supabase.from('users').delete().eq('id', id)
    } catch (e) { console.error('Remove error:', e) }
    await loadUsers()
  }

  const updateUserPermissions = async (userId, permissions) => {
    const updatedUsers = users.map(u =>
      u.id === userId ? { ...u, permissions } : u
    )
    setUsers(updatedUsers)
    localStorage.setItem('zenthora_users', JSON.stringify(updatedUsers))
    try {
      await supabase.from('users').update({ permissions }).eq('id', userId)
    } catch (e) { console.error('Permissions update error:', e) }
    if (user?.id === userId) {
      refreshUser(userId)
    }
  }

  const changePassword = async (email, newPassword) => {
    const emailLower = email.toLowerCase().trim()
    const existingUser = users.find(u => u.email === emailLower)
    if (!existingUser) {
      return { success: false, message: 'No account found with this email.' }
    }
    const updatedUsers = users.map(u =>
      u.id === existingUser.id ? { ...u, password: newPassword } : u
    )
    setUsers(updatedUsers)
    localStorage.setItem('zenthora_users', JSON.stringify(updatedUsers))
    if (user?.id === existingUser.id) {
      const updatedUser = { ...user, password: newPassword }
      setUser(updatedUser)
      localStorage.setItem('zenthora_user', JSON.stringify(updatedUser))
    }
    try {
      await supabase.from('users').update({ password: newPassword }).eq('id', existingUser.id)
    } catch (e) { console.error('Password update error:', e) }
    return { success: true, message: 'Password updated successfully!' }
  }

  const managerExists = users.some(u => u.role === 'manager')

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      login,
      register,
      logout,
      socialLogin,
      users,
      setUsers,
      managerExists,
      updateCurrentUser,
      approveStaff,
      rejectStaff,
      suspendUser,
      banUser,
      restoreUser,
      removeUser,
      updateUserPermissions,
      changePassword,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}