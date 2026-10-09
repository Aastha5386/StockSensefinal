import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, Info } from 'lucide-react';

export const ToastNotification: React.FC = () => {
  const { toast } = useApp();

  if (!toast || !toast.visible) return null;

  const isWarningOrError =
    toast.message.toLowerCase().includes('failed') ||
    toast.message.toLowerCase().includes('error') ||
    toast.message.toLowerCase().includes('already');

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-white/95 dark:bg-[#18152B]/95 backdrop-blur-md text-slate-800 dark:text-slate-100 rounded-xl border border-[#E8E5F2] dark:border-[#282342] shadow-lg shadow-[#6C4CE6]/10 animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          isWarningOrError
            ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50'
            : 'bg-[#F0EDFD] dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] border border-[#6C4CE6]/20 dark:border-[#383256]'
        }`}
      >
        {isWarningOrError ? <Info className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
      </div>
      <div className="text-sm font-medium pr-2 text-slate-800 dark:text-slate-100">
        {toast.message.replace(/^\/\/\s*/, '')}
      </div>
    </div>
  );
};
