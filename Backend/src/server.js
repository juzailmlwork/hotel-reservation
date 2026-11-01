require('dotenv').config();

const { createApp } = require('./app');
const { seedAdmin } = require('./db');

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

seedAdmin();

const port = process.env.PORT || 5004;
createApp().listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
