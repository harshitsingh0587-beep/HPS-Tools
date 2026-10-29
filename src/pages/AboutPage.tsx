import React from 'react';
import { Logo } from '../components/common/Logo';
import { Icon } from '../components/common/Icon';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-hps-muted">
        <button onClick={() => onNavigate('/')} className="hover:text-hps-text flex items-center gap-1">
          <Icon name="Home" size={13} />
          <span>Home</span>
        </button>
        <Icon name="ChevronRight" size={12} className="opacity-40" />
        <span className="font-semibold text-hps-text">About HPS Tools</span>
      </nav>

      {/* Hero Banner */}
      <div className="p-8 sm:p-10 rounded-3xl border border-hps-border bg-gradient-to-br from-hps-surface to-hps-bg shadow-xs space-y-4 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <Logo size="lg" showTagline={false} />
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-hps-text tracking-tight">
              About HPS Tools
            </h1>
            <p className="text-base text-hps-accent font-bold mt-1">
              Simple Tools. One Place.
            </p>
          </div>
        </div>
        <p className="text-sm text-hps-muted leading-relaxed max-w-2xl pt-2">
          HPS Tools was engineered to solve a common frustration with modern utility websites: cluttered popups, invasive cookie trackers, fake reviews, and slow server queues. Every tool in our suite runs directly inside your browser on your own machine.
        </p>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-2">
          <div className="p-3 rounded-xl bg-hps-primary/10 text-hps-primary w-fit">
            <Icon name="ShieldCheck" size={24} />
          </div>
          <h2 className="text-base font-bold text-hps-text">100% Client-Side</h2>
          <p className="text-xs text-hps-muted leading-relaxed">
            Your photos, PDF documents, passwords, and loan numbers never leave your browser. Processing occurs locally in memory.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-2">
          <div className="p-3 rounded-xl bg-hps-primary/10 text-hps-primary w-fit">
            <Icon name="Zap" size={24} />
          </div>
          <h2 className="text-base font-bold text-hps-text">Instantaneous Speed</h2>
          <p className="text-xs text-hps-muted leading-relaxed">
            No uploading files across slow connections or waiting in server conversion queues. Conversions and math calculations finish in milliseconds.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-2">
          <div className="p-3 rounded-xl bg-hps-primary/10 text-hps-primary w-fit">
            <Icon name="Layers" size={24} />
          </div>
          <h2 className="text-base font-bold text-hps-text">Separate Workspaces</h2>
          <p className="text-xs text-hps-muted leading-relaxed">
            Every tool maintains its own isolated route, clean settings, and drag-and-drop workspace so tasks never interfere with each other.
          </p>
        </div>
      </div>

      {/* Deployment & Free Hosting Guide */}
      <div className="p-8 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Icon name="Cloud" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-hps-text">Free Hosting & Netlify Deployment Guide</h2>
            <p className="text-xs text-hps-muted">How to run and host HPS Tools for free with zero backend maintenance</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-hps-muted leading-relaxed">
          <p>
            Because HPS Tools is architected as an optimized, static client-side application using Vite, React, and TypeScript, it can be deployed for free on <strong>Netlify</strong>, <strong>GitHub Pages</strong>, <strong>Vercel</strong>, or <strong>Cloudflare Pages</strong>.
          </p>

          <div className="p-4 rounded-xl border border-hps-border bg-hps-bg font-mono text-xs space-y-2 text-hps-text">
            <p className="text-hps-muted font-bold">1. Local Development:</p>
            <p className="text-emerald-600 dark:text-emerald-400">npm run dev</p>
            <p className="text-hps-muted font-bold pt-2">2. Production Build:</p>
            <p className="text-emerald-600 dark:text-emerald-400">npm run build</p>
            <p className="text-hps-muted text-[11px] font-sans">
              Output directory: <code className="font-mono text-hps-text">dist</code>
            </p>
            <p className="text-hps-muted font-bold pt-2">3. Netlify Configuration:</p>
            <p className="text-hps-text font-sans">
              • Build command: <code className="font-mono text-emerald-600 dark:text-emerald-400">npm run build</code><br />
              • Publish directory: <code className="font-mono text-emerald-600 dark:text-emerald-400">dist</code><br />
              • SPA Routing: Pre-configured via <code className="font-mono text-hps-primary">public/_redirects</code> (<code className="font-mono">/*  /index.html  200</code>) so all direct tool URLs load seamlessly.
            </p>
          </div>
        </div>
      </div>

      {/* GitHub Synchronization */}
      <div className="p-8 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-hps-primary/10 text-hps-primary">
            <Icon name="GitBranch" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-hps-text">GitHub Synchronization</h2>
            <p className="text-xs text-hps-muted">Seamless continuous deployment from your repository</p>
          </div>
        </div>
        <p className="text-xs text-hps-muted leading-relaxed">
          To sync this codebase with GitHub:
          <br />1. Initialize your repository: <code className="font-mono px-1.5 py-0.5 rounded bg-hps-bg border border-hps-border text-hps-text">git init && git add . && git commit -m &quot;Initial HPS Tools commit&quot;</code>
          <br />2. Push to your GitHub repo: <code className="font-mono px-1.5 py-0.5 rounded bg-hps-bg border border-hps-border text-hps-text">git remote add origin &lt;YOUR_REPO_URL&gt; && git push -u origin main</code>
          <br />3. In Netlify, click <strong>Import from Git</strong>, select your repository, and click <strong>Deploy</strong>. Any git push will automatically re-build and publish the latest version of HPS Tools.
        </p>
      </div>

      {/* Mobile Usage & PWA Installation */}
      <div className="p-8 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-hps-accent/10 text-hps-accent">
            <Icon name="Smartphone" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-hps-text">Mobile & PWA Installation</h2>
            <p className="text-xs text-hps-muted">Install HPS Tools as a lightweight native-style application</p>
          </div>
        </div>
        <p className="text-xs text-hps-muted leading-relaxed">
          HPS Tools is PWA-ready with an official <code className="font-mono">manifest.json</code> and responsive mobile layout. On iOS Safari, tap <strong>Share → Add to Home Screen</strong>. On Android Chrome, tap <strong>Install App</strong> or <strong>Add to Home Screen</strong>. HPS Tools will install as an offline-capable standalone utility on your device!
        </p>
      </div>
    </div>
  );
};
