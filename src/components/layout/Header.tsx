import React, { useState } from 'react';
import { Logo } from '../common/Logo';
import { Icon } from '../common/Icon';
import { TOOLS_CATALOG } from '../../data/toolsCatalog';
import { UserProfile } from '../../services/auth/authService';

interface HeaderProps {
  onNavigate: (path: string) => void;
  onOpenAppearance: () => void;
  onOpenAuth: () => void;
  onOpenFeedback: () => void;
  onOpenWorkspace: () => void;
  currentUser: UserProfile | null;
  currentPath: string;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  onOpenAppearance,
  onOpenAuth,
  onOpenFeedback,
  onOpenWorkspace,
  currentUser,
  currentPath,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = searchQuery.trim()
    ? TOOLS_CATALOG.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 8)
    : [];

  const handleToolClick = (path: string) => {
    onNavigate(path);
    setSearchOpen(false);
    setSearchQuery('');
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-hps-border bg-hps-surface/90 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div 
            onClick={() => onNavigate('/')}
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate('/')}
            aria-label="HPS Tools Home"
          >
            <Logo size="md" showTagline={true} />
          </div>

          {/* Search Trigger (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-hps-muted bg-hps-bg rounded-xl border border-hps-border hover:border-hps-primary/50 transition-all cursor-pointer text-left"
              aria-label="Search tools"
            >
              <div className="flex items-center gap-2">
                <Icon name="Search" size={15} />
                <span>Search tools (Calculator, Convert, Passport...)...</span>
              </div>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] bg-hps-surface rounded border border-hps-border font-mono">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* Right Navigation Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="md:hidden p-2 rounded-xl border border-hps-border text-hps-text hover:bg-hps-bg"
              aria-label="Open search"
            >
              <Icon name="Search" size={18} />
            </button>

            {/* Feedback Button */}
            <button
              onClick={onOpenFeedback}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-hps-border hover:border-amber-400 hover:bg-hps-bg text-hps-text transition-colors"
              title="Give Feedback & Star Rating"
            >
              <Icon name="Star" size={14} className="text-amber-500 fill-amber-500" />
              <span className="hidden sm:inline">Feedback</span>
            </button>

            {/* Saved Work folder */}
            {currentUser && (
              <button
                onClick={onOpenWorkspace}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-hps-border hover:border-hps-primary hover:bg-hps-bg text-hps-text transition-colors"
                title="View My Saved Work"
              >
                <Icon name="FolderHeart" size={14} className="text-hps-primary" />
                <span className="hidden sm:inline">Saved</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-hps-primary text-white font-bold">
                  {currentUser.savedWork.length}
                </span>
              </button>
            )}

            {/* Admin Dashboard */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => onNavigate('/admin')}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
                  currentPath === '/admin'
                    ? 'border-hps-primary bg-hps-primary text-white'
                    : 'border-hps-accent/50 bg-hps-accent/10 text-hps-text hover:bg-hps-accent/20'
                }`}
                title="Admin Control Dashboard"
              >
                <Icon name="Shield" size={14} className="text-hps-accent" />
                <span>Admin</span>
              </button>
            )}

            {/* Theme Customizer */}
            <button
              onClick={onOpenAppearance}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-hps-border hover:border-hps-accent hover:bg-hps-bg text-hps-text transition-colors"
              title="Customize Themes & Colors"
              aria-label="Customize Appearance"
            >
              <Icon name="Palette" size={15} className="text-hps-accent" />
              <span className="hidden lg:inline">Theme</span>
            </button>

            {/* harshit.hub Sign In / User Profile */}
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-xl border border-hps-border bg-hps-bg hover:bg-hps-surface text-hps-text transition-colors shadow-2xs"
              title={currentUser ? `Signed in as ${currentUser.name}` : 'Sign in to harshit.hub'}
            >
              {currentUser ? (
                <>
                  <span className="w-5 h-5 rounded-full bg-hps-primary text-white text-[10px] flex items-center justify-center font-bold">
                    {currentUser.avatarInitials}
                  </span>
                  <span className="hidden sm:inline truncate max-w-[80px]">{currentUser.name}</span>
                </>
              ) : (
                <>
                  <Icon name="User" size={14} className="text-hps-primary" />
                  <span>Sign In</span>
                </>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-hps-border text-hps-text hover:bg-hps-bg lg:hidden"
              aria-label="Toggle Navigation Menu"
            >
              <Icon name={mobileMenuOpen ? 'X' : 'Menu'} size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-hps-border bg-hps-surface px-4 py-4 space-y-3 shadow-lg">
            <div className="flex flex-col gap-1 text-sm font-medium">
              <button
                onClick={() => handleToolClick('/')}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-hps-bg text-left text-hps-text"
              >
                <Icon name="Home" size={16} />
                <span>All Tools Directory</span>
              </button>
              <button
                onClick={() => handleToolClick('/tools/convert-all')}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-hps-bg text-left text-hps-text"
              >
                <Icon name="RefreshCw" size={16} />
                <span>Convert All Centre</span>
              </button>
              <button
                onClick={() => handleToolClick('/tools/calculator')}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-hps-bg text-left text-hps-text"
              >
                <Icon name="Calculator" size={16} />
                <span>Smart Calculator</span>
              </button>
              <button
                onClick={() => handleToolClick('/tools/loan-calculator')}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-hps-bg text-left text-hps-text"
              >
                <Icon name="DollarSign" size={16} />
                <span>Loan Calculator</span>
              </button>
              <button
                onClick={() => handleToolClick('/tools/dob-calculator')}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-hps-bg text-left text-hps-text"
              >
                <Icon name="Calendar" size={16} />
                <span>DOB Calculator</span>
              </button>
              <button
                onClick={() => handleToolClick('/tools/passport-photo-maker')}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-hps-bg text-left text-hps-text"
              >
                <Icon name="Camera" size={16} />
                <span>Passport Photo Maker</span>
              </button>
              <button
                onClick={() => handleToolClick('/tools/image-resizer')}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-hps-bg text-left text-hps-text"
              >
                <Icon name="Maximize2" size={16} />
                <span>Image Resizer</span>
              </button>

              <div className="pt-2 border-t border-hps-border space-y-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenFeedback();
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-hps-bg text-left text-amber-500 font-semibold"
                >
                  <Icon name="Star" size={16} className="fill-amber-500" />
                  <span>Give Star Rating & Feedback</span>
                </button>

                {currentUser && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenWorkspace();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-hps-bg text-left text-hps-primary font-semibold"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon name="FolderHeart" size={16} />
                      <span>My Saved Work</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-hps-primary text-white">
                      {currentUser.savedWork.length}
                    </span>
                  </button>
                )}

                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => handleToolClick('/admin')}
                    className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-hps-bg text-left text-hps-accent font-bold"
                  >
                    <Icon name="Shield" size={16} />
                    <span>Admin Control Dashboard</span>
                  </button>
                )}
              </div>

              <div className="pt-2 border-t border-hps-border flex items-center justify-between">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAppearance();
                  }}
                  className="flex items-center gap-2 text-xs font-semibold text-hps-accent"
                >
                  <Icon name="Palette" size={15} />
                  <span>Customize Appearance</span>
                </button>
                <button
                  onClick={() => handleToolClick('/about')}
                  className="text-xs text-hps-muted hover:text-hps-text"
                >
                  About HPS
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Global Tool Quick Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-xs">
          <div 
            className="w-full max-w-xl bg-hps-surface rounded-2xl shadow-2xl border border-hps-border overflow-hidden"
            role="dialog"
            aria-modal="true"
          >
            <div className="p-4 border-b border-hps-border flex items-center gap-3">
              <Icon name="Search" size={18} className="text-hps-muted" />
              <input
                type="text"
                autoFocus
                placeholder="Search tools by name, tag, or function..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-0 text-sm text-hps-text focus:outline-hidden"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-md text-hps-muted hover:bg-hps-bg"
              >
                <Icon name="X" size={16} />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {searchQuery.trim() === '' ? (
                <div className="p-4 text-xs text-hps-muted">
                  <span className="font-semibold block mb-2 text-hps-text">Popular quick tools:</span>
                  <div className="flex flex-wrap gap-2">
                    {TOOLS_CATALOG.filter((t) => t.popular).map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => handleToolClick(tool.path)}
                        className="px-2.5 py-1 text-xs rounded-lg border border-hps-border bg-hps-bg hover:border-hps-primary/50 text-hps-text flex items-center gap-1.5"
                      >
                        <Icon name={tool.icon} size={13} />
                        <span>{tool.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : filteredTools.length > 0 ? (
                <div className="space-y-1">
                  {filteredTools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => handleToolClick(tool.path)}
                      className="w-full p-2.5 rounded-xl hover:bg-hps-bg flex items-center justify-between text-left group transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-hps-primary/10 text-hps-primary">
                          <Icon name={tool.icon} size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-hps-text group-hover:text-hps-primary">
                            {tool.name}
                          </p>
                          <p className="text-xs text-hps-muted line-clamp-1">{tool.description}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border border-hps-border bg-hps-surface text-hps-muted">
                        {tool.category}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-hps-muted">
                  No tools found matching &quot;{searchQuery}&quot;.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
