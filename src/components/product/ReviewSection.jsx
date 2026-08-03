import React, { useState } from 'react'
import './ReviewSection.css'

function ReviewSection({ productId }) {
  const [reviews, setReviews] = useState(() => {
    return JSON.parse(localStorage.getItem(`reviews_${productId}`) || '[]')
  })
  const [hoverStar, setHoverStar] = useState(0)
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' })
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleStarClick = (star) => {
    setNewReview({ ...newReview, rating: star })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !newReview.comment.trim() || newReview.rating === 0) return
    
    const review = {
      id: Date.now(),
      name: name.trim(),
      rating: newReview.rating,
      comment: newReview.comment.trim(),
      date: new Date().toISOString()
    }
    const updated = [review, ...reviews]
    setReviews(updated)
    localStorage.setItem(`reviews_${productId}`, JSON.stringify(updated))
    setNewReview({ rating: 0, comment: '' })
    setName('')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0

  return (
    <div className="reviews-section">
      <div className="reviews-summary">
        <h2>Customer Reviews</h2>
        <div className="average-rating">
          <span className="avg-number">{averageRating}</span>
          <span className="avg-stars">
            {[1,2,3,4,5].map(star => (
              <span key={star} style={{ color: star <= Math.round(averageRating) ? '#F59E0B' : '#CBD5E1', fontSize: '24px' }}>
                ★
              </span>
            ))}
          </span>
          <span className="avg-count">({reviews.length} reviews)</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="review-form">
        <h3>Write a Review</h3>
        {submitted && <div className="review-success">Review submitted! Thank you.</div>}
        
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Your name" 
          required 
        />
        
        <div className="star-selector">
          <label>Your Rating:</label>
          <div className="stars">
            {[1,2,3,4,5].map(star => (
              <span
                key={star}
                className={`star ${star <= (hoverStar || newReview.rating) ? 'active' : ''}`}
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => setHoverStar(star)}
                onMouseLeave={() => setHoverStar(0)}
              >
                ★
              </span>
            ))}
          </div>
          {newReview.rating > 0 && (
            <span className="rating-text">
              {newReview.rating === 5 ? 'Excellent!' : newReview.rating === 4 ? 'Very Good' : newReview.rating === 3 ? 'Good' : newReview.rating === 2 ? 'Fair' : 'Poor'}
            </span>
          )}
        </div>

        <textarea 
          value={newReview.comment} 
          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} 
          placeholder="Share your thoughts about this product..." 
          rows="4" 
          required 
        />
        <button type="submit">Submit Review</button>
      </form>

      <div className="reviews-list">
        {reviews.length === 0 && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
            No reviews yet. Be the first to review!
          </p>
        )}
        {reviews.map(r => (
          <div key={r.id} className="review-card">
            <div className="review-header">
              <strong>{r.name}</strong>
              <span className="review-rating">
                {[1,2,3,4,5].map(star => (
                  <span key={star} style={{ color: star <= r.rating ? '#F59E0B' : '#CBD5E1' }}>
                    ★
                  </span>
                ))}
              </span>
              <span className="review-date">{new Date(r.date).toLocaleDateString()}</span>
            </div>
            <p>{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ReviewSection