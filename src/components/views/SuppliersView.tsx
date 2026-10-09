import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Supplier } from '../../types';
import {
  Building2,
  Star,
  Mail,
  Phone,
  Clock,
  CreditCard,
  Plus,
  Download,
  Edit3,
  Trash2,
  Search,
  X,
  SlidersHorizontal,
} from 'lucide-react';

export const SuppliersView: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, userRole, showToast, exportCsv } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [categories, setCategories] = useState('Raw Materials');
  const [rating, setRating] = useState('4.8');
  const [leadTimeDays, setLeadTimeDays] = useState('5');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [notes, setNotes] = useState('');

  const canEdit = userRole === 'admin' || userRole === 'inventory_manager';

  const openAddModal = () => {
    setEditingSupplier(null);
    setName('');
    setCode(`SUP-${Math.floor(100 + Math.random() * 900)}`);
    setContactPerson('');
    setEmail('');
    setPhone('');
    setAddress('');
    setCategories('Raw Materials');
    setRating('4.8');
    setLeadTimeDays('5');
    setPaymentTerms('Net 30');
    setNotes('');
    setModalOpen(true);
  };

  const openEditModal = (sup: Supplier) => {
    setEditingSupplier(sup);
    setName(sup.name);
    setCode(sup.code);
    setContactPerson(sup.contactPerson || '');
    setEmail(sup.email || '');
    setPhone(sup.phone || '');
    setAddress(sup.address || '');
    setCategories((sup.categories || []).join(', '));
    setRating(String(sup.rating || 4.5));
    setLeadTimeDays(String(sup.leadTimeDays || 5));
    setPaymentTerms(sup.paymentTerms || 'Net 30');
    setNotes(sup.notes || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Supplier name is required');
      return;
    }

    const payload = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      contactPerson: contactPerson.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      categories: categories.split(',').map((c) => c.trim()).filter(Boolean),
      rating: parseFloat(rating) || 4.5,
      leadTimeDays: parseInt(leadTimeDays, 10) || 5,
      paymentTerms,
      notes,
      status: 'ACTIVE' as const,
    };

    try {
      if (editingSupplier && (editingSupplier._id || editingSupplier.id)) {
        await updateSupplier(editingSupplier._id || editingSupplier.id!, payload);
      } else {
        await addSupplier(payload);
      }
      setModalOpen(false);
    } catch {
      // toast shown in context
    }
  };

  const handleDelete = async (sup: Supplier) => {
    if (!window.confirm(`Are you sure you want to archive vendor ${sup.name}?`)) return;
    const id = sup._id || sup.id;
    if (id) {
      await deleteSupplier(id);
    }
  };

  const filtered = suppliers.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'ALL' ||
      (s.categories && s.categories.some((c) => c.toLowerCase() === selectedCategory.toLowerCase()));
    return matchesSearch && matchesCategory;
  });

  const handleExport = () => {
    const headers = ['Supplier Code', 'Company Name', 'Contact Person', 'Email', 'Phone', 'Rating', 'Lead Time (Days)', 'Payment Terms'];
    const rows = filtered.map((s) => [s.code, s.name, s.contactPerson, s.email, s.phone, s.rating, s.leadTimeDays, s.paymentTerms]);
    exportCsv('suppliers_registry', headers, rows);
  };

  return (
    <div className="flex flex-col w-full max-w-[1400px] mx-auto py-7 px-4 sm:px-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Supplier Registry
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Certified industrial vendors, dock-to-stock SLAs, and commercial procurement terms.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>
          {canEdit && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Onboard Supplier</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Vendors</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{suppliers.length}</div>
          <span className="text-xs text-slate-500 dark:text-slate-400">Active agreements</span>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Average Transit SLA</span>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {suppliers.length > 0
              ? (suppliers.reduce((acc, s) => acc + (s.leadTimeDays || 5), 0) / suppliers.length).toFixed(1)
              : '4.5'}{' '}
            Days
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">Dock-to-stock SLA</span>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Compliance Score</span>
          <div className="text-2xl font-bold text-amber-500 mt-1 flex items-center gap-1.5">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span>
              {suppliers.length > 0
                ? (suppliers.reduce((acc, s) => acc + (s.rating || 4.5), 0) / suppliers.length).toFixed(2)
                : '4.8'}
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">Quality rating</span>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Default Terms</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">NET 30</div>
          <span className="text-xs text-slate-500 dark:text-slate-400">Commercial cycle</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vendor name, code, or contact..."
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="Raw Materials">Raw Materials</option>
            <option value="Fasteners">Fasteners</option>
            <option value="Seals & Gaskets">Seals &amp; Gaskets</option>
            <option value="Packaging">Packaging</option>
            <option value="Fluids">Fluids</option>
          </select>
        </div>
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((sup) => (
          <div
            key={sup.code}
            className="rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-md">
                  {sup.code}
                </span>
                <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{sup.rating}</span>
                </div>
              </div>

              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight mb-1">
                {sup.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                {sup.notes || 'Certified supplier with verified quality control.'}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {(sup.categories || []).map((cat, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 bg-slate-100 dark:bg-slate-700/50 rounded-md text-slate-600 dark:text-slate-300 font-medium"
                  >
                    {cat}
                  </span>
                ))}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-700/60 pt-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Contact:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">
                    {sup.contactPerson || 'Logistics Lead'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Email:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-mono text-[11px] truncate max-w-[180px]">
                    {sup.email || 'orders@vendor.internal'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Lead Time:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">
                    {sup.leadTimeDays} Days SLA
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Terms:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">
                    {sup.paymentTerms}
                  </span>
                </div>
              </div>
            </div>

            {canEdit && (
              <div className="border-t border-slate-100 dark:border-slate-700/60 mt-4 pt-3 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(sup)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Edit</span>
                </button>
                {userRole === 'admin' && (
                  <button
                    onClick={() => handleDelete(sup)}
                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Archive Vendor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full p-12 text-center rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-400 text-xs">
            <Building2 className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No suppliers found</p>
            <p>Try searching for a different name or category.</p>
          </div>
        )}
      </div>

      {/* Onboard / Edit Supplier Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingSupplier ? 'Revise Vendor Profile' : 'Onboard Industrial Supplier'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-300">Vendor Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="h-9 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-300">Company Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-9 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-300">Contact Person</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="h-9 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-300">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-300">Rating (1-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="h-9 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-300">Lead Time (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={leadTimeDays}
                    onChange={(e) => setLeadTimeDays(e.target.value)}
                    className="h-9 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-300">Payment Terms</label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="h-9 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  >
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 45">Net 45</option>
                    <option value="Net 60">Net 60</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-600 dark:text-slate-300">Categories (comma separated)</label>
                <input
                  type="text"
                  value={categories}
                  onChange={(e) => setCategories(e.target.value)}
                  placeholder="Raw Materials, Fasteners, Seals"
                  className="h-9 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-600 dark:text-slate-300">Notes &amp; SLA Details</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none resize-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800 mt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
