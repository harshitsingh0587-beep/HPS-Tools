import React, { useState } from 'react';
import { STARTER_THEMES, saveTheme, applyThemeToDom } from '../themes/themeManager';
import { ThemeConfig } from '../types';
import { Icon } from '../components/common/Icon';

interface AppearanceSettingsPageProps {
  currentTheme: ThemeConfig;
  onThemeChange: (newTheme: ThemeConfig) => void;
  onNavigate: (path: string) => void;
}

export const AppearanceSettingsPage: React.FC<AppearanceSettingsPageProps> = ({
  currentTheme,
  onThemeChange,
  onNavigate,
}) => {
  const [draftTheme, setDraftTheme] = useState<ThemeConfig>(currentTheme);
  const [savedNotification, setSavedNotification] = useState(false);

  const handleSelectPreset = (key: string) => {
    const selected = STARTER_THEMES[key];
    if (selected) {
      setDraftTheme({ ...selected });
      applyThemeToDom(selected);
    }
  };

  const handleColorUpdate = (colorKey: keyof ThemeConfig['colors'], value: string) => {
    const updated: ThemeConfig = {
      ...draftTheme,
      id: 'custom',
      name: 'Custom Theme',
      colors: {
        ...draftTheme.colors,
        [colorKey]: value,
      },
    };
    setDraftTheme(updated);
    applyThemeToDom(updated);
  };

  const handleToggleDark = () => {
    const isDark = !draftTheme.isDark;
    const basePreset = isDark ? STARTER_THEMES.dark : STARTER_THEMES.classic;
    const updated = {
      ...basePreset,
      isDark,
    };
    setDraftTheme(updated);
    applyThemeToDom(updated);
  };

  const handleSaveAndApply = () => {
    saveTheme(draftTheme);
    onThemeChange(draftTheme);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  const handleResetDefault = () => {
    const defaultTheme = STARTER_THEMES.classic;
    setDraftTheme(defaultTheme);
    applyThemeToDom(defaultTheme);
    saveTheme(defaultTheme);
    onThemeChange(defaultTheme);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-hps-muted">
        <button onClick={() => onNavigate('/')} className="hover:text-hps-text flex items-center gap-1">
          <Icon name="Home" size={13} />
          <span>Home</span>
        </button>
        <Icon name="ChevronRight" size={12} className="opacity-40" />
        <span className="font-semibold text-hps-text">Customize Appearance</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-hps-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-hps-text tracking-tight flex items-center gap-2.5">
            <Icon name="Palette" size={28} className="text-hps-accent" />
            <span>Customize Appearance</span>
          </h1>
          <p className="text-sm text-hps-muted mt-1">
            Choose from curated color themes or craft custom palettes. All preferences are preserved in local storage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleDark}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-hps-border bg-hps-surface hover:bg-hps-bg text-hps-text transition-colors"
          >
            <Icon name={draftTheme.isDark ? 'Sun' : 'Moon'} size={15} />
            <span>{draftTheme.isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
          </button>
        </div>
      </div>

      {/* Preset Cards */}
      <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-hps-text">1. Curated Starter Themes</h2>
        <p className="text-xs text-hps-muted">
          Engineered for contrast, accessibility, and high visual clarity:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {Object.values(STARTER_THEMES).map((theme) => {
            const isSelected = draftTheme.name === theme.name;
            return (
              <button
                key={theme.id}
                onClick={() => handleSelectPreset(theme.id)}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-hps-primary ring-2 ring-hps-primary/30 bg-hps-bg shadow-sm'
                    : 'border-hps-border bg-hps-surface hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-hps-text">{theme.name}</span>
                  {isSelected && <Icon name="CheckCircle" size={16} className="text-hps-primary shrink-0" />}
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg border border-black/10 shadow-xs flex items-center justify-center text-[9px] font-bold text-white"
                    style={{ backgroundColor: theme.colors.primary }}
                    title={`Primary: ${theme.colors.primary}`}
                  >
                    Pri
                  </div>
                  <div
                    className="w-7 h-7 rounded-lg border border-black/10 shadow-xs flex items-center justify-center text-[9px] font-bold text-slate-900"
                    style={{ backgroundColor: theme.colors.accent }}
                    title={`Accent: ${theme.colors.accent}`}
                  >
                    Acc
                  </div>
                  <div
                    className="w-7 h-7 rounded-lg border border-black/10 shadow-xs flex items-center justify-center text-[9px] font-bold text-slate-700"
                    style={{ backgroundColor: theme.colors.bg }}
                    title={`Background: ${theme.colors.bg}`}
                  >
                    Bg
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Color Tuning */}
      <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-hps-text">2. Custom Color Picker</h2>
        <p className="text-xs text-hps-muted">
          Pick your own exact hex codes. Changes are previewed instantly on the live site:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl border border-hps-border bg-hps-bg flex items-center justify-between">
            <div>
              <span className="text-xs font-bold block text-hps-text">Primary Brand</span>
              <span className="text-[11px] font-mono text-hps-muted">{draftTheme.colors.primary}</span>
            </div>
            <input
              type="color"
              value={draftTheme.colors.primary}
              onChange={(e) => handleColorUpdate('primary', e.target.value)}
              className="w-9 h-9 rounded-lg border-0 cursor-pointer"
            />
          </div>

          <div className="p-3.5 rounded-xl border border-hps-border bg-hps-bg flex items-center justify-between">
            <div>
              <span className="text-xs font-bold block text-hps-text">Accent Gold/Tone</span>
              <span className="text-[11px] font-mono text-hps-muted">{draftTheme.colors.accent}</span>
            </div>
            <input
              type="color"
              value={draftTheme.colors.accent}
              onChange={(e) => handleColorUpdate('accent', e.target.value)}
              className="w-9 h-9 rounded-lg border-0 cursor-pointer"
            />
          </div>

          <div className="p-3.5 rounded-xl border border-hps-border bg-hps-bg flex items-center justify-between">
            <div>
              <span className="text-xs font-bold block text-hps-text">Page Background</span>
              <span className="text-[11px] font-mono text-hps-muted">{draftTheme.colors.bg}</span>
            </div>
            <input
              type="color"
              value={draftTheme.colors.bg}
              onChange={(e) => handleColorUpdate('bg', e.target.value)}
              className="w-9 h-9 rounded-lg border-0 cursor-pointer"
            />
          </div>

          <div className="p-3.5 rounded-xl border border-hps-border bg-hps-bg flex items-center justify-between">
            <div>
              <span className="text-xs font-bold block text-hps-text">Body Text</span>
              <span className="text-[11px] font-mono text-hps-muted">{draftTheme.colors.text}</span>
            </div>
            <input
              type="color"
              value={draftTheme.colors.text}
              onChange={(e) => handleColorUpdate('text', e.target.value)}
              className="w-9 h-9 rounded-lg border-0 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Live Preview Box */}
      <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-hps-text">3. Live UI Component Preview</h2>
        <div className="p-6 rounded-xl border border-hps-border bg-hps-bg space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs"
              style={{ backgroundColor: draftTheme.colors.primary }}
            >
              Primary Action Button
            </button>
            <button
              className="px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs"
              style={{ backgroundColor: draftTheme.colors.accent, color: '#142B50' }}
            >
              Accent Highlight Button
            </button>
            <div className="px-4 py-2 rounded-xl text-xs font-medium border border-hps-border bg-hps-surface text-hps-text">
              Sample Card / Input Box
            </div>
          </div>
        </div>
      </div>

      {/* Save & Reset Actions Bar */}
      <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={handleResetDefault}
          className="text-xs font-semibold text-hps-muted hover:text-rose-500 transition-colors flex items-center gap-1.5"
        >
          <Icon name="RotateCcw" size={14} />
          <span>Reset to Classic HPS Default (Navy & Gold)</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {savedNotification && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 animate-in fade-in">
              <Icon name="Check" size={14} />
              Theme Saved!
            </span>
          )}
          <button
            onClick={handleSaveAndApply}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-95 transition-all cursor-pointer"
            style={{ backgroundColor: 'var(--hps-primary)' }}
          >
            Save & Keep Theme
          </button>
        </div>
      </div>
    </div>
  );
};
