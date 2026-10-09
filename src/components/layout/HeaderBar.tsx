import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Menu,
  QrCode,
  Bot,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  ShieldCheck,
  Briefcase,
  HardHat,
  User,
  Settings,
  LogOut,
  Search,
} from 'lucide-react';

interface HeaderBarProps {
  onToggleMobileMenu?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ onToggleMobileMenu }) => {
  const { isDarkMode, toggleDarkMode, userProfile, userRole, alerts, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const activeAlertsCount = alerts.length;

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        profileOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [profileOpen]);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/products')) return 'Product Inventory';
    if (path.startsWith('/receipts')) return 'Purchase Orders';
    if (path.startsWith('/transfers')) return 'Sales & Dispatches';
    if (path.startsWith('/suppliers')) return 'Supplier Directory';
    if (path.startsWith('/move-history')) return 'Stock Movements';
    if (path.startsWith('/analytics')) return 'Demand Analytics';
    if (path.startsWith('/forecasting')) return 'AI Demand Forecast';
    if (path.startsWith('/alerts')) return 'Low-Stock Alerts';
    if (path.startsWith('/scanner')) return 'Barcode & QR Scanner';
    if (path.startsWith('/chat')) return 'Intelligence Hub';
    if (path.startsWith('/settings-users')) return 'Team & Roles';
    if (path.startsWith('/settings')) return 'Settings';
    if (path.startsWith('/profile-station')) return 'Operator Profile';
    return 'Dashboard Overview';
  };

  const renderRoleBadge = () => {
    if (userRole === 'admin') {
      return (
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F0EDFD] text-[#6C4CE6] dark:bg-[#252040] dark:text-[#A78BFA] border border-[#E8E5F2] dark:border-[#383256]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#6C4CE6] dark:text-[#A78BFA]" />
          <span>Admin</span>
        </span>
      );
    }
    if (userRole === 'inventory_manager') {
      return (
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
          <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Manager</span>
        </span>
      );
    }
    return (
      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        <HardHat className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
        <span>Staff</span>
      </span>
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSearch.trim()) return;
    navigate(`/products?q=${encodeURIComponent(quickSearch.trim())}`);
  };

  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-white/95 dark:bg-[#141124]/95 backdrop-blur-md border-b border-[#E8E5F2] dark:border-[#282342] z-30 flex items-center justify-between px-4 sm:px-8 select-none transition-colors">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
          aria-label="Toggle mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider hidden sm:block">
            StockSense Platform
          </span>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center flex-1 max-w-sm mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={quickSearch}
            onChange={(e) => setQuickSearch(e.target.value)}
            placeholder="Search SKUs, receipts, or suppliers..."
            className="w-full pl-9 pr-3.5 py-1.5 bg-[#F7F5FF] dark:bg-[#1B172E] border border-[#E8E5F2] dark:border-[#282342] rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6] transition-all"
          />
        </div>
      </form>

      {/* Right: Actions, Alerts, Dark Mode, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Role Badge */}
        {renderRoleBadge()}

        {/* Barcode Scanner Shortcut */}
        <button
          onClick={() => navigate('/scanner')}
          className="p-2 text-slate-600 dark:text-slate-300 hover:text-[#6C4CE6] hover:bg-[#F0EDFD] dark:hover:bg-[#252040] rounded-xl transition-colors cursor-pointer border border-transparent hover:border-[#E8E5F2] dark:hover:border-[#383256]"
          title="Barcode & QR Scanner"
          aria-label="Barcode Scanner"
        >
          <QrCode className="w-4.5 h-4.5" />
        </button>

        {/* AI Copilot Shortcut */}
        <button
          onClick={() => navigate('/chat')}
          className="p-2 text-[#6C4CE6] dark:text-[#A78BFA] hover:bg-[#F0EDFD] dark:hover:bg-[#252040] rounded-xl transition-colors cursor-pointer border border-transparent hover:border-[#E8E5F2] dark:hover:border-[#383256]"
          title="AI Intelligence Hub"
          aria-label="AI Intelligence Hub"
        >
          <Bot className="w-4.5 h-4.5" />
        </button>

        {/* Notifications Bell (Managers and Admins only) */}
        {userRole !== 'warehouse_staff' && (
          <button
            onClick={() => navigate('/alerts')}
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-[#F7F5FF] dark:hover:bg-[#1E1A34] rounded-xl transition-colors cursor-pointer"
            title={`${activeAlertsCount} Low-Stock Alerts`}
            aria-label="Stock Alerts"
          >
            <Bell className="w-4.5 h-4.5" />
            {activeAlertsCount > 0 && (
              <span className="absolute top-1 right-1 bg-rose-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {activeAlertsCount}
              </span>
            )}
          </button>
        )}

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-[#F7F5FF] dark:hover:bg-[#1E1A34] rounded-xl transition-colors cursor-pointer"
          title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          aria-label="Toggle theme mode"
        >
          {isDarkMode ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5" />}
        </button>

        {/* User Profile Menu */}
        <div className="relative ml-1">
          <button
            ref={buttonRef}
            onClick={() => setProfileOpen((prev) => !prev)}
            aria-expanded={profileOpen}
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-[#F7F5FF] dark:hover:bg-[#1E1A34] border border-[#E8E5F2] dark:border-[#282342] transition-colors cursor-pointer"
          >
            <img
              alt="Operator Avatar"
              className="w-7 h-7 rounded-full object-cover ring-1 ring-[#E8E5F2] dark:ring-[#282342]"
              src={userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
            />
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[110px]">
                {userProfile?.name || 'Alexander L.'}
              </span>
              <span className="text-[10px] text-slate-400 leading-none">
                {userProfile?.operatorId || 'OP-774-K'}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div
              ref={dropdownRef}
              className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="p-3.5 bg-[#F7F5FF] dark:bg-[#1B172E] border-b border-[#E8E5F2] dark:border-[#282342]">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {userProfile?.name || 'Alexander Lindberg'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-[#F0EDFD] text-[#6C4CE6] font-semibold rounded-full">
                    Online
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {userProfile?.email || 'admin@stocksense.internal'}
                </div>
              </div>

              <div className="p-1.5 flex flex-col">
                <button
                  onClick={() => {
                    navigate('/profile-station');
                    setProfileOpen(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-[#F7F5FF] dark:hover:bg-[#1E1A34] rounded-xl transition-colors text-left cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Profile Station</span>
                </button>

                {userRole === 'admin' && (
                  <button
                    onClick={() => {
                      navigate('/settings-users');
                      setProfileOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-[#F7F5FF] dark:hover:bg-[#1E1A34] rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>User Management</span>
                  </button>
                )}

                <div className="h-px bg-[#E8E5F2] dark:bg-[#282342] my-1" />

                <button
                  onClick={async () => {
                    setProfileOpen(false);
                    await logout();
                    navigate('/signin', { replace: true });
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
