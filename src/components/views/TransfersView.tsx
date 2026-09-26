import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StockAdjustmentItem, MoveRecord } from '../../types';

export const TransfersView: React.FC = () => {
  const {
    adjustmentItems,
    updateCountedQuantity,
    appendAdjustmentItem,
    postAdjustmentRecord,
    addMoveRecord,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'combined' | 'transfer' | 'adjustment'>('combined');

  // Form states for Transfer
  const [fromLoc, setFromLoc] = useState('WH-A/RACK-14');
  const [toLoc, setToLoc] = useState('COLD-STOR/01');
  const [mandate, setMandate] = useState('BATCH RELOCATION // CRIT-TEMP REGIME');
  const [carrierVehicle, setCarrierVehicle] = useState('PALLET-JACK FORK #04');
  const [tempEnvelope, setTempEnvelope] = useState('-2.0°C TO +3.5°C');
  const [sealCert, setSealCert] = useState('VA-990-21-TAMPER');
  const [estDuration, setEstDuration] = useState('18 MINUTES GROUND');

  // Adjustment notes
  const [marshalNotes, setMarshalNotes] = useState('');

  // Calculations
  const systemSummation = adjustmentItems.reduce((acc, curr) => acc + curr.systemQuantity, 0);
  const countedSummation = adjustmentItems.reduce((acc, curr) => acc + curr.countedQuantity, 0);
  const netVariance = countedSummation - systemSummation;
  const netVariancePct =
    systemSummation > 0 ? ((netVariance / systemSummation) * 100).toFixed(2) : '0.00';

  const [isSubmittingMove, setIsSubmittingMove] = useState(false);
  const [isSubmittingAdjustment, setIsSubmittingAdjustment] = useState(false);

  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingMove(true);
    try {
      const newMove: MoveRecord = {
        reference: `MOV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        timestampUtc: `${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} // ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} UTC`,
        carrier: `Internal Transfer / ${carrierVehicle}`,
        carrierTag: 'INT-CONV',
        from: fromLoc,
        to: toLoc,
        quantity: '64 PALLET',
        isPositive: true,
        status: 'DONE',
        kind: 'internal',
      };
      await addMoveRecord(newMove);
      showToast(`TRANSFER MANDATE EXECUTED: ${fromLoc} -> ${toLoc}`);
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setIsSubmittingMove(false);
    }
  };

  const handleAppendRow = async () => {
    setIsSubmittingAdjustment(true);
    try {
      const newItem: StockAdjustmentItem = {
        id: `adj-${Date.now()}`,
        sku: `SKU-${Math.floor(10000 + Math.random() * 90000)}-ST`,
        name: 'Auxiliary Steel Banding 19mm',
        spec: 'COIL CASING',
        location: 'WH-B / RACK-03',
        systemQuantity: 64,
        countedQuantity: 64,
      };
      await appendAdjustmentItem(newItem);
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setIsSubmittingAdjustment(false);
    }
  };

  const handlePostRecord = async () => {
    setIsSubmittingAdjustment(true);
    try {
      await postAdjustmentRecord(marshalNotes);
      setMarshalNotes('');
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setIsSubmittingAdjustment(false);
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto pb-16 px-4 sm:px-6">
      {/* Top Meta Brow & Operation Status Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-rule pb-2 pt-1 gap-2">
        <span className="font-label-sm text-label-sm text-tertiary tracking-widest uppercase">
          // INTERNAL WAREHOUSE MOVEMENTS &amp; PHYSICAL INVENTORY RECONCILIATION
        </span>
        <div className="flex items-center gap-4 text-tertiary font-label-sm text-label-sm">
          <span className="tracking-wider">STATION: LOG-TERMINAL-04</span>
          <span className="text-outline-variant">|</span>
          <span className="tracking-wider">AUDIT REGIME: ACTIVE</span>
          <span className="text-outline-variant">|</span>
          <span className="text-on-surface">SYS.TIME: 14:02:49 UTC</span>
        </div>
      </div>

      {/* Primary Page Header & Plain-Text Navigation Ledger Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-on-surface pb-4 pt-5 gap-4">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-normal">
            Transfers &amp; Adjustments
          </h1>
          <p className="font-body-sm text-body-sm text-tertiary mt-1">
            Archival dual-ledger for inter-bay conveyance mandates and physical tally reconciliation.
          </p>
        </div>

        {/* Minimalist Plain-Text Tabs (Underline indicator, zero pill-surfaces) */}
        <div className="flex items-center gap-6 select-none" id="ledger-nav-tabs">
          <button
            type="button"
            onClick={() => setActiveTab('combined')}
            className={`font-label-lg text-label-lg uppercase tracking-wider pb-1 transition-colors cursor-pointer ${
              activeTab === 'combined'
                ? 'text-on-surface font-semibold border-b-2 border-primary-container'
                : 'text-tertiary hover:text-on-surface border-b-2 border-transparent'
            }`}
          >
            Dual Ledger View
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('transfer')}
            className={`font-label-lg text-label-lg uppercase tracking-wider pb-1 transition-colors cursor-pointer ${
              activeTab === 'transfer'
                ? 'text-on-surface font-semibold border-b-2 border-primary-container'
                : 'text-tertiary hover:text-on-surface border-b-2 border-transparent'
            }`}
          >
            Internal Transfer
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('adjustment')}
            className={`font-label-lg text-label-lg uppercase tracking-wider pb-1 transition-colors cursor-pointer ${
              activeTab === 'adjustment'
                ? 'text-on-surface font-semibold border-b-2 border-primary-container'
                : 'text-tertiary hover:text-on-surface border-b-2 border-transparent'
            }`}
          >
            Stock Adjustment
          </button>
        </div>
      </div>

      {/* Ledger Body Container */}
      <div className="flex flex-col gap-8 mt-6">
        {/* SECTION 01: INTERNAL TRANSFER MANIFEST */}
        {(activeTab === 'combined' || activeTab === 'transfer') && (
          <section className="flex flex-col border border-rule bg-surface-lowest p-5 sm:p-6 rounded-[2px]">
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-rule gap-2">
              <div className="flex items-center gap-2">
                <div className="w-1 h-3.5 bg-primary-container" />
                <span className="font-label-md text-label-md text-on-surface tracking-widest uppercase font-semibold">
                  // SECTION 01 · ROUTE SPECIFICATION &amp; WAYBILL ISSUANCE
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-tertiary font-mono">
                CONVEYANCE FORM ID: WTR-9042-ALPHA
              </span>
            </div>

            {/* Route Specification Ledger Form */}
            <form onSubmit={handleExecuteTransfer} className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
              {/* From Location Field */}
              <div className="lg:col-span-4 flex flex-col justify-end">
                <label
                  className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider mb-1"
                  htmlFor="from-location"
                >
                  From Location [Source Terminal]
                </label>
                <div className="relative flex items-center border-b border-on-surface pb-1">
                  <select
                    id="from-location"
                    value={fromLoc}
                    onChange={(e) => setFromLoc(e.target.value)}
                    className="w-full bg-transparent font-label-md text-label-md text-on-surface focus:outline-none appearance-none cursor-pointer pr-6 py-1 tracking-wider uppercase"
                  >
                    <option value="WH-A / RACK-14 // MAIN WAREHOUSE" className="bg-surface">
                      WH-A / RACK-14 // MAIN WAREHOUSE
                    </option>
                    <option value="WH-A / BAY-02 // BULK STAGING" className="bg-surface">
                      WH-A / BAY-02 // BULK STAGING
                    </option>
                    <option value="WH-B / SHELF-04 // PACKAGING DEPOT" className="bg-surface">
                      WH-B / SHELF-04 // PACKAGING DEPOT
                    </option>
                    <option value="WH-C / SEC-09 // HAZMAT SHED" className="bg-surface">
                      WH-C / SEC-09 // HAZMAT SHED
                    </option>
                  </select>
                  <span className="material-symbols-outlined text-tertiary pointer-events-none absolute right-0 text-[18px]">
                    arrow_drop_down
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-tertiary/70 mt-1 uppercase">
                  CURRENT STATUS: SECURED · 48 SKUS ACTIVE
                </span>
              </div>

              {/* Conduit Transit Arrow */}
              <div className="lg:col-span-1 hidden lg:flex items-center justify-center pt-4">
                <span className="font-label-md text-tertiary tracking-widest select-none text-xl">
                  →
                </span>
              </div>

              {/* To Location Field */}
              <div className="lg:col-span-4 flex flex-col justify-end">
                <label
                  className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider mb-1"
                  htmlFor="to-location"
                >
                  To Location [Target Terminal]
                </label>
                <div className="relative flex items-center border-b border-on-surface pb-1">
                  <select
                    id="to-location"
                    value={toLoc}
                    onChange={(e) => setToLoc(e.target.value)}
                    className="w-full bg-transparent font-label-md text-label-md text-on-surface focus:outline-none appearance-none cursor-pointer pr-6 py-1 tracking-wider uppercase"
                  >
                    <option value="COLD-STOR / 01 // DEEP CHILL ZONE" className="bg-surface">
                      COLD-STOR / 01 // DEEP CHILL ZONE
                    </option>
                    <option value="WH-A / RACK-14 // MAIN WAREHOUSE" className="bg-surface">
                      WH-A / RACK-14 // MAIN WAREHOUSE
                    </option>
                    <option value="DRUM-BAY / 01 // FLUID CONTAINMENT" className="bg-surface">
                      DRUM-BAY / 01 // FLUID CONTAINMENT
                    </option>
                    <option value="DISPATCH-DOCK / 03 // OUTBOUND STAGE" className="bg-surface">
                      DISPATCH-DOCK / 03 // OUTBOUND STAGE
                    </option>
                  </select>
                  <span className="material-symbols-outlined text-tertiary pointer-events-none absolute right-0 text-[18px]">
                    arrow_drop_down
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-tertiary/70 mt-1 uppercase">
                  CAPACITY INDEX: 78% SATURATION
                </span>
              </div>

              {/* Priority / Auth Code */}
              <div className="lg:col-span-3 flex flex-col justify-end">
                <label
                  className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider mb-1"
                  htmlFor="transfer-mandate"
                >
                  Transfer Reason / Mandate
                </label>
                <div className="relative flex items-center border-b border-on-surface pb-1">
                  <input
                    id="transfer-mandate"
                    type="text"
                    value={mandate}
                    onChange={(e) => setMandate(e.target.value)}
                    className="w-full bg-transparent font-label-md text-label-md text-on-surface focus:outline-none py-1 tracking-wide uppercase"
                  />
                  <span className="font-label-sm text-tertiary select-none pl-1">REF#</span>
                </div>
                <span className="font-label-sm text-label-sm text-tertiary/70 mt-1 uppercase font-mono">
                  AUTH: SUPV-D.ROVIRA // AUTH-892
                </span>
              </div>

              {/* Additional Route Detail Grid Strip */}
              <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4 py-3 bg-surface-low px-4 mt-2 border border-rule">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-tertiary uppercase">
                    CARRIER VEHICLE
                  </span>
                  <span className="font-label-md text-label-md text-on-surface font-semibold uppercase">
                    {carrierVehicle}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-tertiary uppercase">
                    TEMPERATURE ENVELOPE
                  </span>
                  <span className="font-label-md text-label-md text-on-surface font-semibold uppercase">
                    {tempEnvelope}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-tertiary uppercase">
                    SEAL CERTIFICATE
                  </span>
                  <span className="font-label-md text-label-md text-on-surface font-semibold uppercase">
                    {sealCert}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-tertiary uppercase">
                    EST. DURATION
                  </span>
                  <span className="font-label-md text-label-md text-on-surface font-semibold uppercase">
                    {estDuration}
                  </span>
                </div>
              </div>

              {/* Execution Action Row */}
              <div className="lg:col-span-12 flex flex-wrap items-center justify-between pt-2 gap-4">
                <div className="flex items-center gap-2 text-tertiary font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[16px]">info</span>
                  <span>TRANSFER LOGS WILL BE INKED TO PERMANENT MANIFEST BUFFER</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="reset"
                    onClick={() => {
                      setMandate('BATCH RELOCATION // CRIT-TEMP REGIME');
                      showToast('ROUTE FORM RESET TO STABLE BASELINE');
                    }}
                    className="px-4 py-2 border border-rule bg-surface hover:bg-surface-container text-on-surface font-label-md text-label-md uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Reset Route
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingMove}
                    className={`px-5 py-2 border font-label-md text-label-md uppercase tracking-wider font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                      isSubmittingMove ? 'border-rule text-secondary bg-surface-container cursor-not-allowed' : 'border-on-surface text-on-surface hover:bg-on-surface hover:text-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      send_time_extension
                    </span>
                    <span>{isSubmittingMove ? 'Executing...' : 'Execute Transfer'}</span>
                  </button>
                </div>
              </div>
            </form>
          </section>
        )}

        {/* Structural Hairline Partition */}
        {activeTab === 'combined' && <div className="w-full border-b border-rule my-1" />}

        {/* SECTION 02: STOCK ADJUSTMENT & RECONCILIATION */}
        {(activeTab === 'combined' || activeTab === 'adjustment') && (
          <section className="flex flex-col border border-rule bg-surface-lowest p-5 sm:p-6 rounded-[2px]">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-rule gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-3.5 bg-primary-container" />
                  <span className="font-label-md text-label-md text-on-surface tracking-widest uppercase font-semibold">
                    // SECTION 02 · PHYSICAL COUNT RECONCILIATION (CYCLE 2023-Q4)
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-tertiary block mt-1">
                  TARGET SECTORS: WH-A, WH-C, DRUM-BAY · COUNT RECORDED BY TALLY TEAM A-3
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAppendRow}
                  disabled={isSubmittingAdjustment}
                  className={`px-3 py-1.5 border font-label-sm text-label-sm uppercase tracking-wider transition-colors flex items-center gap-1 ${
                    isSubmittingAdjustment ? 'border-rule bg-surface text-tertiary opacity-50 cursor-not-allowed' : 'border-rule bg-surface hover:bg-surface-container text-tertiary hover:text-on-surface cursor-pointer'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  <span>Append SKU Line</span>
                </button>
                <button
                  type="button"
                  onClick={handlePostRecord}
                  disabled={isSubmittingAdjustment}
                  className={`px-4 py-2 text-white font-label-lg text-label-lg uppercase tracking-wider transition-colors rounded-[2px] flex items-center gap-2 font-semibold ${
                    isSubmittingAdjustment ? 'bg-surface-container text-secondary cursor-not-allowed' : 'bg-primary-container hover:bg-[#8E4217] cursor-pointer'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>{isSubmittingAdjustment ? 'Posting...' : 'Post Adjustment Record'}</span>
                </button>
              </div>
            </div>

            {/* Summary Audit Tape Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 border-b border-rule py-3 gap-4 font-label-sm text-label-sm text-tertiary bg-surface-low px-3 my-4">
              <div>
                <span className="uppercase block">AUDITED LINES:</span>
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  {adjustmentItems.length} ITEMS TOTAL
                </span>
              </div>
              <div>
                <span className="uppercase block">SYSTEM SUMMATION:</span>
                <span className="font-label-md text-label-md text-on-surface font-semibold tabular-nums">
                  {systemSummation.toLocaleString()} UNITS
                </span>
              </div>
              <div>
                <span className="uppercase block">COUNTED SUMMATION:</span>
                <span className="font-label-md text-label-md text-on-surface font-semibold tabular-nums">
                  {countedSummation.toLocaleString()} UNITS
                </span>
              </div>
              <div>
                <span className="uppercase block">NET VARIANCE:</span>
                <span
                  className={`font-label-md text-label-md font-bold tabular-nums ${
                    netVariance === 0 ? 'text-[#3F6B4A]' : 'text-error'
                  }`}
                >
                  {netVariance > 0 ? `+${netVariance}` : netVariance} UNITS ({netVariancePct}%)
                </span>
              </div>
            </div>

            {/* Line-Items Physical Count Table */}
            <div className="w-full overflow-x-auto border-t border-on-surface">
              <table className="w-full text-left border-collapse min-w-[760px]">
                <thead>
                  <tr className="border-b border-on-surface select-none bg-surface-low">
                    <th className="py-2 px-3 font-label-md text-label-md text-tertiary uppercase tracking-wider">
                      Product / SKU
                    </th>
                    <th className="py-2 px-3 font-label-md text-label-md text-tertiary uppercase tracking-wider">
                      Location
                    </th>
                    <th className="py-2 px-3 font-label-md text-label-md text-tertiary uppercase tracking-wider text-right">
                      System Quantity
                    </th>
                    <th className="py-2 px-3 font-label-md text-label-md text-tertiary uppercase tracking-wider text-right">
                      Counted Quantity
                    </th>
                    <th className="py-2 px-3 font-label-md text-label-md text-tertiary uppercase tracking-wider text-right">
                      Discrepancy
                    </th>
                    <th className="py-2 px-3 font-label-md text-label-md text-tertiary uppercase tracking-wider text-center w-20">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule font-body-sm text-body-sm text-on-surface">
                  {adjustmentItems.map((item) => {
                    const diff = item.countedQuantity - item.systemQuantity;
                    const isMismatch = diff !== 0;

                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors group ${
                          isMismatch ? 'bg-error-container/10' : 'hover:bg-surface-container'
                        }`}
                      >
                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <span className="font-body-md text-body-md font-medium text-on-surface">
                              {item.name}
                            </span>
                            <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider">
                              {item.sku} · {item.spec}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-label-md text-label-md text-on-surface uppercase">
                          {item.location}
                        </td>
                        <td className="py-3 px-3 font-label-md text-label-md text-on-surface text-right tabular-nums">
                          {item.systemQuantity.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <input
                            type="number"
                            aria-label={`Counted quantity for ${item.sku}`}
                            value={item.countedQuantity}
                            onChange={(e) =>
                              updateCountedQuantity(item.id, Number(e.target.value) || 0)
                            }
                            className={`w-24 text-right bg-surface border px-2 py-0.5 font-label-md text-label-md focus:outline-none ${
                              isMismatch
                                ? 'border-error text-error font-bold'
                                : 'border-rule text-on-surface focus:border-primary-container'
                            }`}
                          />
                        </td>
                        <td className="py-3 px-3 text-right">
                          {diff === 0 ? (
                            <div className="flex items-center justify-end gap-1.5 text-[#3F6B4A] dark:text-[#68a377]">
                              <span className="w-1.5 h-1.5 bg-[#3F6B4A]" />
                              <span className="font-label-md text-label-md font-medium tracking-wide">
                                0 [MATCH]
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5 text-error">
                              <span className="w-1.5 h-1.5 bg-error" />
                              <span className="font-label-md text-label-md font-bold tracking-wide">
                                {diff > 0 ? `+${diff}` : diff} [MISMATCH]
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {isMismatch ? (
                            <button
                              type="button"
                              onClick={() => showToast(`FLAG INVESTIGATION INITIATED // ${item.sku}`)}
                              className="text-error hover:opacity-80 p-1"
                              title="Flag variance investigation"
                            >
                              <span className="material-symbols-outlined text-[18px]">flag</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => showToast(`BARCODE VERIFIED // ${item.sku}`)}
                              className="text-tertiary hover:text-on-surface p-1"
                              title="Re-scan barcode"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                barcode_scanner
                              </span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Tally Ledger Adjustment Remarks & Reconciliation Signoff */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-5 mt-3 border-t border-rule">
              <div className="md:col-span-8 flex flex-col justify-end">
                <label
                  className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider mb-1"
                  htmlFor="adjustment-notes"
                >
                  Discrepancy Justification / Marshal Notes
                </label>
                <input
                  id="adjustment-notes"
                  type="text"
                  value={marshalNotes}
                  onChange={(e) => setMarshalNotes(e.target.value)}
                  placeholder="E.G. SHRINKAGE RECORDED UNDER WATER DAMAGE INCIDENT INC-4029 // RACK-08 PACKAGING FAILURE"
                  className="w-full bg-transparent border-b border-on-surface pb-1 font-label-md text-label-md text-on-surface focus:outline-none uppercase placeholder:text-tertiary/40"
                />
              </div>
              <div className="md:col-span-4 flex items-end justify-end gap-4">
                <button
                  type="button"
                  onClick={handlePostRecord}
                  disabled={isSubmittingAdjustment}
                  className={`w-full md:w-auto px-5 py-2.5 font-label-md text-label-md uppercase tracking-wider font-semibold transition-colors select-none text-center ${
                    isSubmittingAdjustment ? 'bg-surface-container text-secondary cursor-not-allowed' : 'bg-primary-container hover:bg-[#8E4217] text-white cursor-pointer'
                  }`}
                >
                  {isSubmittingAdjustment ? 'Posting...' : 'Post Adjustment Record'}
                </button>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Verification Ledger Archival Footer */}
      <footer className="mt-8 pt-4 border-t border-rule flex flex-col md:flex-row items-start md:items-center justify-between text-tertiary gap-2">
        <div className="flex items-center gap-3">
          <span className="font-label-sm text-label-sm uppercase tracking-wider">
            PHYSICAL TALLY REGISTER // REV C-4 · STAMPED BY CHIEF MARSHAL #104
          </span>
          <span className="inline-block w-2 h-2 bg-[#3F6B4A]" />
        </div>
        <div className="flex items-center gap-3 font-label-sm text-label-sm tracking-wider uppercase">
          <span>CHECKSUM: 0x9F41B7</span>
          <span>·</span>
          <span>NON-REPUDIATION SECURED</span>
          <span>·</span>
          <span className="text-on-surface font-semibold">DEPOT-402 DISPATCH TERMINAL</span>
        </div>
      </footer>
    </div>
  );
};
