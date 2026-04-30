import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';

const Projects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  const fetchProjects = () => {
    API.get('/projects').then(res => setProjects(res.data)).catch(console.error);
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/projects', form);
      setForm({ name: '', description: '' });
      setShowForm(false);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating project');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await API.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      alert('Error deleting project');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Projects</h1>
        {user?.role === 'admin' && (
          <button style={styles.btn} onClick={() => setShowForm(!showForm)}>+ New Project</button>
        )}
      </div>

      {showForm && user?.role === 'admin' && (
        <div style={styles.formCard}>
          <h3 style={{ marginBottom: '16px' }}>Create New Project</h3>
          <form onSubmit={handleCreate}>
            <input style={styles.input} placeholder="Project Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <textarea style={{ ...styles.input, height: '80px', resize: 'vertical' }} placeholder="Project Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={styles.btn} disabled={loading}>{loading ? 'Creating...' : 'Create Project'}</button>
              <button type="button" style={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.grid}>
        {projects.length === 0 && <p style={{ color: '#6b7280' }}>No projects found.</p>}
        {projects.map(project => (
          <div key={project.id} style={styles.card}>
            <div style={styles.cardIcon}>📁</div>
            <h3 style={styles.cardTitle}>{project.name}</h3>
            <p style={styles.cardDesc}>{project.description}</p>
            <div style={styles.cardMeta}>
              <span>📋 {project.taskCount || 0} tasks</span>
              <span>👥 {project.memberCount || 0} members</span>
            </div>
            <div style={styles.cardActions}>
              <button style={styles.viewBtn} onClick={() => navigate(`/projects/${project.id}`)}>View</button>
              {user?.role === 'admin' && (
                <button style={styles.deleteBtn} onClick={() => handleDelete(project.id)}>Delete</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '32px', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '28px', fontWeight: '700', color: '#111827' },
  btn: { padding: '10px 20px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  cancelBtn: { padding: '10px 20px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  formCard: { background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', marginBottom: '12px', outline: 'none' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  card: { background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  cardIcon: { fontSize: '32px', marginBottom: '12px' },
  cardTitle: { fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' },
  cardDesc: { color: '#6b7280', fontSize: '14px', marginBottom: '16px' },
  cardMeta: { display: 'flex', gap: '16px', color: '#6b7280', fontSize: '13px', marginBottom: '16px' },
  cardActions: { display: 'flex', gap: '10px' },
  viewBtn: { padding: '8px 16px', background: 'transparent', color: '#6366f1', border: '1px solid #6366f1', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '13px' },
  deleteBtn: { padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '13px' }
};

export default Projects;
