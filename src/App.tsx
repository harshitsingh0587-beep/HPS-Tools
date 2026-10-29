/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ThemeModal } from './components/layout/ThemeModal';
import { AuthModal } from './components/auth/AuthModal';
import { FeedbackModal } from './components/feedback/FeedbackModal';
import { UserWorkspaceModal } from './components/user/UserWorkspaceModal';
import { AiChatDrawer } from './components/ai/AiChatDrawer';
import { getSavedTheme, applyThemeToDom } from './themes/themeManager';
import { getCurrentUser, UserProfile } from './services/auth/authService';
import { getSiteConfig, SiteConfiguration } from './services/admin/siteConfigService';
import { ThemeConfig } from './types';
import { Icon } from './components/common/Icon';

// Pages
import { HomePage } from './pages/HomePage';
import { AppearanceSettingsPage } from './pages/AppearanceSettingsPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

// Tools
import { CalculatorTool } from './tools/calculator/CalculatorTool';
import { PasswordGeneratorTool } from './tools/password-generator/PasswordGeneratorTool';
import { WordCounterTool } from './tools/word-counter/WordCounterTool';
import { UnitConverterTool } from './tools/unit-converter/UnitConverterTool';
import { DobCalculatorTool } from './tools/dob-calculator/DobCalculatorTool';
import { LoanCalculatorTool } from './tools/loan-calculator/LoanCalculatorTool';
import { PassportPhotoTool } from './tools/passport-photo-maker/PassportPhotoTool';
import { ImageResizerTool } from './tools/image-resizer/ImageResizerTool';
import { ConvertAllHub } from './tools/convert-all/ConvertAllHub';
import { DocumentConverterWorkspace } from './tools/convert-all/DocumentConverterWorkspace';
import { CONVERTER_CONFIGS } from './tools/convert-all/converterConfigs';

export default function App() {
  const [theme, setTheme] = useState<ThemeConfig>(getSavedTheme);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(getCurrentUser);
  const [siteConfig, setSiteConfig] = useState<SiteConfiguration>(getSiteConfig);

  // Modals state
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // Apply theme on initial load
  useEffect(() => {
    applyThemeToDom(theme);
  }, [theme]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (path: string) => {
    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo(0, 0);
    }
  };

  const handleThemeChange = (newTheme: ThemeConfig) => {
    setTheme(newTheme);
    applyThemeToDom(newTheme);
  };

  const handleRefreshUser = () => {
    setCurrentUser(getCurrentUser());
  };

  // Route Resolver
  const renderCurrentView = () => {
    const path = currentPath.length > 1 && currentPath.endsWith('/')
      ? currentPath.slice(0, -1)
      : currentPath;

    if (path === '/' || path === '') {
      return (
        <HomePage
          onNavigate={handleNavigate}
          onOpenAppearance={() => setIsThemeModalOpen(true)}
        />
      );
    }

    if (path === '/admin') {
      return (
        <AdminDashboardPage
          onNavigate={handleNavigate}
          currentUser={currentUser}
          onAdminAuthenticated={(user) => setCurrentUser(user)}
        />
      );
    }

    if (path === '/tools/calculator') {
      return <CalculatorTool onNavigate={handleNavigate} />;
    }

    if (path === '/tools/password-generator') {
      return <PasswordGeneratorTool onNavigate={handleNavigate} />;
    }

    if (path === '/tools/word-counter') {
      return <WordCounterTool onNavigate={handleNavigate} />;
    }

    if (path === '/tools/unit-converter') {
      return <UnitConverterTool onNavigate={handleNavigate} />;
    }

    if (path === '/tools/dob-calculator' || path === '/tools/date-of-birth-calculator') {
      return <DobCalculatorTool onNavigate={handleNavigate} />;
    }

    if (path === '/tools/loan-calculator') {
      return <LoanCalculatorTool onNavigate={handleNavigate} />;
    }

    if (path === '/tools/passport-photo-maker') {
      return <PassportPhotoTool onNavigate={handleNavigate} />;
    }

    if (path === '/tools/image-resizer') {
      return <ImageResizerTool onNavigate={handleNavigate} />;
    }

    if (path === '/tools/convert-all') {
      return <ConvertAllHub onNavigate={handleNavigate} />;
    }

    // Dedicated converter routes
    if (path.startsWith('/tools/')) {
      const toolSlug = path.replace('/tools/', '');
      const converterConfig = CONVERTER_CONFIGS[toolSlug];
      if (converterConfig) {
        return (
          <DocumentConverterWorkspace
            config={converterConfig}
            onNavigate={handleNavigate}
          />
        );
      }
    }

    if (path === '/settings/appearance') {
      return (
        <AppearanceSettingsPage
          currentTheme={theme}
          onThemeChange={handleThemeChange}
          onNavigate={handleNavigate}
        />
      );
    }

    if (path === '/about') {
      return <AboutPage onNavigate={handleNavigate} />;
    }

    if (path === '/privacy') {
      return <PrivacyPolicyPage onNavigate={handleNavigate} />;
    }

    return <NotFoundPage onNavigate={handleNavigate} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-hps-bg text-hps-text transition-colors duration-200">
      {/* Optional Admin Announcement Banner */}
      {siteConfig.announcementEnabled && siteConfig.announcementText && (
        <aside aria-label="Announcement" className="w-full bg-hps-primary text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2 border-b border-white/10 shadow-xs">
          <Icon name="Sparkles" size={14} className="text-hps-accent shrink-0" />
          <span>{siteConfig.announcementText}</span>
          <span className="hidden sm:inline font-bold text-hps-accent">
            • {siteConfig.creatorHub}
          </span>
        </aside>
      )}

      <Header
        onNavigate={handleNavigate}
        onOpenAppearance={() => setIsThemeModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenFeedback={() => setIsFeedbackModalOpen(true)}
        onOpenWorkspace={() => setIsWorkspaceModalOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        currentUser={currentUser}
        currentPath={currentPath}
      />

      <main className="flex-1 w-full">
        {renderCurrentView()}
      </main>

      <Footer
        onNavigate={handleNavigate}
        onOpenAppearance={() => setIsThemeModalOpen(true)}
        onOpenFeedback={() => setIsFeedbackModalOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
      />

      {/* Floating AI Assistant Trigger Bubble */}
      <button
        onClick={() => setIsAiAssistantOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-hps-primary text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all border border-hps-accent/40 group cursor-pointer"
        aria-label="Open AI Assistant"
        title="Open HPS AI Assistant"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-hps-accent opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-hps-accent"></span>
        </span>
        <Icon name="Sparkles" size={17} className="text-hps-accent group-hover:rotate-12 transition-transform" />
        <span className="text-xs font-bold tracking-wide">AI Assistant</span>
      </button>

      {/* Interactive AI Assistant Drawer */}
      <AiChatDrawer
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Interactive Modals */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={theme}
        onThemeChange={handleThemeChange}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onUserChanged={(user) => setCurrentUser(user)}
        currentUser={currentUser}
      />

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        defaultUserName={currentUser ? currentUser.name : 'harshit.hub'}
      />

      {currentUser && (
        <UserWorkspaceModal
          isOpen={isWorkspaceModalOpen}
          onClose={() => setIsWorkspaceModalOpen(false)}
          user={currentUser}
          onRefreshUser={handleRefreshUser}
        />
      )}
    </div>
  );
}
