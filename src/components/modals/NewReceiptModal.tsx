import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Receipt, OperationalStatus } from '../../types';
import { FilePlus2, X, Plus } from 'lucide-react';

interface NewReceiptModalProps {
  onClose: () => void;
}

export const NewReceiptModal: React.FC<NewReceiptModalProps> = ({ onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addReceipt, products, showToast } = useApp();

  const [refId, setRefId] = useState(
    `RCV-${new Date().getFullYear()}-${Math.floor(88420 + Math.random() * 900)}`
  );
  const [contact, setContact] = useState('');
  const [carrierCode, setCarrierCode] = useState('EXP-BERGEN');
  const [toLocation, setToLocation] = useState('BAY-02 / NORTH DOCK');
  const [scheduledUtc, setScheduledUtc] = useState('26 OCT 2023 // 11:00 UTC');
  const [status, setStatus] = useState<OperationalStatus>('READY');
  const [selectedSku, setSelectedSku] = useState(products[0]?.sku || 'SKU-48201-AX');
  const [quantity, setQuantity] = useState(500);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) return;

    setIsSubmitting(true);
    try {
      const matchedProduct = products.find((p) => p.sku === selectedSku);

      const newReceipt: Receipt = {
        id: refId.trim().toUpperCase(),
        reference: `WH/IN/000${Math.floor(10 + Math.random() * 90)}`,
        contact: contact.trim(),
        carrierCode: carrierCode.trim().toUpperCase(),
        toLocation: toLocation.trim().toUpperCase(),
        scheduledUtc: scheduledUtc.trim(),
        status: status,
        clearanceStatus: 'CUSTOMS CLEARED',
        containerSeal: `#SEAL-${Math.floor(1000 + Math.random() * 9000)}-EU`,
        inspectionLevel: 'TIER-2 PHYSICAL TALLY',
        totalPieces: `${quantity} ASSORTED`,
        tallyWeight: `${(quantity * 2.4).toFixed(0)} KG NET`,
        items: [
          {
            product: matchedProduct?.name || 'Assorted Freight Materials',
            spec: 'STANDARD INVENTORY CRATE',
            sku: selectedSku,
            unit: matchedProduct?.unit || 'PCS',
            quantity: Number(quantity) || 1,
          },
        ],
        receiverNotes: 'Inbound consignment registered via dock terminal protocol.',
        custodialHandover: {
          dispatchChief: 'A. LINDBERG',
          terminalAuth: 'PASSED',
          sealStatus: 'UNBROKEN',
        },
      };

      await addReceipt(newReceipt);
      showToast(`Inbound receipt ${newReceipt.id} logged successfully`);
      onClose();
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] rounded-3xl p-6 sm:p-7 shadow-2xl shadow-[#6C4CE6]/10 dark:shadow-none space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E5F2] dark:border-[#282342]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0EDFD] dark:bg-[#6C4CE6]/20 text-[#6C4CE6] dark:text-[#A78BFA] flex items-center justify-center">
              <FilePlus2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Create Inbound Receipt</h2>
              <p className="text-xs text-slate-500 dark:text-[#A5A1BE]">Log incoming purchase order and supplier delivery</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-[#FAF9FD] dark:hover:bg-[#1B172E] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Receipt Reference</label>
              <input
                type="text"
                required
                value={refId}
                onChange={(e) => setRefId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-semibold bg-[#FAF9FD] dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] focus:bg-white dark:focus:bg-[#141124] focus:outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6] text-slate-900 dark:text-white uppercase"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Carrier Code</label>
              <input
                type="text"
                required
                value={carrierCode}
                onChange={(e) => setCarrierCode(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-[#FAF9FD] dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] focus:bg-white dark:focus:bg-[#141124] focus:outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6] text-slate-900 dark:text-white uppercase"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Supplier / Forwarder</label>
            <input
              type="text"
              required
              placeholder="e.g. Nordic Freight Logistics // OSLO-EXP"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#FAF9FD] dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] focus:bg-white dark:focus:bg-[#141124] focus:outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Product SKU</label>
              <select
                value={selectedSku}
                onChange={(e) => setSelectedSku(e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-[#FAF9FD] dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] focus:bg-white dark:focus:bg-[#141124] focus:outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6] text-slate-900 dark:text-white font-medium cursor-pointer"
              >
                {products.map((p) => (
                  <option key={p.sku} value={p.sku}>
                    {p.sku} - {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Intake Quantity</label>
              <input
                type="number"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-semibold bg-[#FAF9FD] dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] focus:bg-white dark:focus:bg-[#141124] focus:outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Destination Bay</label>
              <input
                type="text"
                required
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FAF9FD] dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] focus:bg-white dark:focus:bg-[#141124] focus:outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6] text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OperationalStatus)}
                className="w-full px-2.5 py-2 text-xs bg-[#FAF9FD] dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] focus:bg-white dark:focus:bg-[#141124] focus:outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6] text-slate-900 dark:text-white font-medium cursor-pointer"
              >
                <option value="DRAFT">Draft</option>
                <option value="WAITING">Waiting Inspection</option>
                <option value="READY">Ready for Dock</option>
                <option value="DONE">Completed</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Scheduled Arrival</label>
            <input
              type="text"
              required
              value={scheduledUtc}
              onChange={(e) => setScheduledUtc(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#FAF9FD] dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] focus:bg-white dark:focus:bg-[#141124] focus:outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6] text-slate-900 dark:text-white"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E5F2] dark:border-[#282342]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-[#1B172E] hover:bg-slate-50 dark:hover:bg-[#252040] border border-[#E8E5F2] dark:border-[#282342] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#6C4CE6] hover:bg-[#5839D6] rounded-xl transition-all shadow-sm shadow-[#6C4CE6]/25 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Logging...' : 'Log Receipt'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
