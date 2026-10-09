import React from 'react';
import { MoveRecord } from '../../types';
import { StatusIndicator } from '../common/StatusIndicator';
import { FileText, Printer, X } from 'lucide-react';

interface AuditLogModalProps {
  record: MoveRecord;
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ record, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] rounded-3xl p-6 shadow-2xl shadow-[#6C4CE6]/10 dark:shadow-none space-y-4 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E5F2] dark:border-[#282342]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0EDFD] dark:bg-[#6C4CE6]/20 text-[#6C4CE6] dark:text-[#A78BFA] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Conveyance Slip</h2>
              <p className="text-xs text-slate-500 dark:text-[#A5A1BE]">Immutable transaction audit record</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-[#FAF9FD] dark:hover:bg-[#1B172E] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Paper Slip Card */}
        <div className="bg-[#FAF9FD] dark:bg-[#1B172E] rounded-2xl border border-[#E8E5F2] dark:border-[#282342] p-4 space-y-2.5 text-xs font-mono">
          <div className="flex items-center justify-between border-b border-[#E8E5F2] dark:border-[#282342] pb-2">
            <span className="text-slate-400 dark:text-slate-500 uppercase font-sans">Transaction Ref</span>
            <span className="font-bold text-[#6C4CE6] dark:text-[#A78BFA] text-sm">
              {record.reference}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-sans">Timestamp:</span>
            <span className="text-slate-800 dark:text-slate-200">{record.timestampUtc}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-sans">Carrier / Line:</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold">{record.carrier}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-sans">Dispatch From:</span>
            <span className="text-slate-800 dark:text-slate-200">{record.from}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-sans">Destination To:</span>
            <span className="text-slate-800 dark:text-slate-200">{record.to}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-sans">Conveyance Qty:</span>
            <span className="font-bold text-slate-900 dark:text-white">{record.quantity}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#E8E5F2] dark:border-[#282342]">
            <span className="text-slate-500 dark:text-slate-400 font-sans">Protocol Status:</span>
            <StatusIndicator status={record.status} />
          </div>

          <div className="mt-2 p-2.5 bg-white dark:bg-[#141124] rounded-xl border border-[#E8E5F2] dark:border-[#282342] text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed font-sans">
            Cryptographic non-repudiation verified at terminal dock. Ledger hash attested.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-[#1B172E] hover:bg-[#FAF9FD] dark:hover:bg-[#252040] border border-[#E8E5F2] dark:border-[#282342] rounded-xl transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Print Slip</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#6C4CE6] hover:bg-[#5839D6] rounded-xl transition-all shadow-sm shadow-[#6C4CE6]/25 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
