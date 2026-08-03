import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './ProductManagement.css';

function ProductManagement() {
  const { products, setProducts } = useApp();
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ title: '', price: '', category: 'Movies', genre: '', rating: '', releaseYear: '', stock: '', description: '', publisher: '', author: '' });

  const formatPrice = (price) => {
    const numPrice = Math.round(parseFloat(price)) || 0;
    return `₦${numPrice.toLocaleString('en-NG')}`;
  };

  const resetForm = () => {
    setFormData({ title: '', price: '', category: 'Movies', genre: '', rating: '', releaseYear: '', stock: '', description: '', publisher: '', author: '' });
    setEditingProduct(null);
  };

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.stock) { alert('Please fill in title, price, and stock'); return; }
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...formData, price: Math.round(parseFloat(formData.price)).toString(), stock: parseInt(formData.stock) } : p));
    } else {
      setProducts([...products, { id: `prod-${Date.now()}`, ...formData, price: Math.round(parseFloat(formData.price)).toString(), stock: parseInt(formData.stock), image: null }]);
    }
    resetForm();
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({ title: product.title || '', price: product.price || '', category: product.category || 'Movies', genre: product.genre || '', rating: product.rating || '', releaseYear: product.releaseYear || '', stock: product.stock || '', description: product.description || '', publisher: product.publisher || '', author: product.author || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (productId) => { if (window.confirm('Delete this product?')) setProducts(products.filter(p => p.id !== productId)); };

  return (
    <div className="product-management">
      <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-grid">
          <div className="form-group"><label>Title *</label><input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="Product title" /></div>
          <div className="form-group"><label>Price (₦) *</label><input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" placeholder="e.g. 8500" /></div>
          <div className="form-group"><label>Category</label><select name="category" value={formData.category} onChange={handleChange}><option value="Movies">Movies</option><option value="Books">Books</option><option value="Manga">Manga</option><option value="Comics">Comics</option></select></div>
          <div className="form-group"><label>Genre</label><input type="text" name="genre" value={formData.genre} onChange={handleChange} placeholder="Genre" /></div>
          <div className="form-group"><label>Rating (0-10)</label><input type="number" name="rating" value={formData.rating} onChange={handleChange} step="0.1" min="0" max="10" placeholder="7.5" /></div>
          <div className="form-group"><label>Release Year</label><input type="number" name="releaseYear" value={formData.releaseYear} onChange={handleChange} placeholder="2024" /></div>
          <div className="form-group"><label>Stock *</label><input type="number" name="stock" value={formData.stock} onChange={handleChange} required min="0" placeholder="Quantity" /></div>
          <div className="form-group"><label>Publisher</label><input type="text" name="publisher" value={formData.publisher} onChange={handleChange} placeholder="Publisher" /></div>
          <div className="form-group"><label>Author</label><input type="text" name="author" value={formData.author} onChange={handleChange} placeholder="Author" /></div>
          <div className="form-group full-width"><label>Description</label><textarea name="description" value={formData.description} onChange={handleChange} placeholder="Product description" rows="3" /></div>
        </div>
        <div className="form-actions">
          <button type="submit" className="submit-btn">{editingProduct ? 'Update Product' : 'Add Product'}</button>
          {editingProduct && <button type="button" className="cancel-btn" onClick={resetForm}>Cancel</button>}
        </div>
      </form>
      <div className="products-list">
        <h3>All Products ({products.length})</h3>
        <div className="products-table">
          <div className="table-header"><span>Title</span><span>Category</span><span>Price</span><span>Stock</span><span>Actions</span></div>
          {products.map(product => (
            <div key={product.id} className="table-row">
              <span className="product-name">{product.title}</span>
              <span>{product.category}</span>
              <span className="product-price-display">{formatPrice(product.price)}</span>
              <span className={`stock-indicator ${product.stock === 0 ? 'out' : product.stock <= 5 ? 'low' : ''}`}>{product.stock}</span>
              <div className="row-actions">
                <button className="edit-row-btn" onClick={() => handleEdit(product)}>Edit</button>
                <button className="delete-row-btn" onClick={() => handleDelete(product.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductManagement;