import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ASSET_IMAGES } from '../../data/initialData';
import { StatusIndicator } from '../common/StatusIndicator';
import {
  User,
  Mail,
  Shield,
  Edit3,
  Save,
  X,
  Camera,
  Package,
  Weight,
  Clock,
  CheckCircle2,
  Eye,
  MapPin,
  RefreshCw,
  Calendar,
} from 'lucide-react';

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
    spec: 'Class-3 Industrial Hardware · Crate 44',
    origin: 'Rotterdam',
    destination: 'Bremerhaven',
    weight: '4,820.00',
    status: 'READY',
  },
  {
    index: '02',
    ref: 'WB-90483-ND',
    name: 'Anhydrous Ammonia Pressurized Canisters',
    spec: 'Hazmat 2.2 · Bay 3 Hazard Corridor',
    origin: 'Antwerp',
    destination: 'Gothenburg',
    weight: '11,400.50',
    status: 'WAITING',
  },
  {
    index: '03',
    ref: 'WB-90484-KL',
    name: 'Refined Bleached Deodorized Palm Stearin',
    spec: 'Bulk Commodity Pallets · Hold 2B',
    origin: 'Hamburg',
    destination: 'Aarhus',
    weight: '24,000.00',
    status: 'DONE',
  },
  {
    index: '04',
    ref: 'WB-90485-AA',
    name: 'Precision Turbine Components (Over-spec)',
    spec: 'Special Secure Crate #12 · Seal-3329',
    origin: 'Le Havre',
    destination: 'Oslo',
    weight: '3,120.00',
    status: 'LATE',
  },
  {
    index: '05',
    ref: 'WB-90486-MS',
    name: 'Pharmaceutical Chilled Storage Boxes',
    spec: 'Temp Controlled (-20°C) · Container R-9',
    origin: 'Basel',
    destination: 'Helsinki',
    weight: '950.25',
    status: 'DONE',
  },
];

export const ProfileStationView: React.FC = () => {
  const { userProfile, showToast, updateProfile } = useApp();
  const [filterTab, setFilterTab] = useState<'all' | 'transit' | 'staged' | 'customs'>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userProfile?.name || '');
  const [editAvatarUrl, setEditAvatarUrl] = useState(userProfile?.avatarUrl || '');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setEditAvatarUrl(base64String);
        showToast('Avatar image encoded successfully');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      showToast(`Failed to process photo: ${err.message}`);
      setUploading(false);
    }
  };

  const requestRoleChange = async () => {
    showToast('Role elevation request filed with system administrator');
  };

  const filteredManifests = parcelManifests.filter((p) => {
    if (filterTab === 'transit') return p.status === 'READY';
    if (filterTab === 'staged') return p.status === 'WAITING';
    if (filterTab === 'customs') return p.status === 'LATE';
    return true;
  });

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-16 pt-2 px-4 sm:px-6 space-y-6">
      {/* Profile & Account Settings Card */}
      <div className="bg-white dark:bg-[#141124] rounded-2xl border border-[#E8E5F2] dark:border-[#282342] p-6 shadow-xs flex flex-col md:flex-row gap-6 items-start">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-[#6C4CE6]/30 dark:border-[#A78BFA]/30 bg-[#FAF9FD] dark:bg-[#18152B] shadow-xs">
            <img
              src={editAvatarUrl || ASSET_IMAGES.avatar}
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
            {isEditing && (
              <label
                className={`absolute inset-0 flex flex-col items-center justify-center transition-colors cursor-pointer ${
                  uploading ? 'bg-black/80' : 'bg-black/50 hover:bg-black/70'
                }`}
                title="Upload a new photo"
              >
                {uploading ? (
                  <RefreshCw className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </label>
            )}
          </div>
          {isEditing && (
            <input
              type="text"
              value={editAvatarUrl}
              onChange={(e) => setEditAvatarUrl(e.target.value)}
              placeholder="Or image URL..."
              className="text-xs px-2.5 py-1.5 bg-[#FAF9FD] dark:bg-[#1B172E] border border-[#E8E5F2] dark:border-[#282342] text-slate-900 dark:text-white rounded-lg w-full max-w-[180px] focus:outline-none focus:border-[#6C4CE6]"
            />
          )}
        </div>

        {/* Details Section */}
        <div className="flex-1 w-full space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Operator Station Profile
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage your credentials, station permissions, and active manifest responsibilities
              </p>
            </div>

            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-[#1B172E] hover:bg-[#FAF9FD] dark:hover:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] text-xs font-semibold rounded-xl border border-[#E8E5F2] dark:border-[#282342] transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-[#1B172E] hover:bg-slate-50 dark:hover:bg-[#252040] border border-[#E8E5F2] dark:border-[#282342] rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await updateProfile(editName, editAvatarUrl);
                      setIsEditing(false);
                      showToast('Profile updated successfully');
                    } catch (err) {
                      showToast('Error updating profile');
                    }
                  }}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#6C4CE6] hover:bg-[#5839D6] rounded-xl transition-all shadow-sm shadow-[#6C4CE6]/25 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-9 px-3 text-sm bg-[#FAF9FD] dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] focus:bg-white dark:focus:bg-[#141124] focus:outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6] text-slate-900 dark:text-white"
                />
              ) : (
                <div className="h-9 px-3 flex items-center bg-[#FAF9FD] dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {userProfile?.name || 'Administrator'}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Email Address
              </label>
              <div className="h-9 px-3 flex items-center bg-slate-50 dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] text-sm text-slate-600 dark:text-slate-300">
                {userProfile?.email || 'operator@stocksense.io'}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Role & Permissions
              </label>
              <div className="h-9 px-3 flex items-center justify-between bg-slate-50 dark:bg-[#1B172E] rounded-xl border border-[#E8E5F2] dark:border-[#282342] text-xs">
                <span className="font-semibold text-[#6C4CE6] dark:text-[#A78BFA] uppercase">
                  {userProfile?.role?.replace('_', ' ') || 'Admin'}
                </span>
                {isEditing && (
                  <button
                    type="button"
                    onClick={requestRoleChange}
                    className="text-[11px] text-[#6C4CE6] dark:text-[#A78BFA] underline cursor-pointer hover:text-[#5839D6]"
                  >
                    Request Change
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#141124] p-5 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#F0EDFD] dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Manifest Lines
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">1,248</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">+12% vs yesterday</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#141124] p-5 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] flex items-center justify-center shrink-0">
            <Weight className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Freight Tonnage
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              84.6 <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Tons</span>
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Rated cap: 92.0 Tons</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#141124] p-5 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pending Clearance
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              19 <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Parcels</span>
            </div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">Inspection required</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#141124] p-5 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Depot Efficiency
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">99.4%</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Audit verified</div>
          </div>
        </div>
      </div>

      {/* Parcel Manifest Register */}
      <div className="bg-white dark:bg-[#141124] rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs overflow-hidden space-y-4">
        <div className="p-4 border-b border-[#E8E5F2] dark:border-[#282342] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Daily Outbound Dispatch Manifest
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track parcel routing, weight certificates, and clearance status
            </p>
          </div>

          <div className="flex items-center gap-1 bg-[#F7F5FF] dark:bg-[#1B172E] p-1 rounded-xl border border-[#E8E5F2] dark:border-[#282342]">
            <button
              type="button"
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-white dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Parcels ({parcelManifests.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('transit')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                filterTab === 'transit'
                  ? 'bg-white dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Ready
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('staged')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                filterTab === 'staged'
                  ? 'bg-white dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Waiting
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('customs')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                filterTab === 'customs'
                  ? 'bg-white dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Held
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-[#FAF9FD] dark:bg-[#1B172E] border-b border-[#E8E5F2] dark:border-[#282342] text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Waybill Ref</th>
                <th className="py-3 px-4">Description & Class</th>
                <th className="py-3 px-4">Origin</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4 text-right">Weight (KG)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5F2] dark:divide-[#282342] text-sm text-slate-700 dark:text-slate-300">
              {filteredManifests.map((parcel) => (
                <tr key={parcel.ref} className="hover:bg-[#FAF9FD] dark:hover:bg-[#1B172E]/60 transition-colors">
                  <td className="py-3.5 px-4 text-center text-xs text-slate-400 dark:text-slate-500 font-mono">
                    {parcel.index}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white font-mono text-xs">
                    {parcel.ref}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{parcel.name}</div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{parcel.spec}</div>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400 uppercase">
                    {parcel.origin}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400 uppercase">
                    {parcel.destination}
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-slate-900 dark:text-white tabular-nums text-xs">
                    {parcel.weight}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <StatusIndicator status={parcel.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => showToast(`Waybill inspected: ${parcel.ref}`)}
                      className="p-1 text-slate-400 hover:text-[#6C4CE6] dark:hover:text-[#A78BFA] transition-colors cursor-pointer"
                      title="Inspect waybill"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Terminal Verification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#141124] p-5 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">
              Bay 03 Overhead Schematic
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
              Live Feed
            </span>
          </div>
          <div className="w-full h-36 rounded-xl overflow-hidden border border-[#E8E5F2] dark:border-[#282342] relative">
            <img
              className="w-full h-full object-cover"
              alt="Bay schematic"
              src={ASSET_IMAGES.bayOverhead}
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Remote crane telemetry active on Gantry Bay 03. Sensor verification synchronized.
          </p>
        </div>

        <div className="bg-white dark:bg-[#141124] p-5 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">
              Archival Verification
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F0EDFD] dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] border border-[#6C4CE6]/25 dark:border-[#383256]">
              Sealed
            </span>
          </div>
          <div className="w-full h-36 rounded-xl bg-[#FAF9FD] dark:bg-[#1B172E] border border-[#E8E5F2] dark:border-[#282342] p-3 flex flex-col justify-between text-xs font-mono">
            <div className="flex items-center justify-between border-b border-[#E8E5F2] dark:border-[#282342] pb-1">
              <span className="text-slate-400 dark:text-slate-500">Stamp ID:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">SS-STAMP-402</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#E8E5F2] dark:border-[#282342] pb-1">
              <span className="text-slate-400 dark:text-slate-500">Controller:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">A. Lindberg</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 dark:text-slate-500">Countersign:</span>
              <span className="font-bold text-[#6C4CE6] dark:text-[#A78BFA]">0x77F8...AA2</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            All manifests submitted under this station receive priority harbor clearance.
          </p>
        </div>

        <div className="bg-white dark:bg-[#141124] p-5 rounded-2xl border border-[#E8E5F2] dark:border-[#282342] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">
              Audit Snapshot
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Rev-09
            </span>
          </div>
          <div className="w-full h-36 rounded-xl overflow-hidden border border-[#E8E5F2] dark:border-[#282342] relative">
            <img
              className="w-full h-full object-cover"
              alt="Audit ledger paper"
              src={ASSET_IMAGES.auditLedgerPaper}
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Physical ledger logs signed at terminal station. Reconciled with zero deviations.
          </p>
        </div>
      </div>
    </div>
  );
};
