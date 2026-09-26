import React from 'react';
import { MoveRecord } from '../../types';
import { StatusIndicator } from '../common/StatusIndicator';

interface AuditLogModalProps {
  record: MoveRecord;
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ record, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs select-none">
      <div className="w-full max-w-md bg-surface border border-on-surface p-6 rounded-[2px] shadow-2xl flex flex-col gap-4 text-on-surface">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rule pb-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-primary-container inline-block" />
            <span className="font-label-md text-label-md tracking-wider uppercase font-semibold text-on-surface">
              // ARCHIVAL CONVEYANCE TALLY SLIP
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-secondary hover:text-on-surface p-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Paper style slip */}
        <div className="bg-surface-lowest border border-rule p-4 flex flex-col gap-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-rule pb-2">
            <span className="text-secondary font-label-sm uppercase">TRANSACTION REF</span>
            <span className="font-bold text-primary-container dark:text-primary text-sm">
              {record.reference}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-secondary">TIMESTAMP:</span>
            <span className="text-on-surface">{record.timestampUtc}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-secondary">CARRIER / LINE:</span>
            <span className="text-on-surface font-semibold">{record.carrier}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-secondary">DISPATCH FROM:</span>
            <span className="text-on-surface">{record.from}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-secondary">DESTINATION TO:</span>
            <span className="text-on-surface">{record.to}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-secondary">CONVEYANCE QTY:</span>
            <span className="font-bold text-on-surface">{record.quantity}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-rule">
            <span className="text-secondary">PROTOCOL STATUS:</span>
            <StatusIndicator status={record.status} />
          </div>

          <div className="mt-2 p-2 bg-surface-low border border-rule/50 text-[10px] text-tertiary">
            STAMP: OP-77402 // CRYPTOGRAPHIC SEAL VALIDATED // NON-REPUDIATION ATTESTATION AT BAY-3
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-1.5 border border-rule text-secondary hover:text-on-surface font-label-md text-label-md uppercase flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[14px]">print</span>
            <span>Print Slip</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-primary-container text-white font-label-md text-label-md uppercase font-semibold hover:bg-[#8E4217]"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
