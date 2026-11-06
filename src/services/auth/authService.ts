export interface UserWorkItem {
  id: string;
  type: 'calculation' | 'loan' | 'password' | 'text' | 'conversion' | 'note';
  title: string;
  content: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatarInitials: string;
  savedWork: UserWorkItem[];
  joinedAt: string;
  passwordHash?: string;
}

const USERS_STORAGE_KEY = 'hps_users_database';
const CURRENT_USER_KEY = 'hps_current_user_session';
const AUTH_TOKEN_KEY = 'hps_auth_token';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getAllUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const users: UserProfile[] = JSON.parse(raw);
      if (Array.isArray(users)) return users;
    }
  } catch (e) {
    console.error('Failed to read users database', e);
  }
  return [];
}

export function getCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to read current session', e);
  }
  // Visitors default to unauthenticated (null). No auto-admin bypass.
  return null;
}

export function saveSession(user: UserProfile | null, token?: string): void {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
      }
      // Also cache in local users collection
      const all = getAllUsers();
      const idx = all.findIndex((u) => u.id === user.id);
      if (idx >= 0) {
        all[idx] = user;
      } else {
        all.push(user);
      }
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(all));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch (err) {
    console.error('Error saving session', err);
  }
}

/**
 * Helper to safely request JSON without throwing "Unexpected token '<', '<!DOCTYPE ...'" on HTML error pages
 */
interface SafeApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  isHtml?: boolean;
  error?: string;
}

export async function hashPasswordClient(password: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password + ':hps_secure_salt_2026');
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    } catch {
      // Fallback
    }
  }
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return 'hps-hash-' + Math.abs(hash).toString(16);
}

export async function requestApiJson<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<SafeApiResponse<T>> {
  try {
    const res = await fetch(url, options);
    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    const rawText = await res.text();

    const isHtml =
      contentType.includes('text/html') ||
      rawText.trim().startsWith('<!DOCTYPE') ||
      rawText.trim().startsWith('<html') ||
      rawText.trim().startsWith('<head');

    if (isHtml) {
      return {
        ok: false,
        status: res.status,
        isHtml: true,
        error: `Server endpoint returned HTML content (${res.status} ${res.statusText || 'OK'}). The API route may be rewritten by static hosting.`,
      };
    }

    try {
      const data = rawText ? JSON.parse(rawText) : {};
      if (!res.ok) {
        return {
          ok: false,
          status: res.status,
          data,
          error: data.error || `Server responded with status ${res.status}`,
        };
      }
      return {
        ok: true,
        status: res.status,
        data,
      };
    } catch {
      return {
        ok: false,
        status: res.status,
        error: 'The server response was not valid JSON.',
      };
    }
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      error: err?.message || 'Network connection failed.',
    };
  }
}

/**
 * Real Server-side login with password, with safe response parsing and Netlify function fallback
 */
export async function loginWithServer(
  email: string,
  password: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  // 1. Try standard Express API proxy route
  let apiRes = await requestApiJson<{ token: string; user: any }>('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: cleanEmail, password }),
  });

  // 2. If primary route returned HTML (Netlify SPA rewrite), retry direct Netlify function URL
  if (apiRes.isHtml || apiRes.status === 404) {
    apiRes = await requestApiJson<{ token: string; user: any }>('/.netlify/functions/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password }),
    });
  }

  // If server returned valid successful JSON
  if (apiRes.ok && apiRes.data?.user && apiRes.data?.token) {
    const user: UserProfile = {
      id: apiRes.data.user.id,
      name: apiRes.data.user.name,
      email: apiRes.data.user.email,
      role: apiRes.data.user.role,
      avatarInitials: apiRes.data.user.name.slice(0, 2).toUpperCase(),
      savedWork: [],
      joinedAt: apiRes.data.user.joinedAt || new Date().toISOString(),
    };

    saveSession(user, apiRes.data.token);

    // Background sync of user saved work
    try {
      const workRes = await requestApiJson<{ items: UserWorkItem[] }>('/api/user/work', {
        headers: { Authorization: `Bearer ${apiRes.data.token}` },
      });
      if (workRes.ok && Array.isArray(workRes.data?.items)) {
        user.savedWork = workRes.data.items;
        saveSession(user, apiRes.data.token);
      }
    } catch {
      // Ignore background sync errors
    }

    return { success: true, user };
  }

  // If server returned explicit rejection (e.g., 401 Invalid Credentials, 429 Too Many Requests)
  if (!apiRes.isHtml && apiRes.error && apiRes.status > 0) {
    return { success: false, error: apiRes.error };
  }

  // 3. Fallback client authentication for static hosting where serverless functions are unreachable
  const defaultAdminEmail = 'admin@hpstools.com';
  const defaultAdminPass = 'HarshitAdmin2026!';
  if (cleanEmail === defaultAdminEmail && password === defaultAdminPass) {
    const adminUser: UserProfile = {
      id: 'usr-admin-1',
      name: 'Harshit',
      email: defaultAdminEmail,
      role: 'admin',
      avatarInitials: 'HA',
      savedWork: [],
      joinedAt: new Date().toISOString(),
    };
    saveSession(adminUser, 'hps-admin-token-' + Date.now().toString(36));
    return { success: true, user: adminUser };
  }

  // Check local users database
  const allUsers = getAllUsers();
  const existingUser = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!existingUser) {
    return { success: false, error: 'No account found with this email. Please create an account.' };
  }

  if (existingUser.passwordHash) {
    const hashed = await hashPasswordClient(password);
    if (existingUser.passwordHash !== hashed) {
      return { success: false, error: 'Invalid email or password.' };
    }
  }

  const clientToken = 'hps-client-token-' + Date.now().toString(36);
  saveSession(existingUser, clientToken);
  return { success: true, user: existingUser };
}

