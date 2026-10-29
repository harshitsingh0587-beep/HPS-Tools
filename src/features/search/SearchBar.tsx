import React from 'react';
import { Icon } from '../../components/common/Icon';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search tools by name or keyword...',
  className = '',
  autoFocus = false,
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <span className="absolute left-4 text-hps-muted pointer-events-none">
        <Icon name="Search" size={18} />
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full pl-11 pr-10 py-3 rounded-2xl border border-hps-border bg-hps-surface text-hps-text placeholder-hps-muted/60 text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-hps-primary/30 focus:border-hps-primary transition-all"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3.5 text-hps-muted hover:text-hps-text p-1 cursor-pointer"
          aria-label="Clear search"
        >
          <Icon name="X" size={16} />
        </button>
      )}
    </div>
  );
};
