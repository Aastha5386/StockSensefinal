import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ASSET_IMAGES } from '../../data/initialData';
import { StatusIndicator } from '../common/StatusIndicator';

interface ParcelItem {
  index: string;
  ref: string;
  name: string;
  spec: string;
  origin: string;
  destination: string;
  weight: string;
  status: 'READY' | 'WAITING' | 'DONE' | 'LATE';
}

const parcelManifests: ParcelItem[] = [
  {
    index: '01',
    ref: 'WB-90482-TX',
    name: 'High-Precision Marine Bearings',
    spec: '// CLASS-3 INDUSTRIAL HARDWARE · CRATE 44',
    origin: 'ROTTERDAM',
    destination: 'BREMERHAVEN',
    weight: '4,820.00',
    status: 'READY',
  },
  {
    index: '02',
    ref: 'WB-90483-ND',
    name: 'Anhydrous Ammonia Pressurized Canisters',
    spec: '// HAZMAT 2.2 · BAY 3 HAZARD CORRIDOR',
    origin: 'ANTWERP',
    destination: 'GOTHENBURG',
    weight: '11,400.50',
    status: 'WAITING',
  },
  {
    index: '03',
    ref: 'WB-90484-KL',
    name: 'Refined Bleached Deodorized Palm Stearin',
    spec: '// BULK COMMODITY PALLETS · HOLD 2B',
    origin: 'HAMBURG',
    destination: 'AARHUS',
    weight: '24,000.00',
    status: 'DONE',
  },
  {
    index: '04',
    ref: 'WB-90485-AA',
    name: 'Precision Turbine Components (Over-spec)',
    spec: '// SPECIAL SECURE CRATE #12 · SEAL-3329',
    origin: 'LE HAVRE',
    destination: 'OSLO',
    weight: '3,120.00',
    status: 'LATE',
  },
  {
    index: '05',
    ref: 'WB-90486-MS',
    name: 'Pharmaceutical Chilled Storage Boxes',
    spec: '// TEMP CONTROLLED (-20C) · CONTAINER R-9',
    origin: 'BASEL',
    destination: 'HELSINKI',
    weight: '950.25',
    status: 'DONE',
  },
];

