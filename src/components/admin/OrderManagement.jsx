import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './ManagerPanel.css';

function ManagerPanel() {
  const { users, setUsers } = useAuth();

  const allUsers = users.filter(u => u.role !== 'manager');

  const updateUserStatus = (userId, newStatus) => {
    const updated = users.map(u =>
      u.id === userId ? { ...u, status: newStatus } : u
    );
    setUsers(updated);
  };

  const updateUserRole = (userId, newRole) => {
    const updated = users.map(u =>
      u.id === userId ? { ...u, role: newRole } : u
    );
    setUsers(updated);
  };

  const removeUser = (userId) => {
    if (window.confirm('Are you sure you want to permanently remove this user?')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'var(--success)';
      case 'suspended': return 'var(--warning)';
      case 'banned': return 'var(--danger)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="manager-panel">
      <h2>Manager Controls</h2>
      <p className="manager-subtitle">Full access to manage all users and permissions</p>

      <div className="users-list">
        <h3>All Users ({allUsers.length})</h3>
        <div className="users-table">
          <div className="table-header">
            <span>User</span>
            <span>Email</span>
            <span>Role</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {allUsers.map(user => (
            <div key={user.id} className="table-row">
              <span className="user-name">{user.name}</span>
              <span className="user-email">{user.email}</span>
              <span>
                <select
                  value={user.role}
                  onChange={(e) => updateUserRole(user.id, e.target.value)}
                  className="role-select"
                >
                  <option value="customer">Customer</option>
                  <option value="staff">Staff</option>
                </select>
              </span>
              <span>
                <span
                  className="status-indicator"
                  style={{
                    background: getStatusColor(user.status || 'active'),
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}
                >
                  {user.status || 'active'}
                </span>
              </span>
              <div className="action-buttons">
                <button
                  className="action-btn suspend"
                  onClick={() => updateUserStatus(user.id, 'suspended')}
                >
                  Suspend
                </button>
                <button
                  className="action-btn ban"
                  onClick={() => updateUserStatus(user.id, 'banned')}
                >
                  Ban
                </button>
                <button
                  className="action-btn restore"
                  onClick={() => updateUserStatus(user.id, 'active')}
                >
                  Restore
                </button>
                <button
                  className="action-btn remove"
                  onClick={() => removeUser(user.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {allUsers.length === 0 && (
            <p className="no-data">No users to manage</p>
          )}
        </div>
      </div>

      <div className="manager-stats">
        <h3>Quick Stats</h3>
        <div className="stats-row">
          <div className="mini-stat">
            <span>Total Users</span>
            <strong>{users.length}</strong>
          </div>
          <div className="mini-stat">
            <span>Staff</span>
            <strong>{users.filter(u => u.role === 'staff').length}</strong>
          </div>
          <div className="mini-stat">
            <span>Customers</span>
            <strong>{users.filter(u => u.role === 'customer').length}</strong>
          </div>
          <div className="mini-stat">
            <span>Banned</span>
            <strong>{users.filter(u => u.status === 'banned').length}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManagerPanel;