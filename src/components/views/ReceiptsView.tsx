import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusIndicator } from '../common/StatusIndicator';
import { OperationalStatus, Receipt } from '../../types';
import { NewReceiptModal } from '../modals/NewReceiptModal';

export const ReceiptsView: React.FC = () => {
  const { receipts, setCurrentScreen, setSelectedReceiptId, updateReceiptStatus } = useApp();
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

  const handleRowClick = (receipt: Receipt) => {
    setSelectedReceiptId(receipt.id);
    setCurrentScreen('receipt-detail');
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
    <div className="w-full max-w-[1440px] mx-auto pb-16 pt-6 px-4 sm:px-6">
      {/* Top Master Ledger Identification */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-rule">
        <div>
          <div className="font-label-sm text-label-sm text-tertiary uppercase tracking-widest flex items-center gap-2 mb-1.5">
            <span>// DEPOT PROTOCOL 04-B</span>
            <span className="inline-block w-1 h-1 bg-outline" />
            <span>RCV-INBOUND-LOG // DOCK 04</span>
          </div>
          <div className="flex items-baseline gap-4 flex-wrap">
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-normal">
              Receipts
            </h1>
            <span className="font-label-md text-label-md text-on-surface-variant">
              SERIES 2023 · OCT TALLY
            </span>
          </div>
        </div>

        {/* Action & Meta Stamp */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex flex-col text-right">
            <span className="font-label-sm text-label-sm text-tertiary uppercase">
              INSPECTOR REGISTER
            </span>
            <span className="font-label-md text-label-md text-on-surface font-semibold">
              OPERATOR #774-K
            </span>
          </div>
          <button
            onClick={() => setShowNewReceiptModal(true)}
            className="bg-surface border border-outline-variant hover:border-tertiary text-on-surface font-label-lg text-label-lg px-4 py-2 rounded-[2px] transition-colors duration-150 flex items-center gap-2 tracking-wider cursor-pointer"
          >
            <span className="font-mono text-primary font-bold">+</span>
            <span>NEW RECEIPT</span>
          </button>
        </div>
      </div>

      {/* Ledger Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-on-surface/80">
        {/* Plain Text Mode Toggle (Underlined Text, Never Pills) */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setViewMode('list')}
            className={`font-label-lg text-label-lg uppercase tracking-wider pb-1 transition-colors cursor-pointer ${
              viewMode === 'list'
                ? 'text-primary-container dark:text-primary font-semibold border-b-2 border-primary-container'
                : 'text-secondary hover:text-on-surface border-b-2 border-transparent'
            }`}
          >
            LIST ({receipts.length})
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`font-label-lg text-label-lg uppercase tracking-wider pb-1 transition-colors cursor-pointer ${
              viewMode === 'kanban'
                ? 'text-primary-container dark:text-primary font-semibold border-b-2 border-primary-container'
                : 'text-secondary hover:text-on-surface border-b-2 border-transparent'
            }`}
          >
            KANBAN
          </button>
          <button
            onClick={() => setViewMode('archive')}
            className={`font-label-lg text-label-lg uppercase tracking-wider pb-1 transition-colors cursor-pointer ${
              viewMode === 'archive'
                ? 'text-primary-container dark:text-primary font-semibold border-b-2 border-primary-container'
                : 'text-secondary hover:text-on-surface border-b-2 border-transparent'
            }`}
          >
            ARCHIVE
          </button>
        </div>

        {/* Manifest Filters & Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-2.5 text-on-surface-variant text-[18px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="FILTER REF, VENDOR OR BAY..."
              className="bg-surface-lowest border border-outline-variant focus:border-primary text-on-surface placeholder:text-secondary font-label-md text-label-md pl-8 pr-3 py-1.5 rounded-none outline-none w-56 sm:w-72 md:w-80 tracking-wide uppercase transition-colors"
            />
          </div>
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 bg-surface-low border border-outline-variant hover:bg-surface-container text-tertiary font-label-sm text-label-sm uppercase transition-colors cursor-pointer"
            title="Toggle sort direction"
          >
            <span>SORT: {sortAsc ? 'DATE ASC' : 'DATE DESC'}</span>
            <span className="material-symbols-outlined text-[14px]">swap_vert</span>
          </button>
        </div>
      </div>

      {/* Main View Mode: LIST */}
      {viewMode === 'list' && (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[780px]">
            <thead>
              <tr className="border-b border-on-surface select-none">
                <th className="py-3 px-3 font-label-md text-label-md text-tertiary uppercase tracking-wider w-12 text-center">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === filteredReceipts.length &&
                      filteredReceipts.length > 0
                    }
                    onChange={handleToggleSelectAll}
                    aria-label="Select all receipts"
                    className="w-3.5 h-3.5 rounded-none border border-outline bg-surface-lowest text-on-surface accent-on-surface cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4 font-label-md text-label-md text-tertiary uppercase tracking-wider">
                  Reference
                </th>
                <th className="py-3 px-4 font-label-md text-label-md text-tertiary uppercase tracking-wider">
                  Contact / Forwarder
                </th>
                <th className="py-3 px-4 font-label-md text-label-md text-tertiary uppercase tracking-wider">
                  To Location
                </th>
                <th className="py-3 px-4 font-label-md text-label-md text-tertiary uppercase tracking-wider">
                  Scheduled (UTC)
                </th>
                <th className="py-3 px-4 font-label-md text-label-md text-tertiary uppercase tracking-wider text-right pr-6">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule font-body-md text-body-md">
              {filteredReceipts.length > 0 ? (
                filteredReceipts.map((r) => {
                  const isLate = r.status === 'LATE';
                  const isDone = r.status === 'DONE';
                  const isCancelled = r.status === 'CANCELLED';
                  const isSelected = selectedIds.includes(r.id);

                  return (
                    <tr
                      key={r.id}
                      onClick={() => handleRowClick(r)}
                      className={`transition-colors duration-75 group cursor-pointer ${
                        isSelected
                          ? 'bg-surface-container'
                          : isLate
                          ? 'hover:bg-surface-container-low bg-error-container/10'
                          : isCancelled
                          ? 'hover:bg-surface-container-low opacity-70'
                          : 'hover:bg-surface-container-low'
                      }`}
                    >
                      <td className="py-3 px-3 text-center" onClick={(e) => handleToggleSelectRow(r.id, e)}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          aria-label={`Select receipt ${r.id}`}
                          className="w-3.5 h-3.5 rounded-none border border-outline bg-surface-lowest accent-on-surface cursor-pointer"
                        />
                      </td>
                      <td
                        className={`py-3 px-4 font-label-lg text-label-lg font-semibold group-hover:underline ${
                          isCancelled
                            ? 'text-secondary line-through'
                            : isDone
                            ? 'text-on-surface'
                            : 'text-primary-container dark:text-primary'
                        }`}
                      >
                        {r.id}
                      </td>
                      <td className="py-3 px-4 font-body-md text-body-md text-on-surface">
                        {r.contact}{' '}
                        {r.carrierCode && (
                          <span className="text-secondary font-label-sm text-label-sm ml-1 font-mono">
                            // {r.carrierCode}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-label-md text-label-md text-tertiary uppercase">
                        {r.toLocation}
                      </td>
                      <td className="py-3 px-4 font-label-md text-label-md text-on-surface tabular-nums">
                        {r.scheduledUtc}
                      </td>
                      <td className="py-3 px-4 pr-6 text-right">
                        <StatusIndicator status={r.status} />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-secondary font-label-md">
                    // NO INBOUND RECEIPTS RECORDED UNDER CURRENT SPEC //
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Alternate View Mode: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {(['DRAFT', 'WAITING', 'READY', 'DONE'] as OperationalStatus[]).map((colStatus) => {
            const colItems = receipts.filter((r) => r.status === colStatus);
            return (
              <div
                key={colStatus}
                className="bg-surface-low border border-rule p-3 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-rule">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-[3px] h-3 inline-block"
                      style={{
                        backgroundColor:
                          colStatus === 'WAITING'
                            ? '#B98424'
                            : colStatus === 'READY'
                            ? '#A8501E'
                            : colStatus === 'DONE'
                            ? '#3F6B4A'
                            : '#9C9382',
                      }}
                    />
                    <span className="font-label-md text-label-md uppercase font-semibold text-on-surface">
                      {colStatus}
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm text-secondary font-mono">
                    [{colItems.length}]
                  </span>
                </div>

                <div className="flex flex-col gap-2 min-h-[300px]">
                  {colItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleRowClick(item)}
                      className="p-3 bg-surface-lowest border border-rule hover:border-on-surface transition-colors cursor-pointer flex flex-col gap-1.5 shadow-2xs group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-label-md text-label-md font-bold text-primary-container dark:text-primary group-hover:underline">
                          {item.id}
                        </span>
                        <span className="font-label-sm text-[10px] text-tertiary">
                          {item.items.length} SKUs
                        </span>
                      </div>
                      <div className="font-body-md text-body-md text-on-surface font-medium line-clamp-1">
                        {item.contact}
                      </div>
                      <div className="font-label-sm text-label-sm text-secondary">
                        {item.toLocation}
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-rule/60 text-[10px] font-label-sm text-tertiary">
                        <span>{item.scheduledUtc.split('//')[0]}</span>
                        <div className="flex items-center gap-1">
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
                              }}
                              className="text-primary-container hover:underline uppercase font-bold"
                              title="Advance state"
                            >
                              ADVANCE →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {colItems.length === 0 && (
                    <div className="flex-1 flex items-center justify-center text-tertiary font-label-sm uppercase">
                      Empty Slot
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ledger Pagination & Physical Audit Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-4 border-t border-rule font-label-sm text-label-sm text-tertiary">
        <div className="flex items-center gap-3">
          <span>
            SHOWING {filteredReceipts.length} OF {receipts.length} INBOUND ENTRIES
          </span>
          <span className="h-3 w-px bg-outline-variant" />
          <span>DEPOT CAPACITY ALLOCATED: 68.4%</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1 font-label-md text-label-md">
            <span className="text-on-surface font-semibold">1</span>
            <span className="text-outline">/</span>
            <span className="text-tertiary">2</span>
            <span className="text-outline">/</span>
            <span className="text-tertiary">3</span>
            <button
              onClick={() => alert('No additional ledger sheet archives present in current depot.')}
              className="ml-2 text-primary-container hover:underline uppercase tracking-wider font-label-sm text-label-sm"
            >
              NEXT SHEET →
            </button>
          </div>
        </div>
      </div>

      {/* Ledger Sync & Seal Section */}
      <div className="mt-12 p-4 bg-surface-low border border-rule flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 bg-primary-container" />
          <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
            LEDGER HASH: <span className="text-on-surface font-mono">0x94F2...88CA</span> · SYNCED
            WITH TERMINAL MAIN 0.04s AGO
          </div>
        </div>
        <div className="font-label-sm text-label-sm text-tertiary uppercase tracking-widest">
          ARCHIVE REVISION LEVEL: R-402 // VERIFIED PHYSICAL LEDGER
        </div>
      </div>

      {/* New Receipt Modal */}
      {showNewReceiptModal && (
        <NewReceiptModal onClose={() => setShowNewReceiptModal(false)} />
      )}
    </div>
  );
};
