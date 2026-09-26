import React from 'react';
import { useApp } from '../../context/AppContext';
import { ViewScreen } from '../../types';
import { ASSET_IMAGES } from '../../data/initialData';

interface SidebarRailProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const SidebarRail: React.FC<SidebarRailProps> = ({ mobileOpen, setMobileOpen }) => {
  const { currentScreen, setCurrentScreen, userRole } = useApp();

  const navItems: { screen: ViewScreen; title: string; icon: string }[] = [
    { screen: 'dashboard', title: 'Dashboard', icon: 'dashboard' },
    { screen: 'products', title: 'Catalog & Products', icon: 'inventory_2' },
    { screen: 'receipts', title: 'Receipts', icon: 'receipt_long' },
    { screen: 'transfers', title: 'Transfers', icon: 'sync_alt' },
    { screen: 'move-history', title: 'History', icon: 'history' },
  ];

  const bottomItems: { screen: ViewScreen; title: string; icon: string }[] = [];
  if (userRole !== 'warehouse_staff') {
    bottomItems.push({ screen: 'settings', title: 'Settings', icon: 'tune' });
  }
  if (userRole === 'admin') {
    bottomItems.push({ screen: 'settings-users', title: 'Users', icon: 'manage_accounts' });
  }
  bottomItems.push({ screen: 'profile-station', title: 'Profile', icon: 'account_circle' });

  const handleNav = (screen: ViewScreen) => {
    setCurrentScreen(screen);
    if (setMobileOpen) setMobileOpen(false);
  };

  const isActive = (screen: ViewScreen) => {
    if (currentScreen === screen) return true;
    if (screen === 'receipts' && currentScreen === 'receipt-detail') return true;
    if (screen === 'transfers' && currentScreen === 'delivery-detail') return true;
    return false;
  };

  return (
    <>
      {/* Desktop Fixed Utility Rail (56px / w-14) */}
      <aside className="fixed left-0 top-0 h-full w-14 bg-surface z-50 hidden md:flex flex-col justify-between items-center py-3 border-r border-rule select-none">
        <div className="flex flex-col items-center w-full gap-4">
          {/* Brand SS Mark */}
          <button
            onClick={() => handleNav('dashboard')}
            className="w-10 h-10 flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
            title="StockSense"
          >
            <img 
              src={ASSET_IMAGES.brandLogo} 
              alt="StockSense Logo" 
              className="w-10 h-10 object-contain" 
            />
          </button>

          <div className="w-8 h-[1px] bg-secondary/40" />

          {/* Primary Navigation Rail */}
          <nav className="flex flex-col items-center w-full gap-1.5" aria-label="Primary Navigation">
            {navItems.map((item) => {
              const active = isActive(item.screen);
              return (
                <button
                  key={item.screen}
                  onClick={() => handleNav(item.screen)}
                  className={`flex items-center justify-center w-10 h-10 transition-all duration-200 rounded-[2px] cursor-pointer hover:scale-110 hover:shadow-sm ${
                    active
                      ? 'bg-primary-container text-white border-l-2 border-primary-fixed shadow-sm'
                      : 'text-secondary hover:text-on-surface hover:bg-surface-variant/50'
                  }`}
                  title={item.title}
                  aria-label={item.title}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Secondary Lower Navigation */}
        <div className="flex flex-col items-center w-full gap-2">
          <div className="w-8 h-[1px] bg-secondary/40" />
          <nav className="flex flex-col items-center w-full gap-1.5" aria-label="System Settings">
            {bottomItems.map((item) => {
              const active = isActive(item.screen);
              return (
                <button
                  key={item.screen}
                  onClick={() => handleNav(item.screen)}
                  className={`flex items-center justify-center w-10 h-10 transition-all duration-200 rounded-[2px] cursor-pointer hover:scale-110 hover:shadow-sm ${
                    active
                      ? 'bg-primary-container text-white border-l-2 border-primary-fixed shadow-sm'
                      : 'text-secondary hover:text-on-surface hover:bg-surface-variant/50'
                  }`}
                  title={item.title}
                  aria-label={item.title}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
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
          <div className="relative w-64 bg-surface text-on-surface h-full p-4 flex flex-col justify-between border-r border-rule">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-surface-variant/20">
                <div className="flex items-center gap-2">
                  <img 
                    src={ASSET_IMAGES.brandLogo} 
                    alt="StockSense Logo" 
                    className="w-8 h-8 object-contain" 
                  />
                  <span className="font-headline-md text-on-surface tracking-wider">StockSense</span>
                </div>
                <button
                  onClick={() => setMobileOpen && setMobileOpen(false)}
                  className="text-secondary hover:text-on-surface p-1"
                  aria-label="Close menu"
                >
                  <span className="material-symbols-outlined text-[22px]">close</span>
                </button>
              </div>

              <div className="pt-4 flex flex-col gap-1">
                <div className="font-label-sm text-label-sm text-secondary uppercase px-2 pb-1 tracking-widest">
                  MAIN MENU
                </div>
                {navItems.map((item) => {
                  const active = isActive(item.screen);
                  return (
                    <button
                      key={item.screen}
                      onClick={() => handleNav(item.screen)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left font-label-md text-label-md uppercase tracking-wider transition-all duration-200 hover:translate-x-1 ${
                        active
                          ? 'bg-primary-container text-white font-semibold shadow-sm'
                          : 'text-secondary hover:text-on-surface hover:bg-surface-variant/50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                      <span>{item.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-surface-variant/20 flex flex-col gap-1">
              <div className="font-label-sm text-label-sm text-secondary uppercase px-2 pb-1 tracking-widest">
                SYSTEM
              </div>
              {bottomItems.map((item) => {
                const active = isActive(item.screen);
                return (
                  <button
                    key={item.screen}
                    onClick={() => handleNav(item.screen)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left font-label-md text-label-md uppercase tracking-wider transition-all duration-200 hover:translate-x-1 ${
                      active
                        ? 'bg-primary-container text-white font-semibold shadow-sm'
                        : 'text-secondary hover:text-on-surface hover:bg-surface-variant/50'
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
