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
 * Real Server-side login with password
 */
export async function loginWithServer(
  email: string,
  password: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Login failed. Please check credentials.' };
    }

    const user: UserProfile = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      avatarInitials: data.user.name.slice(0, 2).toUpperCase(),
      savedWork: [],
      joinedAt: data.user.joinedAt || new Date().toISOString(),
    };

    saveSession(user, data.token);

    // Fetch user's saved work from server
    try {
      const workRes = await fetch('/api/user/work', {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      if (workRes.ok) {
        const workData = await workRes.json();
        if (Array.isArray(workData.items)) {
          user.savedWork = workData.items;
          saveSession(user, data.token);
        }
      }
    } catch {
      // Ignore background sync errors
    }

    return { success: true, user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection error to authentication server.' };
  }
}

/**
 * Real Server-side registration (always creates standard 'user' role)
 */
export async function registerWithServer(
  email: string,
  name: string,
  password: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Registration failed.' };
    }

    const user: UserProfile = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: 'user', // strictly 'user'
      avatarInitials: data.user.name.slice(0, 2).toUpperCase(),
      savedWork: [],
      joinedAt: data.user.joinedAt || new Date().toISOString(),
    };

    saveSession(user, data.token);
    return { success: true, user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to connect to authentication server.' };
  }
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
