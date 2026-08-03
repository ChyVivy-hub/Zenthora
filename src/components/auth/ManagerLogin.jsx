import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './LoginPage.css'

function ManagerLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showLogin, setShowLogin] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, register, managerExists } = useAuth()
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (!name.trim()) { setError('Please enter your full name.'); setLoading(false); return }
    if (!email.includes('@')) { setError('Please enter a valid email.'); setLoading(false); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return }
    if (code !== 'ZENTHORA2026') { setError('Invalid setup code.'); setLoading(false); return }

    try {
      const result = await register(name, email, password, 'manager')
      if (result.success) {
        setSuccess('Manager account created! Please login below.')
        setShowLogin(true)
        setName('')
        setCode('')
        setPassword('')
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
      console.error(err)
    }
    setLoading(false)
  }

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    
    const result = login(email, password, 'manager')
    console.log('Login result:', result)
    
    if (result.success) {
      navigate('/manager')
    } else {
      setError(result.message)
    }
    setLoading(false)
  }

  // Registration form (no manager exists or just created one)
  if (!managerExists && !showLogin) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Setup Manager Account</h1>
          <p>First-time setup - Only one manager allowed</p>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your full name" />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Your email" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Create password" minLength="6" />
            </div>
            <div className="form-group">
              <label>Setup Code</label>
              <input type="password" value={code} onChange={(e) => setCode(e.target.value)} required placeholder="Enter setup code" />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Create Manager Account'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Login form (manager exists)
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Manager Login</h1>
        <p>Authorized personnel only</p>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} required placeholder="Manager email" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} required placeholder="Password" />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Manager Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ManagerLogin