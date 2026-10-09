import { UserRole } from '../types';
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
  LucideIcon,
} from 'lucide-react';

export interface NavItemConfig {
  path: string;
  title: string;
  icon: LucideIcon;
  badge?: number | string | null;
  highlight?: boolean;
}

/**
 * Returns the default home landing page for each user role.
 * - Admin: Executive Dashboard
 * - Inventory Manager: Executive Dashboard (or Products)
 * - Warehouse Staff: Barcode & QR Scanner Station
 */
export const getDefaultRouteForRole = (role: UserRole | string | null | undefined): string => {
  switch (role) {
    case 'warehouse_staff':
      return '/scanner';
    case 'purchase_manager':
      return '/receipts';
    case 'inventory_manager':
      return '/dashboard';
    case 'admin':
      return '/dashboard';
    default:
      return '/dashboard';
  }
};

/**
 * Checks whether a given path is accessible by the specified role.
 */
export const isRouteAllowedForRole = (path: string, role: UserRole | string | null | undefined): boolean => {
  if (!role) return false;
  if (role === 'admin') return true;

  // Inventory Manager & Purchase Manager permissions
  if (role === 'inventory_manager' || role === 'purchase_manager') {
    // Admin-only routes
    if (path.startsWith('/settings-users') || path.startsWith('/settings/users')) {
      return false;
    }
    return true;
  }

  // Warehouse Staff permissions (Floor operations only)
  if (role === 'warehouse_staff') {
    const allowedPrefixes = [
      '/scanner',
      '/products',
      '/receipts',
      '/receipt-detail',
      '/transfers',
      '/deliveries',
      '/delivery-detail',
      '/move-history',
      '/reports',
      '/chat',
      '/profile-station',
      '/profile',
    ];

    return allowedPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}?`));
  }

  return false;
};

/**
 * Returns the navigation menu items for the sidebar customized according to role.
 */
export const getNavItemsForRole = (
  role: UserRole | string | null | undefined,
  activeAlertsCount: number = 0
): { mainItems: NavItemConfig[]; adminItems: NavItemConfig[]; bottomItems: NavItemConfig[] } => {
  if (role === 'warehouse_staff') {
    return {
      mainItems: [
        { path: '/scanner', title: 'Barcode Scanner', icon: QrCode, highlight: true },
        { path: '/receipts', title: 'Inbound Orders', icon: FileText },
        { path: '/transfers', title: 'Sales & Outbound', icon: Send },
        { path: '/products', title: 'Product Catalog', icon: Boxes },
        { path: '/move-history', title: 'Stock Movements', icon: History },
        { path: '/chat', title: 'AI Copilot', icon: Bot },
      ],
      adminItems: [],
      bottomItems: [
        { path: '/profile-station', title: 'Operator Station', icon: UserCheck },
      ],
    };
  }

  if (role === 'inventory_manager' || role === 'purchase_manager') {
    return {
      mainItems: [
        { path: '/dashboard', title: 'Dashboard', icon: LayoutDashboard },
        { path: '/products', title: 'Products', icon: Boxes },
        { path: '/receipts', title: 'Purchase Orders', icon: FileText },
        { path: '/transfers', title: 'Sales & Outbound', icon: Send },
        { path: '/suppliers', title: 'Suppliers', icon: Building2 },
        { path: '/move-history', title: 'Stock Movements', icon: History },
        { path: '/analytics', title: 'Analytics', icon: TrendingUp },
        { path: '/forecasting', title: 'AI Forecasting', icon: BrainCircuit },
        { path: '/alerts', title: 'Reorder Alerts', icon: Bell, badge: activeAlertsCount > 0 ? activeAlertsCount : null },
        { path: '/scanner', title: 'Barcode Scanner', icon: QrCode },
        { path: '/chat', title: 'Intelligence Hub', icon: Bot },
      ],
      adminItems: [],
      bottomItems: [
        { path: '/settings', title: 'Settings', icon: Settings },
        { path: '/profile-station', title: 'Profile Station', icon: UserCheck },
      ],
    };
  }

  // Admin: Full access
  return {
    mainItems: [
      { path: '/dashboard', title: 'Dashboard', icon: LayoutDashboard },
      { path: '/products', title: 'Products', icon: Boxes },
      { path: '/receipts', title: 'Purchase Orders', icon: FileText },
      { path: '/transfers', title: 'Sales & Outbound', icon: Send },
      { path: '/suppliers', title: 'Suppliers', icon: Building2 },
      { path: '/move-history', title: 'Stock Movements', icon: History },
      { path: '/analytics', title: 'Analytics', icon: TrendingUp },
      { path: '/forecasting', title: 'AI Forecasting', icon: BrainCircuit },
      { path: '/alerts', title: 'Reorder Alerts', icon: Bell, badge: activeAlertsCount > 0 ? activeAlertsCount : null },
      { path: '/scanner', title: 'Barcode Scanner', icon: QrCode },
      { path: '/chat', title: 'Intelligence Hub', icon: Bot },
    ],
    adminItems: [
      { path: '/settings-users', title: 'Team & Roles', icon: ShieldCheck },
    ],
    bottomItems: [
      { path: '/settings', title: 'Settings', icon: Settings },
      { path: '/profile-station', title: 'Profile Station', icon: UserCheck },
    ],
  };
};
