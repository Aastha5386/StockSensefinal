/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SidebarRail } from './components/layout/SidebarRail';
import { HeaderBar } from './components/layout/HeaderBar';
import { ToastNotification } from './components/common/ToastNotification';

// Screen Views
import { LoginView } from './components/views/LoginView';
import { DashboardView } from './components/views/DashboardView';
import { ProductsView } from './components/views/ProductsView';
import { ReceiptsView } from './components/views/ReceiptsView';
import { ReceiptDetailView } from './components/views/ReceiptDetailView';
import { DeliveryDetailView } from './components/views/DeliveryDetailView';
import { TransfersView } from './components/views/TransfersView';
import { MoveHistoryView } from './components/views/MoveHistoryView';
import { SettingsView } from './components/views/SettingsView';
import { ProfileStationView } from './components/views/ProfileStationView';

const MainAppContent: React.FC = () => {
  const { currentScreen, isAuthenticated } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If user is not logged in or explicitly at login screen, show the Archival Terminal Auth
  if (!isAuthenticated || currentScreen === 'login') {
    return (
      <>
        <LoginView />
        <ToastNotification />
      </>
    );
  }

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardView />;
      case 'products':
        return <ProductsView />;
      case 'receipts':
        return <ReceiptsView />;
      case 'receipt-detail':
        return <ReceiptDetailView />;
      case 'delivery-detail':
        return <DeliveryDetailView />;
      case 'transfers':
        return <TransfersView />;
      case 'move-history':
        return <MoveHistoryView />;
      case 'settings':
        return <SettingsView />;
      case 'profile-station':
        return <ProfileStationView />;
      default:
        return <DashboardView />;
    }
  };

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
          {renderActiveScreen()}
        </main>
      </div>

      {/* Global Toast Notification */}
      <ToastNotification />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
