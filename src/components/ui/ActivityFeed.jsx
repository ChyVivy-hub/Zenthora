import React from 'react'
import './ActivityFeed.css'

function ActivityFeed({ activities = [], className = '' }) {
  if (!activities || activities.length === 0) {
    return (
      <div className={`activity-feed ${className}`}>
        <div className="activity-feed-empty">No recent activity</div>
      </div>
    )
  }

  return (
    <div className={`activity-feed ${className}`}>
      {activities.map((activity, idx) => (
        <div key={idx} className="activity-item">
          <div className="activity-icon">{activity.icon || '📌'}</div>
          <div className="activity-content">
            <p className="activity-text">{activity.text}</p>
            <span className="activity-time">{activity.time}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ActivityFeed