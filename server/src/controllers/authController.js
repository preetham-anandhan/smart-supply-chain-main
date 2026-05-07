// ==============================================
// Auth Controller — Login, Register, Profile
// ==============================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const { query } = require('../config/db');
const { createLogger } = require('../../../shared/utils/logger');

const log = createLogger('AUTH');

// ── In-Memory Users (fallback when DB not available) ───────────
const inMemoryUsers = [
  { id: 1, username: 'customer1', password_hash: '', full_name: 'Priya Sharma', role: 'customer', email: 'priya@example.com' },
  { id: 2, username: 'admin1', password_hash: '', full_name: 'Rajesh Kumar', role: 'admin', email: 'rajesh@example.com' },
  { id: 3, username: 'driver1', password_hash: '', full_name: 'Amit Patel', role: 'driver', email: 'amit@example.com' },
  { id: 4, username: 'warehouse_manager1', password_hash: '', full_name: 'Suresh Reddy', role: 'warehouse_manager', email: 'suresh@example.com' },
  { id: 5, username: 'driver2', password_hash: '', full_name: 'Vikram Singh', role: 'driver', email: 'vikram@example.com' },
  { id: 6, username: 'driver3', password_hash: '', full_name: 'Neha Gupta', role: 'driver', email: 'neha@example.com' },
];

// Pre-hash passwords at startup
(async () => {
  const hash = await bcrypt.hash('password123', 10);
  inMemoryUsers.forEach(u => { u.password_hash = hash; });
})();

/**
 * Generate JWT token for a user.
 */
function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, full_name: user.full_name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * POST /api/auth/register
 */
async function register(req, res) {
  try {
    const { username, password, full_name, role, email } = req.body;

    if (!username || !password || !full_name || !role) {
      return res.status(400).json({ success: false, error: 'All fields are required: username, password, full_name, role' });
    }

    const validRoles = ['customer', 'admin', 'driver', 'warehouse_manager'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }

    const password_hash = await bcrypt.hash(password, 10);

    let user;
    try {
      const result = await query(
        'INSERT INTO users (username, password_hash, full_name, role, email) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, full_name, role, email, created_at',
        [username, password_hash, full_name, role, email || null]
      );
      user = result.rows[0];
    } catch (dbErr) {
      if (dbErr.code === '23505') {
        return res.status(409).json({ success: false, error: 'Username already exists' });
      }
      // Fallback to in-memory
      const existing = inMemoryUsers.find(u => u.username === username);
      if (existing) {
        return res.status(409).json({ success: false, error: 'Username already exists' });
      }
      user = { id: inMemoryUsers.length + 1, username, password_hash, full_name, role, email };
      inMemoryUsers.push(user);
    }

    const token = generateToken(user);

    log.info(`User registered: ${username} (${role})`);
    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role, email: user.email },
      },
    });
  } catch (err) {
    log.error('Registration failed', err.message);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required' });
    }

    let user;

    // Try PostgreSQL first
    try {
      const result = await query('SELECT * FROM users WHERE username = $1', [username]);
      user = result.rows[0];
    } catch {
      // Fallback to in-memory
      user = inMemoryUsers.find(u => u.username === username);
    }

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }

    const token = generateToken(user);

    log.info(`User logged in: ${username} (${user.role})`);
    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role, email: user.email },
      },
    });
  } catch (err) {
    log.error('Login failed', err.message);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
}

/**
 * GET /api/auth/me
 */
function getProfile(req, res) {
  res.json({
    success: true,
    data: req.user,
  });
}

module.exports = { register, login, getProfile };
