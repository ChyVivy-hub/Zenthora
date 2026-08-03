import React from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import './StatsCard.css'

function StatsCard({
  title,
  value,
  icon,
  trend,
  trendDirection = 'up',
  data = [],
  color = 'primary',
  className = '',
}) {
  const colorMap = {
    primary: '#f84750',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
  }

  const chartColor = colorMap[color] || colorMap.primary

  return (
    <div className={`stats-card ${className}`}>
      <div className="stats-card-header">
        <div className="stats-card-icon" style={{ color: chartColor }}>
          {icon}
        </div>
        <div className="stats-card-trend">
          {trend && (
            <span className={`trend-badge trend-${trendDirection}`}>
              {trendDirection === 'up' ? '↑' : '↓'} {trend}
            </span>
          )}
        </div>
      </div>
      <div className="stats-card-value">{value}</div>
      <div className="stats-card-title">{title}</div>
      {data && data.length > 0 && (
        <div className="stats-card-sparkline">
          <ResponsiveContainer width="100%" height={40}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={chartColor}
                strokeWidth={2}
                fill={`url(#grad-${title})`}
                dot={false}
              />
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                }}
                formatter={(v) => [v, '']}
                labelFormatter={() => ''}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default StatsCard