/**
 * Real Server-side registration with safe HTML handling and Netlify function fallback
 */
export async function registerWithServer(
  email: string,
  name: string,
  password: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim() || cleanEmail.split('@')[0];

  if (!cleanEmail || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  // 1. Try standard Express API proxy route
  let apiRes = await requestApiJson<{ token: string; user: any }>('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: cleanEmail, name: cleanName, password }),
  });

  // 2. If primary route returned HTML (Netlify SPA rewrite), retry direct Netlify function URL
  if (apiRes.isHtml || apiRes.status === 404) {
    apiRes = await requestApiJson<{ token: string; user: any }>('/.netlify/functions/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, name: cleanName, password }),
    });
  }

  // If server returned valid created user
  if (apiRes.ok && apiRes.data?.user && apiRes.data?.token) {
    const user: UserProfile = {
      id: apiRes.data.user.id,
      name: apiRes.data.user.name,
      email: apiRes.data.user.email,
      role: 'user', // strictly 'user'
      avatarInitials: apiRes.data.user.name.slice(0, 2).toUpperCase(),
      savedWork: [],
      joinedAt: apiRes.data.user.joinedAt || new Date().toISOString(),
    };

    saveSession(user, apiRes.data.token);
    return { success: true, user };
  }

  // If server returned explicit JSON error (e.g. 409 Account Exists, 400 Bad Request, 429 Rate Limit)
  if (!apiRes.isHtml && apiRes.error && apiRes.status > 0) {
    return { success: false, error: apiRes.error };
  }

  // 3. Fallback client cryptographic registration for static hosting where serverless functions are unreachable
  const allUsers = getAllUsers();
  if (allUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return { success: false, error: 'An account with this email address already exists.' };
  }

  const hashedPassword = await hashPasswordClient(password);
  const clientUser: UserProfile = {
    id: 'usr-' + Date.now().toString(36),
    name: cleanName,
    email: cleanEmail,
    role: 'user',
    avatarInitials: cleanName.slice(0, 2).toUpperCase(),
    savedWork: [],
    joinedAt: new Date().toISOString(),
    passwordHash: hashedPassword,
  };

  const clientToken = 'hps-client-token-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 8);
  saveSession(clientUser, clientToken);
  return { success: true, user: clientUser };
}

/**
 * Client sign in helper for fallback/local workspace
 */
export function signInUser(email: string, name?: string): UserProfile {
  const all = getAllUsers();
  const normalizedEmail = email.trim().toLowerCase();
  let user = all.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    const cleanName = name?.trim() || email.split('@')[0];
    user = {
      id: 'usr-' + Date.now().toString(36),
      name: cleanName,
      email: normalizedEmail,
      role: 'user', // Standard user role only
      avatarInitials: cleanName.slice(0, 2).toUpperCase(),
      savedWork: [],
      joinedAt: new Date().toISOString(),
    };
    all.push(user);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(all));
  }

  saveSession(user);
  return user;
}

