import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarRail } from './SidebarRail';
import { HeaderBar } from './HeaderBar';
import { ToastNotification } from '../common/ToastNotification';
import { ChatDrawer } from '../common/ChatDrawer';

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F5FF] dark:bg-[#0E0C1A] text-slate-900 dark:text-slate-100 antialiased flex flex-col selection:bg-[#6C4CE6] selection:text-white">
      {/* 256px Fixed Left Navigation Sidebar */}
      <SidebarRail mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col md:pl-64">
        {/* Top Header Bar */}
        <HeaderBar onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />

        {/* Spacious Main Canvas */}
        <main className="relative pt-16 w-full min-h-screen bg-[#F7F5FF] dark:bg-[#0E0C1A] transition-colors pb-12">
          <Outlet />
        </main>
      </div>

      {/* Floating AI Copilot Assistant */}
      <ChatDrawer />

      {/* Global Toast Notification */}
      <ToastNotification />
    </div>
  );
};
