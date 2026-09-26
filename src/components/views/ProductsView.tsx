import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { NewProductModal } from '../modals/NewProductModal';

export const ProductsView: React.FC = () => {
  const { products, exportCsv, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showNewProductModal, setShowNewProductModal] = useState(false);
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

        <div className="flex items-center gap-3 shrink-0">
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
              <th className="py-2.5 px-2 font-label-md text-label-md uppercase text-secondary font-medium tracking-wider w-[48px] text-center">
                
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
                    <button
                      onClick={() => showToast(`INSPECTION LOG VIEWED: ${p.sku}`)}
                      className="text-secondary hover:text-on-surface opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1"
                      title="Inspect SKU Ledger"
                    >
                      <span className="material-symbols-outlined text-[18px]">more_vert</span>
                    </button>
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
    </div>
  );
};
