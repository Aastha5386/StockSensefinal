/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import { AdminUsersView } from './components/views/AdminUsersView';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased flex flex-col selection:bg-primary-container selection:text-white">
      <SidebarRail mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />
      <div className="flex-1 flex flex-col md:pl-14">
        <HeaderBar onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="relative pt-14 w-full min-h-screen bg-surface transition-colors">
          {children}
        </main>
      </div>
      <ToastNotification />
    </div>
  );
};

const AuthGuard: React.FC<{ children: React.ReactNode, requireAdmin?: boolean }> = ({ children, requireAdmin }) => {
  const { isAuthenticated, authLoading, userRole } = useApp();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-on-surface">
        <div className="text-secondary font-label-lg tracking-wider">INITIALIZING SESSION...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (requireAdmin && userRole !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const MainAppContent: React.FC = () => {
  const { isAuthenticated, authLoading } = useApp();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-on-surface">
        <div className="text-secondary font-label-lg tracking-wider">INITIALIZING SESSION...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : 
        <><LoginView /><ToastNotification /></>
      } />
      
      <Route path="/" element={<AuthGuard><MainLayout><DashboardView /></MainLayout></AuthGuard>} />
      <Route path="/dashboard" element={<AuthGuard><MainLayout><DashboardView /></MainLayout></AuthGuard>} />
      <Route path="/products" element={<AuthGuard><MainLayout><ProductsView /></MainLayout></AuthGuard>} />
      <Route path="/receipts" element={<AuthGuard><MainLayout><ReceiptsView /></MainLayout></AuthGuard>} />
      <Route path="/receipts/:id" element={<AuthGuard><MainLayout><ReceiptDetailView /></MainLayout></AuthGuard>} />
      <Route path="/deliveries" element={<AuthGuard><MainLayout><DeliveryDetailView /></MainLayout></AuthGuard>} />
      <Route path="/transfers" element={<AuthGuard><MainLayout><TransfersView /></MainLayout></AuthGuard>} />
      <Route path="/move-history" element={<AuthGuard><MainLayout><MoveHistoryView /></MainLayout></AuthGuard>} />
      <Route path="/profile-station" element={<AuthGuard><MainLayout><ProfileStationView /></MainLayout></AuthGuard>} />
      
      <Route path="/settings" element={<AuthGuard requireAdmin><MainLayout><SettingsView /></MainLayout></AuthGuard>} />
      <Route path="/settings-users" element={<AuthGuard requireAdmin><MainLayout><AdminUsersView /></MainLayout></AuthGuard>} />
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </BrowserRouter>
  );
}
