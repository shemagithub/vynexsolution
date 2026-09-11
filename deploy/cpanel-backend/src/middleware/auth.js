import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function getDevAdminUser() {
  return { id: 0, email: config.adminEmail, name: 'Admin' };
}

export function isConfiguredAdminCredentials(email, password) {
  return email === config.adminEmail && password === config.adminPassword;
}

/** @deprecated use isConfiguredAdminCredentials */
export function isDevAuthCredentials(email, password) {
  return config.nodeEnv !== 'production' && isConfiguredAdminCredentials(email, password);
}
