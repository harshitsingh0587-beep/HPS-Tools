import React from 'react';

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  className?: string;
}

export const SliderField: React.FC<SliderFieldProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-xs font-semibold text-hps-text">
        <span>{label}</span>
        <span className="font-mono text-hps-primary bg-hps-primary/10 px-2 py-0.5 rounded-md">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-hps-primary cursor-pointer"
      />
    </div>
  );
};
