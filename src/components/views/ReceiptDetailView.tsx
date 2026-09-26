import React from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

export const ReceiptDetailView: React.FC = () => {
  const { receipts, selectedReceiptId, validateReceipt } = useApp();
  const navigate = useNavigate();

  const receipt =
    receipts.find((r) => r.id === selectedReceiptId) ||
    receipts[0] || {
      id: 'RCV-2023-88401',
      reference: 'WH/IN/0001',
      contact: 'Nordic Freight Logistics // OSLO-EXP',
      toLocation: 'BAY-02 / NORTH DOCK',
      scheduledUtc: '24 OCT 2023 // 10:30 UTC',
      status: 'READY',
      clearanceStatus: 'CUSTOMS CLEARED',
      containerSeal: '#SEAL-9844-EU',
      inspectionLevel: 'TIER-2 PHYSICAL TALLY',
      totalPieces: '2,030 ASSORTED',
      tallyWeight: '4,820 KG NET',
      items: [],
    };

  const isDone = receipt.status === 'DONE';

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 sm:px-6 flex flex-col gap-6">
      {/* Back button & Top Ledger Brow Navigation */}
      <div className="flex flex-col gap-2 border-b border-rule pb-3">
        <div className="flex items-center justify-between text-on-surface-variant flex-wrap gap-2">
          <button
            onClick={() => navigate('/receipts')}
            className="flex items-center gap-1.5 font-label-md text-label-md text-tertiary hover:text-on-surface uppercase tracking-wider transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Return to Inbound Ledger</span>
          </button>
          <div className="flex items-center gap-3 text-secondary font-label-sm text-label-sm tracking-widest uppercase">
            <span>// INBOUND SHIPMENT PROTOCOL · DOCK RECEIPT LEDGER</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">RECORD ENTRY // SEC-09-INBOUND</span>
          </div>
        </div>
      </div>

      {/* Header Section: Category, Identifier, Action Buttons */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          {/* Title & Identifier */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-label-md text-label-md text-tertiary tracking-widest uppercase">
                RECEIPT
              </span>
              <span className="font-label-sm text-label-sm text-secondary font-mono">
                [{receipt.id}]
              </span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-normal">
              {receipt.reference || 'WH/IN/0001'}
            </h1>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 bg-transparent border border-rule text-on-surface hover:bg-surface-container font-label-md text-label-md uppercase tracking-wider rounded-[2px] transition-colors flex items-center gap-2 cursor-pointer select-none"
            >
              <span className="material-symbols-outlined text-[16px] text-tertiary">print</span>
              <span>PRINT</span>
            </button>

            <button
              type="button"
              onClick={() => validateReceipt(receipt.id)}
              className={`px-5 py-2 font-label-md text-label-md uppercase tracking-wider rounded-[2px] transition-colors flex items-center gap-2 cursor-pointer select-none shadow-none font-semibold ${
                isDone
                  ? 'bg-tertiary-container text-white cursor-default'
                  : 'bg-primary-container hover:bg-[#8E4217] text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isDone ? 'verified' : 'check_circle'}
              </span>
              <span>{isDone ? 'VALIDATED' : 'VALIDATE'}</span>
            </button>
          </div>
        </div>

        {/* State Tracker */}
        <div className="flex items-center gap-4 pt-1 border-b border-rule pb-3 font-label-md text-label-md uppercase tracking-wider">
          <span className={receipt.status === 'DRAFT' ? 'text-on-surface font-semibold border-b-2 border-primary-container pb-1' : 'text-tertiary'}>
            Draft
          </span>
          <span className="text-rule select-none">—</span>
          <span className={receipt.status === 'READY' || receipt.status === 'WAITING' ? 'text-on-surface font-semibold border-b-2 border-primary-container pb-1' : 'text-tertiary'}>
            Ready
          </span>
          <span className="text-rule select-none">—</span>
          <span className={receipt.status === 'DONE' ? 'text-on-surface font-semibold border-b-2 border-primary-container pb-1 text-[#3F6B4A]' : 'text-secondary-fixed-dim'}>
            Done
          </span>
        </div>
      </div>

      {/* Two-field Manifest Meta Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl pb-5 border-b border-rule">
        <div className="flex flex-col gap-1">
          <span className="font-label-md text-label-md text-tertiary uppercase tracking-widest">
            RECEIVE FROM
          </span>
          <span className="font-body-lg text-body-lg text-on-surface font-medium">
            {receipt.contact}
          </span>
          <span className="font-label-sm text-label-sm text-secondary tracking-wider mt-0.5 font-mono">
            CARRIER ID: NFL-NO-991204
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-label-md text-label-md text-tertiary uppercase tracking-widest">
            SCHEDULED DATE
          </span>
          <span className="font-label-lg text-label-lg text-on-surface">
            {receipt.scheduledUtc}
          </span>
          <span className="font-label-sm text-label-sm text-secondary tracking-wider mt-0.5">
            BERTH: {receipt.toLocation} [PALLET CRANE ACCESS]
          </span>
        </div>
      </div>

      {/* Secondary Archival Snapshot Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-surface-low border border-rule">
        <div className="flex flex-col gap-0.5">
          <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider">
            CLEARANCE STATUS
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-[3px] h-3 bg-primary-container inline-block" />
            <span className="font-label-md text-label-md text-on-surface uppercase font-semibold">
              {receipt.clearanceStatus || 'CUSTOMS CLEARED'}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider">
            CONTAINER SEAL
          </span>
          <span className="font-label-md text-label-md text-on-surface mt-1 font-mono">
            {receipt.containerSeal || '#SEAL-9844-EU'}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider">
            INSPECTION LEVEL
          </span>
          <span className="font-label-md text-label-md text-on-surface mt-1 font-mono">
            {receipt.inspectionLevel || 'TIER-2 PHYSICAL TALLY'}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider">
            TOTAL PIECES / UNITS
          </span>
          <span className="font-label-md text-label-md text-on-surface mt-1 text-left tabular-nums font-semibold">
            {receipt.totalPieces || '2,030 ASSORTED'}
          </span>
        </div>
      </div>

      {/* Line-items Table Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary-container inline-block" />
            <h2 className="font-label-md text-label-md text-on-surface tracking-widest uppercase font-semibold">
              MANIFEST LINE ITEMS ({receipt.items.length.toString().padStart(2, '0')})
            </h2>
          </div>
          <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-widest">
            TALLY WEIGHT: {receipt.tallyWeight || '4,820 KG NET'}
          </span>
        </div>

        <div className="w-full overflow-x-auto border-t border-b border-on-surface">
          <table className="w-full border-collapse text-left min-w-[640px]">
            <thead>
              <tr className="border-b border-on-surface bg-surface-low select-none">
                <th className="py-2.5 pl-3 pr-4 font-label-md text-label-md text-tertiary uppercase tracking-wider">
                  PRODUCT
                </th>
                <th className="py-2.5 px-4 font-label-md text-label-md text-tertiary uppercase tracking-wider">
                  SKU
                </th>
                <th className="py-2.5 px-4 font-label-md text-label-md text-tertiary uppercase tracking-wider">
                  UNIT
                </th>
                <th className="py-2.5 pl-4 pr-3 font-label-md text-label-md text-tertiary uppercase tracking-wider text-right">
                  QUANTITY
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule font-body-md text-body-md text-on-surface">
              {receipt.items.length > 0 ? (
                receipt.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-surface-container transition-colors group">
                    <td className="py-3 pl-3 pr-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-on-surface group-hover:text-primary-container transition-colors">
                          {item.product}
                        </span>
                        {item.spec && (
                          <span className="font-label-sm text-label-sm text-tertiary">
                            {item.spec}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-label-md text-label-md text-secondary font-mono">
                      {item.sku}
                    </td>
                    <td className="py-3 px-4 font-label-md text-label-md text-tertiary">
                      {item.unit}
                    </td>
                    <td className="py-3 pl-4 pr-3 font-label-lg text-label-lg font-semibold text-on-surface text-right tabular-nums">
                      {item.quantity.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-secondary font-label-md">
                    // NO CARGO LINE ITEMS REGISTERED UNDER THIS RECEIPT //
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Ledger Verification & Cargo Note Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-2">
        <div className="lg:col-span-2 flex flex-col gap-2 border border-rule p-4 bg-surface-lowest">
          <div className="flex items-center justify-between border-b border-rule pb-2">
            <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider font-semibold">
              // RECEIVER TALLY NOTES
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">
              LOG-ENTRY-402
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface leading-relaxed pt-1">
            {receipt.receiverNotes ||
              'External sea container seals verified intact by Gatekeeper 04. No moisture breach observed on lower crate battens. Hydraulic drums marked for immediate segregation under Class-II storage regulation upon custody acceptance.'}
          </p>
        </div>

        <div className="flex flex-col justify-between border border-rule p-4 bg-surface-low">
          <div className="flex flex-col gap-1">
            <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider">
              CUSTODIAL HANDOVER
            </span>
            <span className="font-label-md text-label-md text-on-surface font-semibold">
              DISPATCH CHIEF: A. LINDBERG
            </span>
            <span className="font-label-sm text-label-sm text-secondary font-mono">
              TERMINAL AUTH: PASSED
            </span>
          </div>
          <div className="mt-4 pt-2 border-t border-rule flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-tertiary uppercase">SEAL STATUS</span>
            <span className="font-label-sm text-label-sm text-[#3F6B4A] dark:text-[#68a377] font-semibold uppercase">
              {receipt.custodialHandover?.sealStatus || 'UNBROKEN'}
            </span>
          </div>
        </div>
      </div>

      {/* Archival Ledger Footer Stamp */}
      <div className="pt-6 pb-6 border-t border-rule flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-tertiary">
        <div className="font-label-md text-label-md tracking-wider uppercase">
          LEDGER HASH: 0x94F2...88CA · VERIFIED DEPOT CUSTODY · OPERATOR #774-K
        </div>
        <div className="font-label-sm text-label-sm tracking-widest uppercase text-on-surface-variant">
          ARCHIVE REF: BERGEN-DOCK-SYS-2023 // 10:30:19 UTC
        </div>
      </div>
    </div>
  );
};
