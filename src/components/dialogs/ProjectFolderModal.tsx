import React, { useState } from 'react';
import { Icon } from '../common/Icon';

interface ProjectFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FolderNode {
  name: string;
  type: 'folder' | 'file';
  desc?: string;
  children?: FolderNode[];
}

const PROJECT_TREE: FolderNode[] = [
  {
    name: 'src',
    type: 'folder',
    desc: 'Application source code',
    children: [
      {
        name: 'components',
        type: 'folder',
        desc: 'Reusable UI elements (buttons, forms, dialogs, layout, common)',
      },
      {
        name: 'pages',
        type: 'folder',
        desc: 'Home, About, PrivacyPolicy, Admin, Appearance, NotFound',
      },
      {
        name: 'tools',
        type: 'folder',
        desc: '21 isolated workspaces (calculator, password, converters, passport, etc.)',
      },
      {
        name: 'features',
        type: 'folder',
        desc: 'Authentication, Admin controls, Feedback, Saved tools, Theme engine',
      },
      {
        name: 'services',
        type: 'folder',
        desc: 'API proxy, auth tokens, file conversion canvas engines, storage',
      },
      {
        name: 'hooks',
        type: 'folder',
        desc: 'Custom React hooks (useLocalStorage, useDebounce, etc.)',
      },
      {
        name: 'utils',
        type: 'folder',
        desc: 'Pure mathematical, date, formatting, and unit conversion algorithms',
      },
      {
        name: 'constants',
        type: 'folder',
        desc: 'Navigation routes, tool metadata catalog, starter color themes',
      },
      {
        name: 'types',
        type: 'folder',
        desc: 'TypeScript interfaces and type declarations',
      },
      {
        name: 'styles',
        type: 'folder',
        desc: 'Tailwind and CSS theme variable stylesheets',
      },
      {
        name: 'assets',
        type: 'folder',
        desc: 'HPS logo and iconography assets',
      },
      { name: 'App.tsx', type: 'file', desc: 'Main React application router & state manager' },
      { name: 'main.tsx', type: 'file', desc: 'React DOM root client entry point' },
      { name: 'index.css', type: 'file', desc: 'Global stylesheet with Tailwind imports' },
    ],
  },
  {
    name: 'Documentation',
    type: 'folder',
    desc: 'Complete project manuals',
    children: [
      { name: 'PROJECT_STRUCTURE.md', type: 'file', desc: 'In-depth directory architecture reference' },
      { name: 'SETUP_GUIDE.md', type: 'file', desc: 'Step-by-step local setup & commands' },
      { name: 'TOOL_GUIDE.md', type: 'file', desc: 'Specifications for all 21 tools' },
      { name: 'DEPLOYMENT_GUIDE.md', type: 'file', desc: 'Production hosting configurations' },
    ],
  },
  {
    name: 'tests',
    type: 'folder',
    desc: 'Automated test suite (12/12 passing)',
    children: [
      { name: 'tools', type: 'folder', desc: 'Mathematical & conversion unit tests' },
      { name: 'unit', type: 'folder', desc: 'Utility and pure logic tests' },
      { name: 'integration', type: 'folder', desc: 'Authentication and routing flow tests' },
    ],
  },
  {
    name: 'public',
    type: 'folder',
    desc: 'Static web assets, icons, manifest, and downloadable archives',
  },
  {
    name: 'scripts',
    type: 'folder',
    desc: 'Automation scripts (package_project.py for generating archives)',
  },
  { name: 'server.ts', type: 'file', desc: 'Express API backend & Vite middleware server' },
  { name: 'package.json', type: 'file', desc: 'Dependencies, npm scripts, and build configuration' },
  { name: 'tsconfig.json', type: 'file', desc: 'TypeScript strict mode compiler configuration' },
  { name: 'vite.config.ts', type: 'file', desc: 'Vite build engine configuration' },
  { name: 'README.md', type: 'file', desc: 'Project overview, quick start, and creator credits' },
];

