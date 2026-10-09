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
import { LandingPageView } from './components/views/LandingPageView';
import { LoginView } from './components/views/LoginView';
import { DashboardView } from './components/views/DashboardView';
import { ProductsView } from './components/views/ProductsView';
import { ReceiptsView } from './components/views/ReceiptsView';
import { ReceiptDetailView } from './components/views/ReceiptDetailView';
import { DeliveryDetailView } from './components/views/DeliveryDetailView';
import { TransfersView } from './components/views/TransfersView';
import { MoveHistoryView } from './components/views/MoveHistoryView';
import { SuppliersView } from './components/views/SuppliersView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { ForecastingView } from './components/views/ForecastingView';
import { AlertsView } from './components/views/AlertsView';
import { BarcodeScannerView } from './components/views/BarcodeScannerView';
import { ChatBotView } from './components/views/ChatBotView';
import { SettingsView } from './components/views/SettingsView';
import { ProfileStationView } from './components/views/ProfileStationView';
import { AdminUsersView } from './components/views/AdminUsersView';
import { NotFoundView } from './components/views/NotFoundView';

import { getDefaultRouteForRole } from './lib/roleRoutes';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, authLoading } = useApp();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5FF] dark:bg-[#0E0C1A] text-slate-900 dark:text-slate-100">
        <div className="text-slate-500 dark:text-slate-400 font-label-lg tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
          <span>ESTABLISHING STOCKSENSE TERMINAL SESSION...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

const LoginRoute: React.FC<{ initialMode?: 'signin' | 'signup' }> = ({ initialMode = 'signin' }) => {
  const { isAuthenticated, authLoading, userRole } = useApp();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5FF] dark:bg-[#0E0C1A] text-slate-900 dark:text-slate-100">
        <div className="text-slate-500 dark:text-slate-400 font-label-lg tracking-wider">INITIALIZING SESSION...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname;
    const dest =
      from && from !== '/login' && from !== '/signin' && from !== '/signup' && from !== '/'
        ? from
        : getDefaultRouteForRole(userRole);
    return <Navigate to={dest} replace />;
  }

  return (
    <>
      <LoginView initialMode={initialMode} />
      <ToastNotification />
    </>
  );
};

const RoleHomeRedirect: React.FC = () => {
  const { userRole, authLoading } = useApp();
  if (authLoading) return null;
  return <Navigate to={getDefaultRouteForRole(userRole)} replace />;
};

interface RoleRouteProps {
  allowedRoles: string[];
  element: React.ReactElement;
}

const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles, element }) => {
  const { userRole, authLoading } = useApp();

  if (authLoading) return null;

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to={getDefaultRouteForRole(userRole)} replace />;
  }

  return element;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public SaaS Landing Page */}
      <Route path="/" element={<LandingPageView />} />

      {/* Authentication Routes */}
      <Route path="/login" element={<Navigate to="/signin" replace />} />
      <Route path="/signin" element={<LoginRoute initialMode="signin" />} />
      <Route path="/signup" element={<LoginRoute initialMode="signup" />} />

      {/* Protected Application Routes with AppLayout Shell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/app" element={<RoleHomeRedirect />} />

          {/* Admin & Manager pages */}
          <Route
            path="/dashboard"
            element={<RoleRoute allowedRoles={['admin', 'inventory_manager', 'purchase_manager']} element={<DashboardView />} />}
          />
          <Route
            path="/suppliers"
            element={<RoleRoute allowedRoles={['admin', 'inventory_manager', 'purchase_manager']} element={<SuppliersView />} />}
          />
          <Route
            path="/analytics"
            element={<RoleRoute allowedRoles={['admin', 'inventory_manager', 'purchase_manager']} element={<AnalyticsView />} />}
          />
          <Route
            path="/forecasting"
            element={<RoleRoute allowedRoles={['admin', 'inventory_manager', 'purchase_manager']} element={<ForecastingView />} />}
          />
          <Route
            path="/alerts"
            element={<RoleRoute allowedRoles={['admin', 'inventory_manager', 'purchase_manager']} element={<AlertsView />} />}
          />
          <Route
            path="/settings"
            element={<RoleRoute allowedRoles={['admin', 'inventory_manager', 'purchase_manager']} element={<SettingsView />} />}
          />

          {/* Admin-only pages */}
          <Route
            path="/settings-users"
            element={<RoleRoute allowedRoles={['admin']} element={<AdminUsersView />} />}
          />
          <Route
            path="/settings/users"
            element={<RoleRoute allowedRoles={['admin']} element={<AdminUsersView />} />}
          />

          {/* Floor & General Operations accessible to All Roles (Staff, Manager, Admin, Purchase Manager) */}
          <Route path="/scanner" element={<BarcodeScannerView />} />
          <Route path="/products" element={<ProductsView />} />
          <Route path="/inventory" element={<ProductsView />} />
          <Route path="/receipts" element={<ReceiptsView />} />
          <Route path="/receipts/:id" element={<ReceiptDetailView />} />
          <Route path="/receipt-detail" element={<ReceiptDetailView />} />
          <Route path="/purchase-orders" element={<ReceiptsView />} />
          <Route path="/transfers" element={<TransfersView />} />
          <Route path="/delivery-detail" element={<DeliveryDetailView />} />
          <Route path="/deliveries/:id" element={<DeliveryDetailView />} />
          <Route path="/move-history" element={<MoveHistoryView />} />
          <Route path="/reports" element={<MoveHistoryView />} />
          <Route path="/chat" element={<ChatBotView />} />
          <Route path="/intelligence" element={<ChatBotView />} />
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
