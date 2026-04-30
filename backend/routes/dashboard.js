const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, (req, res) => {
  try {
    const now = new Date();
    let tasks = db.get('tasks').value();

    if (req.user.role !== 'admin') {
      tasks = tasks.filter(t => t.assignedTo === req.user.id);
    }

    const totalTasks = tasks.length;
    const todoTasks = tasks.filter(t => t.status === 'todo').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
    const doneTasks = tasks.filter(t => t.status === 'done').length;
    const overdueTasks = tasks.filter(t => t.status !== 'done' && new Date(t.deadline) < now).length;

    let totalProjects = 0;
    let totalUsers = 0;

    if (req.user.role === 'admin') {
      totalProjects = db.get('projects').value().length;
      totalUsers = db.get('users').value().length;
    } else {
      const memberProjects = db.get('projectMembers').filter({ userId: req.user.id }).value();
      totalProjects = memberProjects.length;
    }

    res.json({
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      overdueTasks,
      totalProjects,
      totalUsers
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
