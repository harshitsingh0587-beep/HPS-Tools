export interface FeedbackItem {
  id: string;
  userName: string;
  userEmail: string;
  rating: number; // 1 to 5
  category: 'General' | 'Calculators' | 'Document Converters' | 'Passport & Photo' | 'Feature Request';
  comment: string;
  timestamp: string;
  status: 'new' | 'reviewed';
}

const FEEDBACK_STORAGE_KEY = 'hps_user_feedback_list';

const INITIAL_FEEDBACK: FeedbackItem[] = [];

export function getFeedbackList(): FeedbackItem[] {
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (raw) {
      const list: FeedbackItem[] = JSON.parse(raw);
      if (Array.isArray(list)) return list;
    }
  } catch (e) {
    console.error('Failed to load feedback', e);
  }
  return INITIAL_FEEDBACK;
}

export function submitFeedback(feedback: Omit<FeedbackItem, 'id' | 'timestamp' | 'status'>): FeedbackItem {
  const current = getFeedbackList();
  const newItem: FeedbackItem = {
    ...feedback,
    id: 'fb-' + Date.now().toString(36),
    timestamp: new Date().toISOString(),
    status: 'new',
  };
  const updated = [newItem, ...current];
  localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));

  // Sync to server
  try {
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    }).catch(() => {});
  } catch {
    // Ignore offline errors
  }

  return newItem;
}

export function updateFeedbackStatus(id: string, status: 'new' | 'reviewed'): void {
  const current = getFeedbackList();
  const updated = current.map((item) => (item.id === id ? { ...item, status } : item));
  localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));
}

export function deleteFeedback(id: string): void {
  const current = getFeedbackList();
  const updated = current.filter((item) => item.id !== id);
  localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));
}
