import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

// Gemini AI client initialization
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey) {
  aiClient = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

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

// 11. Project Folder Download Endpoints
app.get('/api/download/project-zip', (_req: Request, res: Response) => {
  const filePath = path.resolve('public/hps-tools-project.zip');
  res.download(filePath, 'hps-tools-project.zip');
});

app.get('/api/download/project-tar', (_req: Request, res: Response) => {
  const filePath = path.resolve('public/hps-tools-project.tar.gz');
  res.download(filePath, 'hps-tools-project.tar.gz');
});

// Helper for intelligent intent recognition when offline or API key is not ready
function generateSmartFallbackReply(userMsg: string): string {
  const lower = userMsg.toLowerCase().trim();

  if (lower.includes('pdf to image') || lower.includes('pdf to png') || lower.includes('pdf to jpg') || (lower.includes('convert') && lower.includes('pdf'))) {
    return `### 📄 Convert PDF to Image\nI can help you convert your PDF documents into high-resolution PNG or JPG images!
- **How to do it directly:** You can drop or attach your PDF file right here in this assistant, or open the **PDF to Image Tool** (/tools/pdf-to-image).
- **Quality:** Renders crisp, print-ready pages at 300 DPI without uploading to any remote servers.
- **Privacy:** 100% processed in your browser.`;
  }

  if (lower.includes('jpg to png') || lower.includes('png to jpg') || (lower.includes('convert') && lower.includes('image'))) {
    return `### 🖼️ Image Format Converter\nI can transcode images instantly:
- **JPG to PNG:** Preserves highest visual detail and creates lossless PNG output.
- **PNG to JPG:** Replaces transparency with crisp white background and optimizes compression.
- You can attach your image right here or open **JPG to PNG** (/tools/jpg-to-png).`;
  }

  if (lower.includes('passport') || lower.includes('photo')) {
    return `### 📷 Passport Photo Maker\nCreate biometric passport photos that meet official global standards:
- **Dimensions:** Standard 2×2 inches (51×51 mm) or 35×45 mm at 300 DPI (600×600 px).
- **Features:** Live circular guideline, head-to-chin proportion ruler, background fill, and multi-photo printable grid.
- Launch the **Passport Photo Maker** (/tools/passport-photo-maker) to begin!`;
  }

  if (lower.includes('loan') || lower.includes('emi') || lower.includes('mortgage') || lower.includes('interest')) {
    return `### 📊 Loan & EMI Calculator\nPlan your loan repayments accurately:
- Calculates exact Monthly EMI, Total Interest Payable, and Total Repayment amount.
- Provides a full year-by-year amortization breakdown.
- Open the **Loan Calculator** (/tools/loan-calculator) to test loan amounts and interest rates.`;
  }

  if (lower.includes('age') || lower.includes('dob') || lower.includes('birthday') || lower.includes('born')) {
    return `### 🎂 Date of Birth Calculator\nCalculate precise age down to the day:
- Computes exact years, months, weeks, days, and hours lived.
- Shows total days until your next birthday and day of the week you were born.
- Open the **Date of Birth Calculator** (/tools/dob-calculator) to check.`;
  }

  if (lower.includes('password') || lower.includes('generate')) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()_+';
    let pwd = '';
    for (let i = 0; i < 16; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `### 🔑 Secure Password Generator\nHere is a freshly generated 16-character high-entropy password for you:\n\`${pwd}\`\n\nNeed more custom options (symbols, length, pronounceable)? Open the **Password Generator** (/tools/password-generator).`;
  }

  if (lower.includes('word') || lower.includes('count') || lower.includes('character')) {
    return `### 📝 Live Word & Character Counter\nAnalyze any text instantly:
- Live word count, character count (with/without spaces), sentence count, and reading time estimate.
- Open the **Word Counter** (/tools/word-counter) or paste your text here to analyze.`;
  }

  if (lower.includes('resize') || lower.includes('dimension') || lower.includes('scale')) {
    return `### 📐 Image Resizer\nResize your images with pixel-perfect accuracy:
- Set custom width and height, lock aspect ratio, or scale by percentage (25%, 50%, 75%).
- Instant client-side download without watermarks.
- Open the **Image Resizer** (/tools/image-resizer) to resize your pictures.`;
  }

  return `### 👋 Welcome to HPS AI Assistant!
I am your intelligent utility assistant created by **Harshit** (\`harshit.hub\`) for **HPS Tools**.

How can I fulfill your work today?
- **Convert PDF to Image:** Convert PDF files to high-resolution PNG/JPG.
- **Format Transcoding:** Convert JPG to PNG, PNG to JPG, Word to PDF, Image to PDF.
- **Passport Photo Maker:** Crop compliant biometric photos for passports and visas.
- **Image Resizer:** Resize and optimize pictures.
- **Calculators:** Compute Loans, Mortgage EMI, Exact Age & DOB, or scientific math.
- **Productivity:** Generate secure passwords and analyze word counts.

Ask me anything or attach a file to get started!`;
}

// 12. AI Assistant Chat Endpoint
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { message, history } = req.body;
  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Message is required.' });
    return;
  }

  const systemInstruction = `You are HPS AI Assistant, the intelligent utility assistant for HPS Tools (Simple Tools. One Place.), created by Harshit (harshit.hub).
Your purpose is to directly assist users and fulfill their everyday tasks and tools work.
Available tools and features in HPS Tools:
- PDF to Image (/tools/pdf-to-image): Convert PDF documents to high-resolution images
- Image to PDF (/tools/image-to-pdf): Convert photos and graphics into a compiled PDF
- Passport Photo Maker (/tools/passport-photo-maker): Generate compliant 2x2 inch biometric passport photos
- Image Resizer (/tools/image-resizer): Resize dimensions, crop, scale image pixels
- JPG to PNG (/tools/jpg-to-png) & PNG to JPG (/tools/png-to-jpg): Fast image format transcoding
- Smart Calculator (/tools/calculator): Math evaluations, trigonometry, algebra
- Loan Calculator (/tools/loan-calculator): Compute monthly EMI, interest, amortization
- DOB Calculator (/tools/dob-calculator): Compute exact age, birth milestone, next birthday
- Unit Converter (/tools/unit-converter): Length, temperature, area, volume, mass, speed
- Word Counter (/tools/word-counter): Word, character, reading time, sentence analysis
- Password Generator (/tools/password-generator): Cryptographically secure random passwords
- Convert All (/tools/convert-all): Universal conversion hub (Word, PowerPoint, PDF, Images)

Guidelines:
1. Always be concise, polite, helpful, and directly actionable.
2. If the user asks to convert files (like PDF to image, JPG to PNG, or resize), give clear instructions and recommend clicking the action button or uploading the file into the assistant.
3. If the user asks for a calculation or conversion (e.g. loan math, unit conversion, age calculation, word count, password), perform the calculation directly and provide the exact answer!
4. Keep answers clean with markdown formatting.`;

  if (aiClient) {
    try {
      const contents: any[] = [];
      if (Array.isArray(history)) {
        for (const item of history.slice(-6)) {
          if (item && item.role && item.content) {
            contents.push({
              role: item.role === 'user' ? 'user' : 'model',
              parts: [{ text: String(item.content) }],
            });
          }
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      // Race with a 3.5s timeout for high-speed responsiveness
      const geminiPromise = aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API timeout')), 3500)
      );

      const response: any = await Promise.race([geminiPromise, timeoutPromise]);

      const replyText = response.text || 'I am ready to help you with HPS Tools!';
      res.json({ reply: replyText });
      return;
    } catch (err: any) {
      console.warn('Gemini call ended (smart fallback active):', err?.message || err);
    }
  }

  const reply = generateSmartFallbackReply(message);
  res.json({ reply });
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
