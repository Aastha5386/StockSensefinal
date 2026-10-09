import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { NewProductModal } from '../modals/NewProductModal';
import { EditProductModal } from '../modals/EditProductModal';
import { ReorderingRuleModal } from '../modals/ReorderingRuleModal';
import {
  Search,
  SlidersHorizontal,
  Download,
  Plus,
  Edit3,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Boxes,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Package,
} from 'lucide-react';

// Matched high-res product catalog imagery
const getProductThumbnail = (sku: string, category: string): string => {
  const s = sku.toUpperCase();
  const c = category.toLowerCase();

  if (s.includes('48201') || c.includes('raw') || c.includes('glass')) {
    return 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=120';
  }
  if (s.includes('99120') || c.includes('fastener') || c.includes('bolt')) {
    return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=120';
  }
  if (s.includes('10492') || c.includes('seal') || c.includes('gasket')) {
    return 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=120';
  }
  if (s.includes('88319') || c.includes('packag') || c.includes('crate')) {
    return 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=120';
  }
  if (s.includes('50284') || c.includes('fluid') || c.includes('oil')) {
    return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=120';
  }
  if (s.includes('31092') || c.includes('metal') || c.includes('aluminum')) {
    return 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=120';
  }
  if (c.includes('electric') || s.includes('7702')) {
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=120';
  }
  return 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=120';
};

