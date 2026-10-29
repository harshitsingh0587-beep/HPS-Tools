import React, { useState, useEffect, useCallback } from 'react';
import { WorkspaceShell } from '../../components/layout/WorkspaceShell';
import { generatePassword, evaluatePasswordStrength, PasswordOptions } from '../../utils/password';
import { Icon } from '../../components/common/Icon';

interface PasswordGeneratorToolProps {
  onNavigate: (path: string) => void;
}

export const PasswordGeneratorTool: React.FC<PasswordGeneratorToolProps> = ({ onNavigate }) => {
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeAmbiguous: true,
  });

  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(() => {
    const { password: newPw, error: err } = generatePassword(options);
    if (err) {
      setError(err);
      setPassword('');
    } else {
      setError(null);
      setPassword(newPw);
    }
  }, [options]);

  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  const handleCopy = () => {
    if (password) {
      navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const strength = evaluatePasswordStrength(password);

  return (
    <WorkspaceShell
      toolId="password-generator"
      title="Secure Password Generator"
      description="Create cryptographically secure, high-entropy passwords directly in your browser. Passwords are never saved, tracked, or sent anywhere."
      category="Everyday Tools"
      iconName="ShieldCheck"
      onNavigate={onNavigate}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Output Box */}
        <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-4">
          <div className="p-4 rounded-xl border border-hps-border bg-hps-bg flex items-center justify-between gap-3 min-h-[64px]">
            <div className="font-mono text-lg sm:text-xl font-bold text-hps-text break-all select-all">
              {password || <span className="text-hps-muted text-sm font-normal">Select at least one character type</span>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleGenerate}
                className="p-2.5 rounded-xl border border-hps-border bg-hps-surface hover:bg-hps-bg text-hps-text transition-colors"
                title="Regenerate new password"
                aria-label="Regenerate password"
              >
                <Icon name="RefreshCw" size={17} />
              </button>
              <button
                onClick={handleCopy}
                disabled={!password}
                className="px-4 py-2.5 rounded-xl font-semibold text-xs text-white transition-all shadow-xs flex items-center gap-2 disabled:opacity-40"
                style={{ backgroundColor: 'var(--hps-primary)' }}
                aria-label="Copy password to clipboard"
              >
                <Icon name={copied ? 'Check' : 'Copy'} size={15} />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Strength Bar */}
          {password && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-hps-muted">Password Strength:</span>
                <span className="font-bold" style={{ color: strength.color }}>
                  {strength.label} ({strength.entropy} bits entropy)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex gap-1">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <div
                    key={lvl}
                    className="flex-1 transition-all duration-300"
                    style={{
                      backgroundColor: lvl <= strength.score ? strength.color : 'transparent',
                    }}
                  />
                ))}
              </div>
              <p className="text-[11px] text-hps-muted">{strength.feedback}</p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
              <Icon name="AlertCircle" size={15} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Configuration Controls */}
        <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-hps-text pb-2 border-b border-hps-border">
            Generator Configuration
          </h2>

          {/* Length Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="length-slider" className="font-bold text-hps-text">Password Length</label>
              <span className="font-mono font-bold px-2 py-0.5 rounded border border-hps-border bg-hps-bg">
                {options.length} characters
              </span>
            </div>
            <input
              id="length-slider"
              type="range"
              min={6}
              max={64}
              value={options.length}
              onChange={(e) => setOptions({ ...options, length: parseInt(e.target.value) })}
              className="w-full accent-hps-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-hps-muted font-mono">
              <span>6 (Minimum)</span>
              <span>16 (Standard)</span>
              <span>32 (Strong)</span>
              <span>64 (Maximum)</span>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-hps-border bg-hps-bg cursor-pointer hover:border-hps-primary/40">
              <input
                type="checkbox"
                checked={options.includeUppercase}
                onChange={(e) => setOptions({ ...options, includeUppercase: e.target.checked })}
                className="w-4 h-4 accent-hps-primary rounded"
              />
              <div>
                <span className="text-xs font-bold block text-hps-text">Uppercase Letters</span>
                <span className="text-[11px] text-hps-muted font-mono">A-Z</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-hps-border bg-hps-bg cursor-pointer hover:border-hps-primary/40">
              <input
                type="checkbox"
                checked={options.includeLowercase}
                onChange={(e) => setOptions({ ...options, includeLowercase: e.target.checked })}
                className="w-4 h-4 accent-hps-primary rounded"
              />
              <div>
                <span className="text-xs font-bold block text-hps-text">Lowercase Letters</span>
                <span className="text-[11px] text-hps-muted font-mono">a-z</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-hps-border bg-hps-bg cursor-pointer hover:border-hps-primary/40">
              <input
                type="checkbox"
                checked={options.includeNumbers}
                onChange={(e) => setOptions({ ...options, includeNumbers: e.target.checked })}
                className="w-4 h-4 accent-hps-primary rounded"
              />
              <div>
                <span className="text-xs font-bold block text-hps-text">Numbers</span>
                <span className="text-[11px] text-hps-muted font-mono">0-9</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-hps-border bg-hps-bg cursor-pointer hover:border-hps-primary/40">
              <input
                type="checkbox"
                checked={options.includeSymbols}
                onChange={(e) => setOptions({ ...options, includeSymbols: e.target.checked })}
                className="w-4 h-4 accent-hps-primary rounded"
              />
              <div>
                <span className="text-xs font-bold block text-hps-text">Special Symbols</span>
                <span className="text-[11px] text-hps-muted font-mono">!@#$%^&*</span>
              </div>
            </label>
          </div>

          <label className="flex items-start gap-3 p-3 rounded-xl border border-hps-border bg-hps-bg cursor-pointer hover:border-hps-primary/40">
            <input
              type="checkbox"
              checked={options.excludeAmbiguous}
              onChange={(e) => setOptions({ ...options, excludeAmbiguous: e.target.checked })}
              className="w-4 h-4 accent-hps-primary rounded mt-0.5"
            />
            <div>
              <span className="text-xs font-bold block text-hps-text">Exclude Ambiguous Characters</span>
              <span className="text-[11px] text-hps-muted">
                Avoids easily confused glyphs like <span className="font-mono font-bold">1, l, I, 0, O</span> for error-free manual typing.
              </span>
            </div>
          </label>
        </div>

        {/* Security assurance */}
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
          <Icon name="Shield" size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Cryptographic Safety Notice:</strong> All passwords are built using the Web Cryptography API (`crypto.getRandomValues`) with uniform distribution entropy. No data ever leaves your device.
          </p>
        </div>
      </div>
    </WorkspaceShell>
  );
};
