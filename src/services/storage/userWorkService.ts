import { storageService } from './storageService';
import { UserWorkItem } from '../../types';
import { getCurrentUser } from '../auth/authService';

const WORK_STORAGE_KEY_PREFIX = 'hps_user_work_';

export const userWorkService = {
  getUserWork(userId: string): UserWorkItem[] {
    return storageService.get<UserWorkItem[]>(`${WORK_STORAGE_KEY_PREFIX}${userId}`, []);
  },

  saveWorkItem(userId: string, item: Omit<UserWorkItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): UserWorkItem {
    const list = this.getUserWork(userId);
    const newItem: UserWorkItem = {
      id: `work-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      ...item,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newItem, ...list];
    storageService.set(`${WORK_STORAGE_KEY_PREFIX}${userId}`, updated);
    return newItem;
  },

  deleteWorkItem(userId: string, workId: string): boolean {
    const list = this.getUserWork(userId);
    const updated = list.filter((item) => item.id !== workId);
    return storageService.set(`${WORK_STORAGE_KEY_PREFIX}${userId}`, updated);
  },

  getCurrentUserWork(): UserWorkItem[] {
    const user = getCurrentUser();
    if (!user) return [];
    return this.getUserWork(user.id);
  },
};
