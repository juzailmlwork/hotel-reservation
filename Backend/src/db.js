const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Simple JSON-file store: { users: { [username]: { id, username, passwordHash, createdAt } } }

function getDataFile() {
  return path.resolve(__dirname, '..', process.env.DATA_FILE || 'data.json');
}

function readData() {
  const file = getDataFile();
  if (!fs.existsSync(file)) {
    return { users: {} };
  }
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  return { users: {}, ...data };
}

function writeData(data) {
  fs.writeFileSync(getDataFile(), JSON.stringify(data, null, 2));
}

function normalize(username) {
  return username.trim().toLowerCase();
}

function findUser(username) {
  return readData().users[normalize(username)] || null;
}

function createUser(username, password) {
  const data = readData();
  const key = normalize(username);
  if (data.users[key]) {
    return null;
  }
  const user = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    username: key,
    passwordHash: bcrypt.hashSync(password, 10),
    createdAt: new Date().toISOString(),
  };
  data.users[key] = user;
  writeData(data);
  return user;
}

function listUsers() {
  return Object.values(readData().users);
}

function seedAdmin() {
  const username = process.env.SEED_ADMIN_USERNAME;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!username || !password) {
    return;
  }
  if (!findUser(username)) {
    createUser(username, password);
  }
}

function toPublicUser(user) {
  return { id: user.id, username: user.username, createdAt: user.createdAt };
}

module.exports = { findUser, createUser, listUsers, seedAdmin, toPublicUser };
