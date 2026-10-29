import { useState, useEffect } from 'react';
import { UserProfile, getCurrentUser, signOutUser } from '../services/auth/authService';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(getCurrentUser);

  const refreshUser = () => {
    setCurrentUser(getCurrentUser());
  };

  const logout = () => {
    signOutUser();
    setCurrentUser(null);
  };

  return {
    currentUser,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.role === 'admin',
    refreshUser,
    logout,
  };
}
