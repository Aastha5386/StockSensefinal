import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';

interface NewProductModalProps {
  onClose: () => void;
}

export const NewProductModal: React.FC<NewProductModalProps> = ({ onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addProduct, showToast } = useApp();

  const [sku, setSku] = useState(`SKU-${Math.floor(10000 + Math.random() * 90000)}-NX`);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Raw Materials');
  const [unit, setUnit] = useState('PCS');
  const [onHand, setOnHand] = useState(100);
  const [freeToUse, setFreeToUse] = useState(90);
  const [location, setLocation] = useState('WH-A / RACK-14');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const newProd: Product = {
        sku: sku.trim().toUpperCase(),
        name: name.trim(),
        category: category.trim(),
        unit: unit.trim().toUpperCase(),
        onHand: Number(onHand) || 0,
        freeToUse: Number(freeToUse) || 0,
        location: location.trim(),
      };

      await addProduct(newProd);
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
              // REGISTER NEW CATALOG PRODUCT
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-secondary hover:text-on-surface p-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm uppercase text-secondary font-semibold">
                SKU Identifier
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full h-8 px-2 bg-surface-lowest border border-rule font-label-md text-label-md uppercase text-on-surface focus:outline-none focus:border-primary-container"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm uppercase text-secondary font-semibold">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-8 px-2 bg-surface-lowest border border-rule font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary-container"
              >
                <option value="Raw Materials">Raw Materials</option>
                <option value="Fasteners">Fasteners</option>
                <option value="Seals & Gaskets">Seals &amp; Gaskets</option>
                <option value="Packaging">Packaging</option>
                <option value="Fluids">Fluids</option>
                <option value="Electrical">Electrical</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm uppercase text-secondary font-semibold">
              Product Description / Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Precision CNC Machined Coupling Bolt"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-8 px-2 bg-surface-lowest border border-rule font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary-container"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm uppercase text-secondary font-semibold">
                Unit Spec
              </label>
              <input
                type="text"
                required
                placeholder="PCS, BOX / 500"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full h-8 px-2 bg-surface-lowest border border-rule font-label-md text-label-md uppercase text-on-surface focus:outline-none focus:border-primary-container"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm uppercase text-secondary font-semibold">
                On Hand
              </label>
              <input
                type="number"
                min="0"
                required
                value={onHand}
                onChange={(e) => setOnHand(Number(e.target.value))}
                className="w-full h-8 px-2 bg-surface-lowest border border-rule font-label-md text-label-md text-right text-on-surface focus:outline-none focus:border-primary-container"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm uppercase text-secondary font-semibold">
                Free to Use
              </label>
              <input
                type="number"
                min="0"
                required
                value={freeToUse}
                onChange={(e) => setFreeToUse(Number(e.target.value))}
                className="w-full h-8 px-2 bg-surface-lowest border border-rule font-label-md text-label-md text-right text-on-surface focus:outline-none focus:border-primary-container"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm uppercase text-secondary font-semibold">
              Assigned Depot Bay / Location
            </label>
            <input
              type="text"
              placeholder="e.g. WH-A / BAY-04"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full h-8 px-2 bg-surface-lowest border border-rule font-label-md text-label-md uppercase text-on-surface focus:outline-none focus:border-primary-container"
            />
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
              disabled={isSubmitting}
              className={`px-4 py-1.5 font-label-md text-label-md uppercase tracking-wider font-semibold transition-colors ${
                isSubmitting ? 'bg-surface-container text-secondary cursor-not-allowed' : 'bg-primary-container hover:bg-[#8E4217] text-white'
              }`}
            >
              {isSubmitting ? 'Committing...' : 'Commit SKU to Ledger'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
