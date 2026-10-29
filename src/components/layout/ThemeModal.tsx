import React, { useState } from 'react';
import { STARTER_THEMES, saveTheme, applyThemeToDom } from '../../themes/themeManager';
import { ThemeConfig } from '../../types';
import { Icon } from '../common/Icon';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeConfig;
  onThemeChange: (newTheme: ThemeConfig) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onThemeChange,
}) => {
  const [draftTheme, setDraftTheme] = useState<ThemeConfig>(currentTheme);
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');

  if (!isOpen) return null;

  const handleSelectPreset = (presetKey: string) => {
    const selected = STARTER_THEMES[presetKey];
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
    setDraftTheme({
      ...basePreset,
      isDark,
    });
    applyThemeToDom({
      ...basePreset,
      isDark,
    });
  };

  const handleApply = () => {
    saveTheme(draftTheme);
    onThemeChange(draftTheme);
    onClose();
  };

  const handleResetDefault = () => {
    const defaultTheme = STARTER_THEMES.classic;
    setDraftTheme(defaultTheme);
    applyThemeToDom(defaultTheme);
    saveTheme(defaultTheme);
    onThemeChange(defaultTheme);
  };

  const handleCancel = () => {
    applyThemeToDom(currentTheme);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl rounded-2xl shadow-2xl border border-hps-border overflow-hidden bg-hps-surface text-hps-text"
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-hps-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-hps-primary/10 text-hps-primary">
              <Icon name="Palette" size={20} />
            </div>
            <div>
              <h2 id="theme-modal-title" className="text-lg font-bold">Customize Appearance</h2>
              <p className="text-xs text-hps-muted">Personalize theme colours, contrast, and dark mode</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-hps-muted"
            aria-label="Close appearance settings"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 pt-4 flex gap-2 border-b border-hps-border">
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-2.5 px-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'presets'
                ? 'border-hps-primary text-hps-primary'
                : 'border-transparent text-hps-muted hover:text-hps-text'
            }`}
          >
            Curated Themes
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-2.5 px-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'custom'
                ? 'border-hps-primary text-hps-primary'
                : 'border-transparent text-hps-muted hover:text-hps-text'
            }`}
          >
            Custom Palette
          </button>
          <div className="ml-auto flex items-center gap-2 pb-2">
            <button
              onClick={handleToggleDark}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border border-hps-border hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Toggle Light / Dark mode"
            >
              <Icon name={draftTheme.isDark ? 'Sun' : 'Moon'} size={14} />
              <span>{draftTheme.isDark ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {activeTab === 'presets' ? (
            <div>
              <p className="text-xs text-hps-muted mb-3 font-medium">Select one of 7 official starter themes:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.values(STARTER_THEMES).map((theme) => {
                  const isSelected = draftTheme.name === theme.name;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => handleSelectPreset(theme.id)}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-hps-primary ring-2 ring-hps-primary/30 shadow-sm'
                          : 'border-hps-border hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate">{theme.name}</span>
                        {isSelected && <Icon name="Check" size={14} className="text-hps-primary shrink-0" />}
                      </div>
                      <div className="flex gap-1.5 items-center">
                        <div
                          className="w-5 h-5 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: theme.colors.primary }}
                          title={`Primary: ${theme.colors.primary}`}
                        />
                        <div
                          className="w-5 h-5 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: theme.colors.accent }}
                          title={`Accent: ${theme.colors.accent}`}
                        />
                        <div
                          className="w-5 h-5 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: theme.colors.bg }}
                          title={`Background: ${theme.colors.bg}`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-hps-muted font-medium">Fine-tune individual theme colours with real-time preview:</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Primary */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-hps-border">
                  <div>
                    <label className="text-xs font-bold block">Primary Color</label>
                    <span className="text-[11px] text-hps-muted font-mono">{draftTheme.colors.primary}</span>
                  </div>
                  <input
                    type="color"
                    value={draftTheme.colors.primary}
                    onChange={(e) => handleColorUpdate('primary', e.target.value)}
                    className="w-9 h-9 rounded-lg border-0 cursor-pointer"
                  />
                </div>

                {/* Accent */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-hps-border">
                  <div>
                    <label className="text-xs font-bold block">Accent Color</label>
                    <span className="text-[11px] text-hps-muted font-mono">{draftTheme.colors.accent}</span>
                  </div>
                  <input
                    type="color"
                    value={draftTheme.colors.accent}
                    onChange={(e) => handleColorUpdate('accent', e.target.value)}
                    className="w-9 h-9 rounded-lg border-0 cursor-pointer"
                  />
                </div>

                {/* Background */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-hps-border">
                  <div>
                    <label className="text-xs font-bold block">Background</label>
                    <span className="text-[11px] text-hps-muted font-mono">{draftTheme.colors.bg}</span>
                  </div>
                  <input
                    type="color"
                    value={draftTheme.colors.bg}
                    onChange={(e) => handleColorUpdate('bg', e.target.value)}
                    className="w-9 h-9 rounded-lg border-0 cursor-pointer"
                  />
                </div>

                {/* Text */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-hps-border">
                  <div>
                    <label className="text-xs font-bold block">Text Color</label>
                    <span className="text-[11px] text-hps-muted font-mono">{draftTheme.colors.text}</span>
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
          )}

          {/* Live Preview Box */}
          <div className="p-4 rounded-xl border border-hps-border bg-hps-bg">
            <span className="text-[11px] uppercase tracking-wider font-bold text-hps-muted block mb-2">Live UI Preview</span>
            <div className="flex flex-wrap items-center gap-3">
              <button
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-xs"
                style={{ backgroundColor: draftTheme.colors.primary }}
              >
                Primary Button
              </button>
              <button
                className="px-4 py-2 rounded-lg text-xs font-semibold shadow-xs"
                style={{ backgroundColor: draftTheme.colors.accent, color: '#142B50' }}
              >
                Accent Action
              </button>
              <span className="text-xs font-medium px-3 py-1.5 rounded-lg border border-hps-border bg-hps-surface">
                Sample Card Element
              </span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-hps-border flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={handleResetDefault}
            className="text-xs font-semibold text-hps-muted hover:text-hps-text flex items-center gap-1.5"
          >
            <Icon name="RotateCcw" size={14} />
            <span>Reset to Default</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-hps-border hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 text-xs font-bold rounded-lg text-white shadow-sm hover:opacity-95"
              style={{ backgroundColor: draftTheme.colors.primary }}
            >
              Apply Theme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
