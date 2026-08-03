import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import './charts.css'

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B']

function TrafficChart({ data, title = 'Traffic Sources' }) {
  return (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <div className="chart-wrapper pie-chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
              }}
              formatter={(value, name) => [`${value}%`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pie-legend">
          {data.map((item, idx) => (
            <div key={idx} className="legend-item">
              <span className="legend-color" style={{ background: COLORS[idx % COLORS.length] }} />
              <span className="legend-label">{item.name}</span>
              <span className="legend-value">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TrafficChart