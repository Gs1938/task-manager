import React, { useState, useEffect } from 'react';
import API from '../api';

const Users = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = () => {
    API.get('/users').then(res => setUsers(res.data)).catch(console.error);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await API.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert('Error deleting user');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Users Management</h1>
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Joined</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={styles.tr}>
                <td style={styles.td}>👤 {user.name}</td>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, background: user.role === 'admin' ? '#f59e0b' : '#6366f1' }}>
                    {user.role}
                  </span>
                </td>
                <td style={styles.td}>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td style={styles.td}>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(user.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '32px', maxWidth: '1000px', margin: '0 auto' },
  title: { fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '24px' },
  tableWrapper: { background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f9fafb' },
  th: { padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280', borderBottom: '1px solid #e5e7eb' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '14px 16px', fontSize: '14px', color: '#374151' },
  badge: { padding: '3px 10px', borderRadius: '10px', color: '#fff', fontSize: '12px', fontWeight: '600' },
  deleteBtn: { padding: '5px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }
};

export default Users;
