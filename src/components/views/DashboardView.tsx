import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

export const DashboardView: React.FC = () => {
  const { setCurrentScreen, setSelectedReceiptId, products, receipts, delivery, moveRecords } = useApp();
  const [utcTime, setUtcTime] = useState<string>('');

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

      {/* Plain Text Operations Section */}
      <section aria-label="Active Ledger Operations" className="w-full mt-8">
        <div className="flex items-center justify-between pb-3 border-b border-on-surface">
          <h2 className="font-label-md text-label-md text-tertiary uppercase tracking-wider font-semibold">
            Active Operations
          </h2>
          <span className="font-label-sm text-label-sm text-secondary uppercase">
            LIVE DATA
          </span>
        </div>

        {/* Operational Ledger Rows */}
        <div className="flex flex-col w-full divide-y divide-rule">
          {/* Row 1: Receipts */}
          <div
            onClick={() => {
              setSelectedReceiptId('RCV-2023-88401');
              setCurrentScreen('receipts');
            }}
            className="group flex flex-col md:flex-row md:items-center justify-between py-4 px-2 transition-colors duration-100 hover:bg-surface-container cursor-pointer"
          >
            <div className="flex items-center gap-6 min-w-0">
              <span className="font-headline-md text-headline-md text-on-surface w-28 shrink-0">
                Receipts
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1">
                <span className="font-label-md text-label-md text-on-surface font-semibold tracking-wide">
                  {String(receipts?.length || 0).padStart(2, '0')} INBOUND RECEIPTS
                </span>
                <span className="hidden sm:inline text-outline-variant font-label-sm">•</span>
                <span className="font-label-sm text-label-sm text-tertiary font-mono">
                  RCV-2023-88401 // RCV-2023-88412
                </span>
              </div>
            </div>
            <div className="flex items-center gap-8 mt-2 md:mt-0 justify-between md:justify-end">
              <span className="font-label-sm text-label-sm text-secondary tabular-nums">
                EXP 09:30 UTC
              </span>
              <div className="flex items-center gap-1.5 w-24 justify-start">
                <span className="w-[3px] h-3 bg-[#B98424] shrink-0" />
                <span className="font-label-md text-label-md text-on-surface font-semibold tracking-wider">
                  WAITING
                </span>
              </div>
            </div>
          </div>

          {/* Row 2: Delivery */}
          <div
            onClick={() => setCurrentScreen('delivery-detail')}
            className="group flex flex-col md:flex-row md:items-center justify-between py-4 px-2 transition-colors duration-100 hover:bg-surface-container cursor-pointer"
          >
            <div className="flex items-center gap-6 min-w-0">
              <span className="font-headline-md text-headline-md text-on-surface w-28 shrink-0">
                Delivery
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1">
                <span className="font-label-md text-label-md text-on-surface font-semibold tracking-wide">
                  01 OUTBOUND DELIVERIES
                </span>
                <span className="hidden sm:inline text-outline-variant font-label-sm">•</span>
                <span className="font-label-sm text-label-sm text-tertiary font-mono">
                  {delivery?.id || 'N/A'} // {delivery?.routing ? delivery.routing.split('//')[0].trim() : 'N/A'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-8 mt-2 md:mt-0 justify-between md:justify-end">
              <span className="font-label-sm text-label-sm text-secondary tabular-nums">
                DSP 08:15 UTC
              </span>
              <div className="flex items-center gap-1.5 w-24 justify-start">
                <span className={`w-[3px] h-3 shrink-0 ${delivery?.status === 'DONE' ? 'bg-[#3F6B4A]' : 'bg-[#B98424]'}`} />
                <span className="font-label-md text-label-md text-on-surface font-semibold tracking-wider">
                  {delivery?.status || 'UNKNOWN'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Supplementary Register Detail Footnote */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 mt-2 border-t border-rule font-label-sm text-label-sm text-secondary gap-2">
          <span>DATABASE STATUS</span>
          <span>SYNCED TO CLOUD</span>
        </div>
      </section>
    </div>
  );
};
