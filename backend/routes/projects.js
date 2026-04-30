const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Get all projects (admin sees all, member sees only their projects)
router.get('/', authMiddleware, (req, res) => {
  try {
    let projects = db.get('projects').value();

    if (req.user.role !== 'admin') {
      const memberProjects = db.get('projectMembers').filter({ userId: req.user.id }).map('projectId').value();
      projects = projects.filter(p => memberProjects.includes(p.id) || p.createdBy === req.user.id);
    }

    const projectsWithDetails = projects.map(project => {
      const members = db.get('projectMembers').filter({ projectId: project.id }).value();
      const tasks = db.get('tasks').filter({ projectId: project.id }).value();
      return { ...project, memberCount: members.length, taskCount: tasks.length };
    });

    res.json(projectsWithDetails);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create project - Admin only
router.post('/', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Project name is required' });

    const project = {
      id: uuidv4(),
      name,
      description: description || '',
      createdBy: req.user.id,
      createdAt: new Date().toISOString()
    };

    db.get('projects').push(project).write();
    db.get('projectMembers').push({ projectId: project.id, userId: req.user.id }).write();

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single project
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const project = db.get('projects').find({ id: req.params.id }).value();
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const members = db.get('projectMembers').filter({ projectId: project.id }).value();
    const memberDetails = members.map(m => {
      const user = db.get('users').find({ id: m.userId }).value();
      return user ? { id: user.id, name: user.name, email: user.email, role: user.role } : null;
    }).filter(Boolean);

    const tasks = db.get('tasks').filter({ projectId: project.id }).value();
    res.json({ ...project, members: memberDetails, tasks });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add member to project - Admin only
router.post('/:id/members', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { email } = req.body;
    const project = db.get('projects').find({ id: req.params.id }).value();
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const user = db.get('users').find({ email }).value();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const existing = db.get('projectMembers').find({ projectId: project.id, userId: user.id }).value();
    if (existing) return res.status(400).json({ message: 'User already in project' });

    db.get('projectMembers').push({ projectId: project.id, userId: user.id }).write();
    res.json({ message: 'Member added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete project - Admin only
router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const project = db.get('projects').find({ id: req.params.id }).value();
    if (!project) return res.status(404).json({ message: 'Project not found' });

    db.get('projects').remove({ id: req.params.id }).write();
    db.get('tasks').remove({ projectId: req.params.id }).write();
    db.get('projectMembers').remove({ projectId: req.params.id }).write();

    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
