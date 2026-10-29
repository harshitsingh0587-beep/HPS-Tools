import React from 'react';
import { Icon } from './Icon';
import { Badge } from './Badge';
import { ToolItem } from '../../types';

interface ToolCardProps {
  tool: ToolItem;
  isFavorite?: boolean;
  onToggleFavorite?: (toolId: string, e: React.MouseEvent) => void;
  onClick: (tool: ToolItem) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  isFavorite = false,
  onToggleFavorite,
  onClick,
}) => {
  return (
    <div
      onClick={() => onClick(tool)}
      className="group relative bg-hps-surface hover:bg-hps-surface/80 border border-hps-border hover:border-hps-primary/50 rounded-2xl p-5 transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(tool);
        }
      }}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="p-3 rounded-xl bg-hps-primary/10 text-hps-primary group-hover:scale-105 transition-transform duration-200">
            <Icon name={tool.icon} size={22} />
          </div>
          <div className="flex items-center gap-1.5">
            {tool.popular && <Badge variant="accent">Popular</Badge>}
            {onToggleFavorite && (
              <button
                type="button"
                onClick={(e) => onToggleFavorite(tool.id, e)}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                className="p-1.5 text-hps-muted hover:text-amber-500 rounded-lg hover:bg-hps-bg transition-colors"
              >
                <Icon
                  name="Star"
                  size={16}
                  className={isFavorite ? 'fill-amber-400 text-amber-400' : ''}
                />
              </button>
            )}
          </div>
        </div>

        <h3 className="font-bold text-base text-hps-text group-hover:text-hps-primary transition-colors line-clamp-1 mb-1.5">
          {tool.name}
        </h3>
        <p className="text-xs text-hps-muted line-clamp-2 leading-relaxed">
          {tool.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-hps-border/60 flex items-center justify-between text-xs text-hps-muted font-medium">
        <span className="text-[11px]">{tool.category}</span>
        <span className="flex items-center gap-1 text-hps-primary group-hover:translate-x-0.5 transition-transform font-semibold text-[11px]">
          Open Tool
          <Icon name="ArrowRight" size={13} />
        </span>
      </div>
    </div>
  );
};
