import React from 'react';
import { Icon } from '../../components/common/Icon';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  onRatingChange?: (newRating: number) => void;
  size?: number;
  interactive?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  onRatingChange,
  size = 18,
  interactive = true,
}) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, idx) => {
        const starValue = idx + 1;
        const isFilled = starValue <= rating;
        return (
          <button
            key={idx}
            type="button"
            disabled={!interactive}
            onClick={() => onRatingChange && onRatingChange(starValue)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} p-0.5 transition-transform text-amber-400`}
            aria-label={`${starValue} of ${maxRating} stars`}
          >
            <Icon
              name="Star"
              size={size}
              className={isFilled ? 'fill-amber-400 text-amber-400' : 'text-hps-muted/40'}
            />
          </button>
        );
      })}
    </div>
  );
};