export const ProductsView: React.FC = () => {
  const { products, exportCsv } = useApp();
  const [activeTab, setActiveTab] = useState<'catalog' | 'reordering'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [reorderModalProduct, setReorderModalProduct] = useState<Product | null>(null);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ['all', ...Array.from(set)];
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase();

      let matchesStatus = true;
      if (selectedStatus === 'out') {
        matchesStatus = p.onHand <= 0;
      } else if (selectedStatus === 'low') {
        matchesStatus = p.onHand > 0 && p.onHand <= (p.minThreshold || 50);
      } else if (selectedStatus === 'in') {
        matchesStatus = p.onHand > (p.minThreshold || 50);
      }

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, selectedCategory, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExport = () => {
    const headers = ['SKU', 'Name', 'Category', 'Unit', 'Price', 'Supplier', 'On Hand', 'Free To Use', 'Location'];
    const rows = products.map((p) => [
      p.sku,
      p.name,
      p.category,
      p.unit,
      p.sellingPrice || p.costPrice || 0,
      p.supplierName || 'Default Supplier',
      p.onHand,
      p.freeToUse,
      p.location || 'N/A',
    ]);
    exportCsv('stocksense_inventory_catalog', headers, rows);
  };

  const reorderAlertsCount = products.filter((p) => p.freeToUse <= (p.minThreshold || 50)).length;

  const renderStockBadge = (p: Product) => {
    if (p.onHand <= 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40">
          <AlertOctagon className="w-3 h-3" />
          <span>Out of Stock</span>
        </span>
      );
    }
    if (p.onHand <= (p.minThreshold || 50)) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
          <AlertTriangle className="w-3 h-3" />
          <span>Low Stock</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40">
        <CheckCircle2 className="w-3 h-3" />
        <span>In Stock</span>
      </span>
    );
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto py-7 px-4 sm:px-8 space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Inventory &amp; Products
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Enterprise master catalog, bay allocation, price schedules, and safety rules.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setReorderModalProduct(null);
              setShowReorderModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E8E5F2] dark:border-[#282342] bg-white dark:bg-[#141124] text-slate-700 dark:text-slate-200 text-xs font-semibold hover:border-[#6C4CE6] transition-colors cursor-pointer shadow-xs"
          >
            <Sliders className="w-4 h-4 text-[#6C4CE6]" />
            <span>Configure Rule</span>
          </button>

          <button
            type="button"
            onClick={() => setShowNewProductModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6C4CE6] hover:bg-[#5839D6] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Modern Purple Tab Bar */}
      <div className="flex items-center gap-2 border-b border-[#E8E5F2] dark:border-[#282342]">
        <button
          onClick={() => {
            setActiveTab('catalog');
            setCurrentPage(1);
          }}
          className={`pb-3 px-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'catalog'
              ? 'border-[#6C4CE6] text-[#6C4CE6] dark:text-[#A78BFA]'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>All Products ({products.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('reordering');
            setCurrentPage(1);
          }}
          className={`pb-3 px-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'reordering'
              ? 'border-[#6C4CE6] text-[#6C4CE6] dark:text-[#A78BFA]'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Reorder Policies</span>
          {reorderAlertsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
              {reorderAlertsCount}
            </span>
          )}
        </button>
      </div>

      {/* Toolbar / Search & Filter Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-2xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="product-filter"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by SKU, product name, or category..."
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#141124] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 border border-[#E8E5F2] dark:border-[#282342] rounded-xl outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6] shadow-xs"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-[#E8E5F2] dark:border-[#282342] bg-white dark:bg-[#141124] text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer shadow-xs"
          >
            <option value="all">All Statuses</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>

          {/* Category Dropdown */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="px-3 py-2 rounded-xl border border-[#E8E5F2] dark:border-[#282342] bg-white dark:bg-[#141124] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-[#F7F5FF] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span>{selectedCategory === 'all' ? 'All Categories' : selectedCategory}</span>
            </button>

            {showFilterDropdown && (
              <div className="absolute top-full left-0 mt-1.5 w-48 bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] rounded-2xl shadow-xl z-30 py-1 text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setShowFilterDropdown(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-[#F7F5FF] dark:hover:bg-[#1E1A34] transition-colors ${
                      selectedCategory === cat
                        ? 'text-[#6C4CE6] font-semibold bg-[#F0EDFD] dark:bg-[#252040]'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="capitalize">{cat}</span>
                    {selectedCategory === cat && <span className="w-1.5 h-1.5 rounded-full bg-[#6C4CE6]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E8E5F2] dark:border-[#282342] bg-white dark:bg-[#141124] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-[#F7F5FF] transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] shadow-xs overflow-hidden">
        {activeTab === 'catalog' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF9FF] dark:bg-[#1B172E] text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-[#E8E5F2] dark:border-[#282342]">
                  <th className="py-3 px-5">Product SKU &amp; Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4 text-right">On Hand</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5F2]/60 dark:divide-[#282342] text-xs">
                {displayedProducts.length > 0 ? (
                  displayedProducts.map((p) => {
                    const thumb = getProductThumbnail(p.sku, p.category);
                    const price = p.sellingPrice || p.costPrice || 45;

                    return (
                      <tr
                        key={p.sku}
                        className="hover:bg-[#F7F5FF] dark:hover:bg-[#1E1A34] transition-colors group"
                      >
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={thumb}
                              alt={p.name}
                              className="w-10 h-10 rounded-xl object-cover ring-1 ring-[#E8E5F2] dark:ring-[#282342] shrink-0 bg-slate-100"
                              loading="lazy"
                            />
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white">
                                {p.name}
                              </div>
                              <div className="text-[11px] font-mono text-[#6C4CE6] dark:text-[#A78BFA]">
                                {p.sku}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F0EDFD] text-[#6C4CE6] dark:bg-[#252040] dark:text-[#A78BFA]">
                            {p.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {p.location || 'WH-A / BAY-01'}
                        </td>

                        <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                          ${price.toFixed(2)}
                        </td>

                        <td className="py-3.5 px-4 text-right tabular-nums font-semibold text-slate-900 dark:text-white">
                          {p.onHand.toLocaleString()} {p.unit}
                        </td>

                        <td className="py-3.5 px-4">
                          {renderStockBadge(p)}
                        </td>

                        <td className="py-3.5 px-5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setEditingProduct(p)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#6C4CE6] hover:bg-[#F0EDFD] dark:hover:bg-[#252040] transition-colors cursor-pointer"
                              title="Edit SKU"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setReorderModalProduct(p);
                                setShowReorderModal(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#6C4CE6] hover:bg-[#F0EDFD] dark:hover:bg-[#252040] transition-colors cursor-pointer"
                              title="Reorder Rules"
                            >
                              <Sliders className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                      No products match your search or filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Reordering Rules Dedicated Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF9FF] dark:bg-[#1B172E] text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-[#E8E5F2] dark:border-[#282342]">
                  <th className="py-3 px-5">Product SKU</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-right">Min Threshold</th>
                  <th className="py-3 px-4 text-right">Target Capacity</th>
                  <th className="py-3 px-4 text-right">Available Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right">Procurement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5F2]/60 dark:divide-[#282342] text-xs">
                {displayedProducts.length > 0 ? (
                  displayedProducts.map((p) => {
                    const minThreshold = p.minThreshold || 50;
                    const maxThreshold = p.maxThreshold || minThreshold * 3;
                    const isLow = p.freeToUse <= minThreshold;
                    const toOrder = Math.max(0, maxThreshold - p.freeToUse);

                    return (
                      <tr
                        key={p.sku}
                        className="hover:bg-[#F7F5FF] dark:hover:bg-[#1E1A34] transition-colors group"
                      >
                        <td className="py-3.5 px-5">
                          <div className="font-semibold text-slate-900 dark:text-white">{p.name}</div>
                          <div className="text-[11px] font-mono text-[#6C4CE6] dark:text-[#A78BFA]">{p.sku}</div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {p.location || 'WH-A / RACK-14'}
                        </td>

                        <td className="py-3.5 px-4 text-right tabular-nums text-slate-600 dark:text-slate-400 font-semibold">
                          {minThreshold.toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4 text-right tabular-nums text-slate-600 dark:text-slate-400">
                          {maxThreshold.toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4 text-right tabular-nums font-semibold text-slate-900 dark:text-white">
                          {p.freeToUse.toLocaleString()} {p.unit}
                        </td>

                        <td className="py-3.5 px-4">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Reorder Needed</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Optimal</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={() => {
                              setReorderModalProduct(p);
                              setShowReorderModal(true);
                            }}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#6C4CE6] hover:bg-[#5839D6] text-white shadow-xs transition-colors cursor-pointer"
                          >
                            Procure {toOrder > 0 ? `(+${toOrder})` : ''}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                      No reordering rules found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 border-t border-[#E8E5F2] dark:border-[#282342] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1}–
            {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} items
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-xl border border-[#E8E5F2] dark:border-[#282342] hover:bg-[#F7F5FF] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setCurrentPage(pg)}
                className={`w-7 h-7 rounded-xl text-xs font-semibold cursor-pointer ${
                  currentPage === pg
                    ? 'bg-[#6C4CE6] text-white'
                    : 'border border-[#E8E5F2] dark:border-[#282342] hover:bg-[#F7F5FF] text-slate-700 dark:text-slate-300'
                }`}
              >
                {pg}
              </button>
            ))}

            {totalPages > 3 && <span className="px-1 text-slate-400">...</span>}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-xl border border-[#E8E5F2] dark:border-[#282342] hover:bg-[#F7F5FF] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showNewProductModal && (
        <NewProductModal onClose={() => setShowNewProductModal(false)} />
      )}
      {editingProduct && (
        <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} />
      )}
      {showReorderModal && (
        <ReorderingRuleModal
          product={reorderModalProduct || undefined}
          onClose={() => {
            setShowReorderModal(false);
            setReorderModalProduct(null);
          }}
        />
      )}
    </div>
  );
};
