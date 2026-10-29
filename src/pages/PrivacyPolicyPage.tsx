import React from 'react';
import { Icon } from '../components/common/Icon';

interface PrivacyPolicyPageProps {
  onNavigate: (path: string) => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-hps-muted">
        <button onClick={() => onNavigate('/')} className="hover:text-hps-text flex items-center gap-1">
          <Icon name="Home" size={13} />
          <span>Home</span>
        </button>
        <Icon name="ChevronRight" size={12} className="opacity-40" />
        <span className="font-semibold text-hps-text">Privacy Policy</span>
      </nav>

      {/* Header */}
      <div className="pb-6 border-b border-hps-border">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-hps-text tracking-tight flex items-center gap-2.5">
          <Icon name="Lock" size={28} className="text-emerald-500" />
          <span>Privacy & Security Policy</span>
        </h1>
        <p className="text-xs text-hps-muted mt-1">
          Last updated: October 2026 • Effective immediately
        </p>
      </div>

      {/* Policy Sections */}
      <div className="space-y-6 text-xs text-hps-muted leading-relaxed">
        <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-hps-text flex items-center gap-2">
            <Icon name="CheckCircle2" size={16} className="text-emerald-500" />
            <span>1. 100% Client-Side In-Memory Execution</span>
          </h2>
          <p>
            Unlike conventional utility websites that require you to upload your confidential tax returns, contracts, photos, and passwords to remote third-party cloud servers, <strong>HPS Tools executes all calculations, format conversions, and image operations locally in your web browser</strong> using JavaScript, WebAssembly, and standard HTML5 Canvas APIs.
          </p>
          <p>
            Your uploaded documents, images, and entered financial details never travel across the internet to our servers or any cloud database.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-hps-text flex items-center gap-2">
            <Icon name="Trash2" size={16} className="text-emerald-500" />
            <span>2. Automatic Resource Garbage Collection</span>
          </h2>
          <p>
            When you upload or convert files within HPS Tools, temporary objects are referenced via in-memory <code className="font-mono text-hps-text">blob:</code> URLs. As soon as you clear the workspace, navigate away, or close your browser tab, all temporary resources are released from memory by the browser garbage collector.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-hps-text flex items-center gap-2">
            <Icon name="Shield" size={16} className="text-emerald-500" />
            <span>3. Cryptographic Password Security</span>
          </h2>
          <p>
            Our Secure Password Generator relies exclusively on the browser&apos;s native <code className="font-mono text-hps-text">crypto.getRandomValues</code> API. Generated passwords are never transmitted over any network, are never stored in cookies or databases, and do not appear in analytics or server logs.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-hps-text flex items-center gap-2">
            <Icon name="Database" size={16} className="text-emerald-500" />
            <span>4. Local Storage Preferences</span>
          </h2>
          <p>
            The only information retained on your device is your chosen color theme and your optional pinned/favorite tools. This data is stored strictly in your browser&apos;s local storage (<code className="font-mono text-hps-text">localStorage</code>) and is never transmitted off your machine.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-hps-text flex items-center gap-2">
            <Icon name="EyeOff" size={16} className="text-emerald-500" />
            <span>5. Zero Advertisements & Tracking</span>
          </h2>
          <p>
            HPS Tools does not use third-party advertising cookies, fingerprinting scripts, behavioral trackers, or marketing trackers.
          </p>
        </div>
      </div>
    </div>
  );
};
