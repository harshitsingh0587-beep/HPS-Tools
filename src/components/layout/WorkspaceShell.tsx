import React from 'react';
import { Icon } from '../common/Icon';
import { TOOLS_CATALOG } from '../../data/toolsCatalog';

interface WorkspaceShellProps {
  toolId: string;
  title: string;
  description: string;
  category: string;
  iconName: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export const WorkspaceShell: React.FC<WorkspaceShellProps> = ({
  toolId,
  title,
  description,
  category,
  iconName,
  onNavigate,
  children,
}) => {
  // Find 3 related tools in the same or complementary category
  const relatedTools = TOOLS_CATALOG.filter(
    (t) => t.id !== toolId && (t.category === category || t.popular)
  ).slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb & Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-hps-muted">
        <button
          onClick={() => onNavigate('/')}
          className="hover:text-hps-text transition-colors flex items-center gap-1"
        >
          <Icon name="Home" size={13} />
          <span>Home</span>
        </button>
        <Icon name="ChevronRight" size={12} className="opacity-40" />
        <span className="font-medium text-hps-muted">{category}</span>
        <Icon name="ChevronRight" size={12} className="opacity-40" />
        <span className="font-semibold text-hps-text">{title}</span>
      </nav>

      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-hps-border">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-hps-primary/10 text-hps-primary border border-hps-primary/20 shrink-0">
            <Icon name={iconName} size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-hps-text tracking-tight">
                {title}
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border border-hps-border bg-hps-surface text-hps-muted">
                {category}
              </span>
            </div>
            <p className="text-sm text-hps-muted max-w-2xl leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('/')}
          className="self-start sm:self-center flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-hps-border bg-hps-surface hover:bg-hps-bg text-hps-text transition-colors shrink-0"
        >
          <Icon name="ArrowLeft" size={14} />
          <span>All Tools</span>
        </button>
      </div>

      {/* Main Workspace Body */}
      <div className="min-h-[420px]">
        {children}
      </div>

      {/* Related Tools Shelf */}
      {relatedTools.length > 0 && (
        <div className="pt-8 border-t border-hps-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-hps-text flex items-center gap-2">
              <Icon name="Sparkles" size={16} className="text-hps-accent" />
              <span>Related & Popular Tools</span>
            </h2>
            <button
              onClick={() => onNavigate('/')}
              className="text-xs font-medium text-hps-primary hover:underline"
            >
              Browse all {TOOLS_CATALOG.length} tools →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedTools.map((tool) => (
              <div
                key={tool.id}
                onClick={() => onNavigate(tool.path)}
                className="p-4 rounded-xl border border-hps-border bg-hps-card hover:border-hps-primary/50 hover:shadow-xs transition-all cursor-pointer flex items-start gap-3 group"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onNavigate(tool.path)}
              >
                <div className="p-2.5 rounded-xl bg-hps-primary/10 text-hps-primary shrink-0 group-hover:bg-hps-primary group-hover:text-white transition-colors">
                  <Icon name={tool.icon} size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-hps-text group-hover:text-hps-primary transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-[11px] text-hps-muted line-clamp-1 mt-0.5">
                    {tool.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
