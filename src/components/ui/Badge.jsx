import React from 'react'
import './Badge.css'

function Badge({ children, variant = 'default', className = '', ...props }) {
    const variantClasses = {
    default: 'badge-default',
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
    muted: 'badge-muted',
    }

    return (
    <span className={`badge ${variantClasses[variant] || variantClasses.default} ${className}`} {...props}>
        {children}
    </span>
    )
}

export default Badge