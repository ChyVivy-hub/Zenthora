import React from 'react'
import './Avatar.css'

function Avatar({ src, name, size = 'md', className = '', ...props }) {
    const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.substring(0, 1).toUpperCase()
    }

    const sizeMap = {
    sm: 28,
    md: 38,
    lg: 48,
    xl: 64,
    }

    const dimension = sizeMap[size] || 38

    if (src) {
    return (
        <img
        src={src}
        alt={name || 'Avatar'}
        className={`avatar avatar-image ${className}`}
        style={{ width: dimension, height: dimension }}
        {...props}
        />
    )
    }

    return (
    <div
        className={`avatar avatar-fallback ${className}`}
      style={{ width: dimension, height: dimension, fontSize: dimension * 0.4 }}
        {...props}
    >
        {getInitials(name)}
    </div>
    )
}

export default Avatar