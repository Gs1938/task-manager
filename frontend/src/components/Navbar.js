import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/dashboard" style={styles.brand}>
        📋 TaskFlow
      </Link>
      <div style={styles.links}>
        <Link to="/dashboard" style={styles.link}>Dashboard</Link>
        <Link to="/projects" style={styles.link}>Projects</Link>
        <Link to="/tasks" style={styles.link}>Tasks</Link>
        {user?.role === 'admin' && <Link to="/users" style={styles.link}>Users</Link>}
      </div>
      <div style={styles.userInfo}>
        <span style={styles.userName}>{user?.name}</span>
        <span style={{ ...styles.badge, background: user?.role === 'admin' ? '#f59e0b' : '#6366f1' }}>
          {user?.role?.toUpperCase()}
        </span>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>
    </nav>
  );
};

const styles = {
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: '60px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100 },
  brand: { fontWeight: '700', fontSize: '20px', color: '#6366f1', textDecoration: 'none' },
  links: { display: 'flex', gap: '24px' },
  link: { color: '#374151', textDecoration: 'none', fontWeight: '500', fontSize: '14px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  userName: { fontWeight: '600', color: '#374151', fontSize: '14px' },
  badge: { padding: '2px 10px', borderRadius: '20px', color: '#fff', fontSize: '12px', fontWeight: '600' },
  logoutBtn: { padding: '6px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '13px' }
};

export default Navbar;
