import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { StatusIndicator } from '../common/StatusIndicator';
import { OperationalStatus, Receipt } from '../../types';
import { NewReceiptModal } from '../modals/NewReceiptModal';
import {
  Plus,
  Search,
  ArrowUpDown,
  LayoutList,
  Kanban,
  Archive,
  Truck,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
  PackageCheck,
  AlertCircle,
} from 'lucide-react';

export const ReceiptsView: React.FC = () => {
  const { receipts, setSelectedReceiptId, updateReceiptStatus, showToast } = useApp();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'archive'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showNewReceiptModal, setShowNewReceiptModal] = useState(false);

  // Filtered receipts
  const filteredReceipts = useMemo(() => {
    let list = receipts.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.reference.toLowerCase().includes(q) ||
        r.contact.toLowerCase().includes(q) ||
        r.toLocation.toLowerCase().includes(q);

      if (viewMode === 'archive') {
        return matchesSearch && (r.status === 'DONE' || r.status === 'CANCELLED');
      }
      return matchesSearch;
    });

    list.sort((a, b) => {
      return sortAsc ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
    });

    return list;
  }, [receipts, searchQuery, viewMode, sortAsc]);

  // Metric counts
  const waitingCount = receipts.filter((r) => r.status === 'WAITING').length;
  const readyCount = receipts.filter((r) => r.status === 'READY').length;
  const doneCount = receipts.filter((r) => r.status === 'DONE').length;

  const handleRowClick = (receipt: Receipt) => {
    setSelectedReceiptId(receipt.id);
    navigate(`/receipts/${encodeURIComponent(receipt.id)}`);
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredReceipts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredReceipts.map((r) => r.id));
    }
  };

  const handleToggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-16 pt-2 px-4 sm:px-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Inbound Receipts & POs
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track incoming supplier shipments, dock intakes, and quality tally verification
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewReceiptModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#6C4CE6] hover:bg-[#5839D6] text-white font-medium text-sm rounded-xl transition-all shadow-sm shadow-[#6C4CE6]/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Receipt</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#141124] p-5 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#F0EDFD] dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Inbound POs
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{receipts.length}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#141124] p-5 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Awaiting Inspection
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{waitingCount}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#141124] p-5 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Ready for Dock
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{readyCount}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#141124] p-5 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Intakes Completed
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{doneCount}</div>
          </div>
        </div>
      </div>

      {/* Control Bar: View Modes, Search, Filter */}
      <div className="bg-white dark:bg-[#141124] p-4 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* View switcher tabs */}
        <div className="flex items-center gap-1 bg-[#F7F5FF] dark:bg-[#1B172E] p-1 rounded-xl border border-[#E8E5F2] dark:border-[#282342]">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" />
            <span>List ({receipts.length})</span>
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              viewMode === 'kanban'
                ? 'bg-white dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>
          <button
            onClick={() => setViewMode('archive')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              viewMode === 'archive'
                ? 'bg-white dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archive</span>
          </button>
        </div>

        {/* Search & Sort controls */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by ref, supplier, or bay..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-[#FAF9FD] dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] focus:bg-white dark:focus:bg-[#141124] focus:outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6] transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] hover:bg-[#F7F5FF] dark:hover:bg-[#252040] transition-colors cursor-pointer"
            title="Toggle sort direction"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[#6C4CE6] dark:text-[#A78BFA]" />
            <span className="hidden sm:inline">{sortAsc ? 'Ascending' : 'Descending'}</span>
          </button>
        </div>
      </div>

      {/* Main View Mode: LIST */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-[#141124] rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-[#E8E5F2] dark:border-[#282342] bg-[#FAF9FD] dark:bg-[#1B172E] text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === filteredReceipts.length &&
                        filteredReceipts.length > 0
                      }
                      onChange={handleToggleSelectAll}
                      aria-label="Select all receipts"
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-[#6C4CE6] focus:ring-[#6C4CE6]/20 cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-4">Receipt Reference</th>
                  <th className="py-3.5 px-4">Supplier / Forwarder</th>
                  <th className="py-3.5 px-4">Destination Bay</th>
                  <th className="py-3.5 px-4">Scheduled Arrival</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5F2] dark:divide-[#282342] text-sm text-slate-700 dark:text-slate-300">
                {filteredReceipts.length > 0 ? (
                  filteredReceipts.map((r) => {
                    const isSelected = selectedIds.includes(r.id);

                    return (
                      <tr
                        key={r.id}
                        onClick={() => handleRowClick(r)}
                        className={`transition-colors cursor-pointer group ${
                          isSelected
                            ? 'bg-[#F0EDFD]/40 dark:bg-[#252040]/50'
                            : 'hover:bg-[#FAF9FD] dark:hover:bg-[#1B172E]/60'
                        }`}
                      >
                        <td
                          className="py-3 px-4 text-center"
                          onClick={(e) => handleToggleSelectRow(r.id, e)}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            aria-label={`Select receipt ${r.id}`}
                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-[#6C4CE6] focus:ring-[#6C4CE6]/20 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white group-hover:text-[#6C4CE6] dark:group-hover:text-[#A78BFA] transition-colors">
                          <div className="flex items-center gap-2">
                            <span>{r.id}</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">
                              ({r.reference})
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                          {r.contact}
                          {r.carrierCode && (
                            <span className="ml-1.5 text-xs text-slate-400 dark:text-slate-500 font-mono">
                              · {r.carrierCode}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {r.toLocation}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-xs">
                          {r.scheduledUtc}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <StatusIndicator status={r.status} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#6C4CE6] dark:text-[#A78BFA] group-hover:translate-x-0.5 transition-transform">
                            <span>Inspect</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                        <span className="text-sm font-medium">No matching receipts found</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">Try adjusting your filters or search keywords</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-[#E8E5F2] dark:border-[#282342] bg-[#FAF9FD] dark:bg-[#1B172E] text-xs text-slate-500 dark:text-slate-400">
            <div>
              Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{filteredReceipts.length}</span> of{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">{receipts.length}</span> inbound receipts
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Dock terminal synchronized</span>
            </div>
          </div>
        </div>
      )}

      {/* Alternate View Mode: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {(['DRAFT', 'WAITING', 'READY', 'DONE'] as OperationalStatus[]).map((colStatus) => {
            const colItems = receipts.filter((r) => r.status === colStatus);

            const badgeStyles =
              colStatus === 'WAITING'
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50'
                : colStatus === 'READY'
                ? 'bg-[#F0EDFD] dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] border-[#6C4CE6]/25 dark:border-[#383256]'
                : colStatus === 'DONE'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';

            return (
              <div
                key={colStatus}
                className="bg-[#FAF9FD] dark:bg-[#18152B] border border-[#E8E5F2] dark:border-[#282342] rounded-2xl p-4 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#E8E5F2] dark:border-[#282342]">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyles}`}>
                    {colStatus === 'DONE' ? 'COMPLETED' : colStatus}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 font-mono">
                    {colItems.length}
                  </span>
                </div>

                <div className="flex flex-col gap-3 min-h-[360px]">
                  {colItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleRowClick(item)}
                      className="p-4 bg-white dark:bg-[#141124] rounded-xl border border-[#E8E5F2] dark:border-[#282342] hover:border-[#6C4CE6]/40 dark:hover:border-[#A78BFA]/40 hover:shadow-md transition-all cursor-pointer flex flex-col gap-2 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#6C4CE6] dark:group-hover:text-[#A78BFA] transition-colors">
                          {item.id}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-[#1B172E] px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-[#282342]">
                          {item.items.length} SKUs
                        </span>
                      </div>

                      <div className="text-sm text-slate-700 dark:text-slate-300 font-medium line-clamp-1">
                        {item.contact}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item.toLocation}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 mt-1 border-t border-[#E8E5F2] dark:border-[#282342] text-xs">
                        <span className="text-slate-400 dark:text-slate-500 text-[11px] truncate">
                          {item.scheduledUtc.split('//')[0]}
                        </span>
                        {colStatus !== 'DONE' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const nextMap: Record<string, OperationalStatus> = {
                                DRAFT: 'WAITING',
                                WAITING: 'READY',
                                READY: 'DONE',
                              };
                              updateReceiptStatus(item.id, nextMap[colStatus]);
                              showToast(`Advanced ${item.id} status`);
                            }}
                            className="inline-flex items-center gap-1 text-[#6C4CE6] dark:text-[#A78BFA] font-semibold hover:text-[#5839D6] transition-colors cursor-pointer"
                            title="Advance to next state"
                          >
                            <span>Advance</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {colItems.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs py-8">
                      <span>No receipts</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Receipt Modal */}
      {showNewReceiptModal && (
        <NewReceiptModal onClose={() => setShowNewReceiptModal(false)} />
      )}
    </div>
  );
};
