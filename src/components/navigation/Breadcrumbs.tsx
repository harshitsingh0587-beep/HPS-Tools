import React from 'react';
import { Icon } from '../common/Icon';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate: (path: string) => void;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  onNavigate,
  className = '',
}) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-2 text-xs text-hps-muted ${className}`}>
      <button
        onClick={() => onNavigate('/')}
        className="hover:text-hps-text transition-colors flex items-center gap-1 cursor-pointer"
        type="button"
      >
        <Icon name="Home" size={13} />
        <span>Home</span>
      </button>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            <Icon name="ChevronRight" size={12} className="opacity-40" />
            {isLast || !item.path ? (
              <span className={`font-semibold ${isLast ? 'text-hps-text' : 'text-hps-muted'}`}>
                {item.label}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate(item.path!)}
                className="hover:text-hps-text transition-colors cursor-pointer text-hps-muted font-medium"
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
