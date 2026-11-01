const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { validateCredentials } = require('../validation');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
  return jwt.sign({ sub: user.id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
}

router.post('/register', (req, res) => {
  const errors = validateCredentials(req.body);
  if (Object.keys(errors).length) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  const user = db.createUser(req.body.username, req.body.password);
  if (!user) {
    return res.status(409).json({ message: 'Username already exists' });
  }

  return res.status(201).json({ token: signToken(user), user: db.toPublicUser(user) });
});

router.post('/login', (req, res) => {
  const errors = validateCredentials(req.body);
  if (Object.keys(errors).length) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  const user = db.findUser(req.body.username);
  if (!user || !bcrypt.compareSync(req.body.password, user.passwordHash)) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  return res.json({ token: signToken(user), user: db.toPublicUser(user) });
});

router.get('/me', requireAuth, (req, res) => {
  const user = db.findUser(req.user.username);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  return res.json({ user: db.toPublicUser(user) });
});

module.exports = router;
