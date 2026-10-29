import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import crypto from 'node:crypto';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

app.use(express.json());

// Secret key for cryptographic session tokens (from env or secure runtime fallback)
const SESSION_SECRET = process.env.SESSION_SECRET || 'hps-tools-secure-session-key-' + crypto.randomBytes(16).toString('hex');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'HarshitAdmin2026!';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@hpstools.com';

// In-memory data store for server-side verification and persistence
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

function hashPassword(password: string): string {
  return crypto.createHmac('sha256', SESSION_SECRET).update(password).digest('hex');
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

    // Check token age (7 days)
    const timestamp = parseInt(timestampStr, 10);
    if (Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000) return null;

    return { userId, role };
  } catch {
    return null;
  }
}

// Initial Admin User
const adminUser: ServerUser = {
  id: 'usr-admin-1',
  email: ADMIN_EMAIL,
  name: 'Harshit',
  passwordHash: hashPassword(ADMIN_PASSWORD),
  role: 'admin',
  createdAt: new Date().toISOString(),
};

const users: Map<string, ServerUser> = new Map();
users.set(adminUser.email.toLowerCase(), adminUser);

const feedbackList: ServerFeedback[] = [];
const userWorkList: ServerWorkItem[] = [];

let siteConfig = {
  announcementEnabled: false,
  announcementText: '',
  announcementType: 'info',
  maintenanceMode: false,
  brandTagline: 'Simple Tools. One Place.',
  creatorName: 'Harshit',
  creatorHub: 'harshit.hub',
};

// Authentication Middleware
function authenticateUser(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired session token.' });
    return;
  }

  (req as any).user = payload;
  next();
}

// Strict Server-Side Admin Authorization Middleware
function requireAdminRole(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Administrator authentication required.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') {
    res.status(403).json({ error: 'Access denied: You do not possess administrator authorization.' });
    return;
  }

  (req as any).user = payload;
  next();
}

// --- API ROUTES ---

// 1. Auth: Register (Always creates standard 'user' role)
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, name, password } = req.body;
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'Valid email and password are required.' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (users.has(normalizedEmail)) {
    res.status(409).json({ error: 'An account with this email address already exists.' });
    return;
  }

  const cleanName = typeof name === 'string' && name.trim() ? name.trim() : email.split('@')[0];
  const newUser: ServerUser = {
    id: 'usr-' + Date.now().toString(36),
    email: normalizedEmail,
    name: cleanName,
    passwordHash: hashPassword(password),
    role: 'user', // Standard user only!
    createdAt: new Date().toISOString(),
  };

  users.set(normalizedEmail, newUser);
  const token = createToken(newUser.id, newUser.role);

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      joinedAt: newUser.createdAt,
    },
  });
});

// 2. Auth: Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = users.get(normalizedEmail);

  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const token = createToken(user.id, user.role);
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      joinedAt: user.createdAt,
    },
  });
});

// 3. Auth: Current user verification
app.get('/api/auth/me', authenticateUser, (req: Request, res: Response) => {
  const tokenPayload = (req as any).user;
  let foundUser: ServerUser | undefined;
  for (const u of users.values()) {
    if (u.id === tokenPayload.userId) {
      foundUser = u;
      break;
    }
  }

  if (!foundUser) {
    res.status(404).json({ error: 'User record not found.' });
    return;
  }

  res.json({
    user: {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      role: foundUser.role,
      joinedAt: foundUser.createdAt,
    },
  });
});

// 4. Public Feedback: Submit genuine feedback
app.post('/api/feedback', (req: Request, res: Response) => {
  const { userName, userEmail, rating, category, comment } = req.body;
  if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
    res.status(400).json({ error: 'Comment is required.' });
    return;
  }

  const numRating = Number(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
    return;
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

  feedbackList.unshift(newFeedback);
  res.status(201).json({ success: true, feedback: newFeedback });
});

// 5. Protected Admin: Get feedback list
app.get('/api/admin/feedback', requireAdminRole, (_req: Request, res: Response) => {
  res.json({ feedbackList });
});

// 6. Protected Admin: Update feedback status
app.patch('/api/admin/feedback/:id', requireAdminRole, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const item = feedbackList.find((f) => f.id === id);
  if (!item) {
    res.status(404).json({ error: 'Feedback item not found.' });
    return;
  }
  if (status === 'new' || status === 'reviewed') {
    item.status = status;
  }
  res.json({ success: true, item });
});

// 7. Protected Admin: Delete feedback
app.delete('/api/admin/feedback/:id', requireAdminRole, (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = feedbackList.findIndex((f) => f.id === id);
  if (idx >= 0) {
    feedbackList.splice(idx, 1);
  }
  res.json({ success: true });
});

// 8. Public Site Config: Get public announcement & tagline
app.get('/api/site-config', (_req: Request, res: Response) => {
  res.json({
    announcementEnabled: siteConfig.announcementEnabled,
    announcementText: siteConfig.announcementText,
    brandTagline: siteConfig.brandTagline,
    creatorName: siteConfig.creatorName,
    creatorHub: siteConfig.creatorHub,
  });
});

// 9. Protected Admin: Update Site Config
app.post('/api/admin/site-config', requireAdminRole, (req: Request, res: Response) => {
  const { announcementEnabled, announcementText, brandTagline, creatorName, creatorHub } = req.body;
  if (typeof announcementEnabled === 'boolean') siteConfig.announcementEnabled = announcementEnabled;
  if (typeof announcementText === 'string') siteConfig.announcementText = announcementText.trim();
  if (typeof brandTagline === 'string') siteConfig.brandTagline = brandTagline.trim();
  if (typeof creatorName === 'string') siteConfig.creatorName = creatorName.trim();
  if (typeof creatorHub === 'string') siteConfig.creatorHub = creatorHub.trim();

  res.json({ success: true, siteConfig });
});

// 10. Protected User Work storage
app.get('/api/user/work', authenticateUser, (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const items = userWorkList.filter((w) => w.userId === userId);
  res.json({ items });
});

app.post('/api/user/work', authenticateUser, (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { type, title, content } = req.body;
  if (!title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  const newItem: ServerWorkItem = {
    id: 'work-' + Date.now().toString(36),
    userId,
    type: type || 'note',
    title: title.trim(),
    content: content || '',
    timestamp: new Date().toISOString(),
  };

  userWorkList.unshift(newItem);
  res.status(201).json({ item: newItem });
});

app.delete('/api/user/work/:id', authenticateUser, (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { id } = req.params;
  const idx = userWorkList.findIndex((w) => w.id === id && w.userId === userId);
  if (idx >= 0) {
    userWorkList.splice(idx, 1);
  }
  res.json({ success: true });
});

// --- VITE MIDDLEWARE OR STATIC PRODUCTION ---
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    app.use(express.static('dist'));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, HOST, () => {
    console.log(`HPS Tools server running at http://${HOST}:${PORT}`);
  });
}

startServer();
