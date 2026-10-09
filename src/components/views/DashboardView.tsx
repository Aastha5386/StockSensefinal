import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Boxes,
  AlertTriangle,
  ArrowDownLeft,
  Send,
  QrCode,
  BrainCircuit,
  Building2,
  Bot,
  Search,
  ArrowRight,
  Clock,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  DollarSign,
  AlertOctagon,
  Sparkles,
  Package,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    setSelectedReceiptId,
    products,
    receipts,
    delivery,
    moveRecords,
    adjustmentItems,
    alerts,
    suppliers,
    userProfile,
  } = useApp();
  const navigate = useNavigate();
  const [currentDateStr, setCurrentDateStr] = useState<string>('');

  // Dynamic Filters State
  const [filterDocType, setFilterDocType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterSearch, setFilterSearch] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDateStr(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      );
    };
    updateTime();
  }, []);

  // Real KPI calculations from existing state
  const totalProducts = products.length;
  const totalStockUnits = products.reduce((acc, p) => acc + (p.onHand || 0), 0);
  const lowStockCount = alerts.length || products.filter((p) => p.onHand <= (p.minThreshold || 50)).length;
  const outOfStockCount = products.filter((p) => p.onHand <= 0).length;
  const totalValuation = products.reduce(
    (acc, p) => acc + (p.onHand || 0) * (p.costPrice || (p.sellingPrice ? p.sellingPrice * 0.7 : 28)),
    0
  );
  const pendingReceiptsCount = receipts?.filter((r) => r.status === 'READY' || r.status === 'WAITING').length || 0;
  const pendingDeliveriesCount = delivery?.status !== 'DONE' ? 1 : 0;
  const totalPendingOrders = pendingReceiptsCount + pendingDeliveriesCount;

  // Compile Unified Active Operations List
  const compiledOperations = useMemo(() => {
    const list: Array<{
      id: string;
      docType: 'RECEIPTS' | 'DELIVERY' | 'INTERNAL' | 'ADJUSTMENT';
      docTypeLabel: string;
      reference: string;
      contact: string;
      location: string;
      status: string;
      time: string;
      onClick: () => void;
    }> = [];

    // Receipts
    receipts.forEach((r) => {
      list.push({
        id: r.id,
        docType: 'RECEIPTS',
        docTypeLabel: 'Purchase Order',
        reference: r.reference,
        contact: r.contact,
        location: r.toLocation || 'WH-A / RACK-14',
        status: r.status,
        time: r.scheduledUtc || '09:30 UTC',
        onClick: () => {
          setSelectedReceiptId(r.id);
          navigate(`/receipts/${encodeURIComponent(r.id)}`);
        },
      });
    });

    // Outbound Delivery
    if (delivery) {
      list.push({
        id: delivery.id,
        docType: 'DELIVERY',
        docTypeLabel: 'Customer Delivery',
        reference: delivery.ledgerId,
        contact: delivery.deliveryAddress.split('\n')[0] || 'Customer Order',
        location: 'STAGE-NORTH',
        status: delivery.status,
        time: delivery.timestampUtc || '08:15 UTC',
        onClick: () => navigate('/delivery-detail'),
      });
    }

    // Moves
    moveRecords.forEach((m) => {
      const isInternal = m.kind === 'internal';
      list.push({
        id: m.reference,
        docType: isInternal ? 'INTERNAL' : m.kind === 'inbound' ? 'RECEIPTS' : 'DELIVERY',
        docTypeLabel: isInternal ? 'Internal Transfer' : m.kind === 'inbound' ? 'Inbound Move' : 'Outbound Dispatch',
        reference: m.carrierTag || 'MOV-LEDGER',
        contact: m.carrier,
        location: `${m.from} → ${m.to}`,
        status: m.status,
        time: m.timestampUtc.split('//')[1] || '10:00 UTC',
        onClick: () => navigate('/move-history'),
      });
    });

    // Adjustments
    if (adjustmentItems.length > 0) {
      list.push({
        id: 'ADJ-CYCLE-2025',
        docType: 'ADJUSTMENT',
        docTypeLabel: 'Audit Adjustment',
        reference: 'AUDIT-TEAM-A3',
        contact: 'Cycle Reconciliation',
        location: 'WH-A / ALL BAYS',
        status: 'DONE',
        time: '11:45 UTC',
        onClick: () => navigate('/transfers'),
      });
    }

    return list;
  }, [receipts, delivery, moveRecords, adjustmentItems, navigate, setSelectedReceiptId]);

  // Filter operations
  const filteredOperations = useMemo(() => {
    return compiledOperations.filter((op: any) => {
      const matchDocType = filterDocType === 'ALL' || op.docType === filterDocType;
      const matchStatus = filterStatus === 'ALL' || op.status.toUpperCase() === filterStatus.toUpperCase();
      const matchSearch =
        !filterSearch.trim() ||
        op.id.toLowerCase().includes(filterSearch.toLowerCase()) ||
        op.reference.toLowerCase().includes(filterSearch.toLowerCase()) ||
        op.contact.toLowerCase().includes(filterSearch.toLowerCase());

      return matchDocType && matchStatus && matchSearch;
    });
  }, [compiledOperations, filterDocType, filterStatus, filterSearch]);

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'DONE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
          <CheckCircle2 className="w-3 h-3" />
          <span>Completed</span>
        </span>
      );
    }
    if (s === 'READY' || s === 'WAITING') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40">
          <Clock className="w-3 h-3" />
          <span>{s === 'READY' ? 'Ready' : 'Pending'}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        <span>{status}</span>
      </span>
    );
  };

  return (
    <div className="flex flex-col w-full max-w-[1400px] mx-auto py-7 px-4 sm:px-8 space-y-7">
      {/* Welcome Banner & Date Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6C4CE6] dark:text-[#A78BFA] mb-1">
            <Sparkles className="w-4 h-4" />
            <span>OPERATIONAL DASHBOARD</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {userProfile?.name?.split(' ')[0] || 'Operator'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {currentDateStr || 'StockSense Central Overview'} · All warehouse bays online
          </p>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => navigate('/scanner')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] text-slate-700 dark:text-slate-200 text-xs font-semibold hover:border-[#6C4CE6] transition-colors cursor-pointer shadow-xs"
          >
            <QrCode className="w-3.5 h-3.5 text-[#6C4CE6]" />
            <span>Scan SKU</span>
          </button>
          <button
            onClick={() => navigate('/receipts')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6C4CE6] hover:bg-[#5839D6] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* Automatic Low-Stock Reorder Alert Card */}
      {alerts.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#F0EDFD] via-white to-amber-50/40 dark:from-[#252040] dark:via-[#141124] dark:to-transparent border border-[#E8E5F2] dark:border-[#383256] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#6C4CE6]/15 text-[#6C4CE6] dark:text-[#A78BFA] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Automatic Reorder Signal Triggered
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                  {alerts.length} Low Stock
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {alerts.slice(0, 3).map((a) => a.productName).join(', ')}
                {alerts.length > 3 ? ` and ${alerts.length - 3} others` : ''} have fallen below safe replenishment limits.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/alerts')}
            className="px-4 py-2 bg-[#6C4CE6] hover:bg-[#5839D6] text-white text-xs font-semibold rounded-xl shadow-xs flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer"
          >
            <span>Review Shortages</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 6 Clean KPI Cards - Reference Style White Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {/* 1. Total Products */}
        <div
          onClick={() => navigate('/products')}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Products</span>
            <div className="w-8 h-8 rounded-xl bg-[#F0EDFD] dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {totalProducts.toLocaleString()}
            </div>
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              Registered SKUs
            </span>
          </div>
        </div>

        {/* 2. Total Stock Units */}
        <div
          onClick={() => navigate('/products')}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Stock</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {totalStockUnits.toLocaleString()}
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              Units on hand
            </span>
          </div>
        </div>

        {/* 3. Low Stock Items */}
        <div
          onClick={() => navigate('/alerts')}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Low Stock</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 tracking-tight">
              {lowStockCount}
            </div>
            <span className="text-[11px] font-medium text-amber-600/80">
              Below threshold
            </span>
          </div>
        </div>

        {/* 4. Out of Stock */}
        <div
          onClick={() => navigate('/products')}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Out of Stock</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400 tracking-tight">
              {outOfStockCount}
            </div>
            <span className="text-[11px] font-medium text-rose-600/80">
              Zero balance
            </span>
          </div>
        </div>

        {/* 5. Inventory Valuation */}
        <div
          onClick={() => navigate('/analytics')}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Asset Value</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              ${Math.round(totalValuation).toLocaleString()}
            </div>
            <span className="text-[11px] font-medium text-emerald-600">
              Replacement value
            </span>
          </div>
        </div>

        {/* 6. Pending Orders */}
        <div
          onClick={() => navigate('/receipts')}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending Orders</span>
            <div className="w-8 h-8 rounded-xl bg-[#F0EDFD] dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] flex items-center justify-center group-hover:scale-105 transition-transform">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-[#6C4CE6] dark:text-[#A78BFA] tracking-tight">
              {totalPendingOrders}
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              Inbound &amp; Outbound
            </span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <button
          onClick={() => navigate('/scanner')}
          className="p-4 rounded-2xl bg-white dark:bg-[#141124] hover:bg-[#F0EDFD]/40 dark:hover:bg-[#1E1A34] border border-[#E8E5F2] dark:border-[#282342] flex items-center gap-3.5 cursor-pointer transition-all text-left group shadow-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-[#F0EDFD] dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <QrCode className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">Optical Scanner</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Barcode &amp; QR lookup</div>
          </div>
        </button>

        <button
          onClick={() => navigate('/forecasting')}
          className="p-4 rounded-2xl bg-white dark:bg-[#141124] hover:bg-[#F0EDFD]/40 dark:hover:bg-[#1E1A34] border border-[#E8E5F2] dark:border-[#282342] flex items-center gap-3.5 cursor-pointer transition-all text-left group shadow-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-[#F0EDFD] dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">AI Forecasting</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Depletion simulations</div>
          </div>
        </button>

        <button
          onClick={() => navigate('/suppliers')}
          className="p-4 rounded-2xl bg-white dark:bg-[#141124] hover:bg-[#F0EDFD]/40 dark:hover:bg-[#1E1A34] border border-[#E8E5F2] dark:border-[#282342] flex items-center gap-3.5 cursor-pointer transition-all text-left group shadow-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">Suppliers</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{suppliers.length} active vendors</div>
          </div>
        </button>

        <button
          onClick={() => navigate('/chat')}
          className="p-4 rounded-2xl bg-white dark:bg-[#141124] hover:bg-[#F0EDFD]/40 dark:hover:bg-[#1E1A34] border border-[#E8E5F2] dark:border-[#282342] flex items-center gap-3.5 cursor-pointer transition-all text-left group shadow-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-[#F0EDFD] dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Bot className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">Copilot Hub</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Natural language queries</div>
          </div>
        </button>
      </div>

      {/* Main Operations Ledger Card */}
      <div className="rounded-2xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] shadow-xs overflow-hidden">
        {/* Ledger Header & Search Toolbar */}
        <div className="p-5 border-b border-[#E8E5F2] dark:border-[#282342] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Inventory Operations
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredOperations.length} recorded movements across inbound, outbound, and transfers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                placeholder="Search reference, contact..."
                className="pl-9 pr-3 py-1.5 w-48 sm:w-60 rounded-xl bg-[#F7F5FF] dark:bg-[#1B172E] text-xs text-slate-800 dark:text-slate-200 border border-[#E8E5F2] dark:border-[#282342] focus:outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6]"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                showFilters
                  ? 'bg-[#F0EDFD] text-[#6C4CE6] border-[#E8E5F2] dark:bg-[#252040] dark:border-[#383256]'
                  : 'bg-white dark:bg-[#141124] text-slate-600 dark:text-slate-300 border-[#E8E5F2] dark:border-[#282342] hover:bg-[#F7F5FF]'
              }`}
              title="Filter by status or document type"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Tray */}
        {showFilters && (
          <div className="p-4 bg-[#F7F5FF] dark:bg-[#1B172E] border-b border-[#E8E5F2] dark:border-[#282342] grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Document Type
              </label>
              <select
                value={filterDocType}
                onChange={(e) => setFilterDocType(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#141124] text-xs text-slate-800 dark:text-slate-200 border border-[#E8E5F2] dark:border-[#282342] outline-none focus:border-[#6C4CE6]"
              >
                <option value="ALL">All Types</option>
                <option value="RECEIPTS">Inbound Purchase Orders</option>
                <option value="DELIVERY">Outbound Deliveries</option>
                <option value="INTERNAL">Internal Transfers</option>
                <option value="ADJUSTMENT">Stock Adjustments</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Operational Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#141124] text-xs text-slate-800 dark:text-slate-200 border border-[#E8E5F2] dark:border-[#282342] outline-none focus:border-[#6C4CE6]"
              >
                <option value="ALL">All Statuses</option>
                <option value="READY">Ready</option>
                <option value="WAITING">Waiting</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>
        )}

        {/* Operations Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF9FF] dark:bg-[#1B172E] text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-[#E8E5F2] dark:border-[#282342]">
                <th className="py-3 px-5">Document</th>
                <th className="py-3 px-4">Contact / Party</th>
                <th className="py-3 px-4">Bay Allocation</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5F2]/60 dark:divide-[#282342] text-xs">
              {filteredOperations.length > 0 ? (
                filteredOperations.map((op: any) => (
                  <tr
                    key={op.id}
                    onClick={op.onClick}
                    className="hover:bg-[#F7F5FF] dark:hover:bg-[#1E1A34] transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {op.docTypeLabel}
                      </div>
                      <div className="text-[11px] text-[#6C4CE6] dark:text-[#A78BFA] font-mono">
                        {op.id}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {op.contact}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {op.location}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 tabular-nums">
                      {op.time}
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(op.status)}
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <span className="inline-flex items-center text-[#6C4CE6] dark:text-[#A78BFA] group-hover:translate-x-0.5 transition-transform">
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    No operations matching your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
