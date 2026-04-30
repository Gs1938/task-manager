const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Get all users - Admin only
router.get('/', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const users = db.get('users').map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt
    })).value();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user profile
router.get('/me', authMiddleware, (req, res) => {
  try {
    const user = db.get('users').find({ id: req.user.id }).value();
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user - Admin only
router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    db.get('users').remove({ id: req.params.id }).write();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
