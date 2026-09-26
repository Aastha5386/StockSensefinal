/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
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
import { NotFoundView } from './components/views/NotFoundView';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, authLoading } = useApp();
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

  return <Outlet />;
};

const LoginRoute: React.FC = () => {
  const { isAuthenticated, authLoading } = useApp();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-on-surface">
        <div className="text-secondary font-label-lg tracking-wider">INITIALIZING SESSION...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <>
      <LoginView />
      <ToastNotification />
    </>
  );
};

const SettingsRoute: React.FC = () => {
  const { userRole } = useApp();
  return userRole === 'warehouse_staff' ? <Navigate to="/dashboard" replace /> : <SettingsView />;
};

const AdminUsersRoute: React.FC = () => {
  const { userRole } = useApp();
  return userRole === 'admin' ? <AdminUsersView /> : <Navigate to="/dashboard" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />

      {/* Protected Application Routes with AppLayout Shell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/products" element={<ProductsView />} />
          <Route path="/receipts" element={<ReceiptsView />} />
          <Route path="/receipts/:id" element={<ReceiptDetailView />} />
          <Route path="/receipt-detail" element={<ReceiptDetailView />} />
          <Route path="/transfers" element={<TransfersView />} />
          <Route path="/delivery-detail" element={<DeliveryDetailView />} />
          <Route path="/deliveries/:id" element={<DeliveryDetailView />} />
          <Route path="/move-history" element={<MoveHistoryView />} />
          <Route path="/reports" element={<MoveHistoryView />} />
          <Route path="/suppliers" element={<ReceiptsView />} />
          <Route path="/settings" element={<SettingsRoute />} />
          <Route path="/settings-users" element={<AdminUsersRoute />} />
          <Route path="/settings/users" element={<AdminUsersRoute />} />
          <Route path="/profile-station" element={<ProfileStationView />} />
          <Route path="/profile" element={<ProfileStationView />} />
        </Route>
      </Route>

      {/* 404 Unknown Routes */}
      <Route path="*" element={<NotFoundView />} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
