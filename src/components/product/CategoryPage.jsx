import React, { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import ProductCard from '../home/ProductCard'
import './CategoryPage.css'

function CategoryPage() {
  const { category } = useParams()
  const { products, loading } = useApp()
  const [sort, setSort] = useState('rating')
  const [page, setPage] = useState(1)
  const perPage = 20

  const catMap = { movies: 'Movies', books: 'Books', manga: 'Manga', comics: 'Comics' }
  const catName = catMap[category] || category

  const filtered = useMemo(() => {
    let items = products.filter(p => p.category === catName)
    if (sort === 'price-low') items.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
    if (sort === 'price-high') items.sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
    if (sort === 'rating') items.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
    if (sort === 'newest') items.sort((a, b) => b.releaseYear - a.releaseYear)
    return items
  }, [products, catName, sort])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  if (loading) {
    return (
      <div className="category-page">
        <h1>{catName}</h1>
        <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading products...</p>
      </div>
    )
  }

  return (
    <div className="category-page">
      <h1>{catName}</h1>
      <p className="cat-count">{filtered.length} products</p>

      <div className="cat-controls">
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="rating">Top Rated</option>
          <option value="newest">Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      <div className="cat-grid">
        {paginated.length > 0 ? (
          paginated.map(p => <ProductCard key={p.id} product={p} />)
        ) : (
          <p className="no-products">No products found in {catName}</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} className={page === i + 1 ? 'active' : ''} onClick={() => setPage(i + 1)}>{i + 1}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
        </div>
      )}
    </div>
  )
}

export default CategoryPage