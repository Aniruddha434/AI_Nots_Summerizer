import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { jest, describe, test, expect, beforeEach } from '@jest/globals';

process.env.JWT_SECRET = 'testsecret';

// Mock the models module to avoid real DB
let MockUser;
await jest.unstable_mockModule('../models/index.js', () => {
  class _MockUser {
    static _scenario = {};
    static _lastSaved = null;

    static async findOne(query) {
      // Allow tests to explicitly control return value
      if (Object.prototype.hasOwnProperty.call(_MockUser._scenario, 'findOneReturn')) {
        return _MockUser._scenario.findOneReturn;
      }
      if (_MockUser._scenario.loginUser) return _MockUser._scenario.loginUser;
      return null;
    }

    constructor({ name, email, password }) {
      this._id = 'user_123';
      this.name = name;
      this.email = (email || '').toLowerCase();
      this.password = password;
      this.role = 'user';
      this._saved = false;
    }

    async save() {
      this._saved = true;
      _MockUser._lastSaved = this;
    }

    async comparePassword(candidate) {
      if (Object.prototype.hasOwnProperty.call(_MockUser._scenario, 'compareResult')) {
        return _MockUser._scenario.compareResult;
      }
      // Default false unless test sets behavior
      return false;
    }
  }
  return { User: _MockUser };
});

// Import mocked module and router after mocking
const models = await import('../models/index.js');
MockUser = models.User;
const { default: authRouter } = await import('../routes/auth.js');

// Build an express app scoped to the auth router
function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRouter);
  return app;
}

beforeEach(() => {
  // Reset scenario between tests
  MockUser._scenario = {};
  MockUser._lastSaved = null;
});

describe('Auth routes', () => {
  test('POST /api/auth/signup succeeds for new email', async () => {
    const app = buildApp();
    MockUser._scenario.findOneReturn = null; // No existing user

    const payload = { name: 'Alice', email: 'alice@example.com', password: 'password123' };
    const res = await request(app).post('/api/auth/signup').send(payload);

    expect(res.status).toBe(201);
    expect(res.body?.data?.user?.email).toBe('alice@example.com');
    expect(typeof res.body?.data?.token).toBe('string');
    // Token should be verifiable
    const decoded = jwt.verify(res.body.data.token, process.env.JWT_SECRET);
    expect(decoded.email).toBe('alice@example.com');
    // Ensure save was called
    expect(MockUser._lastSaved).not.toBeNull();
    expect(MockUser._lastSaved?._saved).toBe(true);
  });

  test('POST /api/auth/signup rejects when email already exists', async () => {
    const app = buildApp();
    const existing = new MockUser({ name: 'Existing', email: 'bob@example.com', password: 'x' });
    MockUser._scenario.findOneReturn = existing; // Simulate existing

    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Bob', email: 'bob@example.com', password: 'password123' });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already in use/i);
  });

  test('POST /api/auth/signup validates input', async () => {
    const app = buildApp();
    const res = await request(app).post('/api/auth/signup').send({ name: 'A', email: 'not-an-email', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/validation/i);
  });

  test('POST /api/auth/login succeeds with correct credentials', async () => {
    const app = buildApp();
    const user = new MockUser({ name: 'Carol', email: 'carol@example.com', password: 'hashed' });
    // Successful password check
    user.comparePassword = jest.fn().mockResolvedValue(true);
    MockUser._scenario.findOneReturn = user;

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'carol@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(typeof res.body?.data?.token).toBe('string');
    expect(res.body?.data?.user?.email).toBe('carol@example.com');
  });

  test('POST /api/auth/login rejects invalid password', async () => {
    const app = buildApp();
    const user = new MockUser({ name: 'Dave', email: 'dave@example.com', password: 'hashed' });
    user.comparePassword = jest.fn().mockResolvedValue(false);
    MockUser._scenario.findOneReturn = user;

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'dave@example.com', password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid email or password/i);
  });

  test('POST /api/auth/login rejects unknown user', async () => {
    const app = buildApp();
    MockUser._scenario.findOneReturn = null;

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'whatever' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid email or password/i);
  });
});

