import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-hps-text">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`w-full px-3.5 py-2.5 rounded-xl border bg-hps-surface text-hps-text placeholder-hps-muted/60 text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-hps-primary/30 focus:border-hps-primary ${
            error ? 'border-rose-500' : 'border-hps-border hover:border-hps-border/80'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-hps-muted">{helperText}</p>}
      </div>
    );
  }
);

InputField.displayName = 'InputField';
