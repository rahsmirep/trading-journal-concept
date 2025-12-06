const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Use a simple in-memory user store for development/testing only
const users = [];

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-for-prod';
const JWT_EXPIRES_IN = '7d';

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const existing = users.find((u) => u.email === email);
  if (existing) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const id = users.length + 1;
    const user = { id, name: name || '', email, passwordHash: hashed };
    users.push(user);

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Signup error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const user = users.find((u) => u.email === email);
  if (!user) return res.status(401).json({ message: 'Invalid email or password' });

  try {
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
