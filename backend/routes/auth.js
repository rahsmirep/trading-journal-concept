const express = require('express');
const router = express.Router();

// Simple in-memory user store for development/demo purposes
const users = [];

// POST /api/auth/signup
router.post('/signup', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const existing = users.find((u) => u.email === email);
  if (existing) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const id = users.length + 1;
  const user = { id, name: name || '', email, password };
  users.push(user);

  // Return a simple development token (do NOT use in production)
  return res.status(201).json({ token: `dev-token-${id}`, user: { id, name: user.name, email: user.email } });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  return res.json({ token: `dev-token-${user.id}`, user: { id: user.id, name: user.name, email: user.email } });
});

module.exports = router;
