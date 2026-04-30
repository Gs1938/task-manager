import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    API.get('/dashboard').then(res => setStats(res.data)).catch(console.error);
  }, []);

  const cards = stats ? [
    { label: 'Total Tasks', value: stats.totalTasks, color: '#6366f1', icon: '📋' },
    { label: 'To Do', value: stats.todoTasks, color: '#f59e0b', icon: '📌' },
    { label: 'In Progress', value: stats.inProgressTasks, color: '#3b82f6', icon: '🔄' },
    { label: 'Completed', value: stats.doneTasks, color: '#10b981', icon: '✅' },
    { label: 'Overdue', value: stats.overdueTasks, color: '#ef4444', icon: '⚠️' },
    { label: 'Projects', value: stats.totalProjects, color: '#8b5cf6', icon: '📁' },
    ...(user?.role === 'admin' ? [{ label: 'Total Users', value: stats.totalUsers, color: '#06b6d4', icon: '👥' }] : [])
  ] : [];

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome back, {user?.name}! 👋</h1>
      <p style={styles.subtitle}>Here's your task overview</p>
      <div style={styles.grid}>
        {cards.map((card, i) => (
          <div key={i} style={{ ...styles.card, borderTop: `4px solid ${card.color}` }}>
            <div style={styles.cardIcon}>{card.icon}</div>
            <div style={{ ...styles.cardValue, color: card.color }}>{card.value}</div>
            <div style={styles.cardLabel}>{card.label}</div>
          </div>
        ))}
      </div>
      {stats?.overdueTasks > 0 && (
        <div style={styles.alert}>
          ⚠️ You have <strong>{stats.overdueTasks}</strong> overdue task(s). Please complete them as soon as possible!
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '32px', maxWidth: '1200px', margin: '0 auto' },
  title: { fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '8px' },
  subtitle: { color: '#6b7280', marginBottom: '32px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' },
  card: { background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' },
  cardIcon: { fontSize: '28px', marginBottom: '12px' },
  cardValue: { fontSize: '36px', fontWeight: '700', marginBottom: '8px' },
  cardLabel: { color: '#6b7280', fontSize: '14px', fontWeight: '500' },
  alert: { marginTop: '24px', background: '#fee2e2', color: '#dc2626', padding: '16px 20px', borderRadius: '10px', fontSize: '15px' }
};

export default Dashboard;
