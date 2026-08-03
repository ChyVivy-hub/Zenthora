import React, { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import ProductCard from '../home/ProductCard'
import './SearchResults.css'

function SearchResults() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const { products, loading } = useApp()

  const results = useMemo(() => {
    if (!query) return []
    const q = query.toLowerCase()
    return products.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.genre && p.genre.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    )
  }, [products, query])

  return (
    <div className="search-results">
      <div className="results-header">
        <h1>Search Results</h1>
        {query && <p>Showing results for: <strong>"{query}"</strong></p>}
        <p className="results-count">{results.length} products found</p>
      </div>

      <div className="results-grid">
        {loading ? (
          <p>Loading...</p>
        ) : results.length > 0 ? (
          results.map(product => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="no-results">
            <h2>No results found</h2>
            <p>Try different keywords or browse categories.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchResults