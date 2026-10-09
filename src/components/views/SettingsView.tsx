import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WarehouseSite } from '../../types';
import {
  Building2,
  MapPin,
  Plus,
  Search,
  Download,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Edit3,
  Server,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { warehouses, addWarehouse, archiveWarehouse, subLocations, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'warehouses' | 'locations'>('warehouses');

  // Form states
  const [title, setTitle] = useState('');
  const [shortCode, setShortCode] = useState(`WH-EXP-0${warehouses.length + 1}`);
  const [address, setAddress] = useState('');
  const [specClass, setSpecClass] = useState('Refrigerated (Type-C)');
  const [priority, setPriority] = useState('Standard (Cycle)');
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
      address: address.trim() || 'Logistics Depot Gateway',
      dockAccess: 'DEPOT DOCK ACCESS',
      zoneCount: '12 BAYS',
      utilization: '45% UTILIZED',
      status: 'OPERATIONAL',
    };

    addWarehouse(newWh);
    showToast(`Registered warehouse site: ${newWh.code}`);
    setTitle('');
    setAddress('');
    setShortCode(`WH-EXP-0${warehouses.length + 2}`);
  };

  const filteredWarehouses = warehouses.filter(
    (w) =>
      w.code.toLowerCase().includes(filterQuery.toLowerCase()) ||
      w.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      w.address.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-16 pt-2 px-4 sm:px-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Depot & Facility Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Configure physical warehouse locations, zones, sub-locations, and operational schemas
          </p>
        </div>

        {/* Quick Telemetry Chips */}
        <div className="flex items-center gap-4 bg-white dark:bg-[#141124] px-4 py-2 rounded-xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#6C4CE6] dark:text-[#A78BFA]" />
            <div className="text-xs">
              <span className="text-slate-400 dark:text-slate-500">Sites: </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{warehouses.length} Active</span>
            </div>
          </div>
          <div className="w-px h-4 bg-[#E8E5F2] dark:bg-[#282342]" />
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Master Synced</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8E5F2] dark:border-[#282342] pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('warehouses')}
          className={`flex items-center gap-2 pb-3 px-1 text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'warehouses'
              ? 'text-[#6C4CE6] dark:text-[#A78BFA] border-b-2 border-[#6C4CE6]'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border-b-2 border-transparent'
          }`}
        >
          <span>Warehouse Facilities</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#F0EDFD] dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] font-semibold">
            {warehouses.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('locations')}
          className={`flex items-center gap-2 pb-3 px-1 text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'locations'
              ? 'text-[#6C4CE6] dark:text-[#A78BFA] border-b-2 border-[#6C4CE6]'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border-b-2 border-transparent'
          }`}
        >
          <span>Zones & Sub-Locations</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
            {subLocations.length}
          </span>
        </button>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Add Facility Form */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white dark:bg-[#141124] p-6 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#E8E5F2] dark:border-[#282342]">
              <div className="w-8 h-8 rounded-lg bg-[#F0EDFD] dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Add Warehouse Site</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Register new geographical depot or hub</p>
              </div>
            </div>

            <form onSubmit={handleAddWarehouse} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Warehouse Title / Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. North Coast Cold Vault Beta"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FAF9FD] dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] focus:bg-white dark:focus:bg-[#141124] focus:outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6] text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Short Code (Unique Identifier)
                </label>
                <input
                  type="text"
                  required
                  placeholder="WH-NCV-04"
                  value={shortCode}
                  onChange={(e) => setShortCode(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FAF9FD] dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] focus:bg-white dark:focus:bg-[#141124] focus:outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6] text-slate-900 dark:text-white font-mono uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Physical Address / Dock Yard
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Pierhead Road, Sector 8, Outer Perimeter..."
                  className="w-full px-3 py-2 text-sm bg-[#FAF9FD] dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] focus:bg-white dark:focus:bg-[#141124] focus:outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6] text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Designated Class</label>
                  <select
                    value={specClass}
                    onChange={(e) => setSpecClass(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-[#FAF9FD] dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] focus:bg-white dark:focus:bg-[#141124] focus:outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6] text-slate-900 dark:text-white font-medium cursor-pointer"
                  >
                    <option value="Refrigerated [Type-C]">Refrigerated [Type-C]</option>
                    <option value="Dry Goods Bulk">Dry Goods Bulk</option>
                    <option value="Hazmat Sealed">Hazmat Sealed</option>
                    <option value="Cross-Dock Terminal">Cross-Dock Terminal</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tally Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-[#FAF9FD] dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] focus:bg-white dark:focus:bg-[#141124] focus:outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6] text-slate-900 dark:text-white font-medium cursor-pointer"
                  >
                    <option value="Standard (Cycle)">Standard (Cycle)</option>
                    <option value="Realtime Auto-Ingest">Realtime Auto-Ingest</option>
                    <option value="Manual Review Only">Manual Review Only</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6C4CE6] hover:bg-[#5839D6] text-white font-semibold text-sm rounded-xl transition-all shadow-sm shadow-[#6C4CE6]/25 cursor-pointer mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Save Warehouse Record</span>
              </button>
            </form>
          </div>

          {/* Topology Hierarchy Card */}
          <div className="bg-[#FAF9FD] dark:bg-[#18152B] p-5 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white">
              <Layers className="w-4 h-4 text-[#6C4CE6] dark:text-[#A78BFA]" />
              <span>Facility Hierarchy Architecture</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Master warehouses represent geographic buildings. Racks, aisles, and cold storage
              bins inherit access protocols and customs certifications from their parent facility.
            </p>
            <div className="p-3 bg-white dark:bg-[#141124] rounded-xl border border-[#E8E5F2] dark:border-[#282342] text-xs font-mono text-slate-700 dark:text-slate-300 space-y-1">
              <div className="font-bold text-[#6C4CE6] dark:text-[#A78BFA]">DEPOT: Pierhead Terminal (WH-MAIN-01)</div>
              <div className="pl-3 text-slate-500 dark:text-slate-400">├── SEC-A1 · High-Bay Automated (42 bays)</div>
              <div className="pl-3 text-slate-500 dark:text-slate-400">├── SEC-A2 · Deep Freeze Zone (24 bins)</div>
              <div className="pl-3 text-slate-500 dark:text-slate-400">└── SEC-FL · Floor Dispatch Staging</div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Directory Table & Matrix */}
        <div className="xl:col-span-8 space-y-6">
          {/* Warehouse Table */}
          <div className="bg-white dark:bg-[#141124] rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#E8E5F2] dark:border-[#282342] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#6C4CE6] dark:text-[#A78BFA]" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Registered Warehouse Sites ({filteredWarehouses.length})
                </h2>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="Filter by code or spec..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAF9FD] dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] focus:bg-white dark:focus:bg-[#141124] focus:outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6] text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => showToast('Warehouse register exported')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#1B172E] hover:bg-[#FAF9FD] dark:hover:bg-[#252040] text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-[#E8E5F2] dark:border-[#282342] transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#6C4CE6] dark:text-[#A78BFA]" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-[#FAF9FD] dark:bg-[#1B172E] border-b border-[#E8E5F2] dark:border-[#282342] text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Code / ID</th>
                    <th className="py-3 px-4">Facility Title & Spec</th>
                    <th className="py-3 px-4">Address / Coordinates</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E5F2] dark:divide-[#282342] text-sm text-slate-700 dark:text-slate-300">
                  {filteredWarehouses.map((w) => (
                    <tr key={w.code} className="hover:bg-[#FAF9FD] dark:hover:bg-[#1B172E]/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-slate-900 dark:text-white">{w.code}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500">{w.regId}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{w.title}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{w.spec}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400">
                        <div>{w.address}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                          {w.dockAccess}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{w.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => showToast(`Edit mode for ${w.code}`)}
                            className="p-1 text-slate-400 hover:text-[#6C4CE6] dark:hover:text-[#A78BFA] transition-colors cursor-pointer"
                            title="Edit warehouse"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => archiveWarehouse(w.code)}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                            title="Archive facility"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sub-Location Topology Matrix */}
          <div className="bg-white dark:bg-[#141124] p-5 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E5F2] dark:border-[#282342]">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-[#6C4CE6] dark:text-[#A78BFA]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Sub-Location Topology Matrix
                </h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#F0EDFD] dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA]">
                All Depots
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {subLocations.map((sub) => (
                <div
                  key={sub.code}
                  className="p-4 bg-[#FAF9FD] dark:bg-[#18152B] rounded-xl border border-[#E8E5F2] dark:border-[#282342] hover:border-[#6C4CE6]/30 dark:hover:border-[#A78BFA]/30 transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#6C4CE6] dark:text-[#A78BFA]">{sub.code}</span>
                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                      {sub.parentWarehouse}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-1">{sub.name}</div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#E8E5F2] dark:border-[#282342] text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{sub.capacity}</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{sub.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
