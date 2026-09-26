import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Receipt, OperationalStatus } from '../../types';

interface NewReceiptModalProps {
  onClose: () => void;
}

export const NewReceiptModal: React.FC<NewReceiptModalProps> = ({ onClose }) => {
  const { addReceipt, products } = useApp();

  const [refId, setRefId] = useState(`RCV-${new Date().getFullYear()}-${Math.floor(88420 + Math.random() * 900)}`);
  const [contact, setContact] = useState('');
  const [carrierCode, setCarrierCode] = useState('EXP-BERGEN');
  const [toLocation, setToLocation] = useState('BAY-02 / NORTH DOCK');
  const [scheduledUtc, setScheduledUtc] = useState('26 OCT 2023 // 11:00 UTC');
  const [status, setStatus] = useState<OperationalStatus>('READY');
  const [selectedSku, setSelectedSku] = useState(products[0]?.sku || 'SKU-48201-AX');
  const [quantity, setQuantity] = useState(500);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) return;

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

    addReceipt(newReceipt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
      <div className="w-full max-w-lg bg-surface border border-on-surface p-6 rounded-[2px] shadow-2xl flex flex-col gap-4 text-on-surface">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rule pb-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-primary-container inline-block" />
            <span className="font-label-md text-label-md tracking-wider uppercase font-semibold text-on-surface">
              // LOG NEW INBOUND FREIGHT MANIFEST
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-secondary hover:text-on-surface p-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm uppercase text-secondary font-semibold">
                Receipt / Manifest Reference
              </label>
              <input
                type="text"
                required
                value={refId}
                onChange={(e) => setRefId(e.target.value)}
                className="w-full h-8 px-2 bg-surface-lowest border border-rule font-label-md text-label-md uppercase text-on-surface focus:outline-none focus:border-primary-container"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm uppercase text-secondary font-semibold">
                Forwarder / Carrier Code
              </label>
              <input
                type="text"
                value={carrierCode}
                onChange={(e) => setCarrierCode(e.target.value)}
                className="w-full h-8 px-2 bg-surface-lowest border border-rule font-label-md text-label-md uppercase text-on-surface focus:outline-none focus:border-primary-container"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm uppercase text-secondary font-semibold">
              Contact / Freight Line Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Nordic Freight Logistics or Apex Industrial"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full h-8 px-2 bg-surface-lowest border border-rule font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary-container"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm uppercase text-secondary font-semibold">
                Assigned Dock / Bay
              </label>
              <input
                type="text"
                required
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                className="w-full h-8 px-2 bg-surface-lowest border border-rule font-label-md text-label-md uppercase text-on-surface focus:outline-none focus:border-primary-container"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm uppercase text-secondary font-semibold">
                Operational Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OperationalStatus)}
                className="w-full h-8 px-2 bg-surface-lowest border border-rule font-label-md text-label-md uppercase text-on-surface focus:outline-none focus:border-primary-container"
              >
                <option value="READY">READY</option>
                <option value="WAITING">WAITING</option>
                <option value="DRAFT">DRAFT</option>
                <option value="DONE">DONE</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm uppercase text-secondary font-semibold">
              Scheduled Timestamp (UTC)
            </label>
            <input
              type="text"
              value={scheduledUtc}
              onChange={(e) => setScheduledUtc(e.target.value)}
              className="w-full h-8 px-2 bg-surface-lowest border border-rule font-label-md text-label-md uppercase text-on-surface focus:outline-none focus:border-primary-container"
            />
          </div>

          {/* Initial SKU Line */}
          <div className="p-3 bg-surface-low border border-rule flex flex-col gap-2 mt-1">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-tertiary">
              // INITIAL CARGO MANIFEST ITEM
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-label-sm uppercase text-secondary">
                  Primary SKU
                </label>
                <select
                  value={selectedSku}
                  onChange={(e) => setSelectedSku(e.target.value)}
                  className="w-full h-7 px-1.5 bg-surface-lowest border border-rule font-label-sm text-label-sm text-on-surface"
                >
                  {products.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.sku} - {p.name.slice(0, 24)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-label-sm uppercase text-secondary">
                  Tally Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full h-7 px-2 bg-surface-lowest border border-rule font-label-sm text-label-sm text-right text-on-surface"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-rule mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 border border-rule hover:bg-surface-container font-label-md text-label-md uppercase tracking-wider text-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-primary-container hover:bg-[#8E4217] text-white font-label-md text-label-md uppercase tracking-wider font-semibold transition-colors"
            >
              Sign &amp; Inscribe Manifest
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
