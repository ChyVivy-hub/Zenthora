import React, { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, Search, X } from 'lucide-react'
import Button from './Button'
import './DataTable.css'

function DataTable({
  data = [],
  columns = [],
  onRowClick,
  searchable = false,
  searchPlaceholder = 'Search...',
  sortable = false,
  paginated = false,
  pageSize = 10,
  title = '',
  actions,
  className = '',
  statusKey = 'status',
  statusMap = {},
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredData = useMemo(() => {
    if (!searchQuery.trim() || !searchable) return data
    const q = searchQuery.toLowerCase()
    return data.filter((row) =>
      columns.some((col) => {
        const value = row[col.key]
        if (value == null) return false
        return String(value).toLowerCase().includes(q)
      })
    )
  }, [data, searchQuery, columns, searchable])

  const sortedData = useMemo(() => {
    if (!sortField || !sortable) return filteredData
    const sorted = [...filteredData]
    sorted.sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (aVal == null) return 1
      if (bVal == null) return -1
      if (typeof aVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
    })
    return sorted
  }, [filteredData, sortField, sortDirection, sortable])

  const paginatedData = useMemo(() => {
    if (!paginated) return sortedData
    const start = (currentPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, currentPage, pageSize, paginated])

  const totalPages = Math.ceil(sortedData.length / pageSize)

  const handleSort = (key) => {
    if (!sortable) return
    if (sortField === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(key)
      setSortDirection('asc')
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setCurrentPage(1)
  }

  const renderCell = (row, col) => {
    const value = row[col.key]
    if (col.render) return col.render(value, row)
    if (value == null) return '—'
    return String(value)
  }

  const getStatusBadge = (status) => {
    const config = statusMap[status] || { label: status || 'Unknown', className: 'status-unknown' }
    return <span className={`status-badge ${config.className}`}>{config.label || status}</span>
  }

  return (
    <div className={`data-table-wrapper ${className}`}>
      {title && <h3 className="data-table-title">{title}</h3>}
      <div className="data-table-controls">
        {searchable && (
          <div className="data-table-search">
            <Search size={16} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
            />
            {searchQuery && (
              <button className="data-table-clear-search" onClick={clearSearch}>
                <X size={14} />
              </button>
            )}
          </div>
        )}
        {actions && <div className="data-table-actions">{actions}</div>}
      </div>
      <div className="data-table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={sortable ? 'sortable' : ''}
                  onClick={() => handleSort(col.key)}
                >
                  <div className="data-table-th-content">
                    {col.label}
                    {sortable && sortField === col.key && (
                      <span className="sort-icon">
                        {sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="data-table-empty">
                  No data available
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  className={onRowClick ? 'clickable' : ''}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.key === statusKey && statusMap ? getStatusBadge(row[statusKey]) : renderCell(row, col)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {paginated && totalPages > 1 && (
        <div className="data-table-pagination">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="data-table-page-info">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

export default DataTable