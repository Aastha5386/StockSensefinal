import React, { useState, useEffect } from 'react';
import { apiAnalytics } from '../../lib/api';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Calendar,
  Layers,
  Clock,
  AlertTriangle,
  ArrowLeftRight,
  ShieldAlert,
  Tag,
  Package,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  DollarSign,
  Activity,
  Archive,
} from 'lucide-react';
import { DeadStockItem, InventoryAnomaly, SmartTransferRecommendation } from '../../types';

export const AnalyticsView: React.FC = () => {
  const { addMoveRecord, userProfile, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'trends' | 'dead-stock' | 'anomalies' | 'transfers'>('trends');
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  // Core trend data
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Dead stock state
  const [deadStockData, setDeadStockData] = useState<{ totalDeadValuation: number; items: DeadStockItem[] } | null>(null);
  const [deadStockLoading, setDeadStockLoading] = useState(false);

  // Anomalies state
  const [anomalies, setAnomalies] = useState<InventoryAnomaly[]>([]);
  const [anomaliesLoading, setAnomaliesLoading] = useState(false);

  // Smart transfers state
  const [transfers, setTransfers] = useState<SmartTransferRecommendation[]>([]);
  const [transfersLoading, setTransfersLoading] = useState(false);
  const [executingTransferId, setExecutingTransferId] = useState<string | null>(null);

  const fetchTrends = async (tf: '7d' | '30d' | '90d') => {
    setLoading(true);
    try {
      const res = await apiAnalytics.getTrends(tf);
      if (res.success) {
        setData(res);
      }
    } catch (e) {
      console.error('Analytics load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeadStock = async () => {
    setDeadStockLoading(true);
    try {
      const res = await apiAnalytics.getDeadStock();
      if (res.success) {
        setDeadStockData({
          totalDeadValuation: res.totalDeadValuation,
          items: res.items,
        });
      }
    } catch (e) {
      console.error('Dead stock error:', e);
    } finally {
      setDeadStockLoading(false);
    }
  };

  const fetchAnomalies = async () => {
    setAnomaliesLoading(true);
    try {
      const res = await apiAnalytics.getAnomalies();
      if (res.success) {
        setAnomalies(res.anomalies);
      }
    } catch (e) {
      console.error('Anomalies error:', e);
    } finally {
      setAnomaliesLoading(false);
    }
  };

  const fetchSmartTransfers = async () => {
    setTransfersLoading(true);
    try {
      const res = await apiAnalytics.getSmartTransfers();
      if (res.success) {
        setTransfers(res.recommendations);
      }
    } catch (e) {
      console.error('Smart transfers error:', e);
    } finally {
      setTransfersLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends(timeframe);
    fetchDeadStock();
    fetchAnomalies();
    fetchSmartTransfers();
  }, [timeframe]);

  const handleExecuteSmartTransfer = async (rec: SmartTransferRecommendation) => {
    setExecutingTransferId(rec.id);
    try {
      await addMoveRecord({
        reference: `TRANS-${Date.now().toString().slice(-6)}`,
        timestampUtc: new Date().toISOString(),
        carrier: 'Internal Depot Shuttle Fleet #2',
        carrierTag: 'LOG-REBALANCE',
        from: rec.fromWarehouse,
        to: rec.toWarehouse,
        quantity: `${rec.recommendedTransferQty} Units`,
        isPositive: true,
        status: 'DONE',
        kind: 'internal',
        productSku: rec.sku,
        productName: rec.productName,
        operator: userProfile?.name || 'OPERATOR',
        notes: `Smart Rebalancing: ${rec.rationale}`,
      });

      // Remove from list locally
      setTransfers((prev) => prev.filter((t) => t.id !== rec.id));
      showToast(`TRANSFER EXECUTED: ${rec.recommendedTransferQty} units of ${rec.sku} moved from ${rec.fromWarehouse} to ${rec.toWarehouse}`);
    } catch (err: any) {
      showToast(`TRANSFER FAILED: ${err.message}`);
    } finally {
      setExecutingTransferId(null);
    }
  };

  const maxVolume = data?.dailyVolume
    ? Math.max(1, ...data.dailyVolume.map((d: any) => Math.max(d.inbound || 0, d.outbound || 0)))
    : 100;

  return (
    <div className="flex flex-col w-full max-w-[1440px] mx-auto py-7 px-4 sm:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Inventory Intelligence &amp; Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
              AUDIT RADAR
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Throughput trends, Dead Stock liquidation detector, theft anomaly detection, and multi-warehouse rebalancing.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'trends'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Demand Trends &amp; ABC</span>
          </button>
          <button
            onClick={() => setActiveTab('dead-stock')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'dead-stock'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Dead Stock Detector</span>
          </button>
          <button
            onClick={() => setActiveTab('anomalies')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'anomalies'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span>Anomaly Radar</span>
          </button>
          <button
            onClick={() => setActiveTab('transfers')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'transfers'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-500" />
            <span>Smart Rebalancing</span>
          </button>
        </div>
      </div>

      {/* ==================== TAB 1: DEMAND TRENDS & ABC ==================== */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          {/* Timeframe & KPIs */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              System Velocity Overview
            </span>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setTimeframe('7d')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  timeframe === '7d' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                7d
              </button>
              <button
                onClick={() => setTimeframe('30d')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  timeframe === '30d' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                30d
              </button>
              <button
                onClick={() => setTimeframe('90d')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  timeframe === '90d' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                90d
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Units Managed</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {data?.kpis?.totalStock?.toLocaleString() || '34,000'}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Physical depot inventory</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Ledger Valuation</span>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                ${data?.kpis?.totalValuation?.toLocaleString() || '582,400'}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Current cost replacement</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Turnover Velocity</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {data?.kpis?.inventoryTurnoverRatio || '4.2'}x / yr
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Optimal capital turnover</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Inbound vs Outbound</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
                <span className="text-emerald-600 text-lg">+{data?.kpis?.totalInboundVolume || 320}</span>
                <span className="text-slate-300 dark:text-slate-600 text-sm">/</span>
                <span className="text-amber-600 text-lg">-{data?.kpis?.totalOutboundVolume || 410}</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Movement units in window</span>
            </div>
          </div>

          {/* Movement Trends Visual Chart */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700/60 mb-4 gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Daily Replenishment vs Sales Outflow
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Inbound receipts (emerald) compared against outbound order dispatches (amber).
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  <span className="text-slate-600 dark:text-slate-400">Inbound (+)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                  <span className="text-slate-600 dark:text-slate-400">Outbound (-)</span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="h-64 w-full flex items-end gap-2 pt-6 pb-2 overflow-x-auto">
                {(data?.dailyVolume || []).slice(-20).map((d: any, idx: number) => {
                  const inHeight = Math.max(8, Math.round((d.inbound / maxVolume) * 180));
                  const outHeight = Math.max(8, Math.round((d.outbound / maxVolume) * 180));

                  return (
                    <div key={idx} className="flex-1 min-w-[28px] flex flex-col items-center gap-1 group relative">
                      <div className="absolute -top-14 hidden group-hover:flex flex-col items-center z-20 pointer-events-none bg-slate-900 text-white p-1.5 rounded-lg shadow-lg text-[10px] whitespace-nowrap">
                        <span className="font-bold">{d.date}</span>
                        <span className="text-emerald-400">Inbound: +{d.inbound}</span>
                        <span className="text-amber-400">Outbound: -{d.outbound}</span>
                      </div>
                      <div className="w-full flex items-end justify-center gap-1 h-[190px]">
                        <div
                          className="w-3 bg-emerald-500 hover:bg-emerald-600 rounded-t-sm transition-all cursor-pointer"
                          style={{ height: `${inHeight}px` }}
                        />
                        <div
                          className="w-3 bg-amber-500 hover:bg-amber-600 rounded-t-sm transition-all cursor-pointer"
                          style={{ height: `${outHeight}px` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 truncate max-w-[36px]">{d.date}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Category Distribution & ABC Classification */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  Category Distribution
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Volume share across catalog</p>
                <div className="space-y-3.5 text-xs">
                  {(data?.categoryDistribution || []).map((cat: any) => (
                    <div key={cat.name} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{cat.name}</span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {cat.totalUnits.toLocaleString()} ({cat.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${cat.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  ABC Inventory Classification (Pareto)
                </h2>
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
                  Value Weighted
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Class A: High-value vital assets (70%) | Class B: Moderate (20%) | Class C: Low-value bulk (10%)
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 uppercase text-[11px]">
                      <th className="py-2.5 px-3">Class</th>
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3">Units</th>
                      <th className="py-2.5 px-3 text-right">Valuation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(data?.abcAnalysis || []).slice(0, 7).map((item: any) => (
                      <tr key={item.sku} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60">
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              item.classification === 'A'
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200'
                                : item.classification === 'B'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            CLASS {item.classification}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900 dark:text-white">{item.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">{item.sku}</div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                          {item.onHand.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white text-right">
                          ${item.valuation.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: DEAD STOCK DETECTOR ==================== */}
      {activeTab === 'dead-stock' && (
        <div className="space-y-6">
          {/* Highlight KPI Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-300/80 dark:border-amber-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs uppercase font-mono tracking-widest text-amber-600 dark:text-amber-400 font-bold block">
                  Dead Stock Liquidation Radar
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  Automated Dormant Inventory Identification
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Identifies products that have recorded zero outbound picking or transfer movement for 30+ days.
                </p>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-amber-200 dark:border-amber-800/80 text-center shrink-0 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Total Locked Capital</span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                ${deadStockData?.totalDeadValuation?.toLocaleString() || '48,200'}
              </span>
              <span className="text-[10px] text-slate-400 block">tied up in idle stock</span>
            </div>
          </div>

          {/* Dead Stock Items Grid */}
          {deadStockLoading ? (
            <div className="p-16 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-2" />
              <p className="text-xs">Scanning ledger timestamps for dormant inventory...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(deadStockData?.items || []).map((item) => (
                <div
                  key={item.sku}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 shadow-xs flex flex-col justify-between gap-4 hover:border-amber-400 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60 mb-3">
                      <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                        {item.sku}
                      </span>
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {item.daysInactive} Days Idle
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Category: {item.category}
                    </p>

                    <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-700/60 my-3">
                      <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                        &ldquo;{item.onHand} {item.unit} have had no movement for {item.daysInactive} days.&rdquo;
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Tied-Up Capital: <strong className="text-slate-700 dark:text-slate-200">${item.tiedUpValuation.toLocaleString()}</strong>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      <strong>AI Recommendation:</strong> {item.actionRationale}
                    </div>
                  </div>

                  {/* Liquidation Action Button */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Suggested Action:
                    </span>
                    <button
                      type="button"
                      onClick={() => showToast(`ACTION INITIATED: ${item.suggestedAction} applied to ${item.sku}`)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <Tag className="w-3 h-3" />
                      <span>{item.suggestedAction}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 3: INVENTORY ANOMALY RADAR ==================== */}
      {activeTab === 'anomalies' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-500/10 via-red-500/10 to-transparent border border-rose-300/80 dark:border-rose-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs uppercase font-mono tracking-widest text-rose-600 dark:text-rose-400 font-bold block">
                  Security &amp; Theft Audit Radar
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  Unusual Stock Activity &amp; Shrinkage Detection
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Surfaces rapid quantity drops, off-hour adjustments, and potential inventory errors in real time.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 rounded-full border border-rose-300 shrink-0">
              {anomalies.length} ACTIVE AUDITS
            </span>
          </div>

          {anomaliesLoading ? (
            <div className="p-16 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-rose-500 mb-2" />
              <p className="text-xs">Auditing move records for anomalous volume spikes...</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {anomalies.map((anom) => (
                <div
                  key={anom.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-rose-500"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">{anom.id}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                          {anom.severity} SEVERITY
                        </span>
                        <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                          {anom.sku}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        ⚠️ &ldquo;{anom.description}&rdquo;
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                        <span>Operator: <strong className="text-slate-700 dark:text-slate-300">{anom.operator}</strong></span>
                        <span>&bull;</span>
                        <span>Logged: <strong className="text-slate-700 dark:text-slate-300">{new Date(anom.timestamp).toLocaleString()}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => showToast(`AUDIT RESOLVED: Incident ${anom.id} marked as inspected.`)}
                      className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 rounded-xl cursor-pointer transition-colors"
                    >
                      Acknowledge
                    </button>
                    <button
                      type="button"
                      onClick={() => showToast(`INVESTIGATION OPENED for incident ${anom.id}`)}
                      className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer transition-colors"
                    >
                      Investigate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 4: SMART REBALANCING TRANSFERS ==================== */}
      {activeTab === 'transfers' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-300/80 dark:border-indigo-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
                <ArrowLeftRight className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs uppercase font-mono tracking-widest text-indigo-600 dark:text-indigo-400 font-bold block">
                  Multi-Facility Depot Optimization
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  Smart Inter-Warehouse Stock Transfer
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Detects regional warehouse surpluses and deficits to suggest automated balance transfers.
                </p>
              </div>
            </div>
          </div>

          {transfersLoading ? (
            <div className="p-16 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
              <p className="text-xs">Computing regional depot balance equations...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {transfers.map((rec) => (
                <div
                  key={rec.id}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 shadow-xs flex flex-col justify-between gap-5 hover:border-indigo-400 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60 mb-4">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                        {rec.sku}
                      </span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {rec.productName}
                      </span>
                    </div>

                    {/* From vs To Depot Flow */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-mono text-slate-400 block">Source Depot (Surplus)</span>
                        <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-0.5">
                          {rec.fromWarehouse}
                        </div>
                        <span className="text-xs text-emerald-600 font-bold block mt-0.5">
                          {rec.fromStock} Units On Hand
                        </span>
                      </div>

                      <div className="flex flex-col items-center shrink-0 px-2">
                        <ArrowLeftRight className="w-5 h-5 text-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                          +{rec.recommendedTransferQty} Units
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-mono text-slate-400 block">Destination (Shortage)</span>
                        <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-0.5">
                          {rec.toWarehouse}
                        </div>
                        <span className="text-xs text-rose-500 font-bold block mt-0.5">
                          {rec.toStock} Units (Deficit)
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">
                      <strong>AI Rebalancing Verdict:</strong> &ldquo;{rec.rationale}&rdquo;
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Transfer: <strong className="text-indigo-600 dark:text-indigo-400">{rec.recommendedTransferQty} Units</strong>
                    </span>
                    <button
                      type="button"
                      disabled={executingTransferId === rec.id}
                      onClick={() => handleExecuteSmartTransfer(rec)}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.01]"
                    >
                      {executingTransferId === rec.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Routing Fleet...</span>
                        </>
                      ) : (
                        <>
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                          <span>Transfer {rec.recommendedTransferQty} Units ({rec.fromWarehouse.split(' ')[0]} &rarr; {rec.toWarehouse.split(' ')[0]})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
