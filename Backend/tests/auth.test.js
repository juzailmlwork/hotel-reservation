const fs = require('fs');
const path = require('path');
const request = require('supertest');
const jwt = require('jsonwebtoken');

const TEST_DATA_FILE = 'data.test.json';
const testFilePath = path.resolve(__dirname, '..', TEST_DATA_FILE);

process.env.DATA_FILE = TEST_DATA_FILE;
process.env.JWT_SECRET = 'test-secret';
process.env.SEED_ADMIN_USERNAME = 'admin@hotel.com';
process.env.SEED_ADMIN_PASSWORD = '123456';

const { createApp } = require('../src/app');
const { seedAdmin } = require('../src/db');

const app = createApp();

beforeEach(() => {
  if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);
  seedAdmin();
});

afterAll(() => {
  if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);
});

async function loginAsAdmin() {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ username: 'admin@hotel.com', password: '123456' });
  return res.body.token;
}

describe('POST /api/auth/login', () => {
  test('seeded admin can log in and receives a JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin@hotel.com', password: '123456' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe('admin@hotel.com');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  test('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin@hotel.com', password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  test('rejects unknown user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'nobody', password: '123456' });
    expect(res.status).toBe(401);
  });

  test('returns 400 for short password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin@hotel.com', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.errors.password).toBeDefined();
  });
});

describe('POST /api/auth/register', () => {
  test('registers a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'staff1', password: 'secret1' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe('staff1');
  });

  test('rejects duplicate username', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'admin@hotel.com', password: '123456' });
    expect(res.status).toBe(409);
  });

  test('rejects password shorter than 6 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'staff2', password: '12345' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/me', () => {
  test('returns current user with valid token', async () => {
    const token = await loginAsAdmin();
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('admin@hotel.com');
  });

  test('rejects missing token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('TOKEN_MISSING');
  });

  test('rejects invalid token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-token');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Invalid token', code: 'TOKEN_INVALID' });
  });

  test('rejects expired token with a TOKEN_EXPIRED code', async () => {
    const expired = jwt.sign({ sub: 'x', username: 'admin@hotel.com' }, process.env.JWT_SECRET, {
      expiresIn: -10,
    });
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${expired}`);
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Session expired', code: 'TOKEN_EXPIRED' });
  });

  test('rejects token signed with a different secret', async () => {
    const forged = jwt.sign({ sub: 'x', username: 'admin@hotel.com' }, 'wrong-secret');
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${forged}`);
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('TOKEN_INVALID');
  });

  test('issued tokens expire after JWT_EXPIRES_IN', async () => {
    const token = await loginAsAdmin();
    const { iat, exp } = jwt.decode(token);
    expect(exp - iat).toBe(60 * 60); // default 1h
  });
});

describe('expired token on protected user routes', () => {
  test('cannot create a user with an expired token', async () => {
    const expired = jwt.sign({ sub: 'x', username: 'admin@hotel.com' }, process.env.JWT_SECRET, {
      expiresIn: -10,
    });
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${expired}`)
      .send({ username: 'late@gmail.com', password: 'abc@123' });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('TOKEN_EXPIRED');
  });
});

describe('/api/users (protected)', () => {
  test('logged-in user can create a new user', async () => {
    const token = await loginAsAdmin();
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'frontdesk', password: 'abcdef' });
    expect(res.status).toBe(201);
    expect(res.body.user.username).toBe('frontdesk');

    const list = await request(app).get('/api/users').set('Authorization', `Bearer ${token}`);
    expect(list.body.users.map((u) => u.username)).toEqual(
      expect.arrayContaining(['admin@hotel.com', 'frontdesk']),
    );
  });

  test('cannot create user without token', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ username: 'frontdesk', password: 'abcdef' });
    expect(res.status).toBe(401);
  });
});
