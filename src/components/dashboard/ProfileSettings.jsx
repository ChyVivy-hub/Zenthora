import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabase'
import './ProfileSettings.css'

function ProfileSettings() {
  const { user, users, setUsers, updateCurrentUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [section, setSection] = useState('profile')
  const fileInputRef = useRef(null)

  const [savedData, setSavedData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bio: user?.bio || '',
    avatar: user?.avatar || null,
    role: user?.role || '',
    status: user?.status || '',
    created_at: user?.created_at || ''
  })

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bio: user?.bio || ''
  })

  // ============================================================
  //  Force-refresh from Supabase and update everything
  // ============================================================
  const loadFreshData = async () => {
    if (!user?.id) {
      console.warn('loadFreshData: No user.id')
      return
    }

    console.log('loadFreshData: fetching user with ID:', user.id)

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Supabase error in loadFreshData:', error)
        throw error
      }

      if (!data) {
        console.warn('No user found in Supabase, creating one...')
        // Insert the current user
        const newUser = {
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
        }
        const { error: insertError } = await supabase
          .from('users')
          .insert([newUser])
        if (insertError) {
          console.error('Insert error:', insertError)
          throw insertError
        }
        // Fetch again
        const { data: freshData, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()
        if (fetchError) throw fetchError
        if (!freshData) {
          console.error('Still no data after insert')
          return
        }
        const { password, ...rest } = freshData
        setSavedData(rest)
        setFormData({
          name: rest.name || '',
          phone: rest.phone || '',
          address: rest.address || '',
          bio: rest.bio || ''
        })
        // Update users list
        const updatedUsers = users.map(u => u.id === user.id ? { ...u, ...rest } : u)
        setUsers(updatedUsers)
        localStorage.setItem('zenthora_users', JSON.stringify(updatedUsers))
        return
      }

      // Data exists
      const { password, ...rest } = data
      setSavedData(rest)
      setFormData({
        name: rest.name || '',
        phone: rest.phone || '',
        address: rest.address || '',
        bio: rest.bio || ''
      })
      // Update users list
      const updatedUsers = users.map(u => u.id === user.id ? { ...u, ...rest } : u)
      setUsers(updatedUsers)
      localStorage.setItem('zenthora_users', JSON.stringify(updatedUsers))
      console.log('loadFreshData successful:', rest)
    } catch (err) {
      console.error('loadFreshData error:', err)
      showMessage('error', 'Could not refresh profile data. Please refresh the page.')
    }
  }

  useEffect(() => {
    if (user?.id) loadFreshData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 4000)
  }

  // ============================================================
  //  Profile update
  // ============================================================
  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateCurrentUser({
        name: formData.name?.trim() || '',
        phone: formData.phone || '',
        address: formData.address || '',
        bio: formData.bio || ''
      })
      await loadFreshData()
      showMessage('success', 'Profile updated successfully!')
    } catch (error) {
      console.error('Profile update error:', error)
      showMessage('error', 'Failed to update profile.')
    }
    setLoading(false)
  }

  // ============================================================
  //  Password change
  // ============================================================
  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: userData } = await supabase
        .from('users')
        .select('password')
        .eq('id', user.id)
        .maybeSingle()

      if (!userData || userData.password !== passwords.current) {
        showMessage('error', 'Current password is incorrect.')
        setLoading(false)
        return
      }
    } catch {
      showMessage('error', 'Could not verify password. Try again.')
      setLoading(false)
      return
    }

    if (passwords.new.length < 6) {
      showMessage('error', 'Password must be at least 6 characters.')
      setLoading(false)
      return
    }
    if (passwords.new !== passwords.confirm) {
      showMessage('error', 'Passwords do not match.')
      setLoading(false)
      return
    }

    try {
      await supabase.from('users').update({ password: passwords.new }).eq('id', user.id)

      const updatedUser = { ...user, password: passwords.new }
      localStorage.setItem('zenthora_user', JSON.stringify(updatedUser))

      const updatedUsers = users.map(u => u.id === user.id ? { ...u, password: passwords.new } : u)
      setUsers(updatedUsers)

      setPasswords({ current: '', new: '', confirm: '' })
      showMessage('success', 'Password changed!')
    } catch {
      showMessage('error', 'Failed to change password.')
    }
    setLoading(false)
  }

  // ============================================================
  //  Avatar upload
  // ============================================================
  const handleAvatarClick = () => fileInputRef.current?.click()

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 500000) {
      showMessage('error', 'Max 500KB.')
      return
    }
    setLoading(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const base64 = event.target.result
        await updateCurrentUser({ avatar: base64 })
        await loadFreshData()
        showMessage('success', 'Profile picture updated!')
      } catch (error) {
        console.error('Avatar update error:', error)
        showMessage('error', 'Failed to update picture.')
      }
      setLoading(false)
    }
    reader.onerror = () => {
      showMessage('error', 'Failed to read file.')
      setLoading(false)
    }
    reader.readAsDataURL(file)
  }

  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.substring(0, 1).toUpperCase()
  }

  return (
    <div className="profile-settings">
      <h1>My Profile</h1>
      {message.text && <div className={`profile-message ${message.type}`}>{message.text}</div>}

      <div className="profile-layout">
        <div className="profile-sidebar">
          <div className="profile-avatar-section" onClick={handleAvatarClick}>
            {savedData.avatar ? (
              <img src={savedData.avatar} alt="Profile" className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-placeholder">{getInitials(savedData.name)}</div>
            )}
            <div className="avatar-overlay"><span>Change Photo</span></div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
          </div>
          <h3>{savedData.name || 'No name'}</h3>
          <p className="profile-role">{savedData.role?.toUpperCase()}</p>
          <div style={{ textAlign: 'left', marginTop: '16px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
            <p><strong>Email:</strong> {savedData.email}</p>
            <p><strong>Phone:</strong> {savedData.phone || 'Not set'}</p>
            <p><strong>Address:</strong> {savedData.address || 'Not set'}</p>
            <p><strong>Bio:</strong> {savedData.bio || 'Not set'}</p>
            <p><strong>Status:</strong> <span style={{ color: savedData.status === 'active' ? '#10B981' : '#F59E0B' }}>{savedData.status}</span></p>
            <p><strong>Joined:</strong> {savedData.created_at ? new Date(savedData.created_at).toLocaleDateString() : 'N/A'}</p>
          </div>
          <nav className="profile-nav">
            <button className={`profile-nav-btn ${section === 'profile' ? 'active' : ''}`} onClick={() => setSection('profile')}>Edit Profile</button>
            <button className={`profile-nav-btn ${section === 'password' ? 'active' : ''}`} onClick={() => setSection('password')}>Change Password</button>
            <button className={`profile-nav-btn ${section === 'contact' ? 'active' : ''}`} onClick={() => setSection('contact')}>Contact Details</button>
          </nav>
        </div>

        <div className="profile-content">
          {section === 'profile' && (
            <div className="profile-card">
              <h2>Edit Profile</h2>
              <form onSubmit={handleProfileUpdate}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter your full name" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={savedData.email || ''} disabled className="disabled-input" />
                </div>
                <div className="form-group">
                  <label>Bio</label>
                  <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows="3" placeholder="Write something about yourself..." />
                </div>
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {section === 'password' && (
            <div className="profile-card">
              <h2>Change Password</h2>
              <form onSubmit={handlePasswordChange}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
                </div>
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>
          )}

          {section === 'contact' && (
            <div className="profile-card">
              <h2>Contact Details</h2>
              <form onSubmit={handleProfileUpdate}>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Enter phone number" />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Enter your address" />
                </div>
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Contact Details'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfileSettings