import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, Receipt } from '../../types';
import { SlidersHorizontal, X, ShoppingCart, Check } from 'lucide-react';

interface ReorderingRuleModalProps {
  product?: Product;
  onClose: () => void;
}

export const ReorderingRuleModal: React.FC<ReorderingRuleModalProps> = ({ product, onClose }) => {
  const { products, updateProduct, addReceipt, showToast } = useApp();

  const [selectedSku, setSelectedSku] = useState<string>(product?.sku || products[0]?.sku || '');
  const currentProduct = products.find((p) => p.sku === selectedSku) || product || products[0];

  const [minQty, setMinQty] = useState<number>(currentProduct?.minThreshold || 50);
  const [maxQty, setMaxQty] = useState<number>(currentProduct?.maxThreshold || minQty * 3);
  const [location, setLocation] = useState<string>(currentProduct?.location || 'WH-A / RACK-14');

  const toOrderQty = Math.max(0, maxQty - (currentProduct?.freeToUse || 0));

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) return;

    setIsSubmitting(true);
    try {
      await updateProduct(currentProduct.sku, {
        ...currentProduct,
        minThreshold: Number(minQty) || 0,
        maxThreshold: Number(maxQty) || 0,
        location: location.trim(),
      });

      showToast(`Reordering rule saved for SKU: ${currentProduct.sku} (Min: ${minQty}, Max: ${maxQty})`);
      onClose();
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTriggerProcurement = async () => {
    if (!currentProduct || toOrderQty <= 0) {
      showToast('Stock is already at or above target maximum level');
      return;
    }

    setIsSubmitting(true);
    try {
      // Save rule first
      await updateProduct(currentProduct.sku, {
        ...currentProduct,
        minThreshold: Number(minQty) || 0,
        maxThreshold: Number(maxQty) || 0,
        location: location.trim(),
      });

      // Auto generate Inbound Receipt
      const receiptId = `RCV-REORDER-${Math.floor(1000 + Math.random() * 9000)}`;
      const newReceipt: Receipt = {
        id: receiptId,
        reference: `PO-AUTO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        contact: 'Automated Procurement / Reorder Rule',
        carrierCode: 'AUTO-REORDER',
        toLocation: location,
        scheduledUtc: `${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} // 09:00 UTC`,
        status: 'WAITING',
        clearanceStatus: 'REORDER RULE TRIGGERED',
        items: [
          {
            product: currentProduct.name,
            sku: currentProduct.sku,
            unit: currentProduct.unit,
            quantity: toOrderQty,
          },
        ],
        receiverNotes: `Auto-generated procurement receipt from Reordering Rule (Min: ${minQty}, Max: ${maxQty}, Target Procure: ${toOrderQty} ${currentProduct.unit}).`,
      };

      await addReceipt(newReceipt);
      showToast(`Procurement manifest created: ${receiptId} (+${toOrderQty} ${currentProduct.unit})`);
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
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Configure Reordering Rule</h2>
              <p className="text-xs text-slate-500 dark:text-[#A5A1BE]">Automated minimum/maximum threshold policy</p>
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

        <form onSubmit={handleSaveRule} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select Product Catalog SKU</label>
            <select
              value={selectedSku}
              onChange={(e) => {
                const skuVal = e.target.value;
                setSelectedSku(skuVal);
                const found = products.find((p) => p.sku === skuVal);
                if (found) {
                  setMinQty(found.minThreshold || 50);
                  setMaxQty(found.maxThreshold || 150);
                  setLocation(found.location || 'WH-A / RACK-14');
                }
              }}
              className="w-full px-3 py-2 text-xs bg-[#FAF9FD] dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] focus:bg-white dark:focus:bg-[#141124] focus:outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6] text-slate-900 dark:text-white font-medium cursor-pointer"
            >
              {products.map((p) => (
                <option key={p.sku} value={p.sku}>
                  {p.sku} — {p.name} (Stock: {p.freeToUse} {p.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Current Status Tile */}
          <div className="p-3 bg-[#FAF9FD] dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 dark:text-slate-500">Current Free Stock: </span>
              <span className="font-bold text-slate-800 dark:text-white tabular-nums">
                {currentProduct?.freeToUse.toLocaleString()} {currentProduct?.unit}
              </span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500">Bay: </span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{currentProduct?.location || 'WH-A / BAY-01'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Min Threshold (Alert)
              </label>
              <input
                type="number"
                min="0"
                required
                value={minQty}
                onChange={(e) => setMinQty(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-semibold bg-[#FAF9FD] dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] focus:bg-white dark:focus:bg-[#141124] focus:outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6] text-slate-900 dark:text-white text-right"
              />
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Triggers low stock status</span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Max Threshold (Target)
              </label>
              <input
                type="number"
                min="0"
                required
                value={maxQty}
                onChange={(e) => setMaxQty(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-semibold bg-[#FAF9FD] dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] focus:bg-white dark:focus:bg-[#141124] focus:outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6] text-slate-900 dark:text-white text-right"
              />
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Replenishment ceiling</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Assigned Staging Location</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#FAF9FD] dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] focus:bg-white dark:focus:bg-[#141124] focus:outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6] text-slate-900 dark:text-white"
            />
          </div>

          {/* Calculated Replenish Card */}
          <div className="p-3.5 bg-[#F0EDFD] dark:bg-[#6C4CE6]/10 border border-[#6C4CE6]/20 dark:border-[#6C4CE6]/30 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#6C4CE6] dark:text-[#A78BFA]">Calculated Reorder Volume</div>
              <div className="text-[11px] text-slate-500 dark:text-[#A5A1BE]">Target Max ({maxQty}) - Available ({currentProduct?.freeToUse || 0})</div>
            </div>
            <div className="text-lg font-bold text-[#6C4CE6] dark:text-[#A78BFA] tabular-nums">
              +{toOrderQty.toLocaleString()} {currentProduct?.unit}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-[#E8E5F2] dark:border-[#282342]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-[#1B172E] hover:bg-slate-50 dark:hover:bg-[#252040] border border-[#E8E5F2] dark:border-[#282342] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#1B172E] hover:bg-[#FAF9FD] dark:hover:bg-[#252040] border border-[#E8E5F2] dark:border-[#282342] rounded-xl transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-[#6C4CE6] dark:text-[#A78BFA]" />
                <span>{isSubmitting ? 'Saving...' : 'Save Rule'}</span>
              </button>
              <button
                type="button"
                onClick={handleTriggerProcurement}
                disabled={toOrderQty <= 0 || isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#6C4CE6] hover:bg-[#5839D6] rounded-xl transition-all shadow-sm shadow-[#6C4CE6]/25 cursor-pointer disabled:opacity-40"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Ordering...' : 'Procure Now'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
