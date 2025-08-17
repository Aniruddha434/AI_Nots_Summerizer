import express from 'express';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';
import { User } from '../models/index.js';
import Logger from '../utils/logger.js';

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/signup
router.post(
  '/signup',
  [
    body('name').isLength({ min: 2 }).withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(409).json({ error: 'Email already in use' });
      }

      const user = new User({ name, email, password });
      await user.save();

      const token = signToken(user);
      Logger.info('User signed up', { id: user._id, email: user.email });
      res.status(201).json({
        success: true,
        data: {
          token,
          user: { id: user._id, name: user.name, email: user.email, role: user.role }
        }
      });
    } catch (err) {
      Logger.error('Signup failed', err);
      res.status(500).json({ error: 'Failed to sign up', message: 'Internal server error' });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 1 }).withMessage('Password is required'),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email.toLowerCase(), isActive: true });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      const ok = await user.comparePassword(password);
      if (!ok) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      const token = signToken(user);
      Logger.info('User logged in', { id: user._id, email: user.email });
      res.json({
        success: true,
        data: {
          token,
          user: { id: user._id, name: user.name, email: user.email, role: user.role }
        }
      });
    } catch (err) {
      Logger.error('Login failed', err);
      res.status(500).json({ error: 'Failed to login', message: 'Internal server error' });
    }
  }
);

export default router;

