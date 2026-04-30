import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedTo: '', deadline: '', priority: 'medium' });

  const fetchProject = () => {
    API.get(`/projects/${id}`).then(res => setProject(res.data)).catch(console.error);
  };

  useEffect(() => {
    fetchProject();
    if (user?.role === 'admin') {
      API.get('/users').then(res => setAllUsers(res.data)).catch(console.error);
    }
  }, [id]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/projects/${id}/members`, { email: memberEmail });
      setMemberEmail('');
      setShowAddMember(false);
      fetchProject();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding member');
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await API.post('/tasks', { ...taskForm, projectId: id });
      setTaskForm({ title: '', description: '', assignedTo: '', deadline: '', priority: 'medium' });
      setShowAddTask(false);
      fetchProject();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await API.delete(`/tasks/${taskId}`);
      fetchProject();
    } catch (err) {
      alert('Error deleting task');
    }
  };

  if (!project) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  const statusColor = { todo: '#f59e0b', 'in-progress': '#3b82f6', done: '#10b981' };
  const priorityColor = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📁 {project.name}</h1>
      <p style={styles.desc}>{project.description}</p>

      {/* Members Section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Team Members</h2>
          {user?.role === 'admin' && (
            <button style={styles.btn} onClick={() => setShowAddMember(!showAddMember)}>+ Add Member</button>
          )}
        </div>
        {showAddMember && (
          <form onSubmit={handleAddMember} style={styles.inlineForm}>
            <input style={styles.input} placeholder="Member email address" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} required />
            <button type="submit" style={styles.btn}>Add</button>
            <button type="button" style={styles.cancelBtn} onClick={() => setShowAddMember(false)}>Cancel</button>
          </form>
        )}
        <div style={styles.memberList}>
          {project.members?.map(member => (
            <div key={member.id} style={styles.memberChip}>
              <span>👤 {member.name}</span>
              <span style={{ ...styles.roleBadge, background: member.role === 'admin' ? '#f59e0b' : '#6366f1' }}>{member.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks Section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Tasks</h2>
          {user?.role === 'admin' && (
            <button style={styles.btn} onClick={() => setShowAddTask(!showAddTask)}>+ Add Task</button>
          )}
        </div>

        {showAddTask && user?.role === 'admin' && (
          <div style={styles.formCard}>
            <form onSubmit={handleAddTask}>
              <input style={styles.input} placeholder="Task Title" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required />
              <textarea style={{ ...styles.input, height: '70px', resize: 'vertical' }} placeholder="Task Description" value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
              <select style={styles.input} value={taskForm.assignedTo} onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })} required>
                <option value="">Assign to...</option>
                {project.members?.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
              </select>
              <input style={styles.input} type="date" value={taskForm.deadline} onChange={e => setTaskForm({ ...taskForm, deadline: e.target.value })} required />
              <select style={styles.input} value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={styles.btn}>Create Task</button>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowAddTask(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {project.tasks?.length === 0 && <p style={{ color: '#6b7280' }}>No tasks yet.</p>}
        {project.tasks?.map(task => {
          const isOverdue = task.status !== 'done' && new Date(task.deadline) < new Date();
          const assignedUser = project.members?.find(m => m.id === task.assignedTo);
          return (
            <div key={task.id} style={{ ...styles.taskCard, borderLeft: `4px solid ${isOverdue ? '#ef4444' : statusColor[task.status]}` }}>
              <div style={styles.taskHeader}>
                <h3 style={styles.taskTitle}>{task.title} {isOverdue && <span style={styles.overdueTag}>OVERDUE</span>}</h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ ...styles.priorityBadge, background: priorityColor[task.priority] }}>{task.priority}</span>
                  <span style={{ ...styles.statusBadge, background: statusColor[task.status] }}>{task.status}</span>
                  {user?.role === 'admin' && (
                    <button style={styles.deleteTaskBtn} onClick={() => handleDeleteTask(task.id)}>Delete</button>
                  )}
                </div>
              </div>
              <p style={styles.taskDesc}>{task.description}</p>
              <div style={styles.taskMeta}>
                <span>👤 {assignedUser?.name || 'Unknown'}</span>
                <span>📅 {task.deadline}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '32px', maxWidth: '1000px', margin: '0 auto' },
  title: { fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '8px' },
  desc: { color: '#6b7280', marginBottom: '32px' },
  section: { background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  sectionTitle: { fontSize: '18px', fontWeight: '700', color: '#111827' },
  btn: { padding: '8px 16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  cancelBtn: { padding: '8px 16px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  inlineForm: { display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', marginBottom: '12px', outline: 'none' },
  formCard: { background: '#f9fafb', borderRadius: '10px', padding: '20px', marginBottom: '16px' },
  memberList: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  memberChip: { display: 'flex', alignItems: 'center', gap: '8px', background: '#f3f4f6', padding: '8px 14px', borderRadius: '20px', fontSize: '14px' },
  roleBadge: { padding: '2px 8px', borderRadius: '10px', color: '#fff', fontSize: '11px', fontWeight: '600' },
  taskCard: { background: '#f9fafb', borderRadius: '10px', padding: '16px', marginBottom: '12px' },
  taskHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' },
  taskTitle: { fontSize: '16px', fontWeight: '600', color: '#111827' },
  taskDesc: { color: '#6b7280', fontSize: '14px', marginBottom: '10px' },
  taskMeta: { display: 'flex', gap: '16px', color: '#6b7280', fontSize: '13px' },
  statusBadge: { padding: '3px 10px', borderRadius: '10px', color: '#fff', fontSize: '12px', fontWeight: '600' },
  priorityBadge: { padding: '3px 10px', borderRadius: '10px', color: '#fff', fontSize: '12px', fontWeight: '600' },
  overdueTag: { background: '#ef4444', color: '#fff', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' },
  deleteTaskBtn: { padding: '4px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }
};

export default ProjectDetail;
