import React from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import './charts.css'

function RevenueChart({ data, title = 'Revenue Overview' }) {
  return (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f84750" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f84750" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
              }}
              formatter={(value) => [`₦${value.toLocaleString()}`, 'Revenue']}
            />
            <Area type="monotone" dataKey="value" stroke="#f84750" strokeWidth={3} fill="url(#revenueGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default RevenueChart