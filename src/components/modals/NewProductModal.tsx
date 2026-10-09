import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { Plus, X, PackagePlus } from 'lucide-react';

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
      showToast(`Product ${newProd.sku} created successfully`);
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
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Add New Product</h2>
              <p className="text-xs text-slate-500 dark:text-[#A5A1BE]">Register new item into the StockSense catalog</p>
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
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">SKU Identifier</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-semibold bg-[#FAF9FD] dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] focus:bg-white dark:focus:bg-[#141124] focus:outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6] text-slate-900 dark:text-white uppercase"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FAF9FD] dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] focus:bg-white dark:focus:bg-[#141124] focus:outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6] text-slate-900 dark:text-white font-medium cursor-pointer"
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

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Product Name / Title</label>
            <input
              type="text"
              required
              placeholder="e.g. High-Pressure Hydraulic Valve 12mm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#FAF9FD] dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] focus:bg-white dark:focus:bg-[#141124] focus:outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Unit of Measure</label>
              <input
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-[#FAF9FD] dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] focus:bg-white dark:focus:bg-[#141124] focus:outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6] text-slate-900 dark:text-white uppercase"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">On Hand Qty</label>
              <input
                type="number"
                required
                value={onHand}
                onChange={(e) => setOnHand(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-semibold bg-[#FAF9FD] dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] focus:bg-white dark:focus:bg-[#141124] focus:outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6] text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Free to Use</label>
              <input
                type="number"
                required
                value={freeToUse}
                onChange={(e) => setFreeToUse(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-semibold bg-[#FAF9FD] dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] focus:bg-white dark:focus:bg-[#141124] focus:outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Storage Location / Bay</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
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
              <span>{isSubmitting ? 'Saving...' : 'Add Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
