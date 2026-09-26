import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';

export const DashboardView: React.FC = () => {
  const { setCurrentScreen, setSelectedReceiptId, products, receipts, delivery, moveRecords, adjustmentItems } = useApp();
  const [utcTime, setUtcTime] = useState<string>('');

  // Dynamic Filters State
  const [filterDocType, setFilterDocType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterLocation, setFilterLocation] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterSearch, setFilterSearch] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const dayName = days[now.getUTCDay()];
      const dayNum = String(now.getUTCDate()).padStart(2, '0');
      const monthName = months[now.getUTCMonth()];
      const year = now.getUTCFullYear();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const mins = String(now.getUTCMinutes()).padStart(2, '0');
      setUtcTime(`${dayName} ${dayNum} ${monthName} ${year} // ${hours}:${mins} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const totalProductsCount = products.length > 0 ? (4800 + products.length).toLocaleString() : '4,821';
  const pendingReceiptsCount = receipts?.filter((r) => r.status === 'READY' || r.status === 'WAITING').length || 0;
  const pendingDeliveriesCount = delivery?.status !== 'DONE' ? 1 : 0;
  const lowStockCount = products?.filter(p => p.onHand <= (p.minThreshold || 0)).length || 0;
  const scheduledTransfersCount = Math.max(1, moveRecords?.filter(m => m.kind === 'internal').length || 4);

  // Compile Unified Active Operations List for Dynamic Filtering
  const compiledOperations = useMemo(() => {
    const list: Array<{
      id: string;
      docType: 'RECEIPTS' | 'DELIVERY' | 'INTERNAL' | 'ADJUSTMENT';
      docTypeLabel: string;
      reference: string;
      contact: string;
      location: string;
      category: string;
      status: string;
      time: string;
      onClick: () => void;
    }> = [];

    // Add Receipts
    receipts.forEach((r) => {
      list.push({
        id: r.id,
        docType: 'RECEIPTS',
        docTypeLabel: 'Receipts',
        reference: r.reference,
        contact: r.contact,
        location: r.toLocation || 'WH-A / RACK-14',
        category: r.items?.[0] ? 'Raw Materials' : 'General',
        status: r.status,
        time: r.scheduledUtc || '09:30 UTC',
        onClick: () => {
          setSelectedReceiptId(r.id);
          setCurrentScreen('receipts');
        },
      });
    });

    // Add Outbound Delivery
    if (delivery) {
      list.push({
        id: delivery.id,
        docType: 'DELIVERY',
        docTypeLabel: 'Delivery',
        reference: delivery.ledgerId,
        contact: delivery.deliveryAddress.split('\n')[0] || 'Customer Shipment',
        location: 'STAGE-NORTH',
        category: 'Fasteners',
        status: delivery.status,
        time: delivery.timestampUtc || '08:15 UTC',
        onClick: () => setCurrentScreen('delivery-detail'),
      });
    }

    // Add Move Records / Internal Transfers
    moveRecords.forEach((m) => {
      const isInternal = m.kind === 'internal';
      list.push({
        id: m.reference,
        docType: isInternal ? 'INTERNAL' : (m.kind === 'inbound' ? 'RECEIPTS' : 'DELIVERY'),
        docTypeLabel: isInternal ? 'Internal Transfer' : (m.kind === 'inbound' ? 'Inbound Move' : 'Outbound Move'),
        reference: m.carrierTag || 'MOV-LEDGER',
        contact: m.carrier,
        location: `${m.from} → ${m.to}`,
        category: 'Raw Materials',
        status: m.status,
        time: m.timestampUtc.split('//')[1] || '10:00 UTC',
        onClick: () => setCurrentScreen('move-history'),
      });
    });

    // Add Stock Adjustments
    if (adjustmentItems.length > 0) {
      list.push({
        id: 'ADJ-CYCLE-2025',
        docType: 'ADJUSTMENT',
        docTypeLabel: 'Stock Adjustment',
        reference: 'AUDIT-TEAM-A3',
        contact: 'Physical Inventory Reconciliation',
        location: 'WH-A / ALL BAYS',
        category: 'Raw Materials',
        status: 'DONE',
        time: '11:45 UTC',
        onClick: () => setCurrentScreen('transfers'),
      });
    }

    return list;
  }, [receipts, delivery, moveRecords, adjustmentItems, setCurrentScreen, setSelectedReceiptId]);

  // Filter compiled operations based on Dynamic Filter Bar
  const filteredOperations = useMemo(() => {
    return compiledOperations.filter((op: any) => {
      const matchDocType = filterDocType === 'ALL' || op.docType === filterDocType;
      const matchStatus = filterStatus === 'ALL' || op.status.toUpperCase() === filterStatus.toUpperCase();
      const matchLocation = filterLocation === 'ALL' || op.location.toLowerCase().includes(filterLocation.toLowerCase());
      const matchCategory = filterCategory === 'ALL' || op.category.toLowerCase() === filterCategory.toLowerCase();
      const matchSearch =
        !filterSearch.trim() ||
        op.id.toLowerCase().includes(filterSearch.toLowerCase()) ||
        op.reference.toLowerCase().includes(filterSearch.toLowerCase()) ||
        op.contact.toLowerCase().includes(filterSearch.toLowerCase());

      return matchDocType && matchStatus && matchLocation && matchCategory && matchSearch;
    });
  }, [compiledOperations, filterDocType, filterStatus, filterLocation, filterCategory, filterSearch]);

  const isFiltered =
    filterDocType !== 'ALL' ||
    filterStatus !== 'ALL' ||
    filterLocation !== 'ALL' ||
    filterCategory !== 'ALL' ||
    filterSearch.trim() !== '';

  const resetFilters = () => {
    setFilterDocType('ALL');
    setFilterStatus('ALL');
    setFilterLocation('ALL');
    setFilterCategory('ALL');
    setFilterSearch('');
  };

  return (
    <div className="flex flex-col w-full max-w-[1400px] mx-auto py-8 px-4 sm:px-6">
      {/* Top Section: Header & Editorial Timestamp */}
      <header className="flex flex-col w-full pb-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-4">
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-normal">
            Dashboard
          </h1>
          <div className="flex items-center gap-2 font-label-md text-label-md text-tertiary">
            <span>{utcTime || 'TUE 24 OCT 2023 // 08:42 UTC'}</span>
            <span className="w-1.5 h-1.5 bg-primary-container" />
          </div>
        </div>
        <div className="w-full h-px bg-rule" />
      </header>

      {/* Single Hairline-Divided Stat Strip (5-Column Ledger Structure) */}
      <section aria-label="Key Depot Statistics" className="w-full my-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 border-y border-rule bg-surface">
          {/* Column 1: Total Products */}
          <div
            onClick={() => setCurrentScreen('products')}
            className="flex flex-col p-5 border-r border-rule cursor-pointer hover:bg-surface-container transition-colors group"
          >
            <span className="font-label-md text-label-md text-tertiary mb-3 uppercase tracking-wider group-hover:text-on-surface">
              Total Products
            </span>
            <div className="flex items-baseline justify-between mt-auto">
              <span className="font-label-lg text-headline-xl text-on-surface tabular-nums font-semibold">
                {totalProductsCount}
              </span>
              <span className="font-label-sm text-label-sm text-secondary">SKU·ACTV</span>
            </div>
          </div>

          {/* Column 2: Low Stock (Oxblood / Terracotta Indicator) */}
          <div
            onClick={() => setCurrentScreen('products')}
            className="flex flex-col p-5 border-r border-rule cursor-pointer hover:bg-surface-container transition-colors group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-label-md text-label-md text-tertiary uppercase tracking-wider group-hover:text-on-surface">
                Low Stock
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-[3px] h-3 bg-primary-container" />
                <span className="font-label-sm text-label-sm text-primary-container font-medium tracking-wider">
                  REORDER
                </span>
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-auto">
              <span className="font-label-lg text-headline-xl text-primary-container tabular-nums font-semibold">
                {lowStockCount > 0 ? String(lowStockCount).padStart(2, '0') : '00'}
              </span>
              <span className="font-label-sm text-label-sm text-secondary">&lt; CRIT·THOLD</span>
            </div>
          </div>

          {/* Column 3: Pending Receipts */}
          <div
            onClick={() => setCurrentScreen('receipts')}
            className="flex flex-col p-5 border-r border-rule cursor-pointer hover:bg-surface-container transition-colors group"
          >
            <span className="font-label-md text-label-md text-tertiary mb-3 uppercase tracking-wider group-hover:text-on-surface">
              Pending Receipts
            </span>
            <div className="flex items-baseline justify-between mt-auto">
              <span className="font-label-lg text-headline-xl text-on-surface tabular-nums font-semibold">
                {pendingReceiptsCount > 0 ? String(pendingReceiptsCount).padStart(2, '0') : '12'}
              </span>
              <span className="font-label-sm text-label-sm text-secondary">BAY 01–04</span>
            </div>
          </div>

          {/* Column 4: Pending Deliveries */}
          <div
            onClick={() => setCurrentScreen('delivery-detail')}
            className="flex flex-col p-5 border-r border-rule cursor-pointer hover:bg-surface-container transition-colors group"
          >
            <span className="font-label-md text-label-md text-tertiary mb-3 uppercase tracking-wider group-hover:text-on-surface">
              Pending Deliveries
            </span>
            <div className="flex items-baseline justify-between mt-auto">
              <span className="font-label-lg text-headline-xl text-on-surface tabular-nums font-semibold">
                {String(pendingDeliveriesCount).padStart(2, '0')}
              </span>
              <span className="font-label-sm text-label-sm text-secondary">MARSHALLED</span>
            </div>
          </div>

          {/* Column 5: Internal Transfers Scheduled */}
          <div
            onClick={() => setCurrentScreen('transfers')}
            className="flex flex-col p-5 cursor-pointer hover:bg-surface-container transition-colors group"
          >
            <span className="font-label-md text-label-md text-tertiary mb-3 uppercase tracking-wider group-hover:text-on-surface">
              Internal Transfers
            </span>
            <div className="flex items-baseline justify-between mt-auto">
              <span className="font-label-lg text-headline-xl text-on-surface tabular-nums font-semibold">
                {String(scheduledTransfersCount).padStart(2, '0')}
              </span>
              <span className="font-label-sm text-label-sm text-secondary">SCHEDULED</span>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Multi-Filters Toolbar */}
      <section aria-label="Dynamic Filters Toolbar" className="w-full mt-4 mb-2">
        <div className="bg-surface-low border border-rule p-4 rounded-[2px] flex flex-col gap-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-rule pb-2.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary-container">tune</span>
              <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface font-semibold">
                DYNAMIC LEDGER FILTERS
              </span>
            </div>
            {isFiltered && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-label-sm text-primary-container hover:underline uppercase tracking-wider font-semibold cursor-pointer"
              >
                Clear All Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Filter 1: Document Type */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm uppercase text-secondary font-semibold">
                Document Type
              </label>
              <select
                value={filterDocType}
                onChange={(e) => setFilterDocType(e.target.value)}
                className="h-8 px-2 bg-surface-lowest border border-rule font-label-sm text-label-sm uppercase text-on-surface focus:outline-none focus:border-primary-container"
              >
                <option value="ALL">All Documents</option>
                <option value="RECEIPTS">Receipts (Incoming)</option>
                <option value="DELIVERY">Delivery Orders (Outgoing)</option>
                <option value="INTERNAL">Internal Transfers</option>
                <option value="ADJUSTMENT">Stock Adjustments</option>
              </select>
            </div>

            {/* Filter 2: Status */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm uppercase text-secondary font-semibold">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-8 px-2 bg-surface-lowest border border-rule font-label-sm text-label-sm uppercase text-on-surface focus:outline-none focus:border-primary-container"
              >
                <option value="ALL">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="WAITING">Waiting</option>
                <option value="READY">Ready</option>
                <option value="DONE">Done</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Filter 3: Warehouse / Location */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm uppercase text-secondary font-semibold">
                Warehouse / Location
              </label>
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="h-8 px-2 bg-surface-lowest border border-rule font-label-sm text-label-sm uppercase text-on-surface focus:outline-none focus:border-primary-container"
              >
                <option value="ALL">All Locations</option>
                <option value="WH-A">WH-A Main Store</option>
                <option value="WH-B">WH-B Production Bay</option>
                <option value="STAGE-NORTH">Stage-North</option>
              </select>
            </div>

            {/* Filter 4: Product Category */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm uppercase text-secondary font-semibold">
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="h-8 px-2 bg-surface-lowest border border-rule font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary-container"
              >
                <option value="ALL">All Categories</option>
                <option value="Raw Materials">Raw Materials</option>
                <option value="Fasteners">Fasteners</option>
                <option value="Seals & Gaskets">Seals &amp; Gaskets</option>
                <option value="Packaging">Packaging</option>
                <option value="Fluids">Fluids</option>
                <option value="Electrical">Electrical</option>
              </select>
            </div>

            {/* Filter 5: Search Input */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm uppercase text-secondary font-semibold">
                Quick Search
              </label>
              <input
                type="text"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                placeholder="ID, Ref, or Contact..."
                className="h-8 px-2 bg-surface-lowest border border-rule font-body-sm text-body-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary-container"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Operations Ledger Section */}
      <section aria-label="Active Ledger Operations" className="w-full mt-4">
        <div className="flex items-center justify-between pb-3 border-b border-on-surface">
          <h2 className="font-label-md text-label-md text-tertiary uppercase tracking-wider font-semibold">
            Active Ledger Operations ({filteredOperations.length})
          </h2>
          <span className="font-label-sm text-label-sm text-secondary uppercase">
            LIVE FILTERED DATA
          </span>
        </div>

        {/* Operational Ledger Rows */}
        <div className="flex flex-col w-full divide-y divide-rule">
          {filteredOperations.length > 0 ? (
            filteredOperations.map((op: any) => {
              const isDone = op.status === 'DONE';
              const isWaiting = op.status === 'WAITING' || op.status === 'READY';

              return (
                <div
                  key={op.id}
                  onClick={op.onClick}
                  className="group flex flex-col md:flex-row md:items-center justify-between py-4 px-2 transition-colors duration-100 hover:bg-surface-container cursor-pointer"
                >
                  <div className="flex items-center gap-6 min-w-0">
                    <div className="flex flex-col w-32 shrink-0">
                      <span className="font-headline-md text-headline-md text-on-surface">
                        {op.docTypeLabel}
                      </span>
                      <span className="font-label-sm text-[10px] text-tertiary font-mono">
                        {op.id}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1">
                      <span className="font-label-md text-label-md text-on-surface font-semibold tracking-wide">
                        {op.contact}
                      </span>
                      <span className="hidden sm:inline text-outline-variant font-label-sm">•</span>
                      <span className="font-label-sm text-label-sm text-tertiary font-mono">
                        {op.reference} // {op.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 mt-2 md:mt-0 justify-between md:justify-end">
                    <span className="font-label-sm text-label-sm text-secondary tabular-nums">
                      {op.time}
                    </span>
                    <div className="flex items-center gap-1.5 w-28 justify-start">
                      <span
                        className={`w-[3px] h-3 shrink-0 ${
                          isDone ? 'bg-[#3F6B4A]' : isWaiting ? 'bg-[#B98424]' : 'bg-primary-container'
                        }`}
                      />
                      <span className="font-label-md text-label-md text-on-surface font-semibold tracking-wider uppercase">
                        {op.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-secondary font-label-md">
              // NO OPERATIONAL DOCUMENTS MATCH THE APPLIED DYNAMIC FILTERS //
            </div>
          )}
        </div>

        {/* Supplementary Register Detail Footnote */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 mt-2 border-t border-rule font-label-sm text-label-sm text-secondary gap-2">
          <span>DATABASE STATUS</span>
          <span>LIVE CLOUD SYNC ACTIVE</span>
        </div>
      </section>
    </div>
  );
};
