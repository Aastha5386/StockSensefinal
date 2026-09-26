import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { NewProductModal } from '../modals/NewProductModal';
import { EditProductModal } from '../modals/EditProductModal';
import { ReorderingRuleModal } from '../modals/ReorderingRuleModal';

export const ProductsView: React.FC = () => {
  const { products, exportCsv, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'catalog' | 'reordering'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExport = () => {
    const headers = ['SKU', 'Name', 'Category', 'Unit', 'On Hand', 'Free To Use', 'Location'];
    const rows = products.map((p) => [
      p.sku,
      p.name,
      p.category,
      p.unit,
      p.onHand,
      p.freeToUse,
      p.location || 'N/A',
    ]);
    exportCsv('stocksense_products_catalog', headers, rows);
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto py-8 px-4 sm:px-6">
      {/* Top Manifest Stamp & Page Header */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-label-sm text-label-sm text-tertiary tracking-widest uppercase">
            // DEPOT-402 · CATALOG INVENTORY · REV 08
          </span>
          <span className="w-1.5 h-1.5 bg-primary-container" />
          <span className="font-label-sm text-label-sm text-secondary tracking-widest uppercase">
            LOC: WH-BAY-C · INDEX ARCHIVE
          </span>
        </div>
        <div className="flex flex-row items-baseline justify-between flex-wrap gap-2">
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-normal">
            Products
          </h1>
          <div className="font-label-sm text-label-sm text-secondary tabular-nums">
            TOTAL REGISTERED:{' '}
            <span className="font-semibold text-on-surface">
              {products.length.toLocaleString()} ITEMS
            </span>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-2 border-b border-rule pt-2">
          <button
            onClick={() => { setActiveTab('catalog'); setCurrentPage(1); }}
            className={`px-3 py-2 font-label-md text-label-md uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
              activeTab === 'catalog'
                ? 'border-primary-container text-primary-container font-bold'
                : 'border-transparent text-secondary hover:text-on-surface'
            }`}
          >
            Catalog Items ({products.length})
          </button>
          <button
            onClick={() => { setActiveTab('reordering'); setCurrentPage(1); }}
            className={`px-3 py-2 font-label-md text-label-md uppercase tracking-wider transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
              activeTab === 'reordering'
                ? 'border-primary-container text-primary-container font-bold'
                : 'border-transparent text-secondary hover:text-on-surface'
            }`}
          >
            <span>Reordering Rules</span>
            <span className="px-2 py-0.5 bg-primary-container text-white text-[10px] rounded-full font-bold">
              {products.filter((p) => p.freeToUse <= (p.minThreshold || 50)).length} Alerts
            </span>
          </button>
        </div>
      </div>

      {/* Controls / Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-2 gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-secondary pointer-events-none">
              search
            </span>
            <input
              id="product-filter"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by SKU or description..."
              className="w-full bg-surface-lowest text-on-surface placeholder:text-secondary font-body-md text-body-md pl-9 pr-3 py-1.5 border border-rule focus:outline-none focus:border-primary-container rounded-[2px] transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0 relative">
            <button
              type="button"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="px-3 py-1.5 bg-surface text-secondary hover:text-on-surface font-label-md text-label-md uppercase border border-rule hover:bg-surface-container rounded-[2px] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>Filter</span>
            </button>

            {/* Filter Category Dropdown */}
            {showFilterDropdown && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-surface-lowest border border-rule rounded-[2px] shadow-lg z-30 py-1 text-on-surface">
                <div className="px-3 py-1 text-[10px] font-label-sm text-tertiary uppercase tracking-wider border-b border-rule">
                  Filter by Category
                </div>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setShowFilterDropdown(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-label-md uppercase flex items-center justify-between hover:bg-surface-container transition-colors ${
                      selectedCategory === cat ? 'text-primary-container font-bold' : 'text-secondary'
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <span className="w-1.5 h-1.5 bg-primary-container" />}
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleExport}
              className="px-3 py-1.5 bg-surface text-secondary hover:text-on-surface font-label-md text-label-md uppercase border border-rule hover:bg-surface-container rounded-[2px] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setReorderModalProduct(null);
              setShowReorderModal(true);
            }}
            className="px-3.5 py-1.5 border border-primary-container text-primary-container hover:bg-primary-container/10 font-label-md text-label-md uppercase tracking-wider rounded-[2px] transition-colors flex items-center gap-1.5 cursor-pointer font-semibold"
          >
            <span className="material-symbols-outlined text-[16px]">settings_suggest</span>
            <span>Configure Rule</span>
          </button>

          <button
            type="button"
            onClick={() => setShowNewProductModal(true)}
            className="px-4 py-1.5 bg-primary-container hover:bg-[#8E4217] text-white font-label-lg text-label-lg uppercase tracking-wider rounded-[2px] transition-colors flex items-center gap-2 cursor-pointer shadow-none"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>New product</span>
          </button>
        </div>
      </div>

      {/* Tally Ledger Table Container */}
      <div className="w-full bg-surface border-t border-on-surface overflow-x-auto">
        {activeTab === 'catalog' ? (
          <table className="w-full text-left border-collapse min-w-[760px]" id="products-table">
            <thead>
              <tr className="border-b border-on-surface select-none">
                <th className="py-2.5 px-3 font-label-md text-label-md uppercase text-secondary font-medium tracking-wider w-[180px]">
                  SKU
                </th>
                <th className="py-2.5 px-3 font-label-md text-label-md uppercase text-secondary font-medium tracking-wider">
                  Name
                </th>
                <th className="py-2.5 px-3 font-label-md text-label-md uppercase text-secondary font-medium tracking-wider w-[180px]">
                  Category
                </th>
                <th className="py-2.5 px-3 font-label-md text-label-md uppercase text-secondary font-medium tracking-wider w-[130px]">
                  Unit
                </th>
                <th className="py-2.5 px-3 font-label-md text-label-md uppercase text-secondary font-medium tracking-wider text-right w-[130px]">
                  On hand
                </th>
                <th className="py-2.5 px-3 font-label-md text-label-md uppercase text-secondary font-medium tracking-wider text-right w-[130px]">
                  Free to use
                </th>
                <th className="py-2.5 px-2 font-label-md text-label-md uppercase text-secondary font-medium tracking-wider w-[80px] text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule font-body-md text-body-md text-on-surface">
              {displayedProducts.length > 0 ? (
                displayedProducts.map((p) => (
                  <tr
                    key={p.sku}
                    className="hover:bg-surface-container transition-colors group cursor-default"
                  >
                    <td className="py-2.5 px-3 font-label-md text-label-md font-medium text-on-surface tracking-wide">
                      {p.sku}
                    </td>
                    <td className="py-2.5 px-3 font-body-md text-body-md text-on-surface font-medium">
                      {p.name}
                    </td>
                    <td className="py-2.5 px-3 font-body-sm text-body-sm text-secondary">
                      {p.category}
                    </td>
                    <td className="py-2.5 px-3 font-label-md text-label-md text-on-surface-variant">
                      {p.unit}
                    </td>
                    <td className="py-2.5 px-3 font-label-md text-label-md text-right tabular-nums text-on-surface font-semibold">
                      {p.onHand.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-label-md text-label-md text-right tabular-nums text-on-surface">
                      {p.freeToUse.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingProduct(p)}
                          className="text-secondary hover:text-primary-container transition-colors cursor-pointer p-1 rounded-[2px]"
                          title="Edit / Update Product SKU"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => {
                            setReorderModalProduct(p);
                            setShowReorderModal(true);
                          }}
                          className="text-secondary hover:text-primary-container transition-colors cursor-pointer p-1 rounded-[2px]"
                          title="Configure Reordering Rule"
                        >
                          <span className="material-symbols-outlined text-[18px]">settings_suggest</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-secondary font-label-md">
                    // NO ITEMS MATCH THE CURRENT FILTER QUERY //
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          /* Reordering Rules Dedicated Table */
          <table className="w-full text-left border-collapse min-w-[840px]" id="reordering-rules-table">
            <thead>
              <tr className="border-b border-on-surface select-none">
                <th className="py-2.5 px-3 font-label-md text-label-md uppercase text-secondary font-medium tracking-wider w-[160px]">
                  SKU
                </th>
                <th className="py-2.5 px-3 font-label-md text-label-md uppercase text-secondary font-medium tracking-wider">
                  Product Description
                </th>
                <th className="py-2.5 px-3 font-label-md text-label-md uppercase text-secondary font-medium tracking-wider w-[160px]">
                  Location / Bay
                </th>
                <th className="py-2.5 px-3 font-label-md text-label-md uppercase text-secondary font-medium tracking-wider text-right w-[110px]">
                  Min Qty
                </th>
                <th className="py-2.5 px-3 font-label-md text-label-md uppercase text-secondary font-medium tracking-wider text-right w-[110px]">
                  Max Target
                </th>
                <th className="py-2.5 px-3 font-label-md text-label-md uppercase text-secondary font-medium tracking-wider text-right w-[110px]">
                  Free Stock
                </th>
                <th className="py-2.5 px-3 font-label-md text-label-md uppercase text-secondary font-medium tracking-wider w-[160px]">
                  Reorder Status
                </th>
                <th className="py-2.5 px-3 font-label-md text-label-md uppercase text-secondary font-medium tracking-wider w-[160px] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule font-body-md text-body-md text-on-surface">
              {displayedProducts.length > 0 ? (
                displayedProducts.map((p) => {
                  const minThreshold = p.minThreshold || 50;
                  const maxThreshold = p.maxThreshold || (minThreshold * 3);
                  const isLow = p.freeToUse <= minThreshold;
                  const toOrder = Math.max(0, maxThreshold - p.freeToUse);

                  return (
                    <tr
                      key={p.sku}
                      className="hover:bg-surface-container transition-colors group cursor-default"
                    >
                      <td className="py-2.5 px-3 font-label-md text-label-md font-medium text-on-surface tracking-wide">
                        {p.sku}
                      </td>
                      <td className="py-2.5 px-3 font-body-md text-body-md text-on-surface font-medium">
                        {p.name}
                      </td>
                      <td className="py-2.5 px-3 font-label-md text-label-md text-secondary uppercase font-mono">
                        {p.location || 'WH-A / RACK-14'}
                      </td>
                      <td className="py-2.5 px-3 font-label-md text-label-md text-right tabular-nums text-tertiary font-bold">
                        {minThreshold.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-label-md text-label-md text-right tabular-nums text-on-surface font-semibold">
                        {maxThreshold.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-label-md text-label-md text-right tabular-nums text-on-surface font-bold">
                        {p.freeToUse.toLocaleString()} {p.unit}
                      </td>
                      <td className="py-2.5 px-3">
                        {isLow ? (
                          <span className="px-2 py-0.5 bg-primary-container/20 text-primary-container border border-primary-container/30 font-label-sm text-[10px] uppercase font-bold rounded-[2px] tracking-wider inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-primary-container rounded-full animate-pulse" />
                            REORDER REQUIRED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-[#3F6B4A]/20 text-[#3F6B4A] border border-[#3F6B4A]/30 font-label-sm text-[10px] uppercase font-bold rounded-[2px] tracking-wider">
                            STOCK OPTIMAL
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setReorderModalProduct(p);
                              setShowReorderModal(true);
                            }}
                            className="px-2.5 py-1 border border-rule hover:bg-surface-container font-label-sm text-[10px] uppercase text-on-surface transition-colors cursor-pointer rounded-[2px]"
                            title="Edit Reorder Threshold Rules"
                          >
                            Set Rule
                          </button>

                          <button
                            onClick={() => {
                              setReorderModalProduct(p);
                              setShowReorderModal(true);
                            }}
                            disabled={toOrder <= 0}
                            className="px-2.5 py-1 bg-primary-container hover:bg-[#8E4217] text-white font-label-sm text-[10px] uppercase transition-colors cursor-pointer rounded-[2px] disabled:opacity-40"
                            title={`Trigger procurement for +${toOrder} ${p.unit}`}
                          >
                            Procure (+{toOrder})
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-secondary font-label-md">
                    // NO REORDERING RULES FOUND FOR CURRENT FILTER //
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Table Pagination & Ledger Footer Stamp */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-rule mt-2 gap-3">
        <div className="flex items-center gap-3">
          <span className="font-label-sm text-label-sm text-secondary uppercase">
            SHOWING {(currentPage - 1) * itemsPerPage + 1}–
            {Math.min(currentPage * itemsPerPage, filteredProducts.length)} OF{' '}
            {filteredProducts.length} ENTRIES
          </span>
          <span className="h-3 w-px bg-rule" />
          <span className="font-label-sm text-label-sm text-tertiary">
            HASH: 0x9AF8·E341B·2025
          </span>
        </div>

        <div className="flex items-center gap-1 font-label-sm text-label-sm">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-7 h-7 flex items-center justify-center text-secondary hover:text-on-surface border border-rule hover:bg-surface-container rounded-[2px] transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            aria-label="Previous page"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          </button>

          {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((pg) => (
            <button
              key={pg}
              onClick={() => setCurrentPage(pg)}
              className={`w-7 h-7 flex items-center justify-center font-medium rounded-[2px] cursor-pointer ${
                currentPage === pg
                  ? 'bg-primary-container text-white'
                  : 'text-secondary hover:text-on-surface border border-rule hover:bg-surface-container'
              }`}
            >
              {pg}
            </button>
          ))}

          {totalPages > 3 && <span className="px-1 text-secondary">...</span>}

          {totalPages > 3 && (
            <button
              onClick={() => setCurrentPage(totalPages)}
              className={`w-7 h-7 flex items-center justify-center font-medium rounded-[2px] cursor-pointer ${
                currentPage === totalPages
                  ? 'bg-primary-container text-white'
                  : 'text-secondary hover:text-on-surface border border-rule hover:bg-surface-container'
              }`}
            >
              {totalPages}
            </button>
          )}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-7 h-7 flex items-center justify-center text-secondary hover:text-on-surface border border-rule hover:bg-surface-container rounded-[2px] transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            aria-label="Next page"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Generous Whitespace Ledger Stamp */}
      <div className="pt-20 pb-8 flex flex-col items-start gap-1 opacity-80">
        <div className="font-label-sm text-label-sm text-tertiary tracking-widest uppercase">
          ARCHIVAL RECORD // STOCKSENSE MARITIME &amp; DEPOT SYSTEM // REGISTER C-4
        </div>
        <div className="font-label-sm text-label-sm text-secondary">
          ALL TALLIES INKED UNDER LOCAL DEPOT CUSTODY STANDARDS. UNAUTHORIZED ADJUSTMENTS INVALIDATE
          SEAL 78-A.
        </div>
      </div>

      {/* New Product Modal */}
      {showNewProductModal && (
        <NewProductModal onClose={() => setShowNewProductModal(false)} />
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} />
      )}

      {/* Reordering Rule Modal */}
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
