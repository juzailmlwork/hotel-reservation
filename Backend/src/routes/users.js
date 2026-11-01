const express = require('express');
const db = require('../db');
const { validateCredentials } = require('../validation');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', (req, res) => {
  res.json({ users: db.listUsers().map(db.toPublicUser) });
});

router.post('/', (req, res) => {
  const errors = validateCredentials(req.body);
  if (Object.keys(errors).length) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  const user = db.createUser(req.body.username, req.body.password);
  if (!user) {
    return res.status(409).json({ message: 'Username already exists' });
  }

  return res.status(201).json({ user: db.toPublicUser(user) });
});

module.exports = router;
