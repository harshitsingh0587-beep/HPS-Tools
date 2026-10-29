import React from 'react';
import { Icon } from '../common/Icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-hps-primary hover:bg-hps-primary-hover text-white shadow-xs',
    secondary: 'bg-hps-accent hover:opacity-90 text-hps-primary font-bold shadow-xs',
    outline: 'border border-hps-border hover:border-hps-primary bg-hps-surface text-hps-text hover:bg-hps-bg',
    ghost: 'hover:bg-hps-primary/10 text-hps-text hover:text-hps-primary',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2.5 rounded-xl gap-2 font-semibold',
    lg: 'text-base px-6 py-3 rounded-xl gap-2.5 font-bold',
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Icon name="RotateCw" size={iconSizes[size]} className="animate-spin" />
      ) : (
        icon && iconPosition === 'left' && <Icon name={icon} size={iconSizes[size]} />
      )}
      {children}
      {!isLoading && icon && iconPosition === 'right' && (
        <Icon name={icon} size={iconSizes[size]} />
      )}
    </button>
  );
};
