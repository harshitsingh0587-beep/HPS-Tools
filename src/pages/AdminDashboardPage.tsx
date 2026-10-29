import React, { useState, useEffect } from 'react';
import { Icon } from '../components/common/Icon';
import {
  getFeedbackList,
  updateFeedbackStatus,
  deleteFeedback,
  FeedbackItem,
} from '../services/feedback/feedbackService';
import {
  getSiteConfig,
  saveSiteConfig,
  SiteConfiguration,
} from '../services/admin/siteConfigService';
import {
  UserProfile,
  getAllUsers,
  loginWithServer,
  getAuthToken,
  signOutUser,
} from '../services/auth/authService';

interface AdminDashboardPageProps {
  onNavigate: (path: string) => void;
  currentUser: UserProfile | null;
  onAdminAuthenticated?: (user: UserProfile | null) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onNavigate,
  currentUser,
  onAdminAuthenticated,
}) => {
  // Admin Login Challenge State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard state
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>(getFeedbackList);
  const [siteConfig, setSiteConfig] = useState<SiteConfiguration>(getSiteConfig);
  const [usersList, setUsersList] = useState<UserProfile[]>(getAllUsers);
  const [saveBannerSuccess, setSaveBannerSuccess] = useState(false);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  const isAdmin = currentUser?.role === 'admin';

  // Fetch verified admin data if authorized
  useEffect(() => {
    if (isAdmin) {
      const loadData = () => {
        const token = getAuthToken();
        if (token) {
          fetch('/api/admin/feedback', {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (data && Array.isArray(data.feedbackList) && data.feedbackList.length > 0) {
                setFeedbackList(data.feedbackList);
              } else {
                setFeedbackList(getFeedbackList());
              }
            })
            .catch(() => {
              setFeedbackList(getFeedbackList());
            });
        } else {
          setFeedbackList(getFeedbackList());
        }
        setUsersList(getAllUsers());
      };

      loadData();
      const interval = setInterval(loadData, 2000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!adminEmail.trim() || !adminPassword) {
      setLoginError('Email and administrator password are required.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await loginWithServer(adminEmail, adminPassword);
      if (res.success && res.user) {
        if (res.user.role === 'admin') {
          if (onAdminAuthenticated) {
            onAdminAuthenticated(res.user);
          } else {
            window.location.reload();
          }
        } else {
          setLoginError('Access denied: This account does not possess administrator privileges.');
        }
      } else {
        setLoginError(res.error || 'Invalid administrator credentials.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOutAdmin = () => {
    signOutUser();
    if (onAdminAuthenticated) {
      onAdminAuthenticated(null);
    } else {
      window.location.reload();
    }
  };

  // If visitor is not authenticated as admin, show secure challenge
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-hps-primary/10 text-hps-primary flex items-center justify-center mx-auto">
            <Icon name="ShieldAlert" size={30} />
          </div>
          <h1 className="text-2xl font-black text-hps-text tracking-tight">
            Administrator Access Required
          </h1>
          <p className="text-xs text-hps-muted">
            This workspace is reserved for authorized site operators. Ordinary visitors cannot access administrative controls without verified server credentials.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-sm space-y-4">
          {loginError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-600 dark:text-rose-400">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-hps-text block">Administrator Email</label>
              <input
                type="email"
                required
                placeholder="admin@hpstools.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-hps-border bg-hps-bg text-xs text-hps-text focus:outline-hidden focus:ring-2 focus:ring-hps-primary/30"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-hps-text block">Administrator Password</label>
              <input
                type="password"
                required
                placeholder="Enter admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-hps-border bg-hps-bg text-xs text-hps-text focus:outline-hidden focus:ring-2 focus:ring-hps-primary/30"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer hover:opacity-95 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: 'var(--hps-primary)' }}
            >
              {isLoggingIn ? 'Verifying Credentials...' : 'Authenticate as Administrator'}
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              onClick={() => onNavigate('/')}
              className="text-xs text-hps-muted hover:text-hps-text underline"
            >
              Return to Public Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authorized Admin View
  const averageRating =
    feedbackList.length > 0
      ? (feedbackList.reduce((acc, curr) => acc + curr.rating, 0) / feedbackList.length).toFixed(1)
      : '5.0';

  const handleUpdateStatus = (id: string, status: 'new' | 'reviewed') => {
    updateFeedbackStatus(id, status);
    setFeedbackList(getFeedbackList());
    const token = getAuthToken();
    if (token) {
      fetch(`/api/admin/feedback/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      }).catch(() => {});
    }
  };

  const handleDeleteFeedback = (id: string) => {
    deleteFeedback(id);
    setFeedbackList(getFeedbackList());
    const token = getAuthToken();
    if (token) {
      fetch(`/api/admin/feedback/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveSiteConfig(siteConfig);
    const token = getAuthToken();
    if (token) {
      fetch('/api/admin/site-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(siteConfig),
      }).catch(() => {});
    }
    setSaveBannerSuccess(true);
    setTimeout(() => setSaveBannerSuccess(false), 2500);
  };

  const filteredFeedback = feedbackList.filter((fb) => {
    if (filterRating === 'all') return true;
    return fb.rating === filterRating;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-hps-muted">
        <button onClick={() => onNavigate('/')} className="hover:text-hps-text flex items-center gap-1">
          <Icon name="Home" size={13} />
          <span>Home</span>
        </button>
        <Icon name="ChevronRight" size={12} className="opacity-40" />
        <span className="font-semibold text-hps-text">Admin Control Dashboard</span>
      </nav>

      {/* Hero Header */}
      <div className="p-6 sm:p-8 rounded-2xl border border-hps-border bg-gradient-to-br from-hps-surface to-hps-bg shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-hps-primary text-white">
              Verified Administrator
            </span>
            <span className="text-xs text-hps-muted">Harshit.hub Operator ({currentUser.email})</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-hps-text tracking-tight flex items-center gap-2.5">
            <Icon name="Shield" size={28} className="text-hps-accent" />
            <span>Website Control & Feedback Column</span>
          </h1>
          <p className="text-xs text-hps-muted">
            Manage site settings, review authentic visitor ratings, and oversee registered users.
          </p>
        </div>

        <button
          onClick={handleSignOutAdmin}
          className="px-4 py-2 rounded-xl text-xs font-bold border border-rose-300 dark:border-rose-900 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
        >
          Sign Out Admin
        </button>
      </div>

      {/* Top Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-hps-border bg-hps-surface shadow-xs">
          <span className="text-[11px] font-bold text-hps-muted uppercase">Average Star Rating</span>
          <div className="text-2xl font-black text-amber-500 flex items-center gap-1.5 mt-1 font-mono">
            <Icon name="Star" size={20} className="fill-amber-500" />
            <span>{averageRating} / 5.0</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-hps-border bg-hps-surface shadow-xs">
          <span className="text-[11px] font-bold text-hps-muted uppercase">Feedback Reviews</span>
          <div className="text-2xl font-black text-hps-primary mt-1 font-mono">
            {feedbackList.length}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-hps-border bg-hps-surface shadow-xs">
          <span className="text-[11px] font-bold text-hps-muted uppercase">Registered Users</span>
          <div className="text-2xl font-black text-hps-text mt-1 font-mono">
            {usersList.length} Accounts
          </div>
        </div>

        <div className="p-4 rounded-xl border border-hps-border bg-hps-surface shadow-xs">
          <span className="text-[11px] font-bold text-hps-muted uppercase">Creator Hub</span>
          <div className="text-xl font-black text-hps-accent mt-1 font-mono truncate">
            {siteConfig.creatorHub}
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid: Left (Website Control) & Right (Feedback Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Column 1: Website Control Block (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-hps-border">
              <h2 className="text-sm font-bold text-hps-text flex items-center gap-2">
                <Icon name="Sliders" size={16} className="text-hps-primary" />
                <span>Website Controls</span>
              </h2>
              <span className="text-[10px] text-hps-muted font-mono">Live Configuration</span>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              {/* Announcement Banner Toggle */}
              <div className="p-3.5 rounded-xl border border-hps-border bg-hps-bg space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="announcement-toggle" className="text-xs font-bold text-hps-text cursor-pointer">
                    Top Announcement Banner
                  </label>
                  <input
                    id="announcement-toggle"
                    type="checkbox"
                    checked={siteConfig.announcementEnabled}
                    onChange={(e) =>
                      setSiteConfig({ ...siteConfig, announcementEnabled: e.target.checked })
                    }
                    className="w-4 h-4 accent-hps-primary cursor-pointer"
                  />
                </div>
                {siteConfig.announcementEnabled && (
                  <textarea
                    rows={2}
                    value={siteConfig.announcementText}
                    onChange={(e) =>
                      setSiteConfig({ ...siteConfig, announcementText: e.target.value })
                    }
                    placeholder="Enter announcement text to display on all pages"
                    className="w-full p-2.5 rounded-lg border border-hps-border bg-hps-surface text-xs text-hps-text"
                  />
                )}
              </div>

              {/* Creator details */}
              <div className="space-y-3">
                <div>
                  <label htmlFor="creator-name-input" className="text-xs font-bold text-hps-text block mb-1">
                    Website Sign Name / Creator
                  </label>
                  <input
                    id="creator-name-input"
                    type="text"
                    value={siteConfig.creatorName}
                    onChange={(e) =>
                      setSiteConfig({ ...siteConfig, creatorName: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-hps-border bg-hps-bg text-xs font-semibold text-hps-text"
                  />
                </div>

                <div>
                  <label htmlFor="creator-hub-input" className="text-xs font-bold text-hps-text block mb-1">
                    Hub Sign Name
                  </label>
                  <input
                    id="creator-hub-input"
                    type="text"
                    value={siteConfig.creatorHub}
                    onChange={(e) =>
                      setSiteConfig({ ...siteConfig, creatorHub: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-hps-border bg-hps-bg text-xs font-semibold text-hps-text font-mono"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2 flex items-center justify-between">
                {saveBannerSuccess && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Icon name="Check" size={14} />
                    Settings Saved!
                  </span>
                )}
                <button
                  type="submit"
                  className="ml-auto px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer hover:opacity-90"
                  style={{ backgroundColor: 'var(--hps-primary)' }}
                >
                  Save Website Settings
                </button>
              </div>
            </form>
          </div>

          {/* Registered Users & Saved Data Column */}
          <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-hps-text flex items-center gap-2">
              <Icon name="Users" size={16} className="text-hps-primary" />
              <span>User Accounts & Work Activity</span>
            </h2>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {usersList.length === 0 ? (
                <p className="text-xs text-hps-muted py-4 text-center">No user accounts registered yet.</p>
              ) : (
                usersList.map((usr) => (
                  <div
                    key={usr.id}
                    className="p-3 rounded-xl border border-hps-border bg-hps-bg flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-xs font-bold text-hps-text flex items-center gap-1.5">
                        <span>{usr.name}</span>
                        {usr.role === 'admin' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold uppercase">
                            Admin
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-hps-muted font-mono">{usr.email}</p>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-hps-surface border border-hps-border text-hps-primary">
                      {usr.savedWork?.length || 0} saved
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Project Source Folder & Code Archive Card */}
          <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-hps-border">
              <h2 className="text-sm font-bold text-hps-text flex items-center gap-2">
                <Icon name="Folder" size={16} className="text-emerald-500" />
                <span>Project Source Folder</span>
              </h2>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                Export & Archives
              </span>
            </div>
            <p className="text-xs text-hps-muted leading-relaxed">
              Export and download the complete, clean source code of HPS Tools as a self-contained archive including all 21 tools, configs, tests, and documentation.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href="/hps-tools-project.zip"
                download="hps-tools-project.zip"
                className="inline-flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-hps-primary text-white text-xs font-bold hover:bg-hps-primary/90 transition-colors shadow-2xs"
              >
                <Icon name="Download" size={14} />
                <span>Download .ZIP</span>
              </a>
              <a
                href="/hps-tools-project.tar.gz"
                download="hps-tools-project.tar.gz"
                className="inline-flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-hps-border bg-hps-bg hover:bg-hps-surface text-xs font-bold text-hps-text transition-colors shadow-2xs"
              >
                <Icon name="Download" size={14} />
                <span>Download .TAR.GZ</span>
              </a>
            </div>
          </div>
        </div>

        {/* Column 2: Feedback & Ratings Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hps-border">
              <div>
                <h2 className="text-base font-bold text-hps-text flex items-center gap-2">
                  <Icon name="MessageSquareHeart" size={18} className="text-amber-500" />
                  <span>User Ratings & Feedback Column</span>
                </h2>
                <p className="text-xs text-hps-muted">
                  Read, review, and moderate submitted feedback and star ratings
                </p>
              </div>

              {/* Filter by stars */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-hps-muted font-medium">Filter:</span>
                {(['all', 5, 4, 3] as const).map((starVal) => (
                  <button
                    key={starVal}
                    onClick={() => setFilterRating(starVal as any)}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                      filterRating === starVal
                        ? 'bg-hps-primary text-white'
                        : 'border border-hps-border bg-hps-bg text-hps-muted hover:text-hps-text'
                    }`}
                  >
                    {starVal === 'all' ? 'All' : `${starVal}★`}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback List */}
            <div className="space-y-3">
              {filteredFeedback.length === 0 ? (
                <div className="py-12 text-center text-xs text-hps-muted">
                  No feedback matching the selected rating filter.
                </div>
              ) : (
                filteredFeedback.map((fb) => (
                  <div
                    key={fb.id}
                    className="p-4 rounded-xl border border-hps-border bg-hps-bg hover:border-hps-primary/40 transition-colors space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-hps-text">{fb.userName}</span>
                        <span className="text-[10px] text-hps-muted font-mono">{fb.userEmail}</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full border border-hps-border bg-hps-surface text-hps-muted font-semibold uppercase">
                          {fb.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Icon
                            key={s}
                            name="Star"
                            size={14}
                            className={
                              s <= fb.rating
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-slate-300 dark:text-slate-600'
                            }
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-hps-text leading-relaxed">
                      &quot;{fb.comment}&quot;
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-hps-border text-[11px] text-hps-muted">
                      <span>{new Date(fb.timestamp).toLocaleString()}</span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleUpdateStatus(fb.id, fb.status === 'reviewed' ? 'new' : 'reviewed')
                          }
                          className={`px-2 py-0.5 rounded-md font-semibold text-[10px] transition-colors ${
                            fb.status === 'reviewed'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {fb.status === 'reviewed' ? 'Reviewed' : 'Mark Reviewed'}
                        </button>

                        <button
                          onClick={() => handleDeleteFeedback(fb.id)}
                          className="p-1 rounded text-hps-muted hover:text-rose-600 transition-colors"
                          title="Delete review"
                        >
                          <Icon name="Trash2" size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