export const ProfileStationView: React.FC = () => {
  const { userProfile, showToast } = useApp();
  const [filterTab, setFilterTab] = useState<'all' | 'transit' | 'staged' | 'customs'>('all');

  return (
    <div className="w-full max-w-[1440px] mx-auto pb-16 pt-2 px-4 sm:px-6 flex flex-col gap-6">
      {/* Top Utility Context Bar / Sub-Header Strip */}
      <div className="flex flex-wrap items-center justify-between py-2 border-b border-rule gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-label-md text-label-md text-secondary uppercase tracking-widest">
            // STATION TERMINAL · BAY-03
          </span>
          <div className="w-1.5 h-1.5 bg-primary-container" />
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
            REGISTRY: WAREHOUSE-NORTH
          </span>
          <span className="font-label-sm text-label-sm text-secondary uppercase px-1.5 py-0.5 bg-surface-low border border-rule">
            SYS_OK · LATENCY 14ms
          </span>
        </div>

        {/* Station User Tag */}
        <div className="flex items-center gap-2 font-label-md text-label-md uppercase text-secondary">
          <span>OPERATOR:</span>
          <span className="font-bold text-on-surface">{userProfile.name}</span>
          <span className="text-tertiary">[{userProfile.operatorId}]</span>
        </div>
      </div>

      {/* Manifest Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-on-surface pb-3 gap-3">
        <div className="flex flex-col">
          <span className="font-label-md text-label-md text-secondary uppercase tracking-widest">
            // MANIFEST LOGBOOK · ACTIVE REGISTER
          </span>
          <h1 className="font-headline-lg text-headline-lg font-semibold text-on-surface tracking-tight">
            Depot 402 Daily Outbound Dispatch Manifest
          </h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-low border border-rule text-on-surface font-label-md text-label-md">
            <span className="material-symbols-outlined text-[15px] text-secondary">
              calendar_today
            </span>
            <span>CYCLE: 2024-W48-03</span>
          </div>
          <button
            type="button"
            onClick={() => showToast('NEW MANIFEST LINE CREATED AT BAY-03')}
            className="px-3 py-1 bg-primary-container hover:bg-[#8E4217] text-white font-label-md text-label-md uppercase rounded-[2px] tracking-wider flex items-center gap-1 font-semibold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add_box</span>
            <span>New Manifest Line</span>
          </button>
        </div>
      </div>

      {/* Quick Ledger Stats Banners (4 Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 bg-surface-low border border-rule flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
              MANIFEST LINES
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
              TALLY // 01
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-headline-xl text-headline-xl font-bold text-on-surface">
              1,248
            </span>
            <span className="font-label-sm text-label-sm text-tertiary uppercase">+12% VS YEST</span>
          </div>
          <div className="w-full bg-surface-variant h-1 mt-2">
            <div className="bg-primary-container h-1 w-3/4" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 bg-surface-low border border-rule flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
              FREIGHT WEIGHT
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
              TALLY // 02
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-headline-xl text-headline-xl font-bold text-on-surface">
              84.6 <span className="text-body-sm font-label-md font-normal">TONS</span>
            </span>
            <span className="font-label-sm text-label-sm text-tertiary uppercase">RATED CAP 92T</span>
          </div>
          <div className="w-full bg-surface-variant h-1 mt-2">
            <div className="bg-tertiary h-1 w-[88%]" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 bg-surface-low border border-rule flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
              PENDING CLEARANCE
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
              TALLY // 03
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-headline-xl text-headline-xl font-bold text-primary-container dark:text-primary">
              19 <span className="text-body-sm font-label-md font-normal">PARCELS</span>
            </span>
            <span className="font-label-sm text-label-sm text-primary-container dark:text-primary uppercase font-bold">
              ACTION REQ
            </span>
          </div>
          <div className="w-full bg-surface-variant h-1 mt-2">
            <div className="bg-primary-container h-1 w-1/4" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 bg-surface-low border border-rule flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
              DEPOT EFFICIENCY
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
              TALLY // 04
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-headline-xl text-headline-xl font-bold text-on-surface">
              99.4%
            </span>
            <span className="font-label-sm text-label-sm text-secondary uppercase">
              AUDIT STABLE
            </span>
          </div>
          <div className="w-full bg-surface-variant h-1 mt-2">
            <div className="bg-[#3F6B4A] h-1 w-[99%]" />
          </div>
        </div>
      </div>

      {/* Ledger Filter Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-surface-low p-1.5 border border-rule gap-2">
        <div className="flex items-center gap-1 flex-wrap">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1 font-label-md text-label-md uppercase font-medium transition-colors cursor-pointer ${
              filterTab === 'all'
                ? 'bg-surface border border-outline-variant text-on-surface font-semibold'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            ALL PARCELS (128)
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('transit')}
            className={`px-3 py-1 font-label-md text-label-md uppercase font-medium transition-colors cursor-pointer ${
              filterTab === 'transit'
                ? 'bg-surface border border-outline-variant text-on-surface font-semibold'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            IN TRANSIT (84)
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('staged')}
            className={`px-3 py-1 font-label-md text-label-md uppercase font-medium transition-colors cursor-pointer ${
              filterTab === 'staged'
                ? 'bg-surface border border-outline-variant text-on-surface font-semibold'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            BAY 3 STAGED (31)
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('customs')}
            className={`px-3 py-1 font-label-md text-label-md uppercase font-medium transition-colors cursor-pointer ${
              filterTab === 'customs'
                ? 'bg-surface border border-outline-variant text-on-surface font-semibold'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            HELD CUSTOMS (13)
          </button>
        </div>

        <div className="flex items-center gap-2 px-2 text-secondary">
          <span className="material-symbols-outlined text-[16px]">filter_alt</span>
          <span className="font-label-sm text-label-sm uppercase">SORT: TIMESTAMP (DESC)</span>
        </div>
      </div>

      {/* Archival Manifest Table */}
      <div className="w-full border border-rule bg-surface-lowest overflow-x-auto">
        <table className="w-full border-collapse text-left min-w-[840px]">
          <thead>
            <tr className="border-b border-on-surface bg-surface-low select-none">
              <th className="py-2.5 px-3 font-label-md text-label-md text-secondary uppercase w-12 text-center">
                #
              </th>
              <th className="py-2.5 px-3 font-label-md text-label-md text-secondary uppercase w-32">
                WAYBILL REF
              </th>
              <th className="py-2.5 px-3 font-label-md text-label-md text-secondary uppercase">
                DESCRIPTION &amp; CARGO CLASS
              </th>
              <th className="py-2.5 px-3 font-label-md text-label-md text-secondary uppercase w-28">
                ORIGIN
              </th>
              <th className="py-2.5 px-3 font-label-md text-label-md text-secondary uppercase w-28">
                DESTINATION
              </th>
              <th className="py-2.5 px-3 font-label-md text-label-md text-secondary uppercase w-28 text-right">
                WEIGHT (KG)
              </th>
              <th className="py-2.5 px-3 font-label-md text-label-md text-secondary uppercase w-32">
                STATUS
              </th>
              <th className="py-2.5 px-3 font-label-md text-label-md text-secondary uppercase w-16 text-center">
                ACTION
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule font-body-md text-body-md text-on-surface">
            {parcelManifests.map((parcel) => (
              <tr key={parcel.ref} className="hover:bg-surface-container transition-colors">
                <td className="py-3 px-3 text-center font-label-sm text-label-sm text-secondary">
                  {parcel.index}
                </td>
                <td className="py-3 px-3 font-label-md text-label-md font-semibold text-primary-container dark:text-primary">
                  {parcel.ref}
                </td>
                <td className="py-3 px-3">
                  <div className="font-medium text-on-surface">{parcel.name}</div>
                  <div className="font-label-sm text-label-sm text-secondary font-mono">
                    {parcel.spec}
                  </div>
                </td>
                <td className="py-3 px-3 font-label-md text-label-md uppercase">
                  {parcel.origin}
                </td>
                <td className="py-3 px-3 font-label-md text-label-md uppercase">
                  {parcel.destination}
                </td>
                <td className="py-3 px-3 text-right font-label-md text-label-md tabular-nums font-semibold">
                  {parcel.weight}
                </td>
                <td className="py-3 px-3">
                  <StatusIndicator status={parcel.status} />
                </td>
                <td className="py-3 px-3 text-center">
                  <button
                    type="button"
                    onClick={() => showToast(`WAYBILL LOG INSPECTED // ${parcel.ref}`)}
                    className="p-1 hover:bg-surface-container text-secondary hover:text-on-surface transition-colors"
                    title="Inspect waybill"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Table Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-surface-low border-t border-rule gap-2">
          <div className="flex items-center gap-3">
            <span className="font-label-sm text-label-sm text-secondary uppercase">
              DISPLAYING 5 OF 128 ACTIVE ROWS
            </span>
            <span className="text-rule">|</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">
              LEDGER CHECKSUM: 9A88F110-OK
            </span>
          </div>
          <div className="flex items-center gap-1 font-label-md text-label-md">
            <button className="px-2 py-0.5 border border-rule bg-surface text-secondary hover:text-on-surface">
              PREV
            </button>
            <span className="px-2 py-0.5 bg-primary-container text-white font-bold">1</span>
            <button className="px-2 py-0.5 border border-rule bg-surface text-on-surface hover:bg-surface-container">
              2
            </button>
            <button className="px-2 py-0.5 border border-rule bg-surface text-on-surface hover:bg-surface-container">
              3
            </button>
            <button className="px-2 py-0.5 border border-rule bg-surface text-secondary hover:text-on-surface">
              NEXT
            </button>
          </div>
        </div>
      </div>

      {/* Visual Manifest Section: Terminal Verification Audit Grid (3 Cards matching Screenshot 21) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {/* Visual Card 1: Depot Bay Map Preview */}
        <div className="p-4 bg-surface-low border border-rule flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md font-semibold text-on-surface uppercase">
              // BAY 03 OVERHEAD LAYOUT
            </span>
            <span className="font-label-sm text-label-sm text-primary-container dark:text-primary uppercase font-bold">
              CAM-04 LIVE
            </span>
          </div>

          <div className="w-full h-36 bg-surface-container border border-rule relative overflow-hidden flex items-center justify-center">
            <img
              className="w-full h-full object-cover"
              alt="Overhead architectural bird-eye technical schematic photograph of an active maritime warehouse freight bay"
              src={ASSET_IMAGES.bayOverhead}
            />
            <div className="absolute inset-0 bg-primary-container/10 mix-blend-multiply pointer-events-none" />
            <div className="absolute bottom-2 left-2 bg-surface/90 px-2 py-0.5 border border-rule font-label-sm text-label-sm text-on-surface font-mono">
              BAY 3B · CRANE CR-12 ENGAGED
            </div>
          </div>

          <p className="font-body-sm text-body-sm text-secondary">
            Operator Linberg assigned to Primary Gantry Bay 03. Remote crane telemetry sync established with terminal station.
          </p>
        </div>

        {/* Visual Card 2: Stamp & Dispatch Approval Status */}
        <div className="p-4 bg-surface-low border border-rule flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md font-semibold text-on-surface uppercase">
              // ARCHIVAL VERIFICATION
            </span>
            <span className="font-label-sm text-label-sm text-[#3F6B4A] dark:text-[#68a377] uppercase font-bold">
              SEALED
            </span>
          </div>

          <div className="w-full h-36 bg-surface border border-rule p-3 flex flex-col justify-between font-label-sm text-label-sm font-mono">
            <div className="flex items-center justify-between border-b border-rule/60 pb-1">
              <span className="text-secondary">DIGITAL STAMP ID:</span>
              <span className="text-on-surface font-semibold">SS-STAMP-402-99</span>
            </div>
            <div className="flex items-center justify-between border-b border-rule/60 pb-1">
              <span className="text-secondary">DISPATCH CONTROLLER:</span>
              <span className="text-on-surface font-semibold">A. LINDBERG [774-K]</span>
            </div>
            <div className="flex items-center justify-between border-b border-rule/60 pb-1">
              <span className="text-secondary">SECURITY CERT:</span>
              <span className="text-tertiary font-semibold">VALIDATED TILL 18:00</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-secondary">CRYPTO COUNTERSIGN:</span>
              <span className="text-primary-container dark:text-primary font-bold">0x77F8...AA2</span>
            </div>
          </div>

          <p className="font-body-sm text-body-sm text-secondary">
            All manifests submitted under Chief Lindberg's credentials receive priority maritime harbor clearance.
          </p>
        </div>

        {/* Visual Card 3: Shift Log Record */}
        <div className="p-4 bg-surface-low border border-rule flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md font-semibold text-on-surface uppercase">
              // PROTOCOL AUDIT SNAPSHOT
            </span>
            <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">
              REV-09
            </span>
          </div>

          <div className="w-full h-36 bg-surface-container border border-rule relative overflow-hidden flex items-center justify-center">
            <img
              className="w-full h-full object-cover"
              alt="Close-up macro editorial archival photograph of vintage maritime shipping documents"
              src={ASSET_IMAGES.auditLedgerPaper}
            />
            <div className="absolute inset-0 bg-primary/10 mix-blend-multiply pointer-events-none" />
            <div className="absolute top-2 right-2 bg-inverse-surface text-inverse-on-surface px-2 py-0.5 font-label-sm text-label-sm uppercase font-mono">
              BOOK ENTRY: OK
            </div>
          </div>

          <p className="font-body-sm text-body-sm text-secondary">
            Tally log physical backup ledger signed at Bay 03 Terminal 12:30 UTC. No discrepancies registered.
          </p>
        </div>
      </div>
    </div>
  );
};
