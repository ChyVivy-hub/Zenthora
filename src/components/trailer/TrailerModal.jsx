import React, { useState, useEffect } from 'react'
import { fetchTrailer } from '../../services/api'
import './TrailerModal.css'

function TrailerModal({ tmdbId, title, onClose }) {
  const [trailerKey, setTrailerKey] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (tmdbId) {
      fetchTrailer(tmdbId).then(key => {
        setTrailerKey(key)
        setLoading(false)
      })
    }
  }, [tmdbId])

  return (
    <div className="trailer-overlay" onClick={onClose}>
      <div className="trailer-modal" onClick={e => e.stopPropagation()}>
        <div className="trailer-header">
          <h3>{title} - Trailer</h3>
          <button onClick={onClose} className="trailer-close">Close</button>
        </div>
        <div className="trailer-body">
          {loading ? (
            <p className="trailer-loading">Loading trailer...</p>
          ) : trailerKey ? (
            <iframe
              src={'https://www.youtube.com/embed/' + trailerKey + '?autoplay=1'}
              title="Trailer"
              allowFullScreen
              className="trailer-iframe"
            />
          ) : (
            <p className="trailer-none">No trailer available for this title.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default TrailerModal