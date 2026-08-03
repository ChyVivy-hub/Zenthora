import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import StatsCard from '../ui/StatsCard'
import DataTable from '../ui/DataTable'
import Sidebar from '../layout/Sidebar/Sidebar'
import DashboardHeader from '../layout/DashboardHeader'
import ProfileSettings from './ProfileSettings'
import { ShoppingBag, Package, Clock, AlertCircle, Edit, Save, X } from 'lucide-react'
import './StaffDashboard.css'


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

function StaffDashboard({ addToast }) {
  const navigate = useNavigate()
  const { products, setProducts, orders, updateOrderStatus, formatPrice, selectedCountry } = useApp()
  const { user, logout, users } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('staff_tab') || 'overview'
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
  const [productEditForm, setProductEditForm] = useState({
    title: '',
    price: '',
    stock: '',
  })

  const showToast = (message, type = 'success') => {
    if (addToast) {
      addToast(message, type)
    } else {
      console.log(`[${type}] ${message}`)
    }
  }

  useEffect(() => {
    localStorage.setItem('staff_tab', activeTab)
  }, [activeTab])

  const handleLogout = () => {
    logout()
    navigate('/staff-login')
  }

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
    return results.slice(0, 10)
  }

  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const lowStockItems = products.filter(p => parseInt(p.stock) <= 5 && parseInt(p.stock) > 0).length
  const outOfStockItems = products.filter(p => parseInt(p.stock) === 0).length

  const staffPermissions = user?.permissions || {
    canEditOrders: true,
    canEditProducts: true,
    canViewCustomers: true,
  }

  const openEditOrder = (order) => {
    if (!staffPermissions.canEditOrders) {
      showToast('You do not have permission to edit orders', 'error')
      return
    }
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

  const openEditProduct = (product) => {
    if (!staffPermissions.canEditProducts) {
      showToast('You do not have permission to edit products', 'error')
      return
    }
    setEditingProduct(product)
    setProductEditForm({
      title: product.title || '',
      price: product.price || '',
      stock: product.stock || '',
    })
  }

  const closeEditProduct = () => {
    setEditingProduct(null)
    setProductEditForm({ title: '', price: '', stock: '' })
  }

  const saveProductEdit = () => {
    if (!editingProduct) return
    const updatedProducts = products.map((p) =>
      p.id === editingProduct.id
        ? {
            ...p,
            title: productEditForm.title,
            price: productEditForm.price,
            stock: parseInt(productEditForm.stock) || 10,
          }
        : p
    )
    setProducts(updatedProducts)
    localStorage.setItem('zenthora_products', JSON.stringify(updatedProducts))
    closeEditProduct()
    showToast(`"${editingProduct.title}" updated successfully`, 'success')
  }

  const renderOverview = () => (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h1>Staff Overview</h1>
        <span className="dashboard-date">{new Date().toLocaleDateString('en-NG', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
      </div>

      <div className="stats-grid">
        <StatsCard title="Pending Orders" value={pendingOrders} icon={<Clock size={24} />} trend={pendingOrders > 0 ? `${pendingOrders} needs action` : ''} color="warning" />
        <StatsCard title="Total Orders" value={totalOrders} icon={<ShoppingBag size={24} />} color="primary" />
        <StatsCard title="Products" value={products.length} icon={<Package size={24} />} color="info" />
        <StatsCard title="Low Stock" value={lowStockItems} icon={<AlertCircle size={24} />} trend={outOfStockItems > 0 ? `${outOfStockItems} out of stock` : 'All stocked'} color="danger" />
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
            {
              key: 'actions',
              label: 'Actions',
              render: (_, row) => (
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => openEditOrder(row)}
                  disabled={!staffPermissions.canEditOrders}
                >
                  <Edit size={14} /> Edit
                </button>
              ),
            },
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
        />
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
              <button
                className="btn btn-sm btn-primary"
                onClick={() => openEditOrder(row)}
                disabled={!staffPermissions.canEditOrders}
              >
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
        <h1>Products</h1>
      </div>
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
              <button
                className="btn btn-sm btn-primary"
                onClick={() => openEditProduct(row)}
                disabled={!staffPermissions.canEditProducts}
              >
                <Edit size={14} /> Edit
              </button>
            ),
          },
        ]}
        searchable
        sortable
        paginated
        pageSize={10}
      />
    </div>
  )

  const renderCustomers = () => {
    const customers = users.filter((u) => u.role === 'customer')

    return (
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
  }

  const renderProfile = () => <ProfileSettings />

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview()
      case 'orders': return renderOrders()
      case 'products': return renderProducts()
      case 'customers': return renderCustomers()
      case 'profile': return renderProfile()
      default: return renderOverview()
    }
  }

  return (
    <div className="staff-dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className={`staff-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <DashboardHeader onSearch={handleSearch} />
        <main className="staff-main-content">{renderContent()}</main>
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

      {editingProduct && (
        <div className="modal-overlay" onClick={closeEditProduct}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Product</h2>
              <button className="modal-close" onClick={closeEditProduct}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Product Title</label>
                <input
                  value={productEditForm.title}
                  onChange={(e) => setProductEditForm({ ...productEditForm, title: e.target.value })}
                  placeholder="Product title"
                />
              </div>
              <div className="form-row-modal">
                <div className="form-group">
                  <label>Price (₦)</label>
                  <input
                    type="number"
                    value={productEditForm.price}
                    onChange={(e) => setProductEditForm({ ...productEditForm, price: e.target.value })}
                    placeholder="Price"
                  />
                </div>
                <div className="form-group">
                  <label>Stock</label>
                  <input
                    type="number"
                    value={productEditForm.stock}
                    onChange={(e) => setProductEditForm({ ...productEditForm, stock: e.target.value })}
                    placeholder="Stock"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeEditProduct}>Cancel</button>
              <button className="btn btn-primary" onClick={saveProductEdit}><Save size={16} /> Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffDashboard