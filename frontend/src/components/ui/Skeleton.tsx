import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'rounded';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rounded',
  width,
  height,
  className = '',
  style,
  ...props
}) => {
  const variantStyles = {
    rectangular: 'rounded-none',
    circular: 'rounded-full',
    rounded: 'rounded-2xl',
  }[variant];

  const inlineStyle: React.CSSProperties = {
    width,
    height,
    ...style,
  };

  return (
    <div
      className={`animate-pulse bg-slate-200/80 dark:bg-slate-800 ${variantStyles} ${className}`}
      style={inlineStyle}
      {...props}
    />
  );
};
