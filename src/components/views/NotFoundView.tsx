import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, ArrowLeft, SearchX } from 'lucide-react';

export const NotFoundView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#F7F5FF] dark:bg-[#0E0C1A] text-slate-800 dark:text-slate-100 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] rounded-3xl p-8 sm:p-10 flex flex-col items-center text-center shadow-xl shadow-[#6C4CE6]/5 space-y-6">
        {/* Modern 404 Illustration Badge */}
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-[#F0EDFD] dark:bg-[#252040] flex items-center justify-center text-[#6C4CE6] dark:text-[#A78BFA] border border-[#6C4CE6]/20 dark:border-[#383256] shadow-inner">
            <SearchX className="w-12 h-12 stroke-[1.5]" />
          </div>
          <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#6C4CE6] text-white shadow-sm">
            404
          </span>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Oops! Page Not Found
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
            The page, inventory partition, or manifest you are looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#6C4CE6] hover:bg-[#5839D6] text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-[#6C4CE6]/25 cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white dark:bg-[#1B172E] hover:bg-[#FAF9FD] dark:hover:bg-[#252040] text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl border border-[#E8E5F2] dark:border-[#282342] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>
      </div>
    </main>
  );
};
