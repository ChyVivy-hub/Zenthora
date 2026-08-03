import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './LoginPage.css'

function StaffLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (!name.trim()) { 
      setError('Please enter your full name.')
      setLoading(false)
      return 
    }
    if (!email.includes('@')) { 
      setError('Please enter a valid email.')
      setLoading(false)
      return 
    }
    if (password.length < 6) { 
      setError('Password must be at least 6 characters.')
      setLoading(false)
      return 
    }
    if (password !== confirmPassword) { 
      setError('Passwords do not match.')
      setLoading(false)
      return 
    }

    const result = await register(name.trim(), email.trim().toLowerCase(), password, 'staff')
    
    if (result.success) {
      setSuccess(result.message)
      setName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        setIsLogin(true)
        setSuccess('')
      }, 3000)
    } else {
      setError(result.message)
    }
    setLoading(false)
  }

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    const result = login(email, password, 'staff')
    if (result.success) {
      navigate('/staff')
    } else {
      setError(result.message)
    }
  }

  const switchToRegister = () => {
    setIsLogin(false)
    setError('')
    setSuccess('')
    setName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
  }

  const switchToLogin = () => {
    setIsLogin(true)
    setError('')
    setSuccess('')
    setEmail('')
    setPassword('')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Staff Portal</h1>
        <p>{isLogin ? 'Staff Login' : 'Staff Registration'}</p>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        {isLogin ? (
          <>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Staff Email</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => { setEmail(e.target.value); setError(''); setSuccess('') }} 
                  required 
                  placeholder="Enter staff email" 
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => { setPassword(e.target.value); setError(''); setSuccess('') }} 
                  required 
                  placeholder="Enter password" 
                />
              </div>
              <button type="submit" className="auth-btn">Staff Sign In</button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>
              Not registered?{' '}
              <button onClick={switchToRegister} style={{ background: 'none', border: 'none', color: '#7C3AED', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                Register here
              </button>
            </p>
          </>
        ) : (
          <>
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => { setName(e.target.value); setError(''); setSuccess('') }} 
                  required 
                  placeholder="Enter your full name" 
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => { setEmail(e.target.value); setError(''); setSuccess('') }} 
                  required 
                  placeholder="Enter your email" 
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => { setPassword(e.target.value); setError(''); setSuccess('') }} 
                  required 
                  placeholder="Min. 6 characters" 
                  minLength="6" 
                />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); setSuccess('') }} 
                  required 
                  placeholder="Re-enter password" 
                />
              </div>
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit for Approval'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>
              Already registered?{' '}
              <button onClick={switchToLogin} style={{ background: 'none', border: 'none', color: '#7C3AED', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                Login here
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default StaffLogin