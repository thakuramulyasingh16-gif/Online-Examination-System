import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast, type ToastType } from '../../context/ToastContext';

export interface ToastProps {
  type?: ToastType;
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  type = 'info',
  title,
  message,
  onClose,
  className = '',
}) => {
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-2xl shadow-elevated border backdrop-blur-md transition-all duration-200 ${
        type === 'success'
          ? 'bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
          : type === 'error'
          ? 'bg-rose-50/95 dark:bg-rose-950/90 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100'
          : type === 'warning'
          ? 'bg-amber-50/95 dark:bg-amber-950/90 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100'
          : 'bg-blue-50/95 dark:bg-blue-950/90 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100'
      } ${className}`}
    >
      <div className="shrink-0 mt-0.5">
        {type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
        {type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
        {type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
        {type === 'info' && <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
      </div>
      <div className="flex-1 text-sm">
        {title && <p className="font-bold text-xs uppercase tracking-wider mb-0.5">{title}</p>}
        <p className="font-medium leading-snug">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 p-1 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export { useToast };
