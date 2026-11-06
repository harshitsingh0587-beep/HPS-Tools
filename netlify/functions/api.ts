import crypto from 'node:crypto';
import fs from 'node:fs';

// Netlify Serverless API Handler for HPS Tools
const SESSION_SECRET = process.env.SESSION_SECRET || 'hps-tools-secure-session-key-netlify-7a8f9c1b2d3e4';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'HarshitAdmin2026!';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@hpstools.com';

interface ServerUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: 'admin' | 'user';
  createdAt: string;
}

interface ServerFeedback {
  id: string;
  userName: string;
  userEmail: string;
  rating: number;
  category: string;
  comment: string;
  timestamp: string;
  status: 'new' | 'reviewed';
}

interface ServerWorkItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  content: string;
  timestamp: string;
}

interface PasswordResetToken {
  token: string;
  email: string;
  expiresAt: number;
  used: boolean;
  createdAt: number;
}

const DATA_STORE_PATH = '/tmp/hps_store.json';

function hashPassword(password: string): string {
  return crypto.createHmac('sha256', SESSION_SECRET).update(password).digest('hex');
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
}

function createToken(userId: string, role: string): string {
  const payload = `${userId}:${role}:${Date.now()}`;
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64');
}

function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length !== 4) return null;
    const [userId, role, timestampStr, signature] = parts;
    const payload = `${userId}:${role}:${timestampStr}`;
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
    if (signature !== expectedSig) return null;

    const timestamp = parseInt(timestampStr, 10);
    if (Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000) return null;

    return { userId, role };
  } catch {
    return null;
  }
}

// Initial Admin User
const initialAdmin: ServerUser = {
  id: 'usr-admin-1',
  email: ADMIN_EMAIL.toLowerCase(),
  name: 'Harshit',
  passwordHash: hashPassword(ADMIN_PASSWORD),
  role: 'admin',
  createdAt: new Date().toISOString(),
};

let store = {
  users: [initialAdmin] as ServerUser[],
  feedbackList: [] as ServerFeedback[],
  userWorkList: [] as ServerWorkItem[],
  resetTokens: [] as PasswordResetToken[],
  siteConfig: {
    announcementEnabled: false,
    announcementText: '',
    brandTagline: 'Simple Tools. One Place.',
    creatorName: 'Harshit',
    creatorHub: 'harshit.hub',
  },
};

// Load from /tmp if exists
try {
  if (fs.existsSync(DATA_STORE_PATH)) {
    const raw = fs.readFileSync(DATA_STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.users)) {
      store = { ...store, ...parsed, resetTokens: parsed.resetTokens || [] };
      if (!store.users.some((u) => u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase())) {
        store.users.push(initialAdmin);
      }
    }
  }
} catch {
  // Read fallback
}

function saveStore() {
  try {
    fs.writeFileSync(DATA_STORE_PATH, JSON.stringify(store));
  } catch {
    // Read-only filesystem fallback
  }
}

// Rate Limiting (in-memory)
const rateLimits = new Map<string, { count: number; resetTime: number }>();
function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimits.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimits.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
};

function jsonResponse(statusCode: number, data: any) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(data),
  };
}

