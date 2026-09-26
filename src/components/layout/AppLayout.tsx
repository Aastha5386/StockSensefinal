import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarRail } from './SidebarRail';
import { HeaderBar } from './HeaderBar';
import { ToastNotification } from '../common/ToastNotification';

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased flex flex-col selection:bg-primary-container selection:text-white">
      {/* 56px Utility Sidebar Rail (Left) */}
      <SidebarRail mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col md:pl-14">
        {/* Top Header Bar */}
        <HeaderBar onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />

        {/* Scrollable Main Canvas */}
        <main className="relative pt-14 w-full min-h-screen bg-surface transition-colors">
          <Outlet />
        </main>
      </div>

      {/* Global Toast Notification */}
      <ToastNotification />
    </div>
  );
};
