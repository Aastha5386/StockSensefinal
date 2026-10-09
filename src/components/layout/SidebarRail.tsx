import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Boxes,
  FileText,
  Send,
  Building2,
  History,
  TrendingUp,
  BrainCircuit,
  Bell,
  QrCode,
  Bot,
  Settings,
  ShieldCheck,
  UserCheck,
  LogOut,
  X,
  Layers,
  ChevronRight,
} from 'lucide-react';

import { getDefaultRouteForRole, getNavItemsForRole } from '../../lib/roleRoutes';

interface SidebarRailProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const SidebarRail: React.FC<SidebarRailProps> = ({ mobileOpen, setMobileOpen }) => {
  const { userRole, userProfile, alerts, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const { mainItems, adminItems, bottomItems } = getNavItemsForRole(userRole, alerts.length);

  const handleNav = (path: string) => {
    navigate(path);
    if (setMobileOpen) setMobileOpen(false);
  };

  const isActive = (path: string) => {
    const currentPath = location.pathname;
    if (currentPath === path) return true;
    if (path === '/receipts' && (currentPath.startsWith('/receipts') || currentPath === '/receipt-detail')) return true;
    if (path === '/transfers' && (currentPath.startsWith('/deliveries') || currentPath === '/delivery-detail')) return true;
    if (path === '/move-history' && currentPath === '/reports') return true;
    if (path === '/settings' && currentPath === '/settings') return true;
    if (path === '/settings-users' && (currentPath === '/settings-users' || currentPath === '/settings/users')) return true;
    if (path === '/profile-station' && (currentPath === '/profile-station' || currentPath === '/profile')) return true;
    return false;
  };

  const renderNavButton = (item: any) => {
    const active = isActive(item.path);
    const Icon = item.icon;

    return (
      <button
        key={item.path}
        onClick={() => handleNav(item.path)}
        className={`flex items-center justify-between w-full h-10 px-3.5 rounded-xl transition-all duration-150 cursor-pointer ${
          active
            ? 'bg-[#F0EDFD] dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] font-semibold shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-[#6C4CE6] dark:hover:text-[#A78BFA] hover:bg-[#F7F5FF] dark:hover:bg-[#1E1A34]'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Icon className={`w-4.5 h-4.5 shrink-0 ${active ? 'text-[#6C4CE6] dark:text-[#A78BFA]' : 'text-slate-400 dark:text-slate-500'}`} />
          <span className="text-[13px] truncate">{item.title}</span>
        </div>
        {item.badge && (
          <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold shrink-0">
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Desktop Fixed Left Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-[#141124] border-r border-[#E8E5F2] dark:border-[#282342] z-40 hidden md:flex flex-col justify-between p-4 select-none shadow-[0_2px_12px_rgba(108,76,230,0.03)]">
        {/* Brand Logo & Name */}
        <div className="flex flex-col gap-6">
          <button
            onClick={() => handleNav(getDefaultRouteForRole(userRole))}
            className="flex items-center gap-3 px-2 py-1.5 hover:opacity-95 transition-all cursor-pointer rounded-xl text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6C4CE6] to-[#8C72FF] shrink-0 flex items-center justify-center text-white shadow-md shadow-[#6C4CE6]/25">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-slate-900 dark:text-white tracking-tight text-base leading-tight">
                StockSense
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                {userRole === 'warehouse_staff' ? 'Terminal Station' : 'Inventory OS'}
              </span>
            </div>
          </button>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-230px)] scrollbar-none pr-0.5" aria-label="Primary Navigation">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 px-3.5 mb-1.5">
              {userRole === 'warehouse_staff' ? 'Floor Operations' : 'Main Menu'}
            </div>
            {mainItems.map(renderNavButton)}

            {adminItems.length > 0 && (
              <>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 px-3.5 mt-3 mb-1.5">
                  Administration
                </div>
                {adminItems.map(renderNavButton)}
              </>
            )}

            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 px-3.5 mt-3 mb-1.5">
              Preferences
            </div>
            {bottomItems.map(renderNavButton)}
          </nav>
        </div>

        {/* User Profile Card & Sign Out */}
        <div className="pt-3 border-t border-[#E8E5F2] dark:border-[#282342] flex items-center justify-between gap-2 px-1">
          <div
            onClick={() => handleNav('/profile-station')}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img
              alt="Operator Avatar"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-[#E8E5F2] dark:ring-[#282342] shrink-0"
              src={userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
            />
            <div className="flex flex-col text-left truncate min-w-0">
              <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {userProfile?.name || 'Alexander L.'}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate capitalize">
                {userRole?.replace('_', ' ') || 'Admin'}
              </span>
            </div>
          </div>

          <button
            onClick={async () => {
              await logout();
              navigate('/signin', { replace: true });
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="Sign out of StockSense"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-950/60 backdrop-blur-xs flex">
          <div className="w-72 bg-white dark:bg-[#141124] h-full p-4 flex flex-col justify-between text-slate-900 dark:text-white border-r border-[#E8E5F2] dark:border-[#282342] shadow-2xl">
            <div className="flex flex-col gap-4 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E5F2] dark:border-[#282342]">
                <button
                  onClick={() => handleNav(getDefaultRouteForRole(userRole))}
                  className="flex items-center gap-2.5 cursor-pointer text-left"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#6C4CE6] flex items-center justify-center text-white shadow-sm">
                    <Layers className="w-4.5 h-4.5" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white text-base">StockSense</span>
                </button>
                <button
                  onClick={() => setMobileOpen && setMobileOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-1">
                {mainItems.map(renderNavButton)}
                {adminItems.map(renderNavButton)}
                {bottomItems.map(renderNavButton)}
              </nav>
            </div>

            <div className="pt-3 border-t border-[#E8E5F2] dark:border-[#282342] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  alt="Operator Avatar"
                  className="w-8 h-8 rounded-full object-cover"
                  src={userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
                />
                <span className="text-xs font-semibold">{userProfile?.name || 'Alexander L.'}</span>
              </div>
              <button
                onClick={async () => {
                  await logout();
                  navigate('/signin', { replace: true });
                }}
                className="p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileOpen && setMobileOpen(false)} />
        </div>
      )}
    </>
  );
};
