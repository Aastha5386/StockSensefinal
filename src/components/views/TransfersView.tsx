import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StockAdjustmentItem, MoveRecord } from '../../types';
import {
  ArrowLeftRight,
  Plus,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ScanLine,
  Flag,
  ArrowRight,
  Layers,
  Truck,
  ShieldCheck,
  Clock,
  Thermometer,
} from 'lucide-react';

export const TransfersView: React.FC = () => {
  const {
    adjustmentItems,
    updateCountedQuantity,
    appendAdjustmentItem,
    postAdjustmentRecord,
    addMoveRecord,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'combined' | 'transfer' | 'adjustment'>('combined');

  // Form states for Transfer
  const [fromLoc, setFromLoc] = useState('WH-A / RACK-14 // MAIN WAREHOUSE');
  const [toLoc, setToLoc] = useState('COLD-STOR / 01 // DEEP CHILL ZONE');
  const [mandate, setMandate] = useState('Batch Relocation / Critical Temperature Regime');
  const [carrierVehicle] = useState('Pallet Forklift #04');
  const [tempEnvelope] = useState('-2.0°C to +3.5°C');
  const [sealCert] = useState('VA-990-21-TAMPER');
  const [estDuration] = useState('18 Minutes');

  // Adjustment notes
  const [marshalNotes, setMarshalNotes] = useState('');

  // Calculations
  const systemSummation = adjustmentItems.reduce((acc, curr) => acc + curr.systemQuantity, 0);
  const countedSummation = adjustmentItems.reduce((acc, curr) => acc + curr.countedQuantity, 0);
  const netVariance = countedSummation - systemSummation;
  const netVariancePct =
    systemSummation > 0 ? ((netVariance / systemSummation) * 100).toFixed(2) : '0.00';

  const [isSubmittingMove, setIsSubmittingMove] = useState(false);
  const [isSubmittingAdjustment, setIsSubmittingAdjustment] = useState(false);

  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingMove(true);
    try {
      const newMove: MoveRecord = {
        reference: `MOV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        timestampUtc: `${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} // ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} UTC`,
        carrier: `Internal Transfer / ${carrierVehicle}`,
        carrierTag: 'INT-CONV',
        from: fromLoc.split('//')[0].trim(),
        to: toLoc.split('//')[0].trim(),
        quantity: '64 PALLET',
        isPositive: true,
        status: 'DONE',
        kind: 'internal',
      };
      await addMoveRecord(newMove);
      showToast(`Transfer mandate executed: ${fromLoc.split('//')[0].trim()} → ${toLoc.split('//')[0].trim()}`);
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setIsSubmittingMove(false);
    }
  };

  const handleAppendRow = async () => {
    setIsSubmittingAdjustment(true);
    try {
      const newItem: StockAdjustmentItem = {
        id: `adj-${Date.now()}`,
        sku: `SKU-${Math.floor(10000 + Math.random() * 90000)}-ST`,
        name: 'Auxiliary Steel Banding 19mm',
        spec: 'COIL CASING',
        location: 'WH-B / RACK-03',
        systemQuantity: 64,
        countedQuantity: 64,
      };
      await appendAdjustmentItem(newItem);
      showToast('Appended new SKU line to adjustment tally');
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setIsSubmittingAdjustment(false);
    }
  };

  const handlePostRecord = async () => {
    setIsSubmittingAdjustment(true);
    try {
      await postAdjustmentRecord(marshalNotes);
      showToast('Stock adjustment and ledger variance reconciled successfully');
      setMarshalNotes('');
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setIsSubmittingAdjustment(false);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-16 pt-2 px-4 sm:px-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Transfers & Adjustments
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Execute inter-bay warehouse transfers and reconcile physical inventory counts
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#141124] p-1 rounded-xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('combined')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'combined'
                ? 'bg-[#6C4CE6] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-[#F7F5FF] dark:hover:bg-[#1E1A34]'
            }`}
          >
            Combined View
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('transfer')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'transfer'
                ? 'bg-[#6C4CE6] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-[#F7F5FF] dark:hover:bg-[#1E1A34]'
            }`}
          >
            Internal Transfer
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('adjustment')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'adjustment'
                ? 'bg-[#6C4CE6] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-[#F7F5FF] dark:hover:bg-[#1E1A34]'
            }`}
          >
            Stock Adjustment
          </button>
        </div>
      </div>

      {/* KPI Audit Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#141124] p-5 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#F0EDFD] dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Audited Lines
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {adjustmentItems.length} SKUs
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#141124] p-5 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              System Book Stock
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {systemSummation.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#141124] p-5 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <ScanLine className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Physical Counted
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {countedSummation.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#141124] p-5 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              netVariance === 0
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
            }`}
          >
            {netVariance === 0 ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Net Variance
            </div>
            <div
              className={`text-2xl font-bold tabular-nums ${
                netVariance === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {netVariance > 0 ? `+${netVariance}` : netVariance}{' '}
              <span className="text-xs font-normal">({netVariancePct}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 01: INTERNAL TRANSFER MANIFEST */}
      {(activeTab === 'combined' || activeTab === 'transfer') && (
        <div className="bg-white dark:bg-[#141124] p-6 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-[#E8E5F2] dark:border-[#282342]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F0EDFD] dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] flex items-center justify-center">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Internal Transfer Route Specification
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Dispatch stock between storage zones, racks, or staging bays
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-[#1B172E] px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-[#282342]">
              FORM: WTR-9042
            </span>
          </div>

          <form onSubmit={handleExecuteTransfer} className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
              {/* From Location */}
              <div className="lg:col-span-5 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Source Location
                </label>
                <select
                  value={fromLoc}
                  onChange={(e) => setFromLoc(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9FD] dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] focus:bg-white dark:focus:bg-[#141124] focus:outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6] text-slate-900 dark:text-white font-medium cursor-pointer"
                >
                  <option value="WH-A / RACK-14 // MAIN WAREHOUSE">
                    WH-A / RACK-14 · Main Warehouse
                  </option>
                  <option value="WH-A / BAY-02 // BULK STAGING">
                    WH-A / BAY-02 · Bulk Staging
                  </option>
                  <option value="WH-B / SHELF-04 // PACKAGING DEPOT">
                    WH-B / SHELF-04 · Packaging Depot
                  </option>
                  <option value="WH-C / SEC-09 // HAZMAT SHED">
                    WH-C / SEC-09 · Hazmat Shed
                  </option>
                </select>
              </div>

              {/* Arrow */}
              <div className="lg:col-span-1 flex items-center justify-center pt-5">
                <div className="w-8 h-8 rounded-full bg-[#F0EDFD] dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] flex items-center justify-center">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* To Location */}
              <div className="lg:col-span-5 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Destination Location
                </label>
                <select
                  value={toLoc}
                  onChange={(e) => setToLoc(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9FD] dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] focus:bg-white dark:focus:bg-[#141124] focus:outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6] text-slate-900 dark:text-white font-medium cursor-pointer"
                >
                  <option value="COLD-STOR / 01 // DEEP CHILL ZONE">
                    COLD-STOR / 01 · Deep Chill Zone
                  </option>
                  <option value="WH-A / RACK-14 // MAIN WAREHOUSE">
                    WH-A / RACK-14 · Main Warehouse
                  </option>
                  <option value="DRUM-BAY / 01 // FLUID CONTAINMENT">
                    DRUM-BAY / 01 · Fluid Containment
                  </option>
                  <option value="DISPATCH-DOCK / 03 // OUTBOUND STAGE">
                    DISPATCH-DOCK / 03 · Outbound Stage
                  </option>
                </select>
              </div>
            </div>

            {/* Mandate & Meta */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Transfer Mandate / Reason
              </label>
              <input
                type="text"
                value={mandate}
                onChange={(e) => setMandate(e.target.value)}
                placeholder="E.g., Routine stock redistribution..."
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9FD] dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] focus:bg-white dark:focus:bg-[#141124] focus:outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6] text-slate-900 dark:text-white"
              />
            </div>

            {/* Route Details Chips */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 bg-[#FAF9FD] dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342]">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-[#6C4CE6] dark:text-[#A78BFA]" />
                <div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Vehicle</div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{carrierVehicle}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Thermometer className="w-4 h-4 text-[#6C4CE6] dark:text-[#A78BFA]" />
                <div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Temperature</div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{tempEnvelope}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#6C4CE6] dark:text-[#A78BFA]" />
                <div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Seal Cert</div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono">{sealCert}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#6C4CE6] dark:text-[#A78BFA]" />
                <div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Duration</div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{estDuration}</div>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="reset"
                onClick={() => {
                  setMandate('Batch Relocation / Critical Temperature Regime');
                  showToast('Reset transfer parameters');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-[#1B172E] hover:bg-slate-50 dark:hover:bg-[#252040] border border-[#E8E5F2] dark:border-[#282342] rounded-xl transition-colors cursor-pointer"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={isSubmittingMove}
                className="inline-flex items-center gap-2 px-5 py-2 bg-[#6C4CE6] hover:bg-[#5839D6] text-white text-xs font-semibold rounded-xl transition-all shadow-sm shadow-[#6C4CE6]/25 cursor-pointer disabled:opacity-50"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>{isSubmittingMove ? 'Executing...' : 'Execute Transfer'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 02: STOCK ADJUSTMENT & RECONCILIATION */}
      {(activeTab === 'combined' || activeTab === 'adjustment') && (
        <div className="bg-white dark:bg-[#141124] p-6 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#E8E5F2] dark:border-[#282342] gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ScanLine className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Physical Count Reconciliation
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Audit physical inventory against system book records and record variances
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAppendRow}
                disabled={isSubmittingAdjustment}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#1B172E] hover:bg-[#FAF9FD] dark:hover:bg-[#252040] border border-[#E8E5F2] dark:border-[#282342] rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#6C4CE6] dark:text-[#A78BFA]" />
                <span>Append SKU Line</span>
              </button>

              <button
                type="button"
                onClick={handlePostRecord}
                disabled={isSubmittingAdjustment}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#6C4CE6] hover:bg-[#5839D6] rounded-xl transition-all shadow-sm shadow-[#6C4CE6]/25 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isSubmittingAdjustment ? 'Posting...' : 'Post Adjustment'}</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-[#E8E5F2] dark:border-[#282342]">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#FAF9FD] dark:bg-[#1B172E] border-b border-[#E8E5F2] dark:border-[#282342] text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Product / SKU</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-right">System Book</th>
                  <th className="py-3 px-4 text-right">Counted Qty</th>
                  <th className="py-3 px-4 text-right">Variance</th>
                  <th className="py-3 px-4 text-center w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5F2] dark:divide-[#282342] text-sm text-slate-700 dark:text-slate-300">
                {adjustmentItems.map((item) => {
                  const diff = item.countedQuantity - item.systemQuantity;
                  const isMismatch = diff !== 0;

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isMismatch ? 'bg-rose-50/40 dark:bg-rose-950/20' : 'hover:bg-[#FAF9FD] dark:hover:bg-[#1B172E]/60'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{item.name}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                          {item.sku} · {item.spec}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                        {item.location}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                        {item.systemQuantity.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <input
                          type="number"
                          aria-label={`Counted quantity for ${item.sku}`}
                          value={item.countedQuantity}
                          onChange={(e) =>
                            updateCountedQuantity(item.id, Number(e.target.value) || 0)
                          }
                          className={`w-24 text-right px-2.5 py-1 text-sm rounded-lg border font-semibold tabular-nums focus:outline-none focus:ring-2 ${
                            isMismatch
                              ? 'border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 focus:ring-rose-200'
                              : 'border-[#E8E5F2] dark:border-[#282342] bg-white dark:bg-[#141124] text-slate-900 dark:text-white focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6]'
                          }`}
                        />
                      </td>
                      <td className="py-3 px-4 text-right">
                        {diff === 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            0 (Match)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            {diff > 0 ? `+${diff}` : diff}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isMismatch ? (
                          <button
                            type="button"
                            onClick={() => showToast(`Flagged investigation on ${item.sku}`)}
                            className="p-1 text-rose-600 dark:text-rose-400 hover:opacity-80 cursor-pointer"
                            title="Flag variance investigation"
                          >
                            <Flag className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => showToast(`Re-scanned barcode for ${item.sku}`)}
                            className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                            title="Scan confirmation"
                          >
                            <ScanLine className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Justification note & Post */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="w-full sm:max-w-md space-y-1">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Variance Justification Notes
              </label>
              <input
                type="text"
                value={marshalNotes}
                onChange={(e) => setMarshalNotes(e.target.value)}
                placeholder="E.g., Packaging shrinkage recorded during physical recount..."
                className="w-full px-3 py-2 text-xs bg-[#FAF9FD] dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] focus:bg-white dark:focus:bg-[#141124] focus:outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6] text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
              />
            </div>

            <button
              type="button"
              onClick={handlePostRecord}
              disabled={isSubmittingAdjustment}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#6C4CE6] hover:bg-[#5839D6] text-white text-xs font-semibold rounded-xl transition-all shadow-sm shadow-[#6C4CE6]/25 cursor-pointer disabled:opacity-50"
            >
              {isSubmittingAdjustment ? 'Reconciling...' : 'Confirm & Post Reconciliation'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
