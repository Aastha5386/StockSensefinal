import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Download,
  RefreshCw,
  ShoppingCart,
  Loader2,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export const AlertsView: React.FC = () => {
  const { alerts, criticalAlertsCount, warningAlertsCount, triggerReorder, userRole, refreshData, exportCsv } = useApp();
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING'>('ALL');
  const [reorderingSku, setReorderingSku] = useState<string | null>(null);

  const canReorder = userRole === 'admin' || userRole === 'inventory_manager';

  const filtered = alerts.filter((a) => {
    if (severityFilter === 'CRITICAL') return a.severity === 'CRITICAL';
    if (severityFilter === 'WARNING') return a.severity === 'WARNING';
    return true;
  });

  const handleReorder = async (sku: string, qty: number, supplier: string) => {
    setReorderingSku(sku);
    try {
      await triggerReorder(sku, qty, supplier);
    } finally {
      setReorderingSku(null);
    }
  };

  const handleExport = () => {
    const headers = ['SKU', 'Product Name', 'Category', 'Current Stock', 'Min Threshold', 'Severity', 'Recommended PO Qty', 'Supplier'];
    const rows = filtered.map((a) => [a.sku, a.productName, a.category, a.currentStock, a.minThreshold, a.severity, a.suggestedReorderQty, a.suggestedSupplier]);
    exportCsv('low_stock_reorder_requisitions', headers, rows);
  };

  return (
    <div className="flex flex-col w-full max-w-[1400px] mx-auto py-7 px-4 sm:px-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Low-Stock &amp; Reorder Alerts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time replenishment signals detecting items below minimum safety threshold with 1-click PO dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={refreshData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E8E5F2] dark:border-[#282342] bg-white dark:bg-[#141124] text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-[#F7F5FF] transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Scan Inventory</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#6C4CE6] hover:bg-[#5839D6] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Reorder List</span>
          </button>
        </div>
      </div>

      {/* KPI Alert Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Active Alerts</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{alerts.length}</div>
            <span className="text-xs text-slate-400">Depleted items</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F0EDFD] dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] border-l-4 border-l-rose-500 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-rose-600 dark:text-rose-400 font-semibold">Critical Shortages</span>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{criticalAlertsCount}</div>
            <span className="text-xs text-slate-400">Stockout expected &lt; 5 days</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] border-l-4 border-l-amber-500 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 font-semibold">Safety Buffer Warnings</span>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{warningAlertsCount}</div>
            <span className="text-xs text-slate-400">Approaching threshold</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSeverityFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
            severityFilter === 'ALL'
              ? 'bg-[#6C4CE6] text-white shadow-xs'
              : 'bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] text-slate-600 dark:text-slate-300 hover:bg-[#F7F5FF]'
          }`}
        >
          All Shortages ({alerts.length})
        </button>
        <button
          onClick={() => setSeverityFilter('CRITICAL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
            severityFilter === 'CRITICAL'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] text-slate-600 dark:text-slate-300 hover:bg-[#F7F5FF]'
          }`}
        >
          Critical ({criticalAlertsCount})
        </button>
        <button
          onClick={() => setSeverityFilter('WARNING')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
            severityFilter === 'WARNING'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] text-slate-600 dark:text-slate-300 hover:bg-[#F7F5FF]'
          }`}
        >
          Warning ({warningAlertsCount})
        </button>
      </div>

      {/* Alerts Table Card */}
      <div className="rounded-2xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF9FF] dark:bg-[#1B172E] text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-[#E8E5F2] dark:border-[#282342]">
                <th className="py-3 px-5">Severity</th>
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Threshold</th>
                <th className="py-3 px-4">Stockout Risk</th>
                <th className="py-3 px-4">Suggested Vendor</th>
                <th className="py-3 px-5 text-right">Replenish Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5F2]/60 dark:divide-[#282342] text-xs">
              {filtered.map((item) => {
                const percentOfThreshold = Math.round((item.currentStock / Math.max(1, item.minThreshold)) * 100);
                const isCritical = item.severity === 'CRITICAL';
                const isReordering = reorderingSku === item.sku;

                return (
                  <tr key={item.sku} className="hover:bg-[#F7F5FF] dark:hover:bg-[#1E1A34] transition-colors">
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          isCritical
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`} />
                        <span>{item.severity}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{item.productName}</div>
                      <div className="font-mono text-[11px] text-[#6C4CE6] dark:text-[#A78BFA]">{item.sku}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {item.category}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {item.currentStock} {item.unit}
                      </div>
                      <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isCritical ? 'bg-rose-500' : 'bg-amber-500'}`}
                          style={{ width: `${Math.min(100, percentOfThreshold)}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400">
                      {item.minThreshold} {item.unit}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`font-medium ${isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {isCritical ? '< 3 Days (Critical)' : '~7–10 Days'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[160px]">
                        {item.suggestedSupplier}
                      </div>
                      <div className="text-[11px] text-slate-400">{item.leadTimeDays}d SLA</div>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      {canReorder ? (
                        <button
                          disabled={isReordering}
                          onClick={() => handleReorder(item.sku, item.suggestedReorderQty, item.suggestedSupplier)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#6C4CE6] hover:bg-[#5839D6] disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                          {isReordering ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Dispatching...</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>Reorder +{item.suggestedReorderQty}</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Manager Access Req.</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                    <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                      All inventory within safety limits
                    </p>
                    <p className="text-xs text-slate-400">No stock depletion warnings detected.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
