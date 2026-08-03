import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './StaffManagement.css';

function StaffManagement() {
  const { users, setUsers, approveStaff, rejectStaff } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'staff' });

  // Only show STAFF role - EXCLUDE managers and customers
  const approvedStaff = users.filter(u => u.role === 'staff' && u.status === 'approved');
  const pendingStaffList = users.filter(u => u.role === 'staff' && u.status === 'pending');
  const rejectedStaff = users.filter(u => u.role === 'staff' && u.status === 'rejected');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddStaff = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      alert('Please fill in all fields');
      return;
    }

    const existingUser = users.find(u => u.email === formData.email);
    if (existingUser) {
      alert('Email already exists');
      return;
    }

    const newStaff = {
      id: `staff-${Date.now()}`,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: 'staff',
      status: 'approved',
      createdAt: new Date().toISOString()
    };

    setUsers([...users, newStaff]);
    setFormData({ name: '', email: '', password: '', role: 'staff' });
    alert('Staff member added successfully!');
  };

  const handleRemoveStaff = (staffId) => {
    if (window.confirm('Are you sure you want to remove this staff member?')) {
      setUsers(users.filter(u => u.id !== staffId));
    }
  };

  const handleApprove = (staffId) => {
    approveStaff(staffId);
  };

  const handleReject = (staffId) => {
    if (window.confirm('Reject this staff application?')) {
      rejectStaff(staffId);
    }
  };

  return (
    <div className="staff-management">
      <h2>Staff Management</h2>

      {/* Pending Approval Section */}
      {pendingStaffList.length > 0 && (
        <div className="pending-section">
          <h3>Pending Approval ({pendingStaffList.length})</h3>
          <p className="section-desc">These staff registered themselves and need your approval.</p>
          <div className="staff-table">
            <div className="table-header">
              <span>Name</span>
              <span>Email</span>
              <span>Date Registered</span>
              <span>Actions</span>
            </div>
            {pendingStaffList.map(staff => (
              <div key={staff.id} className="table-row pending-row">
                <span className="staff-name">{staff.name}</span>
                <span>{staff.email}</span>
                <span>{new Date(staff.createdAt).toLocaleDateString()}</span>
                <div className="action-buttons">
                  <button className="approve-btn" onClick={() => handleApprove(staff.id)}>Approve</button>
                  <button className="reject-btn" onClick={() => handleReject(staff.id)}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Staff Form */}
      <div className="add-staff-form">
        <h3>Add Staff Member</h3>
        <p className="section-desc">Staff added here are automatically approved.</p>
        <div className="form-row">
          <div className="form-group">
            <label>Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Full name" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Email address" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Password" minLength="6" />
          </div>
        </div>
        <button onClick={handleAddStaff} className="add-btn">Add Staff Member</button>
      </div>

      {/* Approved Staff List */}
      <div className="staff-list">
        <h3>Approved Staff ({approvedStaff.length})</h3>
        {approvedStaff.length === 0 ? (
          <p className="no-data">No approved staff members yet.</p>
        ) : (
          <div className="staff-table">
            <div className="table-header">
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {approvedStaff.map(staff => (
              <div key={staff.id} className="table-row">
                <span className="staff-name">{staff.name}</span>
                <span>{staff.email}</span>
                <span className="role-badge staff">staff</span>
                <span className="status-badge approved">approved</span>
                <button className="remove-btn" onClick={() => handleRemoveStaff(staff.id)}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rejected Staff */}
      {rejectedStaff.length > 0 && (
        <div className="staff-list" style={{ marginTop: '1.5rem', opacity: 0.7 }}>
          <h3>Rejected ({rejectedStaff.length})</h3>
          <div className="staff-table">
            <div className="table-header">
              <span>Name</span>
              <span>Email</span>
              <span>Status</span>
            </div>
            {rejectedStaff.map(staff => (
              <div key={staff.id} className="table-row">
                <span className="staff-name">{staff.name}</span>
                <span>{staff.email}</span>
                <span className="status-badge rejected">rejected</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffManagement;