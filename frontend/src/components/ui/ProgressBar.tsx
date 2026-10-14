import React from 'react';

export interface ProgressBarProps {
  value?: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  indeterminate?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value = 0,
  max = 100,
  label,
  showPercentage = false,
  color = 'primary',
  indeterminate = false,
  className = '',
  size = 'md',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[size];

  const colorStyles = {
    primary: 'bg-gradient-to-r from-orange-500 to-amber-500',
    success: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    warning: 'bg-gradient-to-r from-amber-500 to-yellow-500',
    danger: 'bg-gradient-to-r from-rose-500 to-red-600',
  }[color];

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label && <span>{label}</span>}
          {showPercentage && <span>{percentage}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden ${sizeStyles}`}>
        {indeterminate ? (
          <div
            className={`w-1/3 h-full rounded-full animate-[pulse_1s_infinite] ${colorStyles}`}
          />
        ) : (
          <div
            className={`h-full rounded-full transition-all duration-300 ease-out ${colorStyles}`}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    </div>
  );
};
