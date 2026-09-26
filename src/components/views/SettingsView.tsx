import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WarehouseSite } from '../../types';

export const SettingsView: React.FC = () => {
  const { warehouses, addWarehouse, archiveWarehouse, subLocations, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'warehouses' | 'locations'>('warehouses');

  // Form states
  const [title, setTitle] = useState('North Coast Cold Vault Beta');
  const [shortCode, setShortCode] = useState('WH-NCV-04');
  const [address, setAddress] = useState('Pierhead Road, Sector 8, Outer Perimeter Slipway 3');
  const [specClass, setSpecClass] = useState('REFRIGERATED [TYPE-C]');
  const [priority, setPriority] = useState('STANDARD (CYCLE)');
  const [filterQuery, setFilterQuery] = useState('');

  const handleAddWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !shortCode.trim()) return;

    const newWh: WarehouseSite = {
      code: shortCode.trim().toUpperCase(),
      regId: `REG-${Math.floor(1000 + Math.random() * 9000)}`,
      title: title.trim(),
      spec: specClass,
      baysDetail: 'STAGING ZONE 01',
      address: address.trim(),
      dockAccess: 'DEPOT DOCK ACCESS',
      zoneCount: '12 BAYS',
      utilization: '45% UTILIZED',
      status: 'OPERATIONAL',
    };

    addWarehouse(newWh);
    setTitle('');
    setShortCode(`WH-EXP-0${warehouses.length + 1}`);
  };

  const filteredWarehouses = warehouses.filter(
    (w) =>
      w.code.toLowerCase().includes(filterQuery.toLowerCase()) ||
      w.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      w.address.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-[1440px] mx-auto pb-16 pt-4 px-4 sm:px-6">
      {/* Top Operational Header */}
      <header className="pb-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-secondary mb-1 flex-wrap">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary-container dark:text-primary font-semibold">
                // INFRASTRUCTURE REGISTRY · DEPOT &amp; ZONE TOPOLOGY
              </span>
              <span className="text-outline-variant">·</span>
              <span className="font-label-sm text-label-sm text-tertiary uppercase">
                AUTHORIZATION LEVEL 4
              </span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-normal">
              Settings
            </h1>
          </div>

          {/* Facility Quick Telemetry */}
          <div className="flex items-center gap-6 py-2 px-3 bg-surface-low border border-rule rounded-[2px]">
            <div>
              <div className="font-label-sm text-label-sm text-secondary uppercase">
                Operational Footprint
              </div>
              <div className="font-label-lg text-label-lg font-semibold text-on-surface">
                {warehouses.length} SITES · 72 ZONES
              </div>
            </div>
            <div className="w-px h-6 bg-rule" />
            <div>
              <div className="font-label-sm text-label-sm text-secondary uppercase">
                Ledger Sync State
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container inline-block" />
                <span className="font-label-sm text-label-sm text-primary-container dark:text-primary font-semibold tracking-wider">
                  LOCKED &amp; VERIFIED
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Editorial Underlined Navigation Tabs */}
        <nav className="flex items-center gap-8 mt-6 border-b border-rule">
          <button
            type="button"
            onClick={() => setActiveTab('warehouses')}
            className={`relative pb-2.5 font-label-lg text-label-lg uppercase tracking-wider font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'warehouses'
                ? 'text-primary-container dark:text-primary'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span>Warehouses</span>
            <span className="px-1.5 py-0.5 bg-primary-fixed text-primary-container font-label-sm text-label-sm rounded-[2px]">
              {warehouses.length}
            </span>
            {activeTab === 'warehouses' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary-container" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('locations')}
            className={`relative pb-2.5 font-label-lg text-label-lg uppercase tracking-wider font-medium transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'locations'
                ? 'text-primary-container dark:text-primary font-semibold'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span>Sub-Locations &amp; Zones</span>
            <span className="px-1.5 py-0.5 bg-surface-container text-secondary font-label-sm text-label-sm rounded-[2px]">
              72
            </span>
            {activeTab === 'locations' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary-container" />
            )}
          </button>

          <div className="ml-auto hidden lg:flex items-center gap-2 font-label-sm text-label-sm text-secondary">
            <span className="material-symbols-outlined text-[15px] text-tertiary">lock_clock</span>
            <span>AUDIT LOG STREAM #994-A ACTIVE</span>
          </div>
        </nav>
      </header>

      {/* Main Work Area Split: Entry Ledger Form & Active Manifest */}
      <main className="grid grid-cols-1 xl:grid-cols-12 gap-8 mt-6">
        {/* LEFT COLUMN: Register Provisioning Form */}
        <section className="xl:col-span-4 flex flex-col gap-6">
          {/* Warehouse Entry Pane */}
          <div className="bg-surface-lowest border border-rule p-5 sm:p-6 rounded-[2px] shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-rule">
              <div className="flex items-center gap-2">
                <div className="w-1 h-3.5 bg-primary-container" />
                <span className="font-label-md text-label-md text-on-surface font-semibold tracking-wider uppercase">
                  // ADD NEW WAREHOUSE REGISTER
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-secondary font-mono">FORM SEC-01</span>
            </div>
            <p className="font-body-sm text-body-sm text-secondary mt-2">
              Record physical installation coordinates and master short-codes. Every registered depot acts as a parent partition for internal bin racks and bay coordinates.
            </p>

            <form onSubmit={handleAddWarehouse} className="flex flex-col gap-4 mt-4">
              {/* Field 1: Name */}
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-secondary uppercase font-semibold flex justify-between">
                  <span>Warehouse Title / Label</span>
                  <span className="text-tertiary">MANDATORY</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Main Terminal Logistics Hub"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-9 px-3 bg-surface text-on-surface font-body-md text-body-md border border-rule rounded-[2px] focus:outline-none focus:border-primary-container transition-colors"
                />
              </div>

              {/* Field 2: Short Code */}
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-secondary uppercase font-semibold flex justify-between">
                  <span>Short Code (Ledger Moniker)</span>
                  <span className="text-tertiary">FORMAT [WH-XXX-00]</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="WH-MAIN-01"
                    value={shortCode}
                    onChange={(e) => setShortCode(e.target.value)}
                    className="w-full h-9 px-3 bg-surface text-on-surface font-label-md text-label-md uppercase tracking-wider border border-rule rounded-[2px] focus:outline-none focus:border-primary-container transition-colors"
                  />
                  <span className="absolute right-3 font-label-sm text-label-sm text-secondary uppercase pointer-events-none">
                    PREFIX OK
                  </span>
                </div>
              </div>

              {/* Field 3: Address / Physical Spec */}
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-secondary uppercase font-semibold">
                  Physical Address / Yard Coordinates
                </label>
                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Gate 12, Pier 4, Industrial Bay North"
                  className="w-full p-2.5 bg-surface text-on-surface font-body-md text-body-md border border-rule rounded-[2px] focus:outline-none focus:border-primary-container transition-colors resize-none"
                />
              </div>

              {/* Specifications Row */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-secondary uppercase font-semibold">
                    Designated Class
                  </label>
                  <select
                    value={specClass}
                    onChange={(e) => setSpecClass(e.target.value)}
                    className="w-full h-9 px-2 bg-surface text-on-surface font-label-md text-label-md border border-rule rounded-[2px] focus:outline-none"
                  >
                    <option value="REFRIGERATED [TYPE-C]">REFRIGERATED [TYPE-C]</option>
                    <option value="DRY GOODS BULK">DRY GOODS BULK</option>
                    <option value="HAZMAT SEALED">HAZMAT SEALED</option>
                    <option value="CROSS-DOCK TERMINAL">CROSS-DOCK TERMINAL</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-secondary uppercase font-semibold">
                    Tally Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full h-9 px-2 bg-surface text-on-surface font-label-md text-label-md border border-rule rounded-[2px] focus:outline-none"
                  >
                    <option value="STANDARD (CYCLE)">STANDARD (CYCLE)</option>
                    <option value="REALTIME AUTO-INGEST">REALTIME AUTO-INGEST</option>
                    <option value="MANUAL INK ONLY">MANUAL INK ONLY</option>
                  </select>
                </div>
              </div>

              {/* Button Action */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-10 bg-primary-container hover:bg-[#8E4217] text-white font-label-lg text-label-lg uppercase tracking-wider font-semibold rounded-[2px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <span>SAVE WAREHOUSE RECORD →</span>
                </button>
              </div>
            </form>
          </div>

          {/* Secondary Hint Sub-panel: Location Topology Matrix */}
          <div className="p-5 bg-surface-low border border-rule rounded-[2px] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-tertiary">
                <span className="material-symbols-outlined text-[16px]">account_tree</span>
                <span className="font-label-sm text-label-sm uppercase font-semibold tracking-wider">
                  Topology Blueprint
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-secondary uppercase font-mono">
                REL-MAP v2
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-secondary">
              Warehouses partition your geographic land footprint. Sub-locations represent addressable bays, racks, chilled rooms, and vaults parented to a specific master warehouse depot.
            </p>
            <div className="bg-surface-lowest border border-rule p-3 font-label-sm text-label-sm flex flex-col gap-1 text-secondary">
              <div className="flex items-center gap-2 text-on-surface font-semibold">
                <span className="w-2 h-2 rounded-none bg-primary-container" />
                <span>DEPOT: [WH-MAIN-01] Pier Logistics Hub</span>
              </div>
              <div className="pl-4 flex flex-col gap-1 text-[11px]">
                <div className="flex items-center justify-between py-0.5">
                  <span>└─ SEC-A1 · Deep Stacking (42 bays)</span>
                  <span className="text-tertiary font-mono">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span>└─ SEC-A2 · Automated High-Bay (24 bins)</span>
                  <span className="text-primary-container dark:text-primary font-mono font-bold">
                    ENGAGED
                  </span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span>└─ SEC-FL · Floor Dispatch Stage (6 zones)</span>
                  <span className="text-secondary font-mono">CLEAR</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Ledger Physical Facility Stamp */}
          <div className="bg-surface-container border border-rule p-4 rounded-[2px] flex items-center gap-4">
            <div className="w-10 h-10 bg-surface-low border border-rule flex items-center justify-center shrink-0 text-primary-container dark:text-primary">
              <span className="material-symbols-outlined text-[22px]">verified</span>
            </div>
            <div className="min-w-0">
              <div className="font-label-sm text-label-sm font-semibold uppercase text-on-surface">
                Physical Verification Key
              </div>
              <div className="font-label-sm text-label-sm text-secondary font-mono truncate">
                DEPOT-HASH: 78B4-90E1-FA02-402
              </div>
              <div className="font-body-sm text-body-sm text-tertiary mt-0.5">
                Signed by Yard Master OP-77402
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Ledger Table of Active Sites */}
        <section className="xl:col-span-8 flex flex-col gap-6">
          {/* Warehouse Directory List */}
          <div className="bg-surface-lowest border border-rule rounded-[2px] overflow-hidden">
            {/* Table Header Panel */}
            <div className="p-4 bg-surface-low border-b border-rule flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3 bg-primary-container inline-block" />
                <h2 className="font-label-md text-label-md text-on-surface font-semibold tracking-wider uppercase">
                  // REGISTERED WAREHOUSE SITES ({filteredWarehouses.length} ACTIVE)
                </h2>
              </div>
              <div className="flex items-center gap-2 self-stretch sm:self-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <input
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="FILTER BY CODE OR SPEC..."
                    className="h-8 pl-8 pr-3 text-body-sm font-body-sm bg-surface border border-rule rounded-[2px] text-on-surface focus:outline-none w-full sm:w-56"
                  />
                  <span className="material-symbols-outlined absolute left-2 top-2 text-secondary text-[16px]">
                    search
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('WAREHOUSE REGISTER MANIFEST EXPORTED')}
                  className="h-8 px-3 bg-surface hover:bg-surface-container border border-rule text-on-surface font-label-sm text-label-sm uppercase font-semibold rounded-[2px] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">file_download</span>
                  <span>EXPORT</span>
                </button>
              </div>
            </div>

            {/* Strict Manifest Table View */}
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="bg-surface-container border-b border-rule text-secondary font-label-sm text-label-sm uppercase tracking-wider select-none">
                    <th className="py-2.5 px-4 font-semibold w-32">Short Code</th>
                    <th className="py-2.5 px-4 font-semibold">Warehouse Title &amp; Spec</th>
                    <th className="py-2.5 px-4 font-semibold hidden md:table-cell">
                      Address Coordinates
                    </th>
                    <th className="py-2.5 px-4 font-semibold text-right">Zone Count</th>
                    <th className="py-2.5 px-4 font-semibold text-center w-28">Status</th>
                    <th className="py-2.5 px-4 font-semibold text-right w-36">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule font-body-md text-body-md text-on-surface">
                  {filteredWarehouses.map((w) => (
                    <tr key={w.code} className="hover:bg-surface-container transition-colors group">
                      <td className="py-3 px-4 align-top">
                        <div className="font-label-md text-label-md font-bold text-primary-container dark:text-primary uppercase tracking-wider">
                          {w.code}
                        </div>
                        <div className="font-label-sm text-label-sm text-secondary font-mono mt-0.5">
                          {w.regId}
                        </div>
                      </td>
                      <td className="py-3 px-4 align-top">
                        <div className="font-body-md text-body-md font-semibold text-on-surface">
                          {w.title}
                        </div>
                        <div className="font-body-sm text-body-sm text-secondary flex items-center gap-2 mt-0.5">
                          <span>{w.spec}</span>
                          <span className="text-rule">•</span>
                          <span className="font-label-sm text-label-sm text-tertiary">
                            {w.baysDetail}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 align-top hidden md:table-cell">
                        <div className="font-body-sm text-body-sm text-on-surface-variant">
                          {w.address}
                        </div>
                        <div className="font-label-sm text-label-sm text-secondary mt-0.5 font-mono">
                          {w.dockAccess}
                        </div>
                      </td>
                      <td className="py-3 px-4 align-top text-right">
                        <div className="font-label-md text-label-md font-semibold text-on-surface tabular-nums">
                          {w.zoneCount}
                        </div>
                        <div className="font-label-sm text-label-sm text-primary-container dark:text-primary font-semibold">
                          {w.utilization}
                        </div>
                      </td>
                      <td className="py-3 px-4 align-top text-center">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-surface border border-rule rounded-[2px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                          <span className="font-label-sm text-label-sm font-semibold text-on-surface uppercase">
                            {w.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => showToast(`EDIT BUFFER LOADED: ${w.code}`)}
                            className="font-label-sm text-label-sm text-secondary hover:text-on-surface uppercase font-semibold underline underline-offset-2 cursor-pointer"
                          >
                            EDIT
                          </button>
                          <span className="text-rule">/</span>
                          <button
                            type="button"
                            onClick={() => archiveWarehouse(w.code)}
                            className="font-label-sm text-label-sm text-secondary hover:text-error uppercase font-medium cursor-pointer"
                          >
                            ARCHIVE
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Footer */}
            <div className="px-4 py-3 bg-surface-low border-t border-rule flex flex-wrap items-center justify-between text-secondary gap-2">
              <div className="flex items-center gap-4 font-label-sm text-label-sm">
                <span>REGISTER CAPACITY: {warehouses.length} OF 10 SITES ASSIGNED</span>
                <span>•</span>
                <span>TOTAL ALLOCATED BAYS: 72 UNITS</span>
              </div>
              <div className="font-label-sm text-label-sm uppercase tracking-wider text-tertiary">
                LEDGER CHECKSUM // VALIDATED BY SUPERVISOR #441
              </div>
            </div>
          </div>

          {/* Sub-Location Topology Matrix */}
          <div className="bg-surface-lowest border border-rule p-5 sm:p-6 rounded-[2px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-rule gap-2">
              <div className="flex items-center gap-2">
                <span className="w-1 h-3 bg-secondary" />
                <span className="font-label-md text-label-md text-on-surface font-semibold tracking-wider uppercase">
                  // SUB-LOCATION TOPOLOGY MATRIX (SAMPLE RACKS)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-label-sm text-label-sm text-secondary uppercase">
                  PARENT SCOPE:
                </span>
                <span className="font-label-sm text-label-sm bg-surface-container px-2 py-0.5 rounded-[2px] text-on-surface font-mono font-semibold">
                  ALL DEPOTS
                </span>
              </div>
            </div>
            <p className="font-body-sm text-body-sm text-secondary my-3">
              Hierarchical rack, aisle, and bin partitions mapped to current physical depots. New locations inherit environmental traits and custody authorizations from their parent warehouse.
            </p>

            {/* Compact Matrix Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {subLocations.map((sub) => (
                <div key={sub.code} className="p-3 bg-surface border border-rule rounded-[2px]">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md font-bold text-primary-container dark:text-primary">
                      {sub.code}
                    </span>
                    <span className="font-label-sm text-label-sm text-secondary font-mono">
                      {sub.parentWarehouse}
                    </span>
                  </div>
                  <div className="font-body-sm text-body-sm text-on-surface font-medium mt-1">
                    {sub.name}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-rule font-label-sm text-label-sm text-secondary">
                    <span>{sub.capacity}</span>
                    <span className="text-primary-container dark:text-primary font-bold">
                      {sub.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Ledger Archival Footer Stamp */}
      <footer className="mt-8 pt-4 bg-surface-low border border-rule px-4 py-3 rounded-[2px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-secondary">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-primary-container dark:text-primary">
            verified_user
          </span>
          <span className="font-label-md text-label-md text-on-surface uppercase tracking-wider font-semibold">
            // REGISTRY MUTATION REQUIRES SUPERVISOR KEY // STATION REV 2024.11
          </span>
        </div>
        <div className="flex items-center gap-4 font-label-sm text-label-sm font-mono text-tertiary">
          <span>AUTH_ID: #402-DELTA</span>
          <span>•</span>
          <span>PARCEL PROTOCOL: MANIFEST-SECURE</span>
          <span>•</span>
          <span>TIMESTAMP: 14:32:09 UTC</span>
        </div>
      </footer>
    </div>
  );
};
