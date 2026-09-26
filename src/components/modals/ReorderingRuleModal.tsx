import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, Receipt } from '../../types';

interface ReorderingRuleModalProps {
  product?: Product;
  onClose: () => void;
}

export const ReorderingRuleModal: React.FC<ReorderingRuleModalProps> = ({ product, onClose }) => {
  const { products, updateProduct, addReceipt, showToast } = useApp();

  const [selectedSku, setSelectedSku] = useState<string>(product?.sku || (products[0]?.sku || ''));
  const currentProduct = products.find((p) => p.sku === selectedSku) || product || products[0];

  const [minQty, setMinQty] = useState<number>(currentProduct?.minThreshold || 50);
  const [maxQty, setMaxQty] = useState<number>(currentProduct?.maxThreshold || (minQty * 3));
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

      showToast(`REORDERING RULE UPDATED // SKU: ${currentProduct.sku} (MIN: ${minQty} | MAX: ${maxQty})`);
      onClose();
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTriggerProcurement = async () => {
    if (!currentProduct || toOrderQty <= 0) {
      showToast('STOCK IS ALREADY AT OR ABOVE TARGET MAXIMUM LEVEL');
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
      showToast(`PROCUREMENT MANIFEST CREATED: ${receiptId} (+${toOrderQty} ${currentProduct.unit})`);
      onClose();
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
      <div className="w-full max-w-lg bg-surface border border-on-surface p-6 rounded-[2px] shadow-2xl flex flex-col gap-4 text-on-surface">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rule pb-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-primary-container inline-block" />
            <span className="font-label-md text-label-md tracking-wider uppercase font-semibold text-on-surface">
              // CONFIGURE REORDERING RULE (ODOO SPEC)
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-secondary hover:text-on-surface p-1 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSaveRule} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm uppercase text-secondary font-semibold">
              Select Product SKU
            </label>
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
              className="w-full h-8 px-2 bg-surface-lowest border border-rule font-label-md text-label-md uppercase text-on-surface focus:outline-none focus:border-primary-container"
            >
              {products.map((p) => (
                <option key={p.sku} value={p.sku}>
                  {p.sku} — {p.name} (Stock: {p.freeToUse} {p.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-surface-low border border-rule flex flex-col gap-2 rounded-[2px]">
            <div className="flex items-center justify-between text-xs font-label-md uppercase text-secondary">
              <span>Current Free Stock:</span>
              <span className="font-bold text-on-surface tabular-nums">
                {currentProduct?.freeToUse.toLocaleString()} {currentProduct?.unit}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-label-md uppercase text-secondary">
              <span>Location:</span>
              <span className="font-mono text-on-surface">{currentProduct?.location || 'WH-A / BAY-01'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm uppercase text-secondary font-semibold">
                Min Quantity (Trigger Threshold)
              </label>
              <input
                type="number"
                min="0"
                required
                value={minQty}
                onChange={(e) => setMinQty(Number(e.target.value))}
                className="w-full h-8 px-2 bg-surface-lowest border border-rule font-label-md text-label-md text-right text-on-surface focus:outline-none focus:border-primary-container"
              />
              <span className="text-[10px] text-tertiary">Triggers alert if stock &le; this</span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm uppercase text-secondary font-semibold">
                Max Quantity (Target Level)
              </label>
              <input
                type="number"
                min="0"
                required
                value={maxQty}
                onChange={(e) => setMaxQty(Number(e.target.value))}
                className="w-full h-8 px-2 bg-surface-lowest border border-rule font-label-md text-label-md text-right text-on-surface focus:outline-none focus:border-primary-container"
              />
              <span className="text-[10px] text-tertiary">Target stock level to replenish to</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm uppercase text-secondary font-semibold">
              Assigned Warehouse / Location Bay
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full h-8 px-2 bg-surface-lowest border border-rule font-label-md text-label-md uppercase text-on-surface focus:outline-none focus:border-primary-container"
            />
          </div>

          {/* Calculated Procure Amount */}
          <div className="p-3 bg-surface-container border border-primary-container/30 flex items-center justify-between rounded-[2px]">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase text-secondary font-semibold">
                Calculated Reorder Quantity
              </span>
              <span className="text-[11px] text-tertiary">Max Target ({maxQty}) - Free Stock ({currentProduct?.freeToUse || 0})</span>
            </div>
            <span className="font-label-lg text-headline-md font-bold text-primary-container tabular-nums">
              +{toOrderQty.toLocaleString()} {currentProduct?.unit}
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-rule mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-rule hover:bg-surface-container font-label-md text-label-md uppercase tracking-wider text-secondary transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-3 py-1.5 border font-label-md text-label-md uppercase tracking-wider font-semibold transition-colors cursor-pointer ${
                  isSubmitting ? 'border-rule text-secondary bg-surface-container cursor-not-allowed' : 'border-primary-container text-primary-container hover:bg-primary-container/10'
                }`}
              >
                {isSubmitting ? 'Saving...' : 'Save Rule'}
              </button>
              <button
                type="button"
                onClick={handleTriggerProcurement}
                disabled={toOrderQty <= 0 || isSubmitting}
                className={`px-3 py-1.5 font-label-md text-label-md uppercase tracking-wider font-semibold transition-colors shadow-sm ${
                  toOrderQty <= 0 || isSubmitting ? 'bg-surface-container text-secondary opacity-40 cursor-not-allowed' : 'bg-primary-container hover:bg-[#8E4217] text-white cursor-pointer'
                }`}
              >
                {isSubmitting ? 'Procuring...' : 'Procure Stock Now'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
