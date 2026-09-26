import React from 'react';
import { useApp } from '../../context/AppContext';

export const DeliveryDetailView: React.FC = () => {
  const { delivery, toggleDeliveryChecklist, validateDelivery, setCurrentScreen } = useApp();

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 sm:px-6 flex flex-col gap-6">
      {/* Return button & Top Brow */}
      <div className="flex flex-col gap-2 pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className="flex items-center gap-1.5 font-label-md text-label-md text-tertiary hover:text-on-surface uppercase tracking-wider transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Return to Dispatch Register</span>
          </button>
          <div className="flex items-center gap-2 font-label-md text-label-md text-tertiary tracking-widest uppercase">
            <span>// OUTBOUND MARSHALLING</span>
            <span className="text-outline-variant">·</span>
            <span>DOCK DISPATCH LEDGER</span>
          </div>
        </div>
        <div className="font-label-md text-label-md text-primary-container dark:text-primary tracking-widest uppercase font-semibold">
          DELIVERY
        </div>
      </div>

      {/* Header Ledger Unit: Title & Terminal Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-rule">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-normal">
            {delivery?.id || 'UNKNOWN-ID'}
          </h1>
          <div className="font-label-sm text-label-sm text-tertiary uppercase mt-1">
            RECORD TIMESTAMP: {delivery?.timestampUtc || 'N/A'} · LEDGER ID: {delivery?.ledgerId || 'N/A'}
          </div>
        </div>

        {/* Action Cluster */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 bg-transparent text-on-surface font-label-md text-label-md tracking-wider border border-rule hover:bg-surface-container rounded-none transition-colors duration-150 flex items-center gap-2 cursor-pointer select-none"
          >
            <span className="material-symbols-outlined text-[16px] text-tertiary">print</span>
            <span>PRINT</span>
          </button>
          <button
            type="button"
            onClick={validateDelivery}
            className="px-5 py-2 bg-primary-container text-white font-label-md text-label-md tracking-wider font-semibold rounded-none border border-primary-container hover:bg-[#8E4217] transition-colors duration-150 flex items-center gap-2 cursor-pointer select-none shadow-none"
          >
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>{delivery?.status === 'DONE' ? 'DISPATCHED' : 'VALIDATE'}</span>
          </button>
        </div>
      </div>

      {/* State Progression Tracker */}
      <div className="py-4 border-b border-rule flex items-center justify-between flex-wrap gap-2">
        <div className="font-label-md text-label-md flex items-center gap-3 tracking-widest uppercase">
          <span className="text-tertiary">Draft</span>
          <span className="text-outline-variant select-none">—</span>
          <span className={`font-semibold pb-1 ${delivery?.status !== 'DONE' ? 'text-on-surface border-b-2 border-primary-container' : 'text-tertiary'}`}>
            Ready
          </span>
          <span className="text-outline-variant select-none">—</span>
          <span className={`font-semibold pb-1 ${delivery?.status === 'DONE' ? 'text-[#3F6B4A] dark:text-[#68a377] border-b-2 border-[#3F6B4A]' : 'text-secondary select-none'}`}>
            Done
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 font-label-sm text-label-sm text-tertiary uppercase">
          <span>STATUS CODE: {delivery?.statusCode || 'N/A'}</span>
          <span className="text-outline-variant">/</span>
          <span className="text-primary-container dark:text-primary font-semibold">
            {delivery?.stageName || 'N/A'}
          </span>
        </div>
      </div>

      {/* Manifest Meta Fields: Two-Pane Architectural Division */}
      <div className="grid grid-cols-1 md:grid-cols-2 py-6 gap-8 border-b border-rule">
        {/* Field 1 */}
        <div className="flex flex-col gap-1.5">
          <span className="font-label-md text-label-md text-tertiary uppercase tracking-wider">
            DELIVERY ADDRESS
          </span>
          <div className="font-body-lg text-body-lg text-on-surface font-medium">
            {delivery?.deliveryAddress || 'N/A'}
          </div>
          <span className="font-label-sm text-label-sm text-secondary tracking-widest uppercase font-mono">
            COORDINATES: {delivery?.coordinates || 'N/A'}
          </span>
        </div>

        {/* Field 2 */}
        <div className="flex flex-col gap-1.5 md:border-l md:border-rule md:pl-8">
          <span className="font-label-md text-label-md text-tertiary uppercase tracking-wider">
            OPERATION TYPE
          </span>
          <div className="font-label-lg text-label-lg text-on-surface tracking-wider font-semibold">
            {delivery?.operationType || 'N/A'}
          </div>
          <span className="font-label-sm text-label-sm text-secondary tracking-widest uppercase font-mono">
            {delivery?.routing || 'N/A'}
          </span>
        </div>
      </div>

      {/* Pre-Dispatch Tally Checklist */}
      <div className="pt-5 pb-5 border-b border-rule">
        <div className="font-label-md text-label-md text-tertiary uppercase tracking-widest mb-4">
          // PRE-FLIGHT CARGO ATTESTATION
        </div>
        <div className="flex flex-col gap-3.5">
          {/* Checklist Item 1 */}
          <label className="flex items-center group cursor-pointer select-none">
            <input
              type="checkbox"
              checked={delivery?.pickVerified || false}
              onChange={() => toggleDeliveryChecklist('pick')}
              className="sr-only peer"
            />
            <span className="w-4 h-4 border border-on-surface bg-surface peer-checked:bg-on-surface flex items-center justify-center mr-3 transition-colors duration-100 shrink-0">
              <span className="material-symbols-outlined text-[13px] text-surface opacity-0 peer-checked:opacity-100 font-bold select-none">
                check
              </span>
            </span>
            <span className="font-body-md text-body-md text-on-surface mr-3">
              Pick verified by Depot Staging Team
            </span>
            <span
              className={`font-label-sm text-label-sm tracking-widest uppercase ${
                delivery?.pickVerified
                  ? 'text-primary-container dark:text-primary font-semibold'
                  : 'text-tertiary'
              }`}
            >
              [{delivery?.pickVerifiedTime || 'PENDING'}]
            </span>
          </label>

          {/* Checklist Item 2 */}
          <label className="flex items-center group cursor-pointer select-none">
            <input
              type="checkbox"
              checked={delivery?.packInspected || false}
              onChange={() => toggleDeliveryChecklist('pack')}
              className="sr-only peer"
            />
            <span className="w-4 h-4 border border-on-surface bg-surface peer-checked:bg-on-surface flex items-center justify-center mr-3 transition-colors duration-100 shrink-0">
              <span className="material-symbols-outlined text-[13px] text-surface opacity-0 peer-checked:opacity-100 font-bold select-none">
                check
              </span>
            </span>
            <span className="font-body-md text-body-md text-on-surface mr-3">
              Pack inspected and seal intact
            </span>
            <span
              className={`font-label-sm text-label-sm tracking-widest uppercase ${
                delivery?.packInspected
                  ? 'text-primary-container dark:text-primary font-semibold'
                  : 'text-tertiary'
              }`}
            >
              [{delivery?.packInspectedTime || 'PENDING'}]
            </span>
          </label>
        </div>
      </div>

      {/* Line Items Table Section */}
      <div className="pt-4 pb-6">
        <div className="flex items-center justify-between pb-3">
          <span className="font-label-md text-label-md text-tertiary uppercase tracking-widest">
            // SEC-03 · BILL OF LADING LINE ITEMS ({delivery.items.length} TOTAL)
          </span>
          <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">
            TARE AUDIT: PASSED
          </span>
        </div>

        {/* Precision Ledger Data Table */}
        <div className="w-full overflow-x-auto border-t-2 border-on-surface">
          <table className="w-full border-collapse text-left min-w-[640px]">
            <thead>
              <tr className="border-b border-rule bg-surface-low select-none">
                <th className="py-2.5 px-3 font-label-md text-label-md text-tertiary tracking-widest uppercase font-medium">
                  PRODUCT
                </th>
                <th className="py-2.5 px-3 font-label-md text-label-md text-tertiary tracking-widest uppercase font-medium">
                  SKU
                </th>
                <th className="py-2.5 px-3 font-label-md text-label-md text-tertiary tracking-widest uppercase font-medium">
                  DESTINATION BAY
                </th>
                <th className="py-2.5 px-3 font-label-md text-label-md text-tertiary tracking-widest uppercase font-medium text-right">
                  QUANTITY
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule font-body-md text-body-md text-on-surface">
              {delivery?.items?.map((item, idx) => (
                <tr key={idx} className="hover:bg-surface-container transition-colors duration-75">
                  <td className="py-3 px-3">
                    <div className="font-body-md text-body-md font-medium text-on-surface">
                      {item.product}
                    </div>
                    {item.spec && (
                      <div className="font-label-sm text-label-sm text-secondary tracking-widest uppercase">
                        {item.spec}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3 align-top pt-3 font-label-md text-label-md text-tertiary font-mono">
                    {item.sku}
                  </td>
                  <td className="py-3 px-3 align-top pt-3 font-label-md text-label-md text-on-surface uppercase">
                    {item.destinationBay}
                  </td>
                  <td className="py-3 px-3 align-top pt-3 text-right">
                    <span className="font-label-lg text-label-lg font-bold text-on-surface tracking-wider">
                      {item.quantity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tally Subtext & Aggregate Calculation */}
        <div className="mt-4 pt-3 border-t border-rule flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-label-md text-label-md text-tertiary">
          <div className="uppercase tracking-wider">
            CARGO GROSS MASS: {delivery?.grossMass || '0'} · NET VOLUME: {delivery?.netVolume || '0'}
          </div>
          <div className="uppercase tracking-wider text-on-surface font-semibold">
            TOTAL TALLY ENTRIES: {delivery?.items?.length || 0} POSITION UNITS
          </div>
        </div>
      </div>

      {/* Archival Ledger Footer Attestation */}
      <div className="pt-6 pb-8 border-t-2 border-on-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="font-label-md text-label-md text-tertiary tracking-widest uppercase">
          DISPATCH HASH: 0x7E31...55BF · MARITIME LEDGER SEAL ATTESTED
        </div>
        <div className="font-label-sm text-label-sm text-secondary tracking-widest uppercase flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-primary-container" />
          WARM STORAGE ARCHIVE PROTOCOL V4.1
        </div>
      </div>
    </div>
  );
};
