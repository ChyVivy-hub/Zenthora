import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
)

// Scroll Animation System
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          // Animate only once
          observer.unobserve(entry.target)
        }
      })
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    }
  )

  // Wait for React to render
  setTimeout(() => {
    // Animate product cards with stagger
    document.querySelectorAll('.product-card').forEach((el, i) => {
      el.classList.add('animate-fade-up', `stagger-${(i % 10) + 1}`)
      observer.observe(el)
    })

    // Animate sections
    document.querySelectorAll('.section').forEach(el => {
      el.classList.add('animate-fade-up')
      observer.observe(el)
    })

    // Animate cart items
    document.querySelectorAll('.cart-item-modern').forEach((el, i) => {
      el.classList.add('animate-fade-up', `stagger-${(i % 5) + 1}`)
      observer.observe(el)
    })

    // Animate order cards
    document.querySelectorAll('.order-card').forEach((el, i) => {
      el.classList.add('animate-fade-up', `stagger-${(i % 3) + 1}`)
      observer.observe(el)
    })

    // Animate dashboard panels
    document.querySelectorAll('.staff-panel, .stats-grid-dashboard, .chart-container, .profile-card, .profile-sidebar').forEach(el => {
      el.classList.add('animate-fade-up')
      observer.observe(el)
    })

    // Animate stat boxes
    document.querySelectorAll('.stat-box').forEach((el, i) => {
      el.classList.add('animate-scale-in', `stagger-${(i % 8) + 1}`)
      observer.observe(el)
    })

    // Animate table rows
    document.querySelectorAll('.table-row, .staff-row').forEach((el, i) => {
      el.classList.add('animate-fade-in', `stagger-${(i % 10) + 1}`)
      observer.observe(el)
    })

    // Animate wishlist cards
    document.querySelectorAll('.wishlist-card').forEach((el, i) => {
      el.classList.add('animate-fade-up', `stagger-${(i % 4) + 1}`)
      observer.observe(el)
    })

    // Animate category grid items
    document.querySelectorAll('.cat-grid > *').forEach((el, i) => {
      el.classList.add('animate-fade-up', `stagger-${(i % 10) + 1}`)
      observer.observe(el)
    })

    // Animate footer
    const footer = document.querySelector('.footer')
    if (footer) {
      footer.classList.add('animate-fade-up')
      observer.observe(footer)
    }

    // Fade in images on load
    document.querySelectorAll('img').forEach(img => {
      if (img.complete) {
        img.classList.add('loaded')
      } else {
        img.addEventListener('load', () => img.classList.add('loaded'))
      }
    })

    // Hero parallax effect
    let ticking = false
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const heroBg = document.querySelector('.hero-bg img')
          if (heroBg) {
            const scrolled = window.pageYOffset
            heroBg.style.transform = `scale(1.05) translateY(${scrolled * 0.15}px)`
          }
          ticking = false
        })
        ticking = true
      }
    })
  }, 1500)
}

// Initialize animations
initScrollAnimations()

// Re-check when React Router changes page
window.addEventListener('popstate', () => {
  setTimeout(initScrollAnimations, 500)
})