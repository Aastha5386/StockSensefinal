import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ASSET_IMAGES } from '../../data/initialData';

interface SidebarRailProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const SidebarRail: React.FC<SidebarRailProps> = ({ mobileOpen, setMobileOpen }) => {
  const { userRole } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { screen: '/dashboard', title: 'Dashboard', icon: 'dashboard' },
    { screen: '/products', title: 'Product Catalog', icon: 'inventory_2' },
    { screen: '/receipts', title: 'Receipts Management', icon: 'receipt_long' },
    { screen: '/transfers', title: 'Transfers & Outbound', icon: 'sync_alt' },
    { screen: '/move-history', title: 'Stock Move History', icon: 'history' },
  ];

  const bottomItems = [];
  if (userRole !== 'warehouse_staff') {
    bottomItems.push({ screen: '/settings', title: 'System Settings', icon: 'tune' });
  }
  if (userRole === 'admin') {
    bottomItems.push({ screen: '/settings-users', title: 'User Management', icon: 'manage_accounts' });
  }
  bottomItems.push({ screen: '/profile-station', title: 'Profile Station', icon: 'account_circle' });

  const handleNav = (screen: string) => {
    navigate(screen);
    if (setMobileOpen) setMobileOpen(false);
  };

  const isActive = (screen: string) => {
    if (location.pathname === screen) return true;
    if (screen === '/receipts' && location.pathname.startsWith('/receipts/')) return true;
    if (screen === '/transfers' && location.pathname.startsWith('/deliveries/')) return true;
    return false;
  };

  return (
    <>
      {/* Desktop Fixed Expandable Sidebar Rail */}
      <aside className="group fixed left-0 top-0 h-full w-14 hover:w-64 bg-[#23211d] dark:bg-[#161513] z-50 hidden md:flex flex-col justify-between items-start py-3 px-2 border-r border-[#3a3731] select-none shadow-xl transition-all duration-300 ease-in-out overflow-hidden">
        <div className="flex flex-col items-start w-full gap-4">
          {/* Brand Logo & Name */}
          <button
            onClick={() => handleNav('/dashboard')}
            className="flex items-center gap-3 w-full h-10 px-1 hover:opacity-90 transition-all cursor-pointer rounded-[2px]"
            title="StockSense Freight Ledger"
          >
            <div className="w-10 h-10 bg-primary-container shrink-0 flex items-center justify-center text-white font-headline-md font-bold tracking-wider border border-white/20 rounded-[2px] shadow-sm">
              <img 
                src={ASSET_IMAGES.brandLogo} 
                alt="StockSense Logo" 
                className="w-7 h-7 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 font-headline-md text-white font-semibold tracking-wider whitespace-nowrap">
              StockSense
            </span>
          </button>

          <div className="w-full h-[1px] bg-white/15" />

          {/* Primary Navigation Items */}
          <nav className="flex flex-col items-start w-full gap-1.5" aria-label="Primary Navigation">
            {navItems.map((item) => {
              const active = isActive(item.screen);
              return (
                <button
                  key={item.screen}
                  onClick={() => handleNav(item.screen)}
                  className={`flex items-center gap-3.5 w-full h-10 px-2.5 transition-all duration-150 rounded-[2px] cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-primary-container text-white border-l-2 border-[#ffb693] shadow-sm font-medium'
                      : 'text-[#c2baa9] hover:text-white hover:bg-white/10'
                  }`}
                  title={item.title}
                  aria-label={item.title}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="material-symbols-outlined text-[20px] shrink-0">{item.icon}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 font-label-md text-label-md uppercase tracking-wider font-medium truncate">
                    {item.title}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Secondary Lower Navigation */}
        <div className="flex flex-col items-start w-full gap-2">
          <div className="w-full h-[1px] bg-white/15" />
          <nav className="flex flex-col items-start w-full gap-1.5" aria-label="System Settings">
            {bottomItems.map((item) => {
              const active = isActive(item.screen);
              return (
                <button
                  key={item.screen}
                  onClick={() => handleNav(item.screen)}
                  className={`flex items-center gap-3.5 w-full h-10 px-2.5 transition-all duration-150 rounded-[2px] cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-primary-container text-white border-l-2 border-[#ffb693] shadow-sm font-medium'
                      : 'text-[#c2baa9] hover:text-white hover:bg-white/10'
                  }`}
                  title={item.title}
                  aria-label={item.title}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="material-symbols-outlined text-[20px] shrink-0">{item.icon}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 font-label-md text-label-md uppercase tracking-wider font-medium truncate">
                    {item.title}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile Drawer (When Opened) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen && setMobileOpen(false)}
          />
          <div className="relative w-64 bg-[#23211d] text-white h-full p-4 flex flex-col justify-between border-r border-[#3a3731]">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/15">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-container flex items-center justify-center text-white font-headline-md font-bold rounded-[2px]">
                    <img 
                      src={ASSET_IMAGES.brandLogo} 
                      alt="StockSense Logo" 
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <span className="font-headline-md text-white tracking-wider">StockSense</span>
                </div>
                <button
                  onClick={() => setMobileOpen && setMobileOpen(false)}
                  className="text-[#c2baa9] hover:text-white p-1"
                  aria-label="Close menu"
                >
                  <span className="material-symbols-outlined text-[22px]">close</span>
                </button>
              </div>

              <div className="pt-4 flex flex-col gap-1">
                <div className="font-label-sm text-label-sm text-[#8c8276] uppercase px-2 pb-1 tracking-widest">
                  MAIN MENU
                </div>
                {navItems.map((item) => {
                  const active = isActive(item.screen);
                  return (
                    <button
                      key={item.screen}
                      onClick={() => handleNav(item.screen)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left font-label-md text-label-md uppercase tracking-wider transition-colors rounded-[2px] ${
                        active
                          ? 'bg-primary-container text-white font-semibold'
                          : 'text-[#c2baa9] hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                      <span>{item.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-white/15 flex flex-col gap-1">
              <div className="font-label-sm text-label-sm text-[#8c8276] uppercase px-2 pb-1 tracking-widest">
                SYSTEM
              </div>
              {bottomItems.map((item) => {
                const active = isActive(item.screen);
                return (
                  <button
                    key={item.screen}
                    onClick={() => handleNav(item.screen)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left font-label-md text-label-md uppercase tracking-wider transition-colors rounded-[2px] ${
                      active
                        ? 'bg-primary-container text-white font-semibold'
                        : 'text-[#c2baa9] hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    <span>{item.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
