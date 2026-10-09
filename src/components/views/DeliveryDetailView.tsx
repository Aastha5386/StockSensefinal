import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  Printer,
  CheckCircle2,
  Clock,
  MapPin,
  Truck,
  Package,
  Layers,
  ShieldCheck,
} from 'lucide-react';

export const DeliveryDetailView: React.FC = () => {
  const { delivery, toggleDeliveryChecklist, validateDelivery, showToast } = useApp();
  const navigate = useNavigate();

  const [isValidating, setIsValidating] = useState(false);
  const [isTogglingPick, setIsTogglingPick] = useState(false);
  const [isTogglingPack, setIsTogglingPack] = useState(false);

  const handleValidate = async () => {
    setIsValidating(true);
    try {
      await validateDelivery();
      showToast(`Outbound dispatch ${delivery?.id || ''} confirmed and stock reconciled`);
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setIsValidating(false);
    }
  };

  const handleToggle = async (field: 'pick' | 'pack') => {
    field === 'pick' ? setIsTogglingPick(true) : setIsTogglingPack(true);
    try {
      await toggleDeliveryChecklist(field);
    } catch (err: any) {
      showToast(err.message);
    } finally {
      field === 'pick' ? setIsTogglingPick(false) : setIsTogglingPack(false);
    }
  };

  const isDone = delivery?.status === 'DONE';

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Return button & Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#6C4CE6] dark:text-[#A78BFA] hover:text-[#5839D6] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>

        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
          Dispatch ID: <span className="font-mono text-slate-600 dark:text-slate-300">{delivery?.id || 'OUT-8812'}</span>
        </span>
      </div>

      {/* Header Card: Identifier & Actions */}
      <div className="bg-white dark:bg-[#141124] p-6 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F0EDFD] dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] border border-[#6C4CE6]/25 dark:border-[#383256]">
              Outbound Dispatch
            </span>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
              Stage: {delivery?.stageName || 'Staging Bay'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {delivery?.id || 'UNKNOWN-ID'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Timestamp: {delivery?.timestampUtc || 'N/A'} · Ledger ID: {delivery?.ledgerId || 'N/A'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1B172E] text-slate-700 dark:text-slate-200 hover:bg-[#FAF9FD] dark:hover:bg-[#252040] text-sm font-medium rounded-xl border border-[#E8E5F2] dark:border-[#282342] transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Print Waybill</span>
          </button>

          <button
            type="button"
            disabled={isDone || isValidating}
            onClick={handleValidate}
            className={`inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl transition-all shadow-sm cursor-pointer ${
              isDone
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 cursor-default'
                : isValidating
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-[#6C4CE6] hover:bg-[#5839D6] text-white shadow-[#6C4CE6]/25'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isValidating
                ? 'Validating...'
                : isDone
                ? 'Dispatched & Reconciled'
                : 'Validate Dispatch'}
            </span>
          </button>
        </div>
      </div>

      {/* Modern Stepper / Progress Bar */}
      <div className="bg-white dark:bg-[#141124] p-4 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs">
        <div className="flex items-center justify-between max-w-xl mx-auto text-xs font-semibold">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <span className="w-6 h-6 rounded-full bg-[#6C4CE6] text-white flex items-center justify-center text-xs">
              1
            </span>
            <span>Draft Order</span>
          </div>
          <div className="h-0.5 flex-1 mx-3 bg-[#E8E5F2] dark:bg-[#282342]" />
          <div
            className={`flex items-center gap-2 ${
              !isDone ? 'text-[#6C4CE6] dark:text-[#A78BFA]' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                !isDone
                  ? 'bg-[#6C4CE6] text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              2
            </span>
            <span>Picking & Packing</span>
          </div>
          <div className="h-0.5 flex-1 mx-3 bg-[#E8E5F2] dark:bg-[#282342]" />
          <div
            className={`flex items-center gap-2 ${
              isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                isDone ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              3
            </span>
            <span>Outbound Dispatched</span>
          </div>
        </div>
      </div>

      {/* Destination & Operation Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#141124] p-5 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#F0EDFD] dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Delivery Address & Destination
            </div>
            <div className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">
              {delivery?.deliveryAddress || 'N/A'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Coordinates: {delivery?.coordinates || 'N/A'}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#141124] p-5 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Operation Type & Routing
            </div>
            <div className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">
              {delivery?.operationType || 'Outbound Freight'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Route: {delivery?.routing || 'Direct Depot Ground'}
            </div>
          </div>
        </div>
      </div>

      {/* Pre-Dispatch Verification Checklist */}
      <div className="bg-white dark:bg-[#141124] p-5 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#6C4CE6] dark:text-[#A78BFA]" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Pre-Dispatch Verification Checklist
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Item 1 */}
          <div
            onClick={() => !isTogglingPick && handleToggle('pick')}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
              delivery?.pickVerified
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-805/40'
                : 'bg-[#FAF9FD] dark:bg-[#1B172E] border-[#E8E5F2] dark:border-[#282342] hover:border-[#6C4CE6]/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  delivery?.pickVerified
                    ? 'bg-emerald-500 text-white'
                    : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#141124]'
                }`}
              >
                {delivery?.pickVerified && <CheckCircle2 className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Pick Verified by Staging Team
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Dock personnel physical item confirmation
                </div>
              </div>
            </div>
            <span
              className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-md ${
                delivery?.pickVerified
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {delivery?.pickVerifiedTime || 'PENDING'}
            </span>
          </div>

          {/* Item 2 */}
          <div
            onClick={() => !isTogglingPack && handleToggle('pack')}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
              delivery?.packInspected
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                : 'bg-[#FAF9FD] dark:bg-[#1B172E] border-[#E8E5F2] dark:border-[#282342] hover:border-[#6C4CE6]/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  delivery?.packInspected
                    ? 'bg-emerald-500 text-white'
                    : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#141124]'
                }`}
              >
                {delivery?.packInspected && <CheckCircle2 className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Pack Inspected & Seal Intact
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Security tamper seal verification
                </div>
              </div>
            </div>
            <span
              className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-md ${
                delivery?.packInspected
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {delivery?.packInspectedTime || 'PENDING'}
            </span>
          </div>
        </div>
      </div>

      {/* Bill of Lading Line Items Table */}
      <div className="bg-white dark:bg-[#141124] rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E8E5F2] dark:border-[#282342] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#6C4CE6] dark:text-[#A78BFA]" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Bill of Lading Line Items ({delivery?.items?.length || 0})
            </h2>
          </div>
          <span className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40 font-semibold">
            Tare Weight Audit: Passed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-[#FAF9FD] dark:bg-[#1B172E] border-b border-[#E8E5F2] dark:border-[#282342] text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-5">Product Description</th>
                <th className="py-3 px-5">SKU Identifier</th>
                <th className="py-3 px-5">Origin / Bay</th>
                <th className="py-3 px-5 text-right">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5F2] dark:divide-[#282342] text-sm text-slate-700 dark:text-slate-300">
              {delivery?.items?.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#FAF9FD] dark:hover:bg-[#1B172E]/60 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="font-semibold text-slate-900 dark:text-white">{item.product}</div>
                    {item.spec && (
                      <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{item.spec}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-xs text-slate-600 dark:text-slate-400">
                    {item.sku}
                  </td>
                  <td className="py-3.5 px-5 text-slate-600 dark:text-slate-400 text-xs">
                    {item.destinationBay}
                  </td>
                  <td className="py-3.5 px-5 text-right font-bold text-slate-900 dark:text-white tabular-nums">
                    {item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-[#E8E5F2] dark:border-[#282342] bg-[#FAF9FD] dark:bg-[#1B172E] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Cargo Gross Mass: <span className="font-semibold text-slate-800 dark:text-slate-200">{delivery?.grossMass || '0'}</span> · Net Volume:{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">{delivery?.netVolume || '0'}</span>
          </div>
          <div className="font-semibold text-slate-700 dark:text-slate-200">
            Total Position Units: {delivery?.items?.length || 0}
          </div>
        </div>
      </div>
    </div>
  );
};
