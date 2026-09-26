import React from 'react';
import { useApp } from '../../context/AppContext';

export const ToastNotification: React.FC = () => {
  const { toast } = useApp();

  if (!toast || !toast.visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 bg-inverse-surface text-inverse-on-surface px-5 py-3 border border-outline-variant font-label-md text-label-md tracking-wider uppercase z-50 transition-all duration-150 flex items-center gap-2 shadow-sm"
    >
      <span className="w-1.5 h-1.5 bg-primary-container rounded-none shrink-0" />
      <span>// {toast.message}</span>
    </div>
  );
};
