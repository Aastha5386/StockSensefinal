import React from 'react';
import { useNavigate } from 'react-router-dom';

export const NotFoundView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-surface text-on-surface">
      <div className="w-full max-w-lg bg-surface-low border border-rule rounded-[4px] p-8 sm:p-10 flex flex-col items-center text-center shadow-sm">
        <div className="w-12 h-12 bg-primary-container/10 border border-primary-container/30 flex items-center justify-center text-primary-container rounded-[2px] mb-4">
          <span className="material-symbols-outlined text-[28px]">search_off</span>
        </div>

        <div className="font-label-sm text-label-sm text-tertiary tracking-widest uppercase mb-1">
          // ERROR 404 · LEDGER DISCREPANCY
        </div>

        <h1 className="font-headline-lg text-headline-lg text-on-surface font-semibold mb-2">
          Route Not Found
        </h1>

        <p className="font-body-md text-body-md text-secondary max-w-md mb-6">
          The requested ledger path, manifest, or terminal partition does not exist in Depot-402 records.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="h-10 px-5 bg-primary-container hover:bg-[#8E4217] text-white font-label-md tracking-wider uppercase rounded-[2px] transition-colors flex items-center gap-2 cursor-pointer font-medium"
          >
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            <span>Return to Dashboard</span>
          </button>
          <button
            onClick={() => navigate(-1)}
            className="h-10 px-4 border border-rule hover:bg-surface-container text-on-surface font-label-md tracking-wider uppercase rounded-[2px] transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back</span>
          </button>
        </div>
      </div>
    </main>
  );
};