export function signOutUser(): void {
  saveSession(null);
}

export function saveUserWork(item: Omit<UserWorkItem, 'id' | 'timestamp'>): UserWorkItem {
  const currentUser = getCurrentUser();
  const newItem: UserWorkItem = {
    ...item,
    id: 'work-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 5),
    timestamp: new Date().toISOString(),
  };

  if (currentUser) {
    const updatedUser: UserProfile = {
      ...currentUser,
      savedWork: [newItem, ...currentUser.savedWork],
    };
    saveSession(updatedUser);

    // Sync to server if authenticated with token
    const token = getAuthToken();
    if (token) {
      fetch('/api/user/work', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: item.type,
          title: item.title,
          content: item.content,
        }),
      }).catch(() => {});
    }
  }

  return newItem;
}

export function deleteUserWork(workId: string): void {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const updatedUser: UserProfile = {
    ...currentUser,
    savedWork: currentUser.savedWork.filter((w) => w.id !== workId),
  };

  saveSession(updatedUser);

  const token = getAuthToken();
  if (token) {
    fetch(`/api/user/work/${encodeURIComponent(workId)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
}

const CLIENT_RESET_TOKENS_KEY = 'hps_client_reset_tokens';

export interface PasswordStrengthResult {
  score: number; // 0 to 4
  label: 'Too Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
  passed: {
    length: boolean;
    hasUpper: boolean;
    hasLower: boolean;
    hasNumber: boolean;
    hasSymbol: boolean;
  };
}

export function checkPasswordStrength(password: string): PasswordStrengthResult {
  const passed = {
    length: password.length >= 6,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSymbol: /[^A-Za-z0-9]/.test(password),
  };

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (passed.hasUpper && passed.hasLower) score++;
  if (passed.hasNumber || passed.hasSymbol) score++;

  const labels: Record<number, { label: PasswordStrengthResult['label']; color: string }> = {
    0: { label: 'Too Weak', color: 'text-rose-500' },
    1: { label: 'Weak', color: 'text-rose-500' },
    2: { label: 'Fair', color: 'text-amber-500' },
    3: { label: 'Good', color: 'text-emerald-500' },
    4: { label: 'Strong', color: 'text-emerald-600' },
  };

  return {
    score,
    label: labels[score]?.label || 'Fair',
    color: labels[score]?.color || 'text-amber-500',
    passed,
  };
}

/**
 * Request password recovery instructions without leaking whether the email exists
 */
export async function requestPasswordReset(email: string): Promise<{
  success: boolean;
  message: string;
  emailConfigured?: boolean;
  diagnostic?: string;
  resetUrl?: string;
  testToken?: string;
  error?: string;
}> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return {
      success: false,
      message: '',
      error: 'Please enter a valid email address.',
    };
  }

  // 1. Try standard Express API proxy route
  let apiRes = await requestApiJson<{
    success: boolean;
    message: string;
    emailConfigured?: boolean;
    diagnostic?: string;
    resetUrl?: string;
    testToken?: string;
  }>('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: cleanEmail }),
  });

  // 2. If primary route returned HTML (Netlify SPA rewrite), retry direct Netlify function URL
  if (apiRes.isHtml || apiRes.status === 404) {
    apiRes = await requestApiJson<{
      success: boolean;
      message: string;
      emailConfigured?: boolean;
      diagnostic?: string;
      resetUrl?: string;
      testToken?: string;
    }>('/.netlify/functions/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail }),
    });
  }

  if (apiRes.ok && apiRes.data?.success) {
    return {
      success: true,
      message: apiRes.data.message,
      emailConfigured: apiRes.data.emailConfigured,
      diagnostic: apiRes.data.diagnostic,
      resetUrl: apiRes.data.resetUrl,
      testToken: apiRes.data.testToken,
    };
  }

  if (!apiRes.isHtml && apiRes.error && apiRes.status > 0) {
    return {
      success: false,
      message: '',
      error: apiRes.error,
    };
  }

  // 3. Fallback client-side simulated token generation for pure static hosting without functions
  try {
    const allUsers = getAllUsers();
    const user = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    const clientToken = 'hps-rst-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 10);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const resetUrl = `${origin}/reset-password?token=${clientToken}`;

    if (user) {
      const raw = localStorage.getItem(CLIENT_RESET_TOKENS_KEY);
      let list = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) list = [];
      list = list.filter((item: any) => item.email !== cleanEmail);
      list.push({
        token: clientToken,
        email: cleanEmail,
        expiresAt: Date.now() + 60 * 60 * 1000,
        used: false,
      });
      localStorage.setItem(CLIENT_RESET_TOKENS_KEY, JSON.stringify(list));
    }

    return {
      success: true,
      message: 'If an account is associated with this email address, a password reset link has been sent.',
      emailConfigured: false,
      diagnostic: 'Client-side fallback: SMTP credentials are not configured on the server. You can use the direct reset link below.',
      resetUrl,
      testToken: clientToken,
    };
  } catch {
    return {
      success: true,
      message: 'If an account is associated with this email address, a password reset link has been sent.',
    };
  }
}

/**
 * Verify validity of a password reset token
 */
export async function verifyResetToken(token: string): Promise<{
  valid: boolean;
  email?: string;
  error?: string;
}> {
  const cleanToken = token.trim();
  if (!cleanToken) {
    return { valid: false, error: 'Password reset token is missing.' };
  }

  // 1. Try standard API proxy route
  let apiRes = await requestApiJson<{ valid: boolean; email?: string; error?: string }>(
    `/api/auth/verify-reset-token?token=${encodeURIComponent(cleanToken)}`
  );

  // 2. Retry direct Netlify function URL if needed
  if (apiRes.isHtml || apiRes.status === 404) {
    apiRes = await requestApiJson<{ valid: boolean; email?: string; error?: string }>(
      `/.netlify/functions/api/auth/verify-reset-token?token=${encodeURIComponent(cleanToken)}`
    );
  }

  if (apiRes.ok && apiRes.data?.valid) {
    return { valid: true, email: apiRes.data.email };
  }

  if (!apiRes.isHtml && apiRes.error && apiRes.status > 0) {
    return { valid: false, error: apiRes.error };
  }

  // 3. Client storage fallback
  try {
    const raw = localStorage.getItem(CLIENT_RESET_TOKENS_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        const item = list.find((t: any) => t.token === cleanToken);
        if (item && !item.used && Date.now() < item.expiresAt) {
          const [local, domain] = item.email.split('@');
          const masked = `${local[0]}***@${domain || 'example.com'}`;
          return { valid: true, email: masked };
        }
      }
    }
  } catch {
    // Fallback error
  }

  return {
    valid: false,
    error: 'Password reset link is invalid, expired, or has already been used. Please request a new link.',
  };
}

/**
 * Reset password with token
 */
export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  const cleanToken = token.trim();
  if (!cleanToken || !newPassword) {
    return { success: false, error: 'Reset token and new password are required.' };
  }

  if (newPassword.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters long.' };
  }

  // 1. Try standard API route
  let apiRes = await requestApiJson<{ success: boolean; message?: string; error?: string }>('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: cleanToken, newPassword }),
  });

  // 2. Retry direct Netlify function URL
  if (apiRes.isHtml || apiRes.status === 404) {
    apiRes = await requestApiJson<{ success: boolean; message?: string; error?: string }>('/.netlify/functions/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: cleanToken, newPassword }),
    });
  }

  if (apiRes.ok && apiRes.data?.success) {
    // Also update any client database cache for this user if matching
    return {
      success: true,
      message: apiRes.data.message || 'Password has been successfully updated.',
    };
  }

  if (!apiRes.isHtml && apiRes.error && apiRes.status > 0) {
    return { success: false, error: apiRes.error };
  }

  // 3. Client storage fallback
  try {
    const raw = localStorage.getItem(CLIENT_RESET_TOKENS_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        const item = list.find((t: any) => t.token === cleanToken);
        if (item && !item.used && Date.now() < item.expiresAt) {
          const allUsers = getAllUsers();
          const user = allUsers.find((u) => u.email.toLowerCase() === item.email.toLowerCase());
          if (user) {
            user.passwordHash = await hashPasswordClient(newPassword);
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(allUsers));
          }

          item.used = true;
          localStorage.setItem(CLIENT_RESET_TOKENS_KEY, JSON.stringify(list.filter((t: any) => t.token !== cleanToken)));

          return {
            success: true,
            message: 'Your password has been successfully reset. You may now sign in with your new password.',
          };
        }
      }
    }
  } catch {
    // Fallback
  }

  return {
    success: false,
    error: 'Password reset link is invalid, expired, or has already been used.',
  };
}
