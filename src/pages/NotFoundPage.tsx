import React from 'react';
import { Icon } from '../components/common/Icon';
import { TOOLS_CATALOG } from '../data/toolsCatalog';

interface NotFoundPageProps {
  onNavigate: (path: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
      <div className="p-4 rounded-3xl bg-hps-primary/10 text-hps-primary w-fit mx-auto">
        <Icon name="Compass" size={48} />
      </div>

      <div>
        <h1 className="text-4xl font-black text-hps-text">404 — Page Not Found</h1>
        <p className="text-sm text-hps-muted mt-2">
          The requested tool or URL could not be found. Explore our popular tools below or return to the directory.
        </p>
      </div>

      <div className="pt-2">
        <button
          onClick={() => onNavigate('/')}
          className="px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-xs"
          style={{ backgroundColor: 'var(--hps-primary)' }}
        >
          Return to Tools Directory
        </button>
      </div>

      <div className="pt-8 border-t border-hps-border text-left space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-hps-primary block">
          Popular Tools You Might Need:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TOOLS_CATALOG.filter((t) => t.popular).slice(0, 4).map((tool) => (
            <button
              key={tool.id}
              onClick={() => onNavigate(tool.path)}
              className="p-3 rounded-xl border border-hps-border bg-hps-surface hover:border-hps-primary/50 flex items-center gap-3 text-left transition-all"
            >
              <div className="p-2 rounded-lg bg-hps-primary/10 text-hps-primary shrink-0">
                <Icon name={tool.icon} size={16} />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-hps-text truncate">{tool.name}</p>
                <p className="text-[11px] text-hps-muted truncate">{tool.category}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