export const handler = async (event: any, _context: any) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  let reqPath = event.path || '';
  reqPath = reqPath.replace(/^\/\.netlify\/functions\/api/, '/api');
  if (!reqPath.startsWith('/api')) {
    reqPath = '/api' + reqPath;
  }
  reqPath = reqPath.replace(/\/$/, '');

  const method = (event.httpMethod || 'GET').toUpperCase();
  const clientIp = event.headers?.['client-ip'] || event.headers?.['x-forwarded-for'] || 'client';

  let body: any = {};
  if (event.body) {
    try {
      body = JSON.parse(event.body);
    } catch {
      return jsonResponse(400, { error: 'Invalid JSON request payload.' });
    }
  }

  const authHeader = event.headers?.authorization || event.headers?.Authorization;
  let tokenUser: { userId: string; role: string } | null = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    tokenUser = verifyToken(authHeader.split(' ')[1]);
  }

  // --- 1. POST /api/auth/register ---
  if (method === 'POST' && (reqPath === '/api/auth/register' || reqPath === '/api/register')) {
    if (!checkRateLimit(clientIp, 10, 60000)) {
      return jsonResponse(429, { error: 'Too many registration attempts. Please wait a minute.' });
    }

    const { email, name, password } = body;
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return jsonResponse(400, { error: 'Valid email and password are required.' });
    }

    if (password.length < 6) {
      return jsonResponse(400, { error: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (store.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      return jsonResponse(409, { error: 'An account with this email address already exists.' });
    }

    const cleanName = typeof name === 'string' && name.trim() ? name.trim() : email.split('@')[0];
    const newUser: ServerUser = {
      id: 'usr-' + Date.now().toString(36),
      email: normalizedEmail,
      name: cleanName,
      passwordHash: hashPassword(password),
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    store.users.push(newUser);
    saveStore();

    const token = createToken(newUser.id, newUser.role);
    return jsonResponse(201, {
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        joinedAt: newUser.createdAt,
      },
    });
  }

  // --- 2. POST /api/auth/login ---
  if (method === 'POST' && (reqPath === '/api/auth/login' || reqPath === '/api/login')) {
    if (!checkRateLimit(clientIp, 8, 60000)) {
      return jsonResponse(429, { error: 'Too many login attempts. Please wait a minute.' });
    }

    const { email, password } = body;
    if (!email || !password) {
      return jsonResponse(400, { error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = store.users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user || user.passwordHash !== hashPassword(password)) {
      return jsonResponse(401, { error: 'Invalid email or password.' });
    }

    const token = createToken(user.id, user.role);
    return jsonResponse(200, {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        joinedAt: user.createdAt,
      },
    });
  }

  // --- 2a. POST /api/auth/forgot-password ---
  if (method === 'POST' && (reqPath === '/api/auth/forgot-password' || reqPath === '/api/forgot-password')) {
    if (!checkRateLimit(clientIp, 5, 15 * 60000)) {
      return jsonResponse(429, { error: 'Too many password reset requests. Please wait a few minutes before trying again.' });
    }

    const { email } = body;
    if (!email || typeof email !== 'string') {
      return jsonResponse(400, { error: 'A valid email address is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = store.users.find((u) => u.email.toLowerCase() === normalizedEmail);

    let resetUrl: string | undefined;
    let testToken: string | undefined;

    if (existingUser) {
      const token = crypto.randomBytes(32).toString('hex');
      testToken = token;
      const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

      // Remove any older tokens for this user
      store.resetTokens = store.resetTokens.filter((t) => t.email.toLowerCase() !== normalizedEmail);

      const record: PasswordResetToken = {
        token,
        email: normalizedEmail,
        expiresAt,
        used: false,
        createdAt: Date.now(),
      };
      store.resetTokens.push(record);
      saveStore();

      const host = event.headers?.host || 'hps-tools.ai.studio';
      const protocol = (event.headers?.['x-forwarded-proto'] || 'https') === 'https' ? 'https' : 'http';
      resetUrl = `${protocol}://${host}/reset-password?token=${token}`;
      console.log(`[Netlify HPS Security] Generated password reset token for ${normalizedEmail}: ${resetUrl}`);
    }

    const isEmailConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

    // Standard generic response to prevent account enumeration
    return jsonResponse(200, {
      success: true,
      message: 'If an account is associated with this email address, a password reset link has been sent.',
      emailConfigured: isEmailConfigured,
      diagnostic: !isEmailConfigured
        ? 'SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) are not configured in environment variables. In development/testing, you can use the test reset link or inspect logs.'
        : undefined,
      resetUrl: (!isEmailConfigured && resetUrl) ? resetUrl : undefined,
      testToken: (!isEmailConfigured && testToken) ? testToken : undefined,
    });
  }

  // --- 2b. GET /api/auth/verify-reset-token ---
  if (method === 'GET' && (reqPath === '/api/auth/verify-reset-token' || reqPath === '/api/verify-reset-token')) {
    const token = (event.queryStringParameters?.token || '').trim();
    if (!token) {
      return jsonResponse(400, { valid: false, error: 'Password reset token is required.' });
    }

    const record = store.resetTokens.find((t) => t.token === token);
    if (!record) {
      return jsonResponse(400, { valid: false, error: 'Password reset token is invalid or has expired.' });
    }

    if (record.used) {
      return jsonResponse(400, { valid: false, error: 'This password reset link has already been used. Please request a new one.' });
    }

    if (Date.now() > record.expiresAt) {
      store.resetTokens = store.resetTokens.filter((t) => t.token !== token);
      saveStore();
      return jsonResponse(400, { valid: false, error: 'This password reset link has expired (links expire after 1 hour). Please request a new one.' });
    }

    return jsonResponse(200, {
      valid: true,
      email: maskEmail(record.email),
    });
  }

  // --- 2c. POST /api/auth/reset-password ---
  if (method === 'POST' && (reqPath === '/api/auth/reset-password' || reqPath === '/api/reset-password')) {
    if (!checkRateLimit(clientIp, 5, 15 * 60000)) {
      return jsonResponse(429, { error: 'Too many reset attempts. Please wait a few minutes.' });
    }

    const { token, newPassword } = body;
    if (!token || !newPassword || typeof token !== 'string' || typeof newPassword !== 'string') {
      return jsonResponse(400, { error: 'Valid reset token and new password are required.' });
    }

    const cleanToken = token.trim();
    const record = store.resetTokens.find((t) => t.token === cleanToken);
    if (!record || record.used || Date.now() > record.expiresAt) {
      return jsonResponse(400, { error: 'Password reset token is invalid, expired, or has already been used.' });
    }

    if (newPassword.length < 6) {
      return jsonResponse(400, { error: 'New password must be at least 6 characters long.' });
    }

    const user = store.users.find((u) => u.email.toLowerCase() === record.email.toLowerCase());
    if (!user) {
      return jsonResponse(400, { error: 'User account associated with this token was not found.' });
    }

    // Update password hash
    user.passwordHash = hashPassword(newPassword);

    // Consume single-use token and remove
    record.used = true;
    store.resetTokens = store.resetTokens.filter((t) => t.token !== cleanToken);
    saveStore();

    return jsonResponse(200, {
      success: true,
      message: 'Your password has been successfully reset. You may now sign in with your new password.',
    });
  }

  // --- 3. GET /api/auth/me ---
  if (method === 'GET' && reqPath === '/api/auth/me') {
    if (!tokenUser) {
      return jsonResponse(401, { error: 'Authentication required. Please sign in.' });
    }

    const user = store.users.find((u) => u.id === tokenUser!.userId);
    if (!user) {
      return jsonResponse(404, { error: 'User record not found.' });
    }

    return jsonResponse(200, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        joinedAt: user.createdAt,
      },
    });
  }

  // --- 4. Public Feedback: POST /api/feedback ---
  if (method === 'POST' && reqPath === '/api/feedback') {
    const { userName, userEmail, rating, category, comment } = body;
    if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
      return jsonResponse(400, { error: 'Comment is required.' });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return jsonResponse(400, { error: 'Rating must be an integer between 1 and 5.' });
    }

    const newFeedback: ServerFeedback = {
      id: 'fb-' + Date.now().toString(36),
      userName: typeof userName === 'string' && userName.trim() ? userName.trim() : 'Anonymous Visitor',
      userEmail: typeof userEmail === 'string' && userEmail.trim() ? userEmail.trim() : 'Not provided',
      rating: Math.round(numRating),
      category: typeof category === 'string' ? category : 'General',
      comment: comment.trim(),
      timestamp: new Date().toISOString(),
      status: 'new',
    };

    store.feedbackList.unshift(newFeedback);
    saveStore();
    return jsonResponse(201, { success: true, feedback: newFeedback });
  }

  // --- 5. Protected Admin: GET /api/admin/feedback ---
  if (method === 'GET' && reqPath === '/api/admin/feedback') {
    if (!tokenUser || tokenUser.role !== 'admin') {
      return jsonResponse(403, { error: 'Access denied: Administrator privileges required.' });
    }
    return jsonResponse(200, { feedbackList: store.feedbackList });
  }

  // --- 6. Protected Admin: DELETE /api/admin/feedback/:id ---
  if (method === 'DELETE' && reqPath.startsWith('/api/admin/feedback/')) {
    if (!tokenUser || tokenUser.role !== 'admin') {
      return jsonResponse(403, { error: 'Access denied: Administrator privileges required.' });
    }
    const id = reqPath.split('/api/admin/feedback/')[1];
    store.feedbackList = store.feedbackList.filter((f) => f.id !== id);
    saveStore();
    return jsonResponse(200, { success: true });
  }

  // --- 7. Public Site Config: GET /api/site-config ---
  if (method === 'GET' && reqPath === '/api/site-config') {
    return jsonResponse(200, store.siteConfig);
  }

  // --- 8. Protected Admin: POST /api/admin/site-config ---
  if (method === 'POST' && reqPath === '/api/admin/site-config') {
    if (!tokenUser || tokenUser.role !== 'admin') {
      return jsonResponse(403, { error: 'Access denied: Administrator privileges required.' });
    }
    const { announcementEnabled, announcementText, brandTagline, creatorName, creatorHub } = body;
    if (typeof announcementEnabled === 'boolean') store.siteConfig.announcementEnabled = announcementEnabled;
    if (typeof announcementText === 'string') store.siteConfig.announcementText = announcementText.trim();
    if (typeof brandTagline === 'string') store.siteConfig.brandTagline = brandTagline.trim();
    if (typeof creatorName === 'string') store.siteConfig.creatorName = creatorName.trim();
    if (typeof creatorHub === 'string') store.siteConfig.creatorHub = creatorHub.trim();

    saveStore();
    return jsonResponse(200, { success: true, siteConfig: store.siteConfig });
  }

  // --- 9. Protected User Work: GET /api/user/work & POST /api/user/work ---
  if (reqPath === '/api/user/work') {
    if (!tokenUser) {
      return jsonResponse(401, { error: 'Authentication required.' });
    }
    if (method === 'GET') {
      const items = store.userWorkList.filter((w) => w.userId === tokenUser!.userId);
      return jsonResponse(200, { items });
    }
    if (method === 'POST') {
      const { type, title, content } = body;
      if (!title) return jsonResponse(400, { error: 'Title is required.' });
      const newItem: ServerWorkItem = {
        id: 'work-' + Date.now().toString(36),
        userId: tokenUser.userId,
        type: type || 'note',
        title: title.trim(),
        content: content || '',
        timestamp: new Date().toISOString(),
      };
      store.userWorkList.unshift(newItem);
      saveStore();
      return jsonResponse(201, { item: newItem });
    }
  }

  // --- 10. POST /api/ai/chat ---
  if (method === 'POST' && reqPath === '/api/ai/chat') {
    const userMsg = (body.message || '').toString();
    const reply = `### 🤖 HPS Tools Assistant\nI can help you convert files, resize images, change image backgrounds, calculate loans, or generate passwords!\n\nTo begin, open any tool from the top menu or directory.`;
    return jsonResponse(200, { reply });
  }

  return jsonResponse(404, {
    error: `API endpoint ${method} ${reqPath} not found.`,
    availableEndpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/me',
      'POST /api/feedback',
      'GET /api/site-config',
    ],
  });
};
