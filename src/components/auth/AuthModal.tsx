import React, { useState } from 'react';
import { Icon } from '../common/Icon';
import {
  UserProfile,
  loginWithServer,
  registerWithServer,
  signOutUser,
} from '../../services/auth/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserChanged: (user: UserProfile | null) => void;
  currentUser: UserProfile | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onUserChanged,
  currentUser,
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email.trim() || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const res = await registerWithServer(email, name, password);
        if (res.success && res.user) {
          onUserChanged(res.user);
          onClose();
        } else {
          setErrorMessage(res.error || 'Failed to create account.');
        }
      } else {
        const res = await loginWithServer(email, password);
        if (res.success && res.user) {
          onUserChanged(res.user);
          onClose();
        } else {
          setErrorMessage(res.error || 'Invalid email or password.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    signOutUser();
    onUserChanged(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-hps-surface rounded-2xl shadow-2xl border border-hps-border overflow-hidden text-hps-text"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Header */}
        <div className="p-6 border-b border-hps-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-hps-primary/10 text-hps-primary">
              <Icon name="UserCheck" size={20} />
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-base font-bold">
                {currentUser ? 'harshit.hub Account' : isSignUp ? 'Create harshit.hub Account' : 'Sign In to harshit.hub'}
              </h2>
              <p className="text-xs text-hps-muted">
                Save and sync calculations, passwords, and custom notes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-hps-muted hover:bg-hps-bg transition-colors"
            aria-label="Close modal"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {currentUser ? (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-hps-primary text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-md">
                {currentUser.avatarInitials}
              </div>
              <div>
                <h3 className="text-lg font-bold text-hps-text">{currentUser.name}</h3>
                <p className="text-xs text-hps-muted font-mono">{currentUser.email}</p>
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-hps-primary/10 text-hps-primary border border-hps-primary/20">
                  {currentUser.role === 'admin' ? 'Administrator' : 'Standard Account'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-hps-bg border border-hps-border text-xs text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-hps-muted">Saved Work Items:</span>
                  <span className="font-bold text-hps-primary">{currentUser.savedWork?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-hps-muted">Member Since:</span>
                  <span className="font-bold text-hps-text">
                    {new Date(currentUser.joinedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full py-2.5 text-xs font-bold rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
                >
                  Sign Out of Account
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {errorMessage}
                </div>
              )}

              {isSignUp && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-hps-text block">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Harshit"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-hps-border bg-hps-bg text-xs text-hps-text focus:outline-hidden focus:ring-2 focus:ring-hps-primary/30"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-hps-text block">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-hps-border bg-hps-bg text-xs text-hps-text focus:outline-hidden focus:ring-2 focus:ring-hps-primary/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-hps-text block">Password</label>
                <input
                  type="password"
                  required
                  placeholder={isSignUp ? 'At least 6 characters' : 'Enter password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-hps-border bg-hps-bg text-xs text-hps-text focus:outline-hidden focus:ring-2 focus:ring-hps-primary/30"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer hover:opacity-95 transition-opacity disabled:opacity-50"
                style={{ backgroundColor: 'var(--hps-primary)' }}
              >
                {loading
                  ? 'Please wait...'
                  : isSignUp
                  ? 'Create harshit.hub Account'
                  : 'Sign In to harshit.hub'}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setErrorMessage('');
                  }}
                  className="text-xs text-hps-primary hover:underline font-semibold"
                >
                  {isSignUp
                    ? 'Already have an account? Sign in'
                    : "Don't have an account? Create one"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
