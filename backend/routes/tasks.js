const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Get tasks
// Admin sees all tasks, Member sees only their assigned tasks
router.get('/', authMiddleware, (req, res) => {
  try {
    let tasks = db.get('tasks').value();

    if (req.user.role !== 'admin') {
      // Member can only see tasks assigned to them
      tasks = tasks.filter(t => t.assignedTo === req.user.id);
    }

    const tasksWithDetails = tasks.map(task => {
      const project = db.get('projects').find({ id: task.projectId }).value();
      const assignedUser = db.get('users').find({ id: task.assignedTo }).value();
      const now = new Date();
      const deadline = new Date(task.deadline);
      const isOverdue = task.status !== 'done' && deadline < now;

      return {
        ...task,
        projectName: project ? project.name : 'Unknown',
        assignedToName: assignedUser ? assignedUser.name : 'Unknown',
        isOverdue
      };
    });

    res.json(tasksWithDetails);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create task - Admin only
router.post('/', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { title, description, projectId, assignedTo, deadline, priority } = req.body;
    if (!title || !projectId || !assignedTo || !deadline) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const project = db.get('projects').find({ id: projectId }).value();
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const assignedUser = db.get('users').find({ id: assignedTo }).value();
    if (!assignedUser) return res.status(404).json({ message: 'User not found' });

    const task = {
      id: uuidv4(),
      title,
      description: description || '',
      projectId,
      assignedTo,
      deadline,
      priority: priority || 'medium',
      status: 'todo',
      createdBy: req.user.id,
      createdAt: new Date().toISOString()
    };

    db.get('tasks').push(task).write();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task status
// Admin can update any task
// Member can only update their own task status
router.patch('/:id/status', authMiddleware, (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['todo', 'in-progress', 'done'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const task = db.get('tasks').find({ id: req.params.id }).value();
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Member can only update their own assigned task
    if (req.user.role !== 'admin' && task.assignedTo !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own tasks' });
    }

    db.get('tasks').find({ id: req.params.id }).assign({ status }).write();
    res.json({ message: 'Status updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete task - Admin only
router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const task = db.get('tasks').find({ id: req.params.id }).value();
    if (!task) return res.status(404).json({ message: 'Task not found' });

    db.get('tasks').remove({ id: req.params.id }).write();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
