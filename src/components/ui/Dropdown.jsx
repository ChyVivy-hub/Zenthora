import React, { useState, useRef, useEffect } from 'react'
import './Dropdown.css'

function Dropdown({
    trigger,
    children,
    align = 'right',
    className = '',
    onOpenChange,
}) {
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef(null)

    const toggle = () => {
    const newState = !open
    setOpen(newState)
    if (onOpenChange) onOpenChange(newState)
    }

    const close = () => {
    setOpen(false)
    if (onOpenChange) onOpenChange(false)
    }

    useEffect(() => {
    const handleClickOutside = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        close()
        }
    }
    if (open) {
        document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
        document.removeEventListener('mousedown', handleClickOutside)
    }
    }, [open])

    return (
    <div className={`dropdown-wrapper ${className}`} ref={dropdownRef}>
        <div onClick={toggle} className="dropdown-trigger">
        {trigger}
        </div>
        {open && (
        <div className={`dropdown-menu dropdown-align-${align}`}>
            {typeof children === 'function' ? children(close) : children}
        </div>
        )}
    </div>
    )
}

export default Dropdown