export const ProjectFolderModal: React.FC<ProjectFolderModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'download' | 'tree' | 'commands'>('download');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Project Folder and Code Download"
    >
      <div
        className="w-full max-w-2xl bg-hps-surface border border-hps-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-hps-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-hps-border flex items-center justify-between bg-hps-bg/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-hps-primary text-white shadow-xs">
              <Icon name="Folder" size={22} className="text-hps-accent" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">HPS Tools Project Folder</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-hps-accent/20 text-hps-accent border border-hps-accent/30">
                  Ready to Download
                </span>
              </div>
              <p className="text-xs text-hps-muted">
                Complete, clean source code organized into modular enterprise structure.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-hps-muted hover:text-hps-text hover:bg-hps-border/40 transition-colors"
            aria-label="Close dialog"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-hps-border px-5 bg-hps-bg/30 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('download')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'download'
                ? 'border-hps-primary text-hps-primary font-bold'
                : 'border-transparent text-hps-muted hover:text-hps-text'
            }`}
          >
            <Icon name="Download" size={15} />
            <span>Download Archives</span>
          </button>
          <button
            onClick={() => setActiveTab('tree')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'tree'
                ? 'border-hps-primary text-hps-primary font-bold'
                : 'border-transparent text-hps-muted hover:text-hps-text'
            }`}
          >
            <Icon name="FolderTree" size={15} />
            <span>Directory Tree</span>
          </button>
          <button
            onClick={() => setActiveTab('commands')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'commands'
                ? 'border-hps-primary text-hps-primary font-bold'
                : 'border-transparent text-hps-muted hover:text-hps-text'
            }`}
          >
            <Icon name="Terminal" size={15} />
            <span>Run & Build</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'download' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-hps-bg border border-hps-border flex items-start gap-3">
                <Icon name="CheckCircle" size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-hps-text">
                    Folder is ready for instant download
                  </p>
                  <p className="text-hps-muted leading-relaxed">
                    The entire codebase has been cleaned and compressed. It includes all 21 tools, full TypeScript types, React components, Express backend, documentation, tests, and configuration files.
                  </p>
                </div>
              </div>

              {/* Download cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* ZIP card */}
                <div className="p-5 rounded-xl border border-hps-border bg-hps-bg hover:border-hps-primary/60 transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        .ZIP
                      </span>
                      <span className="text-[11px] font-mono text-hps-muted">~200 KB</span>
                    </div>
                    <h3 className="font-bold text-sm">ZIP Archive</h3>
                    <p className="text-xs text-hps-muted leading-relaxed">
                      Standard archive for Windows, macOS, and Linux. Extract with any file manager or Explorer.
                    </p>
                  </div>
                  <a
                    href="/hps-tools-project.zip"
                    download="hps-tools-project.zip"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-hps-primary text-white text-xs font-bold hover:bg-hps-primary/90 transition-all shadow-xs"
                  >
                    <Icon name="Download" size={15} />
                    <span>Download Project (.ZIP)</span>
                  </a>
                </div>

                {/* TAR.GZ card */}
                <div className="p-5 rounded-xl border border-hps-border bg-hps-bg hover:border-hps-primary/60 transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        .TAR.GZ
                      </span>
                      <span className="text-[11px] font-mono text-hps-muted">~150 KB</span>
                    </div>
                    <h3 className="font-bold text-sm">TAR.GZ Compressed</h3>
                    <p className="text-xs text-hps-muted leading-relaxed">
                      Gzip-compressed tarball ideal for Linux, Docker containers, and VPS server deployments.
                    </p>
                  </div>
                  <a
                    href="/hps-tools-project.tar.gz"
                    download="hps-tools-project.tar.gz"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-hps-surface border border-hps-border text-hps-text text-xs font-bold hover:bg-hps-bg transition-all shadow-xs"
                  >
                    <Icon name="Download" size={15} />
                    <span>Download Project (.TAR.GZ)</span>
                  </a>
                </div>
              </div>

              {/* Creator credit banner */}
              <div className="p-3.5 rounded-xl bg-hps-accent/10 border border-hps-accent/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Icon name="Sparkles" size={16} className="text-hps-accent" />
                  <span>
                    Created by <strong>Harshit</strong> (<code className="text-hps-primary font-bold">harshit.hub</code>)
                  </span>
                </div>
                <span className="text-[11px] font-mono text-hps-muted">HPS Tools v2.0</span>
              </div>
            </div>
          )}

          {activeTab === 'tree' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-hps-muted">
                  Organized into clean, modular enterprise directories:
                </p>
                <button
                  onClick={() =>
                    handleCopy(
                      PROJECT_TREE.map((n) => `${n.name}/ - ${n.desc || ''}`).join('\n'),
                      'tree'
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-lg border border-hps-border bg-hps-bg hover:bg-hps-surface text-hps-text transition-colors font-medium"
                >
                  <Icon name={copiedText === 'tree' ? 'Check' : 'Copy'} size={12} />
                  <span>{copiedText === 'tree' ? 'Copied!' : 'Copy Summary'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-hps-bg border border-hps-border font-mono text-xs space-y-2.5 max-h-[340px] overflow-y-auto">
                {PROJECT_TREE.map((node) => (
                  <div key={node.name} className="space-y-1">
                    <div className="flex items-center gap-2 font-bold text-hps-text">
                      <Icon
                        name={node.type === 'folder' ? 'Folder' : 'FileText'}
                        size={14}
                        className={node.type === 'folder' ? 'text-hps-primary' : 'text-hps-muted'}
                      />
                      <span>{node.name}{node.type === 'folder' ? '/' : ''}</span>
                      {node.desc && (
                        <span className="text-[11px] font-normal text-hps-muted">
                          — {node.desc}
                        </span>
                      )}
                    </div>
                    {node.children && (
                      <div className="pl-5 border-l border-hps-border ml-1.5 space-y-1">
                        {node.children.map((child) => (
                          <div key={child.name} className="flex items-center gap-2 text-[11px]">
                            <Icon
                              name={child.type === 'folder' ? 'Folder' : 'FileText'}
                              size={12}
                              className={child.type === 'folder' ? 'text-hps-accent' : 'text-hps-muted'}
                            />
                            <span className={child.type === 'folder' ? 'font-semibold text-hps-text' : 'text-hps-muted'}>
                              {child.name}{child.type === 'folder' ? '/' : ''}
                            </span>
                            {child.desc && (
                              <span className="text-[10px] text-hps-muted">
                                ({child.desc})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'commands' && (
            <div className="space-y-4 text-xs">
              <p className="text-hps-muted">
                After extracting the downloaded folder, run these commands in your terminal:
              </p>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-hps-bg border border-hps-border space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-hps-muted">
                    <span>1. Install Dependencies</span>
                    <button
                      onClick={() => handleCopy('npm install', 'cmd-install')}
                      className="hover:text-hps-text flex items-center gap-1"
                    >
                      <Icon name={copiedText === 'cmd-install' ? 'Check' : 'Copy'} size={12} />
                      <span>{copiedText === 'cmd-install' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="font-mono bg-hps-surface p-2 rounded-lg border border-hps-border text-emerald-600 dark:text-emerald-400">
                    npm install
                  </pre>
                </div>

                <div className="p-3.5 rounded-xl bg-hps-bg border border-hps-border space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-hps-muted">
                    <span>2. Start Development Server</span>
                    <button
                      onClick={() => handleCopy('npm run dev', 'cmd-dev')}
                      className="hover:text-hps-text flex items-center gap-1"
                    >
                      <Icon name={copiedText === 'cmd-dev' ? 'Check' : 'Copy'} size={12} />
                      <span>{copiedText === 'cmd-dev' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="font-mono bg-hps-surface p-2 rounded-lg border border-hps-border text-emerald-600 dark:text-emerald-400">
                    npm run dev
                  </pre>
                </div>

                <div className="p-3.5 rounded-xl bg-hps-bg border border-hps-border space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-hps-muted">
                    <span>3. Run Automated Tests</span>
                    <button
                      onClick={() => handleCopy('npm test', 'cmd-test')}
                      className="hover:text-hps-text flex items-center gap-1"
                    >
                      <Icon name={copiedText === 'cmd-test' ? 'Check' : 'Copy'} size={12} />
                      <span>{copiedText === 'cmd-test' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="font-mono bg-hps-surface p-2 rounded-lg border border-hps-border text-emerald-600 dark:text-emerald-400">
                    npm test
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-hps-border bg-hps-bg/50 flex items-center justify-between">
          <span className="text-xs text-hps-muted">
            Simple Tools. One Place.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-hps-surface border border-hps-border text-xs font-semibold hover:bg-hps-bg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
