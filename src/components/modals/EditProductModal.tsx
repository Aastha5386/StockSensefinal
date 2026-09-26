import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({ product, onClose }) => {
  const { updateProduct } = useApp();

  const [name, setName] = useState(product.name);
  const [category, setCategory] = useState(product.category);
  const [unit, setUnit] = useState(product.unit);
  const [onHand, setOnHand] = useState(product.onHand);
  const [freeToUse, setFreeToUse] = useState(product.freeToUse);
  const [location, setLocation] = useState(product.location || 'WH-A / RACK-14');
  const [minThreshold, setMinThreshold] = useState(product.minThreshold || 50);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updated: Product = {
      sku: product.sku,
      name: name.trim(),
      category: category.trim(),
      unit: unit.trim().toUpperCase(),
      onHand: Number(onHand) || 0,
      freeToUse: Number(freeToUse) || 0,
      location: location.trim(),
      minThreshold: Number(minThreshold) || 0,
    };

    updateProduct(product.sku, updated);
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
              // REVISE CATALOG SKU: {product.sku}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-secondary hover:text-on-surface p-1 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm uppercase text-secondary font-semibold">
                SKU Identifier (Read Only)
              </label>
              <input
                type="text"
                disabled
                value={product.sku}
                className="w-full h-8 px-2 bg-surface-container border border-rule font-label-md text-label-md uppercase text-secondary cursor-not-allowed"
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
                <option value="Hardware">Hardware</option>
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

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm uppercase text-secondary font-semibold">
                Assigned Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full h-8 px-2 bg-surface-lowest border border-rule font-label-md text-label-md uppercase text-on-surface focus:outline-none focus:border-primary-container"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm uppercase text-secondary font-semibold">
                Min Reorder Threshold
              </label>
              <input
                type="number"
                min="0"
                value={minThreshold}
                onChange={(e) => setMinThreshold(Number(e.target.value))}
                className="w-full h-8 px-2 bg-surface-lowest border border-rule font-label-md text-label-md text-right text-on-surface focus:outline-none focus:border-primary-container"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-rule mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 border border-rule hover:bg-surface-container font-label-md text-label-md uppercase tracking-wider text-secondary transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-primary-container hover:bg-[#8E4217] text-white font-label-md text-label-md uppercase tracking-wider font-semibold transition-colors cursor-pointer"
            >
              Save Product Revisions
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
