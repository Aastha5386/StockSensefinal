import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusIndicator } from '../common/StatusIndicator';
import { MoveRecord } from '../../types';
import { AuditLogModal } from '../modals/AuditLogModal';

export const MoveHistoryView: React.FC = () => {
  const { moveRecords, exportCsv } = useApp();
  const [filterKind, setFilterKind] = useState<'all' | 'inbound' | 'outbound' | 'internal'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalRecord, setActiveModalRecord] = useState<MoveRecord | null>(null);

  const filteredRecords = useMemo(() => {
    return moveRecords.filter((rec) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        rec.reference.toLowerCase().includes(q) ||
        rec.carrier.toLowerCase().includes(q) ||
        rec.from.toLowerCase().includes(q) ||
        rec.to.toLowerCase().includes(q);

      const matchesKind = filterKind === 'all' || rec.kind === filterKind;
      return matchesSearch && matchesKind;
    });
  }, [moveRecords, searchQuery, filterKind]);

  const handleExport = () => {
    const headers = ['Reference', 'Timestamp UTC', 'Carrier', 'From', 'To', 'Quantity', 'Status', 'Kind'];
    const rows = moveRecords.map((m) => [
      m.reference,
      m.timestampUtc,
      m.carrier,
      m.from,
      m.to,
      m.quantity,
      m.status,
      m.kind,
    ]);
    exportCsv('stocksense_conveyance_ledger', headers, rows);
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto pb-16 pt-4 px-4 sm:px-6">
      {/* Top Action / Title Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-rule">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary-container dark:text-primary font-semibold">
              // REGISTRY ARCHIVE VOL. 44
            </span>
            <span className="text-secondary/50 text-[10px]">•</span>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
              DEPOT 402
            </span>
          </div>
          <h1 className="font-headline-xl text-headline-xl font-bold tracking-tight text-on-surface">
            Move History
          </h1>
          <div className="font-label-md text-label-md text-secondary uppercase tracking-wider">
            // AUDIT TRAIL · CONVEYANCE &amp; DISPATCH LOG // CHRONOLOGICAL LEDGER
          </div>
        </div>

        {/* Live Counters & Export Action */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-4 px-4 py-2 bg-surface-low border border-rule rounded-[2px]">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                Indexed Dispatches
              </span>
              <span className="font-label-lg text-label-lg text-on-surface font-semibold tracking-normal tabular-nums">
                {(1472 + moveRecords.length).toLocaleString()}{' '}
                <span className="font-label-sm text-secondary font-normal">LINES</span>
              </span>
            </div>
            <div className="w-[1px] h-6 bg-rule" />
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                Net Velocity
              </span>
              <span className="font-label-lg text-label-lg text-primary-container dark:text-primary font-semibold tracking-normal tabular-nums">
                +4,890 <span className="font-label-sm text-secondary font-normal">UNITS</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-outline-variant bg-surface hover:bg-surface-container text-on-surface font-label-md text-label-md uppercase tracking-wider transition-colors rounded-[2px] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-primary-container dark:text-primary">
              download
            </span>
            <span>Export Ledger (CSV)</span>
          </button>
        </div>
      </div>

      {/* Filter & Registry Control Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
        {/* Text Mode Category Tabs */}
        <div className="flex items-center gap-6 overflow-x-auto text-nowrap pb-1 md:pb-0 select-none">
          <button
            type="button"
            onClick={() => setFilterKind('all')}
            className={`font-label-md text-label-md uppercase tracking-wider pb-1 transition-all cursor-pointer ${
              filterKind === 'all'
                ? 'text-on-surface font-semibold border-b-2 border-primary-container'
                : 'text-secondary hover:text-on-surface border-b-2 border-transparent'
            }`}
          >
            All Conveyances [{(1472 + moveRecords.length).toLocaleString()}]
          </button>
          <button
            type="button"
            onClick={() => setFilterKind('inbound')}
            className={`font-label-md text-label-md uppercase tracking-wider pb-1 transition-all cursor-pointer ${
              filterKind === 'inbound'
                ? 'text-on-surface font-semibold border-b-2 border-primary-container'
                : 'text-secondary hover:text-on-surface border-b-2 border-transparent'
            }`}
          >
            Inbound Manifests
          </button>
          <button
            type="button"
            onClick={() => setFilterKind('outbound')}
            className={`font-label-md text-label-md uppercase tracking-wider pb-1 transition-all cursor-pointer ${
              filterKind === 'outbound'
                ? 'text-on-surface font-semibold border-b-2 border-primary-container'
                : 'text-secondary hover:text-on-surface border-b-2 border-transparent'
            }`}
          >
            Outbound Dispatch
          </button>
          <button
            type="button"
            onClick={() => setFilterKind('internal')}
            className={`font-label-md text-label-md uppercase tracking-wider pb-1 transition-all cursor-pointer ${
              filterKind === 'internal'
                ? 'text-on-surface font-semibold border-b-2 border-primary-container'
                : 'text-secondary hover:text-on-surface border-b-2 border-transparent'
            }`}
          >
            Internal Relocations
          </button>
        </div>

        {/* Search & Date Filter Bar */}
        <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
          <div className="relative flex items-center min-w-[240px] sm:min-w-[280px]">
            <span className="material-symbols-outlined absolute left-2.5 text-secondary text-[16px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search REF, Carrier, Bay, Origin..."
              className="w-full pl-8 pr-3 py-1.5 bg-surface-lowest border border-rule rounded-[2px] font-body-sm text-body-sm text-on-surface placeholder:text-secondary/70 focus:outline-none focus:border-primary-container transition-colors"
            />
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-low border border-rule rounded-[2px] text-secondary font-label-sm text-label-sm uppercase tracking-wider select-none">
            <span className="material-symbols-outlined text-[15px]">calendar_today</span>
            <span>L7D: 18 OCT – 25 OCT</span>
          </div>
        </div>
      </div>

      {/* Main Hairline Architectural Ledger */}
      <div className="w-full overflow-x-auto bg-surface-lowest border border-rule">
        <table className="w-full text-left border-collapse min-w-[980px]" id="conveyance-ledger">
          <thead>
            <tr className="border-b border-on-surface bg-surface-low text-secondary font-label-md text-label-md uppercase tracking-wider select-none">
              <th className="py-2.5 px-4 font-semibold text-left w-36">Reference</th>
              <th className="py-2.5 px-4 font-semibold text-left w-48">Timestamp (UTC)</th>
              <th className="py-2.5 px-4 font-semibold text-left">Contact / Carrier</th>
              <th className="py-2.5 px-4 font-semibold text-left w-36">From</th>
              <th className="py-2.5 px-4 font-semibold text-left w-40">To</th>
              <th className="py-2.5 px-4 font-semibold text-right w-36">Quantity</th>
              <th className="py-2.5 px-4 font-semibold text-left w-32">Status</th>
              <th className="py-2.5 px-2 font-semibold text-center w-12">Log</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule font-body-md text-body-md text-on-surface">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((row) => {
                const isNegative = row.quantity.startsWith('-');
                const isPositive = row.quantity.startsWith('+');

                return (
                  <tr
                    key={row.reference}
                    onClick={() => setActiveModalRecord(row)}
                    className="group hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 px-4 font-label-md text-label-md font-semibold text-primary-container dark:text-primary uppercase">
                      {row.reference}
                    </td>
                    <td className="py-2.5 px-4 font-label-sm text-label-sm text-secondary">
                      {row.timestampUtc}
                    </td>
                    <td className="py-2.5 px-4 font-body-md text-body-md text-on-surface">
                      <div className="flex items-center gap-2">
                        <span className="truncate">{row.carrier}</span>
                        {row.carrierTag && (
                          <span className="font-label-sm text-label-sm text-secondary border border-rule px-1 rounded-[2px] uppercase font-mono">
                            {row.carrierTag}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 font-label-md text-label-md text-on-surface uppercase">
                      {row.from}
                    </td>
                    <td className="py-2.5 px-4 font-label-md text-label-md text-on-surface uppercase">
                      {row.to}
                    </td>
                    <td
                      className={`py-2.5 px-4 font-label-md text-label-md text-right font-medium tabular-nums ${
                        isNegative
                          ? 'text-error'
                          : isPositive
                          ? 'text-[#3F6B4A] dark:text-[#68a377] font-semibold'
                          : 'text-on-surface'
                      }`}
                    >
                      {row.quantity}
                    </td>
                    <td className="py-2.5 px-4">
                      <StatusIndicator status={row.status} />
                    </td>
                    <td className="py-2.5 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setActiveModalRecord(row)}
                        className="text-secondary hover:text-primary-container transition-colors p-1"
                        title="Audit Entry Manifest Slip"
                      >
                        <span className="material-symbols-outlined text-[16px]">receipt</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-12 text-center text-secondary font-label-md">
                  // NO CONVEYANCE RECORDS MATCH SEARCH SPECIFICATION //
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Ledger Verification Metadata & Hash Stamp */}
      <div className="pt-6 pb-4 flex flex-col gap-3">
        <div className="h-[1px] w-full bg-rule" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-secondary font-label-sm text-label-sm uppercase tracking-wider">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 font-semibold text-on-surface">
              <span className="material-symbols-outlined text-[15px] text-[#3F6B4A]">
                verified
              </span>
              ARCHIVE INTEGRITY SEALED
            </span>
            <span className="text-secondary/40">•</span>
            <span>DISPATCH TERMINAL: DEPOT-402 // NODE-C</span>
            <span className="text-secondary/40">•</span>
            <span className="font-label-sm text-primary-container dark:text-primary">
              BATCH #771-REV
            </span>
          </div>
          <div className="font-label-sm text-label-sm tracking-widest text-on-surface-variant font-mono">
            CHECKSUM: <span className="text-on-surface font-semibold">0X8B32E749DA1C002F9882B</span> · AUDIT VERIFIED
          </div>
        </div>

        {/* Station Footer Note */}
        <div className="text-secondary/80 font-body-sm text-body-sm max-w-4xl">
          All conveyances inscribed herein constitute a formal inventory conveyance ledger. Records
          are signed chronologically by automated bay transponders and station dispatchers under
          logistics protocol standard ISO-28000. Changes or physical discrepancy write-offs require
          terminal administrative override.
        </div>
      </div>

      {/* Modal for detailed slip inspection */}
      {activeModalRecord && (
        <AuditLogModal
          record={activeModalRecord}
          onClose={() => setActiveModalRecord(null)}
        />
      )}
    </div>
  );
};
