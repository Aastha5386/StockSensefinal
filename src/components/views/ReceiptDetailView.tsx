import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  Printer,
  CheckCircle2,
  Building2,
  Calendar,
  MapPin,
  ShieldCheck,
  FileText,
  Lock,
  Package,
} from 'lucide-react';

export const ReceiptDetailView: React.FC = () => {
  const { receipts, selectedReceiptId, validateReceipt, showToast } = useApp();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(false);

  const receipt =
    (id ? receipts.find((r) => r.id === id) : null) ||
    receipts.find((r) => r.id === selectedReceiptId) ||
    receipts[0] || {
      id: id || 'RCV-2023-88401',
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

  const handleValidate = async () => {
    setIsValidating(true);
    try {
      await validateReceipt(receipt.id);
      showToast(`Receipt ${receipt.id} validated and stock reconciled successfully`);
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/receipts')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#6C4CE6] dark:text-[#A78BFA] hover:text-[#5839D6] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Inbound Receipts</span>
        </button>

        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
          Receipt Ref: <span className="font-mono text-slate-600 dark:text-slate-300">{receipt.id}</span>
        </span>
      </div>

      {/* Header Card: Identifier & Actions */}
      <div className="bg-white dark:bg-[#141124] p-6 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F0EDFD] dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] border border-[#6C4CE6]/25 dark:border-[#383256]">
              PO Manifest
            </span>
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
              {receipt.id}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {receipt.reference || 'WH/IN/0001'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Scheduled Intake: {receipt.scheduledUtc}
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
            <span>Print Manifest</span>
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
              {isValidating ? 'Validating...' : isDone ? 'Intake Validated' : 'Validate & Receive'}
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
            <span>Draft Created</span>
          </div>
          <div className="h-0.5 flex-1 mx-3 bg-[#E8E5F2] dark:bg-[#282342]" />
          <div
            className={`flex items-center gap-2 ${
              receipt.status !== 'DRAFT' ? 'text-[#6C4CE6] dark:text-[#A78BFA]' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                receipt.status !== 'DRAFT'
                  ? 'bg-[#6C4CE6] text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              2
            </span>
            <span>Dock Processing</span>
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
            <span>Received & Reconciled</span>
          </div>
        </div>
      </div>

      {/* Snapshot Specs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#141124] p-4 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-[#6C4CE6] dark:text-[#A78BFA]" />
            <span>Clearance Status</span>
          </div>
          <div className="text-sm font-semibold text-slate-900 dark:text-white">
            {receipt.clearanceStatus || 'Customs Cleared'}
          </div>
        </div>

        <div className="bg-white dark:bg-[#141124] p-4 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            <Lock className="w-4 h-4 text-[#6C4CE6] dark:text-[#A78BFA]" />
            <span>Container Seal</span>
          </div>
          <div className="text-sm font-mono font-semibold text-slate-900 dark:text-white">
            {receipt.containerSeal || '#SEAL-9844-EU'}
          </div>
        </div>

        <div className="bg-white dark:bg-[#141124] p-4 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4 text-[#6C4CE6] dark:text-[#A78BFA]" />
            <span>Inspection Level</span>
          </div>
          <div className="text-sm font-semibold text-slate-900 dark:text-white">
            {receipt.inspectionLevel || 'Tier-2 Physical Tally'}
          </div>
        </div>

        <div className="bg-white dark:bg-[#141124] p-4 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            <Package className="w-4 h-4 text-[#6C4CE6] dark:text-[#A78BFA]" />
            <span>Total Pieces / Units</span>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            {receipt.totalPieces || '2,030 ASSORTED'}
          </div>
        </div>
      </div>

      {/* Logistics & Dock Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#141124] p-5 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#F0EDFD] dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Supplier & Carrier
            </div>
            <div className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">
              {receipt.contact}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Carrier ID: {receipt.carrierCode || 'NFL-NO-991204'}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#141124] p-5 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Warehouse Staging Bay
            </div>
            <div className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">
              {receipt.toLocation}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Scheduled Arrival: {receipt.scheduledUtc}
            </div>
          </div>
        </div>
      </div>

      {/* Manifest Line Items Table */}
      <div className="bg-white dark:bg-[#141124] rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E8E5F2] dark:border-[#282342] flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Manifest Line Items ({receipt.items.length})
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Tally Weight: {receipt.tallyWeight || '4,820 KG Net'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-[#FAF9FD] dark:bg-[#1B172E] border-b border-[#E8E5F2] dark:border-[#282342] text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-5">Product Description</th>
                <th className="py-3 px-5">SKU</th>
                <th className="py-3 px-5">Unit</th>
                <th className="py-3 px-5 text-right">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5F2] dark:divide-[#282342] text-sm text-slate-700 dark:text-slate-300">
              {receipt.items.length > 0 ? (
                receipt.items.map((item, idx) => (
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
                      {item.unit}
                    </td>
                    <td className="py-3.5 px-5 text-right font-bold text-slate-900 dark:text-white tabular-nums">
                      {item.quantity.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                    No individual cargo items attached to this PO manifest
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receiver Notes & Custodial Handover */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white dark:bg-[#141124] p-5 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs">
          <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Receiver Inspection & Tally Notes
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {receipt.receiverNotes ||
              'External sea container seals verified intact by Gatekeeper 04. No moisture breach observed on lower crate battens. Hydraulic drums marked for immediate segregation under Class-II storage regulation upon custody acceptance.'}
          </p>
        </div>

        <div className="bg-white dark:bg-[#141124] p-5 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Custodial Handover
            </h3>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              Dispatch Chief: A. Lindberg
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Terminal Verification: Passed
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-[#E8E5F2] dark:border-[#282342] flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Seal Status:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {receipt.custodialHandover?.sealStatus || 'UNBROKEN'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
