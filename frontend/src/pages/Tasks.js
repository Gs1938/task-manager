import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');

  const fetchTasks = () => {
    API.get('/tasks').then(res => setTasks(res.data)).catch(console.error);
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleStatusChange = async (taskId, newStatus, assignedTo) => {
    // Member can only update their own task
    if (user?.role !== 'admin' && assignedTo !== user?.id) {
      alert('You can only update your own tasks!');
      return;
    }
    try {
      await API.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await API.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      alert('Error deleting task');
    }
  };

  const filtered = tasks.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'overdue') return t.isOverdue;
    return t.status === filter;
  });

  const statusColor = { todo: '#f59e0b', 'in-progress': '#3b82f6', done: '#10b981' };
  const priorityColor = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        {user?.role === 'admin' ? 'All Tasks' : 'My Tasks'}
      </h1>

      <div style={styles.filters}>
        {['all', 'todo', 'in-progress', 'done', 'overdue'].map(f => (
          <button key={f} style={{ ...styles.filterBtn, ...(filter === f ? styles.activeFilter : {}) }} onClick={() => setFilter(f)}>
            {f === 'all' ? `All (${tasks.length})` :
             f === 'todo' ? `To Do (${tasks.filter(t => t.status === 'todo').length})` :
             f === 'in-progress' ? `In Progress (${tasks.filter(t => t.status === 'in-progress').length})` :
             f === 'done' ? `Done (${tasks.filter(t => t.status === 'done').length})` :
             `Overdue (${tasks.filter(t => t.isOverdue).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 && <p style={{ color: '#6b7280' }}>No tasks found.</p>}

      {filtered.map(task => (
        <div key={task.id} style={{ ...styles.taskCard, borderLeft: `4px solid ${task.isOverdue ? '#ef4444' : statusColor[task.status]}` }}>
          <div style={styles.taskHeader}>
            <div>
              <h3 style={styles.taskTitle}>
                {task.title}
                {task.isOverdue && <span style={styles.overdueTag}>OVERDUE</span>}
              </h3>
              <p style={styles.taskDesc}>{task.description}</p>
            </div>
            <div style={styles.taskActions}>
              <span style={{ ...styles.priorityBadge, background: priorityColor[task.priority] }}>{task.priority}</span>
              {/* Status dropdown - Admin can update any, Member only their own */}
              {(user?.role === 'admin' || task.assignedTo === user?.id) ? (
                <select
                  style={{ ...styles.statusSelect, background: statusColor[task.status] }}
                  value={task.status}
                  onChange={e => handleStatusChange(task.id, e.target.value, task.assignedTo)}
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              ) : (
                <span style={{ ...styles.statusBadge, background: statusColor[task.status] }}>{task.status}</span>
              )}
              {user?.role === 'admin' && (
                <button style={styles.deleteBtn} onClick={() => handleDelete(task.id)}>Delete</button>
              )}
            </div>
          </div>
          <div style={styles.taskMeta}>
            <span>📁 {task.projectName}</span>
            <span>👤 {task.assignedToName}</span>
            <span>📅 {task.deadline}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const styles = {
  container: { padding: '32px', maxWidth: '1000px', margin: '0 auto' },
  title: { fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '24px' },
  filters: { display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' },
  filterBtn: { padding: '8px 16px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  activeFilter: { background: '#6366f1', color: '#fff' },
  taskCard: { background: '#fff', borderRadius: '10px', padding: '20px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  taskHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
  taskTitle: { fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' },
  taskDesc: { color: '#6b7280', fontSize: '14px' },
  taskActions: { display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 },
  taskMeta: { display: 'flex', gap: '16px', color: '#6b7280', fontSize: '13px' },
  priorityBadge: { padding: '4px 10px', borderRadius: '10px', color: '#fff', fontSize: '12px', fontWeight: '600' },
  statusBadge: { padding: '4px 10px', borderRadius: '10px', color: '#fff', fontSize: '12px', fontWeight: '600' },
  statusSelect: { padding: '4px 8px', borderRadius: '10px', color: '#fff', fontSize: '12px', fontWeight: '600', border: 'none', cursor: 'pointer' },
  overdueTag: { background: '#ef4444', color: '#fff', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' },
  deleteBtn: { padding: '4px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }
};

export default Tasks;
