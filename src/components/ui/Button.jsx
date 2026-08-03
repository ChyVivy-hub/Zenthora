import React from 'react'
import './Button.css'

function Button({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    onClick,
    ...props
}) {
    const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
    success: 'btn-success',
    }

    const sizeClasses = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
    }

    return (
    <button
        className={`btn ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        disabled={disabled}
        onClick={onClick}
        {...props}
    >
        {children}
    </button>
    )
}

export default Button