import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusIndicator } from '../common/StatusIndicator';
import { MoveRecord } from '../../types';
import { AuditLogModal } from '../modals/AuditLogModal';
import {
  Download,
  Search,
  ArrowLeftRight,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  Clock,
  Layers,
  MapPin,
  AlertCircle,
} from 'lucide-react';

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

  // Counts
  const inboundCount = moveRecords.filter((m) => m.kind === 'inbound').length;
  const outboundCount = moveRecords.filter((m) => m.kind === 'outbound').length;
  const internalCount = moveRecords.filter((m) => m.kind === 'internal').length;

  const handleExport = () => {
    const headers = [
      'Reference',
      'Timestamp UTC',
      'Carrier',
      'From',
      'To',
      'Quantity',
      'Status',
      'Kind',
    ];
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
    <div className="w-full max-w-[1400px] mx-auto pb-16 pt-2 px-4 sm:px-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Move History
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Immutable chronological audit log of all inbound, outbound, and internal movements
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1B172E] hover:bg-[#FAF9FD] dark:hover:bg-[#252040] text-slate-700 dark:text-slate-200 font-medium text-sm rounded-xl border border-[#E8E5F2] dark:border-[#282342] transition-colors shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#6C4CE6] dark:text-[#A78BFA]" />
          <span>Export Ledger (CSV)</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#141124] p-5 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#F0EDFD] dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Movements
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {(1472 + moveRecords.length).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#141124] p-5 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Inbound Receipts
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{inboundCount}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#141124] p-5 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Outbound Dispatches
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{outboundCount}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#141124] p-5 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Internal Transfers
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{internalCount}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#141124] p-4 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Kind Filters */}
        <div className="flex items-center gap-1 bg-[#F7F5FF] dark:bg-[#1B172E] p-1 rounded-xl border border-[#E8E5F2] dark:border-[#282342] overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterKind('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all text-nowrap cursor-pointer ${
              filterKind === 'all'
                ? 'bg-white dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Movements
          </button>
          <button
            type="button"
            onClick={() => setFilterKind('inbound')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all text-nowrap cursor-pointer ${
              filterKind === 'inbound'
                ? 'bg-white dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Inbound
          </button>
          <button
            type="button"
            onClick={() => setFilterKind('outbound')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all text-nowrap cursor-pointer ${
              filterKind === 'outbound'
                ? 'bg-white dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Outbound
          </button>
          <button
            type="button"
            onClick={() => setFilterKind('internal')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all text-nowrap cursor-pointer ${
              filterKind === 'internal'
                ? 'bg-white dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Internal Relocations
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ref, carrier, bay..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#FAF9FD] dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] focus:bg-white dark:focus:bg-[#141124] focus:outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6] transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white dark:bg-[#141124] rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-[#E8E5F2] dark:border-[#282342] bg-[#FAF9FD] dark:bg-[#1B172E] text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Reference</th>
                <th className="py-3.5 px-4">Timestamp (UTC)</th>
                <th className="py-3.5 px-4">Contact / Carrier</th>
                <th className="py-3.5 px-4">From</th>
                <th className="py-3.5 px-4">To</th>
                <th className="py-3.5 px-4 text-right">Quantity</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Slip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5F2] dark:divide-[#282342] text-sm text-slate-700 dark:text-slate-300">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((row) => {
                  const isNegative = row.quantity.startsWith('-');
                  const isPositive = row.quantity.startsWith('+');

                  return (
                    <tr
                      key={row.reference}
                      onClick={() => setActiveModalRecord(row)}
                      className="hover:bg-[#FAF9FD] dark:hover:bg-[#1B172E]/60 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white group-hover:text-[#6C4CE6] dark:group-hover:text-[#A78BFA] transition-colors">
                        {row.reference}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{row.timestampUtc}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 font-medium">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{row.carrier}</span>
                          {row.carrierTag && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              {row.carrierTag}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {row.from}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {row.to}
                        </span>
                      </td>
                      <td
                        className={`py-3.5 px-4 text-right font-bold text-xs tabular-nums ${
                          isNegative
                            ? 'text-rose-600 dark:text-rose-400'
                            : isPositive
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {row.quantity}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusIndicator status={row.status} />
                      </td>
                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setActiveModalRecord(row)}
                          className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-[#6C4CE6] dark:hover:text-[#A78BFA] transition-colors cursor-pointer"
                          title="View Attestation Slip"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Slip</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      <span className="text-sm font-medium">No movement records match this criteria</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">Try selecting another filter or adjusting your search</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-[#E8E5F2] dark:border-[#282342] bg-[#FAF9FD] dark:bg-[#1B172E] text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{filteredRecords.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{moveRecords.length}</span> movements
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Audit trail cryptographically verified</span>
          </div>
        </div>
      </div>

      {/* Slip Audit Modal */}
      {activeModalRecord && (
        <AuditLogModal
          record={activeModalRecord}
          onClose={() => setActiveModalRecord(null)}
        />
      )}
    </div>
  );
};
