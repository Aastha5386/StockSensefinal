import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiForecast } from '../../lib/api';
import { DemandForecast, WhatIfSimulationResult } from '../../types';
import {
  BrainCircuit,
  TrendingDown,
  TrendingUp,
  Clock,
  Sparkles,
  ShoppingCart,
  Loader2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Gauge,
  Sliders,
  Calculator,
  CheckCircle2,
  Calendar,
  DollarSign,
  Package,
  Truck,
  Activity,
  Layers,
} from 'lucide-react';

export const ForecastingView: React.FC = () => {
  const { products, triggerReorder, userRole, showToast } = useApp();
  const [selectedSku, setSelectedSku] = useState<string>('');
  const [forecast, setForecast] = useState<DemandForecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [reordering, setReordering] = useState(false);

  // What-If Simulator State
  const [demandSurgePercent, setDemandSurgePercent] = useState<number>(20); // Default +20%
  const [leadTimeDelay, setLeadTimeDelay] = useState<number>(0); // Default 0 days delay
  const [simulation, setSimulation] = useState<WhatIfSimulationResult | null>(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    if (products.length > 0 && !selectedSku) {
      const initial = products.find((p) => p.onHand <= (p.minThreshold || 50)) || products[0];
      setSelectedSku(initial.sku);
    }
  }, [products, selectedSku]);

  const runForecast = async (sku: string) => {
    if (!sku) return;
    setLoading(true);
    try {
      const res = await apiForecast.getForSku(sku);
      if (res.success && res.forecast) {
        setForecast(res.forecast);
      }
    } catch (err: any) {
      showToast(`FORECAST FAILED: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = async (sku: string, surge: number, delay: number) => {
    if (!sku) return;
    setSimulating(true);
    try {
      const res = await apiForecast.simulateWhatIf(sku, surge, delay);
      if (res.success && res.simulation) {
        setSimulation(res.simulation);
      }
    } catch (err: any) {
      console.warn('Simulation notice:', err.message);
    } finally {
      setSimulating(false);
    }
  };

  useEffect(() => {
    if (selectedSku) {
      runForecast(selectedSku);
      runSimulation(selectedSku, demandSurgePercent, leadTimeDelay);
    }
  }, [selectedSku]);

  // Re-run simulation when sliders change (with debounce)
  useEffect(() => {
    if (!selectedSku) return;
    const timer = setTimeout(() => {
      runSimulation(selectedSku, demandSurgePercent, leadTimeDelay);
    }, 250);
    return () => clearTimeout(timer);
  }, [demandSurgePercent, leadTimeDelay, selectedSku]);

  const handleProcure = async (qtyToOrder?: number) => {
    if (!forecast) return;
    setReordering(true);
    const qty = qtyToOrder || forecast.smartReorder?.recommendedQty || forecast.suggestedReorderQty || 100;
    try {
      await triggerReorder(forecast.sku, qty, forecast.smartReorder?.supplierName);
      await runForecast(forecast.sku);
      runSimulation(forecast.sku, demandSurgePercent, leadTimeDelay);
    } finally {
      setReordering(false);
    }
  };

  const maxTrajectory = forecast?.projectedTimeline
    ? Math.max(1, ...forecast.projectedTimeline.map((t) => t.projectedStock), forecast.currentStock)
    : 100;

  // Determine health color badge
  const healthScore = forecast?.healthScore || 75;
  const healthColor =
    healthScore >= 80
      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800'
      : healthScore >= 50
      ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800'
      : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800';

  return (
    <div className="flex flex-col w-full max-w-[1440px] mx-auto py-7 px-4 sm:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              AI Demand Prediction &amp; Reorder Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
              PREDICTIVE AI
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Consumption regressions, mathematical reorder deadlines, inventory health scoring, and What-If scenario simulations.
          </p>
        </div>

        {/* SKU Selector */}
        <div className="flex items-center gap-2 min-w-[300px]">
          <select
            value={selectedSku}
            onChange={(e) => setSelectedSku(e.target.value)}
            className="w-full h-11 px-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
          >
            {products.map((p) => (
              <option key={p.sku} value={p.sku}>
                {p.sku} — {p.name} ({p.onHand} in stock)
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Synthesizing Demand Regressions &amp; Depletion Curves...
          </p>
        </div>
      ) : forecast ? (
        <div className="flex flex-col gap-6">
          {/* 1. HIGHLIGHT: AI Stock Demand Prediction Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xs uppercase font-mono tracking-widest text-blue-200 font-bold block">
                  AI Stock Demand Prediction
                </span>
                <div className="text-lg sm:text-xl font-extrabold tracking-tight mt-0.5">
                  &ldquo;{forecast.name} ki {forecast.daysUntilStockout} days mein shortage ho sakti hai.&rdquo;
                </div>
                <div className="text-xs text-blue-100/90 mt-1 flex items-center gap-2">
                  <span>Next month expected demand:</span>
                  <span className="font-bold underline decoration-blue-300">
                    {forecast.monthlyExpectedDemand || forecast.avgDailyDemand * 30} units
                  </span>
                  <span>&bull;</span>
                  <span>Est. stockout date:</span>
                  <span className="font-mono font-bold">{forecast.stockoutRiskDate}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto">
              {/* Inventory Health Score Pill */}
              <div className="px-4 py-2 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl text-center">
                <span className="text-[10px] uppercase font-mono tracking-wider text-blue-200 block">Health Score</span>
                <span className="text-base font-extrabold tracking-tight">
                  {forecast.healthScore}/100 {forecast.healthStatus === 'HEALTHY' ? '🟢 Healthy' : forecast.healthStatus === 'AT_RISK' ? '🟡 At Risk' : '🔴 Critical'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. STAR FEATURE: Smart Reorder Recommendation ⭐ */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border-2 border-indigo-500/40 dark:border-indigo-500/30 shadow-md flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-4 py-1 bg-gradient-to-l from-indigo-500 to-purple-500 text-white text-[11px] font-bold rounded-bl-xl tracking-wider uppercase flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Smart Reorder Recommendation ⭐
            </div>

            <div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-4 h-4" />
                Algorithm-Backed Procurement Action
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                &ldquo;{forecast.smartReorder?.headline || `Reorder ${forecast.suggestedReorderQty} units within 3 days.`}&rdquo;
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Calculated automatically from: Current Stock + Average Daily Sales + Supplier Lead Time + Safety Stock Buffer.
              </p>
            </div>

            {/* Formula Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Current Stock</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {forecast.smartReorder?.currentStock ?? forecast.currentStock}
                </span>
                <span className="text-[10px] text-slate-400 block">units in depot</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Avg Daily Sales</span>
                <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                  {forecast.smartReorder?.avgDailySales ?? forecast.avgDailyDemand}
                </span>
                <span className="text-[10px] text-slate-400 block">units / day</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Supplier Lead Time</span>
                <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                  {forecast.smartReorder?.supplierLeadTime ?? 5} Days
                </span>
                <span className="text-[10px] text-slate-400 block truncate">{forecast.smartReorder?.supplierName || 'Primary Vendor'}</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Safety Stock</span>
                <span className="text-base font-bold text-purple-600 dark:text-purple-400">
                  {forecast.smartReorder?.safetyStock ?? forecast.minThreshold}
                </span>
                <span className="text-[10px] text-slate-400 block">min safety buffer</span>
              </div>

              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <span className="text-[10px] font-mono uppercase text-indigo-600 dark:text-indigo-400 font-bold block">Reorder Point</span>
                <span className="text-base font-extrabold text-indigo-700 dark:text-indigo-300">
                  {forecast.smartReorder?.reorderPoint ?? 80}
                </span>
                <span className="text-[10px] text-indigo-500 dark:text-indigo-400 block">trigger threshold</span>
              </div>
            </div>

            {/* Procurement Trigger Button */}
            {(userRole === 'admin' || userRole === 'inventory_manager') && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Order deadline: <strong className="text-slate-800 dark:text-slate-200">Within {forecast.smartReorder?.orderWithinDays || 3} days</strong> to prevent stock depletion before vendor delivery.
                </div>
                <button
                  disabled={reordering}
                  onClick={() => handleProcure()}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.01]"
                >
                  {reordering ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Dispatching PO to Vendor...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Reorder {forecast.smartReorder?.recommendedQty || forecast.suggestedReorderQty} Units Now</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* 3. STAR FEATURE: What-If Simulator ⭐ */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 shadow-xs flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-700/60">
              <div>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4" />
                  What-If Scenario Simulator ⭐
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  Stress-Test Supply Chain Under Demand Surges &amp; Vendor Delays
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                Adjust parameters to calculate real-time capital &amp; stockout shifts
              </span>
            </div>

            {/* Interactive Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/60 p-4 sm:p-5 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
              {/* Slider 1: Demand Surge */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    What if demand changes by:
                  </span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    {demandSurgePercent > 0 ? `+${demandSurgePercent}%` : `${demandSurgePercent}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min={-40}
                  max={100}
                  step={5}
                  value={demandSurgePercent}
                  onChange={(e) => setDemandSurgePercent(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>-40% Slump</span>
                  <span>Normal (0%)</span>
                  <span>+20% Surge</span>
                  <span>+50% Spike</span>
                  <span>+100% 2X Surge</span>
                </div>
              </div>

              {/* Slider 2: Supplier Delay */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    What if supplier lead time delays by:
                  </span>
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    +{leadTimeDelay} Days
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={14}
                  step={1}
                  value={leadTimeDelay}
                  onChange={(e) => setLeadTimeDelay(parseInt(e.target.value, 10))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>On Time (0d)</span>
                  <span>+3 Days Delay</span>
                  <span>+7 Days Delay</span>
                  <span>+14 Days (Severe)</span>
                </div>
              </div>
            </div>

            {/* Simulation Calculated Outputs */}
            {simulation && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Expected Stockout Date</span>
                    <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                      {simulation.simulatedStockoutDate}
                    </div>
                    <span className="text-xs text-rose-500 font-semibold block">
                      {simulation.daysShifted > 0
                        ? `Accelerated by ${simulation.daysShifted} days earlier`
                        : `${simulation.simulatedStockoutDays} days remaining`}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Additional Quantity Required</span>
                    <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                      +{simulation.additionalQtyRequired} Units
                    </div>
                    <span className="text-xs text-slate-400 block">To maintain 30-day buffer</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Estimated Inventory Cost</span>
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      ${simulation.estimatedCapitalCost.toLocaleString()}
                    </div>
                    <span className="text-xs text-slate-400 block">Required working capital</span>
                  </div>
                </div>
              </div>
            )}

            {simulation?.summaryText && (
              <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                <span><strong>Simulation Verdict:</strong> {simulation.summaryText}</span>
              </div>
            )}
          </div>

          {/* 4. 14-Day Stock Depletion Simulation Chart */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700/60 mb-4 gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  14-Day Baseline Depletion Trajectory
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Daily projected balance simulating estimated consumption against minimum safety threshold.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-3 h-0.5 bg-rose-500 inline-block" />
                <span>Safety Threshold: {forecast.minThreshold}</span>
              </div>
            </div>

            <div className="h-60 w-full flex items-end gap-2 pt-6 pb-2 overflow-x-auto">
              {(forecast.projectedTimeline || []).map((t, idx) => {
                const height = Math.max(8, Math.round((t.projectedStock / maxTrajectory) * 190));
                const isBelowMin = t.projectedStock <= (forecast.minThreshold || 50);

                return (
                  <div key={idx} className="flex-1 min-w-[32px] flex flex-col items-center gap-1 group relative">
                    <div className="absolute -top-12 hidden group-hover:flex flex-col items-center z-20 pointer-events-none bg-slate-900 text-white p-1.5 rounded-lg shadow-lg text-[10px] whitespace-nowrap">
                      <span className="font-bold">Day {t.day}</span>
                      <span>Stock: {t.projectedStock}</span>
                      {isBelowMin && <span className="text-rose-400">Deficit: Stockout</span>}
                    </div>

                    <div
                      className={`w-full rounded-t-sm transition-all cursor-pointer ${
                        isBelowMin ? 'bg-rose-500/80 hover:bg-rose-500' : 'bg-blue-600/80 hover:bg-blue-600'
                      }`}
                      style={{ height: `${height}px` }}
                    />

                    <span className="text-[10px] text-slate-400 truncate max-w-[36px]">{t.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
