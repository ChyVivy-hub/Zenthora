import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import StatsCard from '../ui/StatsCard'
import DataTable from '../ui/DataTable'
import ActivityFeed from '../ui/ActivityFeed'
import RevenueChart from './charts/RevenueChart'
import SalesChart from './charts/SalesChart'
import Sidebar from '../layout/Sidebar/Sidebar'
import DashboardHeader from '../layout/DashboardHeader'
import ProfileSettings from './ProfileSettings'
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  UserX,
  UserCheck,
  UserCog,
  X,
  Save,
  Plus,
  Shield,
  UserPlus,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import './ManagerDashboard.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

// Helper: relative time
const getTimeAgo = (timestamp) => {
  if (!timestamp) return 'Unknown'
  const now = Date.now()
  const then = new Date(timestamp).getTime()
  const diff = Math.floor((now - then) / 1000)

  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`
  return new Date(timestamp).toLocaleDateString()
}

function ManagerDashboard({ addToast }) {
  const navigate = useNavigate()
  const { products, setProducts, orders, updateOrderStatus, formatPrice, selectedCountry } = useApp()
  const { user, logout, users, setUsers, approveStaff, rejectStaff, suspendUser, banUser, restoreUser, removeUser, updateUserPermissions } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('manager_tab') || 'overview'
  })

  const [editingOrder, setEditingOrder] = useState(null)
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    customerEmail: '',
    productName: '',
    amount: '',
    status: '',
  })

  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: 'Movies',
    stock: '',
    description: '',
    publisher: '',
    author: '',
    image: '',
    video: '',
  })
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)

  const [showAddStaff, setShowAddStaff] = useState(false)
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: 'staff' })

  const [showPermissions, setShowPermissions] = useState(null)
  const [permissions, setPermissions] = useState({
    canEditOrders: true,
    canEditProducts: true,
    canViewCustomers: true,
  })

  const showToast = (message, type = 'success') => {
    if (addToast) {
      addToast(message, type)
    } else {
      console.log(`[${type}] ${message}`)
    }
  }

  useEffect(() => {
    localStorage.setItem('manager_tab', activeTab)
  }, [activeTab])

  // =============================================
  // USE MEMO FOR STAFF LISTS – REACTIVE TO users
  // =============================================
  const approvedStaff = useMemo(() => {
    return users.filter((u) => u.role === 'staff' && u.status === 'approved')
  }, [users])

  const pendingStaffList = useMemo(() => {
    return users.filter((u) => u.role === 'staff' && u.status === 'pending')
  }, [users])

  const customers = useMemo(() => {
    return users.filter((u) => u.role === 'customer')
  }, [users])

  const handleSearch = (query) => {
    if (!query || query.length < 2) return []
    const q = query.toLowerCase()
    const results = []
    orders.forEach((order) => {
      const customer = order.shipping_info?.firstName || order.shippingInfo?.firstName || ''
      if (order.id.toLowerCase().includes(q) || customer.toLowerCase().includes(q)) {
        results.push(`Order #${order.id} - ${customer}`)
      }
    })
    products.forEach((product) => {
      if (product.title.toLowerCase().includes(q)) {
        results.push(`Product: ${product.title}`)
      }
    })
    users.forEach((u) => {
      if (u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)) {
        results.push(`User: ${u.name} (${u.email})`)
      }
    })
    return results.slice(0, 10)
  }

  const handleLogout = () => {
    logout()
    navigate('/manager-login')
  }

  const totalRevenue = orders.reduce((sum, o) => sum + (parseInt(o.total) || 0), 0)
  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const confirmedOrders = orders.filter(o => o.status === 'confirmed').length
  const shippedOrders = orders.filter(o => o.status === 'shipped').length
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length
  const totalCustomers = customers.length
  const totalStaff = approvedStaff.length
  const pendingStaff = pendingStaffList.length
  const lowStockItems = products.filter(p => parseInt(p.stock) <= 5 && parseInt(p.stock) > 0).length
  const outOfStockItems = products.filter(p => parseInt(p.stock) === 0).length

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthlyRevenue = monthLabels.map((_, index) =>
    orders.filter(order => new Date(order.created_at || order.date || Date.now()).getMonth() === index)
      .reduce((sum, order) => sum + (parseInt(order.total) || 0), 0)
  )
  const monthlyOrders = monthLabels.map((_, index) =>
    orders.filter(order => new Date(order.created_at || order.date || Date.now()).getMonth() === index).length
  )
  const revenueData = monthLabels.map((name, i) => ({ name, value: monthlyRevenue[i] }))
  const ordersData = monthLabels.map((name, i) => ({ name, value: monthlyOrders[i] }))

  // Activity feed with real times
  const activities = React.useMemo(() => {
    const recentOrders = orders.slice(0, 5)
    const activityList = []
    recentOrders.forEach((order) => {
      const customerName = order.shipping_info?.firstName || order.shippingInfo?.firstName || 'Customer'
      activityList.push({
        icon: '🛒',
        text: `${customerName} placed order #${order.id}`,
        time: getTimeAgo(order.created_at),
      })
    })
    if (pendingStaff > 0) {
      const firstPending = users.find(u => u.status === 'pending')
      activityList.push({
        icon: '👤',
        text: `${pendingStaff} staff member(s) awaiting approval`,
        time: getTimeAgo(firstPending?.created_at),
      })
    }
    return activityList.slice(0, 6)
  }, [orders, pendingStaff, users])

  // ========== ORDER FUNCTIONS ==========
  const openEditOrder = (order) => {
    setEditingOrder(order)
    setOrderForm({
      customerName: order.shipping_info?.firstName || order.shippingInfo?.firstName || '',
      customerEmail: order.shipping_info?.email || order.shippingInfo?.email || '',
      productName: order.items?.[0]?.title || '',
      amount: order.total?.toString() || '',
      status: order.status || 'pending',
    })
  }

  const closeEditOrder = () => {
    setEditingOrder(null)
    setOrderForm({ customerName: '', customerEmail: '', productName: '', amount: '', status: '' })
  }

  const saveOrderEdit = () => {
  if (editingOrder) {
    const previousStatus = editingOrder.status
    updateOrderStatus(editingOrder.id, orderForm.status)

    // Send status update email only if email is present
    if (orderForm.customerEmail && orderForm.customerEmail.includes('@')) {
      try {
        fetch(`${BACKEND_URL}/api/send-status-update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: orderForm.customerEmail,
            name: orderForm.customerName || 'Customer',
            orderId: editingOrder.id,
            status: orderForm.status,
            previousStatus: previousStatus,
          }),
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) console.log('✅ Status email sent')
          else console.warn('⚠️ Email not sent:', data.message)
        })
        .catch(err => console.error('❌ Email fetch error:', err))
      } catch (error) {
        console.error('Email failed:', error)
      }
    } else {
      console.warn('⚠️ Skipping status email – no valid email address')
    }

    closeEditOrder()
    showToast(`Order #${editingOrder.id} updated successfully`, 'success')
  }
}

  // ========== PRODUCT FUNCTIONS ==========
  const saveProducts = (newProducts) => {
    setProducts(newProducts)
    localStorage.setItem('zenthora_products', JSON.stringify(newProducts))
  }

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 500000) {
      showToast('Image must be less than 500KB', 'error')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target.result
      setFormData({ ...formData, image: base64 })
      setImagePreview(base64)
      showToast('Image uploaded successfully', 'success')
    }
    reader.readAsDataURL(file)
  }

  const clearForm = () => {
    setFormData({
      title: '',
      price: '',
      category: 'Movies',
      stock: '',
      description: '',
      publisher: '',
      author: '',
      image: '',
      video: '',
    })
    setImagePreview(null)
    setEditingProduct(null)
  }

  const handleAddProduct = (e) => {
    e.preventDefault()
    if (!formData.title || !formData.price) {
      showToast('Please fill in title and price', 'error')
      return
    }
    const newProduct = {
      id: 'prod-' + Date.now(),
      title: formData.title,
      price: formData.price,
      category: formData.category,
      stock: parseInt(formData.stock) || 10,
      description: formData.description,
      publisher: formData.publisher,
      author: formData.author,
      image: formData.image || null,
      video: formData.video || null,
      rating: 0,
      releaseYear: 2026,
      currency: 'NGN',
      country: 'Manager',
    }
    saveProducts([newProduct, ...products])
    clearForm()
    showToast(`"${newProduct.title}" added successfully`, 'success')
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setFormData({
      title: product.title,
      price: product.price,
      category: product.category,
      stock: product.stock,
      description: product.description || '',
      publisher: product.publisher || '',
      author: product.author || '',
      image: product.image || '',
      video: product.video || '',
    })
    setImagePreview(product.image || null)
    setActiveTab('products')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleUpdateProduct = (e) => {
    e.preventDefault()
    if (!editingProduct) return
    saveProducts(
      products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              title: formData.title,
              price: formData.price,
              category: formData.category,
              stock: parseInt(formData.stock) || 10,
              description: formData.description,
              publisher: formData.publisher,
              author: formData.author,
              image: formData.image,
              video: formData.video,
            }
          : p
      )
    )
    clearForm()
    showToast(`"${editingProduct.title}" updated successfully`, 'success')
  }

  const handleDeleteProduct = (id) => {
    const productToDelete = products.find(p => p.id === id)
    if (window.confirm(`Delete "${productToDelete?.title || 'product'}"?`)) {
      saveProducts(products.filter((p) => p.id !== id))
      showToast(`Product deleted successfully`, 'success')
    }
  }

  // ========== STAFF FUNCTIONS ==========
  const handleAddStaff = () => {
    if (!newStaff.name || !newStaff.email || !newStaff.password) {
      showToast('Please fill all fields', 'error')
      return
    }
    const existing = users.find(u => u.email === newStaff.email)
    if (existing) {
      showToast('Email already exists', 'error')
      return
    }
    const staff = {
      id: 'staff-' + Date.now(),
      name: newStaff.name,
      email: newStaff.email,
      password: newStaff.password,
      role: 'staff',
      status: 'approved',
      created_at: new Date().toISOString(),
      permissions: {
        canEditOrders: true,
        canEditProducts: true,
        canViewCustomers: true,
      }
    }
    const updatedUsers = [...users, staff]
    setUsers(updatedUsers)
    localStorage.setItem('zenthora_users', JSON.stringify(updatedUsers))
    setShowAddStaff(false)
    setNewStaff({ name: '', email: '', password: '', role: 'staff' })
    showToast(`Staff "${staff.name}" added successfully`, 'success')
  }

  const handlePermissions = (staff) => {
    const existingPerms = staff.permissions || {
      canEditOrders: true,
      canEditProducts: true,
      canViewCustomers: true,
    }
    setShowPermissions(staff)
    setPermissions(existingPerms)
  }

  const savePermissions = () => {
    if (!showPermissions) return
    updateUserPermissions(showPermissions.id, permissions)
    setShowPermissions(null)
    showToast(`Permissions updated for ${showPermissions.name}`, 'success')
  }

  // =============================================
  // RENDER FUNCTIONS
  // =============================================

  const renderOverview = () => (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h1>Overview</h1>
        <span className="dashboard-date">{new Date().toLocaleDateString('en-NG', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
      </div>

      <div className="stats-grid">
        <StatsCard title="Total Revenue" value={formatPrice(totalRevenue)} icon={<DollarSign size={24} />} trend="+12.5%" trendDirection="up" data={revenueData.slice(-6)} color="primary" />
        <StatsCard title="Total Orders" value={totalOrders} icon={<ShoppingBag size={24} />} trend="+8.2%" trendDirection="up" data={ordersData.slice(-6)} color="success" />
        <StatsCard title="Customers" value={totalCustomers} icon={<Users size={24} />} trend="+5.4%" trendDirection="up" color="info" />
        <StatsCard title="Products" value={products.length} icon={<Package size={24} />} trend="+3.1%" trendDirection="up" color="warning" />
        <StatsCard title="Pending Orders" value={pendingOrders} icon={<Clock size={24} />} trend={pendingOrders > 0 ? `${pendingOrders} needs action` : ''} color="warning" />
        <StatsCard title="Low Stock" value={lowStockItems} icon={<AlertCircle size={24} />} trend={outOfStockItems > 0 ? `${outOfStockItems} out of stock` : 'All stocked'} color="danger" />
      </div>

      <div className="charts-grid">
        <RevenueChart data={revenueData} title="Revenue Trend" />
        <SalesChart data={ordersData} title="Orders Trend" />
      </div>

      <div className="table-section">
        <DataTable
          title="Recent Orders"
          data={orders.slice(0, 5)}
          columns={[
            { key: 'id', label: 'Order ID' },
            { key: 'customer', label: 'Customer', render: (_, row) => row.shipping_info?.firstName || row.shippingInfo?.firstName || 'N/A' },
            { key: 'total', label: 'Amount', render: (v) => formatPrice(v) },
            { key: 'status', label: 'Status' },
          ]}
          searchable
          sortable
          paginated
          pageSize={5}
          statusKey="status"
          statusMap={{
            pending: { label: 'Pending', className: 'status-pending' },
            confirmed: { label: 'Confirmed', className: 'status-confirmed' },
            shipped: { label: 'Shipped', className: 'status-shipped' },
            delivered: { label: 'Delivered', className: 'status-delivered' },
            cancelled: { label: 'Cancelled', className: 'status-cancelled' },
          }}
          actions={
            <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('orders')}>
              View All
            </button>
          }
          onRowClick={(row) => openEditOrder(row)}
        />
      </div>

      <div className="activity-section">
        <ActivityFeed activities={activities} />
      </div>
    </div>
  )

  const renderOrders = () => (
    <div className="dashboard-content">
      <div className="section-header">
        <h1>Orders</h1>
      </div>
      <DataTable
        data={orders}
        columns={[
          { key: 'id', label: 'Order ID' },
          { key: 'customer', label: 'Customer', render: (_, row) => row.shipping_info?.firstName || row.shippingInfo?.firstName || 'N/A' },
          {
            key: 'created_at',
            label: 'Date',
            render: (v, row) => {
              const date = row.created_at || row.date
              return date ? new Date(date).toLocaleDateString() : 'N/A'
            }
          },
          { key: 'total', label: 'Amount', render: (v) => formatPrice(v) },
          { key: 'status', label: 'Status' },
          {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
              <button className="btn btn-sm btn-primary" onClick={() => openEditOrder(row)}>
                <Edit size={14} /> Edit
              </button>
            ),
          },
        ]}
        searchable
        sortable
        paginated
        pageSize={10}
        statusKey="status"
        statusMap={{
          pending: { label: 'Pending', className: 'status-pending' },
          confirmed: { label: 'Confirmed', className: 'status-confirmed' },
          shipped: { label: 'Shipped', className: 'status-shipped' },
          delivered: { label: 'Delivered', className: 'status-delivered' },
          cancelled: { label: 'Cancelled', className: 'status-cancelled' },
        }}
        onRowClick={(row) => openEditOrder(row)}
      />
    </div>
  )

  const renderProducts = () => (
    <div className="dashboard-content">
      <div className="section-header">
        <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
      </div>
      <div className="product-form-wrapper">
        <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="product-form">
          <div className="form-row">
            <div className="form-group">
              <label>Product Title</label>
              <input name="title" value={formData.title} onChange={handleFormChange} placeholder="Enter product title" required />
            </div>
            <div className="form-group">
              <label>Price (₦)</label>
              <input name="price" value={formData.price} onChange={handleFormChange} placeholder="0" required type="number" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleFormChange}>
                <option value="Movies">Movies</option>
                <option value="Books">Books</option>
                <option value="Manga">Manga</option>
                <option value="Comics">Comics</option>
              </select>
            </div>
            <div className="form-group">
              <label>Stock Quantity</label>
              <input name="stock" value={formData.stock} onChange={handleFormChange} placeholder="0" type="number" required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Publisher</label>
              <input name="publisher" value={formData.publisher} onChange={handleFormChange} placeholder="Publisher name" />
            </div>
            <div className="form-group">
              <label>Author</label>
              <input name="author" value={formData.author} onChange={handleFormChange} placeholder="Author name" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>YouTube Video URL</label>
              <input name="video" value={formData.video} onChange={handleFormChange} placeholder="https://youtube.com/..." />
            </div>
          </div>

          <div className="form-group">
            <label>Product Image</label>
            <div className="image-upload-wrapper">
              <input
                name="image"
                value={formData.image}
                onChange={handleFormChange}
                placeholder="Paste image URL or upload below"
                className="image-url-input"
              />
              <span className="upload-divider">OR</span>
              <button type="button" className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
                📁 Upload File
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </div>
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
                <button type="button" className="remove-image" onClick={() => { setImagePreview(null); setFormData({ ...formData, image: '' }) }}>✕</button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleFormChange} placeholder="Product description" rows="4" />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-lg">
              {editingProduct ? <><Save size={16} /> Update Product</> : <><Plus size={16} /> Add Product</>}
            </button>
            {editingProduct && (
              <button type="button" className="btn btn-secondary" onClick={clearForm}>Cancel</button>
            )}
          </div>
        </form>
      </div>

      <div className="products-table-wrapper">
        <h3>All Products ({products.length})</h3>
        <DataTable
          data={products}
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'category', label: 'Category' },
            { key: 'price', label: 'Price', render: (v) => formatPrice(v) },
            { key: 'stock', label: 'Stock', render: (v) => <span className={parseInt(v) <= 5 ? 'stock-low' : ''}>{v}</span> },
            {
              key: 'actions',
              label: 'Actions',
              render: (_, row) => (
                <div className="action-buttons">
                  <button className="btn btn-sm btn-primary" onClick={() => handleEditProduct(row)}>
                    <Edit size={14} /> Edit
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDeleteProduct(row.id)}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              ),
            },
          ]}
          searchable
          sortable
          paginated
          pageSize={10}
        />
      </div>
    </div>
  )

  // =============================================
  // STAFF TAB – Uses useMemo lists
  // =============================================
  const renderStaff = () => (
    <div className="dashboard-content">
      <div className="section-header">
        <h1>Staff Management</h1>
        <button className="btn btn-primary" onClick={() => setShowAddStaff(true)}>
          <UserPlus size={16} /> Add Staff
        </button>
      </div>

      {pendingStaffList.length > 0 && (
        <div className="pending-section">
          <h3><Clock size={18} style={{ display: 'inline', marginRight: '0.5rem' }} /> Pending Approval ({pendingStaffList.length})</h3>
          <DataTable
            data={pendingStaffList}
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'created_at', label: 'Date', render: (v) => new Date(v).toLocaleDateString() },
              {
                key: 'actions',
                label: 'Actions',
                render: (_, row) => (
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => {
                        approveStaff(row.id)
                        showToast(`Staff "${row.name}" approved`, 'success')
                      }}
                    >
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => {
                        rejectStaff(row.id)
                        showToast(`Staff "${row.name}" rejected`, 'info')
                      }}
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}

      <h3 className="staff-section-title">Approved Staff ({approvedStaff.length})</h3>
      <DataTable
        data={approvedStaff}
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role', render: () => 'Staff' },
          { key: 'status', label: 'Status', render: () => <span className="status-badge status-approved">Approved</span> },
          {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
              <div className="action-buttons">
                <button className="btn btn-sm btn-warning" onClick={() => handlePermissions(row)}>
                  <Shield size={14} /> Permissions
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => {
                    removeUser(row.id)
                    showToast(`Staff "${row.name}" removed`, 'info')
                  }}
                >
                  <UserX size={14} /> Remove
                </button>
              </div>
            ),
          },
        ]}
      />
    </div>
  )

  // =============================================
  // CUSTOMERS TAB – Uses useMemo customers
  // =============================================
  const renderCustomers = () => (
    <div className="dashboard-content">
      <div className="section-header">
        <h1>Customers</h1>
      </div>
      <DataTable
        data={customers}
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'status', label: 'Status' },
          {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
              <div className="action-buttons">
                <button
                  className="btn btn-sm btn-warning"
                  onClick={() => {
                    suspendUser(row.id)
                    showToast(`Customer "${row.name}" suspended`, 'warning')
                  }}
                >
                  <UserCog size={14} /> Suspend
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => {
                    banUser(row.id)
                    showToast(`Customer "${row.name}" banned`, 'error')
                  }}
                >
                  <UserX size={14} /> Ban
                </button>
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => {
                    restoreUser(row.id)
                    showToast(`Customer "${row.name}" restored`, 'success')
                  }}
                >
                  <UserCheck size={14} /> Restore
                </button>
              </div>
            ),
          },
        ]}
        searchable
        sortable
        paginated
        pageSize={10}
        statusKey="status"
        statusMap={{
          active: { label: 'Active', className: 'status-active' },
          suspended: { label: 'Suspended', className: 'status-suspended' },
          banned: { label: 'Banned', className: 'status-banned' },
        }}
      />
    </div>
  )

  // =============================================
  // ADVANCED ANALYTICS – Updated with 4 new charts
  // =============================================
  const renderAnalytics = () => {
    // Compute Top Selling Products
    const productSales = {}
    orders.forEach(order => {
      order.items?.forEach(item => {
        const key = item.title
        if (!productSales[key]) productSales[key] = 0
        productSales[key] += (parseFloat(item.price) || 0) * (item.qty || 1)
      })
    })
    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }))

    // Sales by Category
    const categorySales = {}
    orders.forEach(order => {
      order.items?.forEach(item => {
        const cat = item.category || 'Other'
        if (!categorySales[cat]) categorySales[cat] = 0
        categorySales[cat] += (parseFloat(item.price) || 0) * (item.qty || 1)
      })
    })
    const categoryData = Object.entries(categorySales).map(([name, value]) => ({ name, value }))

    // Revenue vs Orders (monthly)
    const monthlyRevenueData = monthLabels.map((_, idx) => ({
      month: monthLabels[idx],
      revenue: monthlyRevenue[idx] || 0,
      orders: monthlyOrders[idx] || 0,
    }))

    const COLORS = ['#f84750', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6']

    return (
      <div className="dashboard-content">
        <div className="section-header">
          <h1>Analytics</h1>
        </div>

        {/* Existing charts */}
        <div className="analytics-grid">
          <RevenueChart data={revenueData} title="Revenue Trend" />
          <SalesChart data={ordersData} title="Orders Trend" />
        </div>

        {/* Advanced charts */}
        <div className="analytics-grid" style={{ marginTop: '1.5rem' }}>
          <div className="chart-container">
            <h3>Top Selling Products</h3>
            <div className="chart-wrapper" style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={topProducts}>
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip formatter={(v) => formatPrice(v)} />
                  <Bar dataKey="value" fill="#f84750" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-container">
            <h3>Sales by Category</h3>
            <div className="chart-wrapper" style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {categoryData.map((entry, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatPrice(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-container" style={{ gridColumn: '1 / -1' }}>
            <h3>Revenue vs Orders (Monthly)</h3>
            <div className="chart-wrapper" style={{ height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyRevenueData}>
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    formatter={(v, name) => {
                      if (name === 'Revenue') return formatPrice(v)
                      return v
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" fill="#f84750" name="Revenue" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10B981" name="Orders" strokeWidth={3} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Existing stats cards */}
        <div className="stats-grid" style={{ marginTop: '1.5rem' }}>
          <StatsCard title="Total Revenue" value={formatPrice(totalRevenue)} icon={<DollarSign size={24} />} color="primary" />
          <StatsCard title="Avg Order Value" value={formatPrice(totalOrders ? totalRevenue / totalOrders : 0)} icon={<ShoppingBag size={24} />} color="success" />
          <StatsCard title="Conversion Rate" value={`${totalCustomers ? Math.round((totalOrders / totalCustomers) * 100) : 0}%`} icon={<Users size={24} />} color="info" />
          <StatsCard title="Cancelled Orders" value={cancelledOrders} icon={<XCircle size={24} />} color="danger" />
        </div>
      </div>
    )
  }

  const renderProfile = () => <ProfileSettings />

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview()
      case 'orders': return renderOrders()
      case 'products': return renderProducts()
      case 'staff': return renderStaff()
      case 'customers': return renderCustomers()
      case 'analytics': return renderAnalytics()
      case 'profile': return renderProfile()
      default: return renderOverview()
    }
  }

  return (
    <div className="manager-dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className={`manager-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <DashboardHeader onSearch={handleSearch} />
        <main className="manager-main-content">{renderContent()}</main>
      </div>

      {editingOrder && (
        <div className="modal-overlay" onClick={closeEditOrder}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Order #{editingOrder.id}</h2>
              <button className="modal-close" onClick={closeEditOrder}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Customer Name</label>
                <input value={orderForm.customerName} onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Customer Email</label>
                <input value={orderForm.customerEmail} onChange={(e) => setOrderForm({ ...orderForm, customerEmail: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Product Name</label>
                <input value={orderForm.productName} onChange={(e) => setOrderForm({ ...orderForm, productName: e.target.value })} />
              </div>
              <div className="form-row-modal">
                <div className="form-group">
                  <label>Amount (₦)</label>
                  <input type="number" value={orderForm.amount} onChange={(e) => setOrderForm({ ...orderForm, amount: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={orderForm.status} onChange={(e) => setOrderForm({ ...orderForm, status: e.target.value })}>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeEditOrder}>Cancel</button>
              <button className="btn btn-primary" onClick={saveOrderEdit}><Save size={16} /> Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {showAddStaff && (
        <div className="modal-overlay" onClick={() => setShowAddStaff(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Staff Member</h2>
              <button className="modal-close" onClick={() => setShowAddStaff(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                  placeholder="Enter password (min 6 chars)"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAddStaff(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddStaff}><UserPlus size={16} /> Add Staff</button>
            </div>
          </div>
        </div>
      )}

      {showPermissions && (
        <div className="modal-overlay" onClick={() => setShowPermissions(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Permissions – {showPermissions.name}</h2>
              <button className="modal-close" onClick={() => setShowPermissions(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="permission-item">
                <label>
                  <input
                    type="checkbox"
                    checked={permissions.canEditOrders}
                    onChange={(e) => setPermissions({ ...permissions, canEditOrders: e.target.checked })}
                  />
                  Can Edit Orders
                </label>
              </div>
              <div className="permission-item">
                <label>
                  <input
                    type="checkbox"
                    checked={permissions.canEditProducts}
                    onChange={(e) => setPermissions({ ...permissions, canEditProducts: e.target.checked })}
                  />
                  Can Edit Products
                </label>
              </div>
              <div className="permission-item">
                <label>
                  <input
                    type="checkbox"
                    checked={permissions.canViewCustomers}
                    onChange={(e) => setPermissions({ ...permissions, canViewCustomers: e.target.checked })}
                  />
                  Can View Customers
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowPermissions(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={savePermissions}><Save size={16} /> Save Permissions</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManagerDashboard