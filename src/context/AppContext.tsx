import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  Receipt,
  OutboundDelivery,
  StockAdjustmentItem,
  MoveRecord,
  WarehouseSite,
  SubLocationZone,
  UserProfile,
  OperationalStatus,
  Supplier,
  StockAlert,
  UserRole,
} from '../types';
import {
  getToken,
  setToken,
  removeToken,
  apiAuth,
  apiProducts,
  apiReceipts,
  apiDeliveries,
  apiSuppliers,
  apiMoves,
  apiAdjustments,
  apiWarehouses,
  apiAlerts,
  subscribeToEvents,
} from '../lib/api';

interface AppContextType {
  selectedReceiptId: string;
  setSelectedReceiptId: (id: string) => void;
  selectedDeliveryId: string;
  setSelectedDeliveryId: (id: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isAuthenticated: boolean;
  authLoading: boolean;
  userRole: UserRole | string | null;
  userUid: string | null;
  userProfile: UserProfile | null;
  login: (companyEmailOrId: string, password?: string, rememberMe?: boolean) => Promise<{ success: boolean; role?: UserRole; message?: string }>;
  register: (payload: { companyName: string; companyEmailOrId: string; password?: string; confirmPassword?: string; role?: string; fullName?: string; email?: string }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (name: string, avatarUrl: string) => Promise<void>;

  // Products
  products: Product[];
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (sku: string, updatedProduct: Product) => Promise<void>;
  deleteProduct: (sku: string) => Promise<void>;

  // Receipts / Purchase Orders
  receipts: Receipt[];
  addReceipt: (receipt: Receipt) => Promise<void>;
  updateReceiptStatus: (id: string, status: OperationalStatus) => Promise<void>;
  validateReceipt: (id: string) => Promise<void>;

  // Deliveries / Sales Orders
  delivery: OutboundDelivery | undefined;
  deliveries: OutboundDelivery[];
  toggleDeliveryChecklist: (field: 'pick' | 'pack') => Promise<void>;
  validateDelivery: () => Promise<void>;

  // Adjustments & Physical Audit
  adjustmentItems: StockAdjustmentItem[];
  updateCountedQuantity: (id: string, qty: number) => Promise<void>;
  appendAdjustmentItem: (item: StockAdjustmentItem) => Promise<void>;
  postAdjustmentRecord: (notes: string) => Promise<void>;

  // Complete Stock Movement History
  moveRecords: MoveRecord[];
  addMoveRecord: (record: MoveRecord) => Promise<void>;

  // Suppliers
  suppliers: Supplier[];
  addSupplier: (supplier: any) => Promise<void>;
  updateSupplier: (id: string, supplier: any) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;

  // Low Stock & Reorder Alerts
  alerts: StockAlert[];
  criticalAlertsCount: number;
  warningAlertsCount: number;
  triggerReorder: (sku: string, quantity?: number, supplierName?: string) => Promise<void>;

  // Warehouses
  warehouses: WarehouseSite[];
  addWarehouse: (wh: WarehouseSite) => Promise<void>;
  archiveWarehouse: (code: string) => Promise<void>;
  subLocations: SubLocationZone[];

  // Real-Time & Utilities
  refreshData: () => Promise<void>;
  toast: { message: string; visible: boolean } | null;
  showToast: (msg: string) => void;
  exportCsv: (filename: string, headers: string[], rows: (string | number)[][]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedReceiptId, setSelectedReceiptId] = useState<string>('RCV-2026-88401');
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>('WH/OUT/0042');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!getToken());
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<UserRole | string | null>('admin');
  const [userUid, setUserUid] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Entities
  const [products, setProducts] = useState<Product[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [deliveries, setDeliveries] = useState<OutboundDelivery[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [moveRecords, setMoveRecords] = useState<MoveRecord[]>([]);
  const [adjustmentItems, setAdjustmentItems] = useState<StockAdjustmentItem[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseSite[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [criticalAlertsCount, setCriticalAlertsCount] = useState<number>(0);
  const [warningAlertsCount, setWarningAlertsCount] = useState<number>(0);

  const [toast, setToast] = useState<{ message: string; visible: boolean } | null>(null);

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('stocksense_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('stocksense_dark_mode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  // Fetch all core operational data from MongoDB API
  const refreshData = useCallback(async () => {
    try {
      const [prodRes, rcvRes, delRes, supRes, movRes, adjRes, whRes, altRes] = await Promise.all([
        apiProducts.getAll().catch(() => ({ products: [] })),
        apiReceipts.getAll().catch(() => ({ receipts: [] })),
        apiDeliveries.getAll().catch(() => ({ deliveries: [] })),
        apiSuppliers.getAll().catch(() => ({ suppliers: [] })),
        apiMoves.getAll().catch(() => ({ moveRecords: [] })),
        apiAdjustments.getAll().catch(() => ({ adjustmentItems: [] })),
        apiWarehouses.getAll().catch(() => ({ warehouses: [] })),
        apiAlerts.getAll().catch(() => ({ alerts: [], criticalCount: 0, warningCount: 0 })),
      ]);

      if (prodRes.products) setProducts(prodRes.products);
      if (rcvRes.receipts) {
        setReceipts(rcvRes.receipts);
        if (rcvRes.receipts.length > 0 && !selectedReceiptId) {
          setSelectedReceiptId(rcvRes.receipts[0].id);
        }
      }
      if (delRes.deliveries) {
        setDeliveries(delRes.deliveries);
        if (delRes.deliveries.length > 0 && !selectedDeliveryId) {
          setSelectedDeliveryId(delRes.deliveries[0].id);
        }
      }
      if (supRes.suppliers) setSuppliers(supRes.suppliers);
      if (movRes.moveRecords) setMoveRecords(movRes.moveRecords);
      if (adjRes.adjustmentItems) setAdjustmentItems(adjRes.adjustmentItems);
      if (whRes.warehouses) setWarehouses(whRes.warehouses);
      if (altRes.alerts) {
        setAlerts(altRes.alerts);
        setCriticalAlertsCount(altRes.criticalCount || 0);
        setWarningAlertsCount(altRes.warningCount || 0);
      }
    } catch (err: any) {
      console.warn('Data sync warning:', err.message);
    }
  }, [selectedReceiptId, selectedDeliveryId]);

  // Check current session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (!token) {
        setIsAuthenticated(false);
        setUserProfile(null);
        setUserRole(null);
        setAuthLoading(false);
        return;
      }

      try {
        const res = await apiAuth.getMe();
        if (res.success && res.user) {
          setIsAuthenticated(true);
          setUserRole(res.user.role || 'warehouse_staff');
          setUserUid(res.user.id);
          setUserProfile({
            id: res.user.id,
            name: res.user.name || 'User',
            email: res.user.email || '',
            role: res.user.role || 'warehouse_staff',
            operatorId: res.user.operatorId || 'OP-774-K',
            dept: res.user.dept || 'LOGISTICS-COMMAND',
            station: res.user.station || 'TERMINAL-01',
            shiftDispatch: '45 CRATES',
            logSignature: 'VERIFIED',
            avatarUrl: res.user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
          });
        } else {
          removeToken();
          setIsAuthenticated(false);
        }
      } catch {
        removeToken();
        setIsAuthenticated(false);
      } finally {
        setAuthLoading(false);
      }
    };

    initAuth();
  }, []);

  // Fetch data when authenticated + listen for real-time SSE updates
  useEffect(() => {
    if (isAuthenticated) {
      refreshData();

      // Connect to real-time Server-Sent Events stream
      const unsubscribe = subscribeToEvents((data) => {
        if (data.type === 'REFRESH' || data.type === 'STOCK_UPDATE') {
          refreshData();
        }
      });

      // Regular polling fallback every 15s to keep dashboard fresh
      const interval = setInterval(refreshData, 15000);

      return () => {
        unsubscribe();
        clearInterval(interval);
      };
    }
  }, [isAuthenticated, refreshData]);

  // Auth Functions
  const login = async (companyEmailOrId: string, password?: string, rememberMe: boolean = true): Promise<{ success: boolean; role?: UserRole; message?: string }> => {
    try {
      const res = await apiAuth.login(companyEmailOrId, password);
      if (res.success && res.token) {
        setToken(res.token);
        setIsAuthenticated(true);
        setUserRole(res.user.role);
        setUserUid(res.user.id);
        setUserProfile({
          id: res.user.id,
          name: res.user.name,
          companyName: res.user.companyName,
          companyId: res.user.companyId,
          companyEmailOrId: res.user.companyEmailOrId,
          email: res.user.email,
          role: res.user.role,
          operatorId: res.user.operatorId,
          dept: res.user.dept,
          station: res.user.station,
          avatarUrl: res.user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
        });
        showToast(`FLEETFLOW SESSION ESTABLISHED // ${res.user.companyName?.toUpperCase() || res.user.name.toUpperCase()} [${res.user.role.toUpperCase()}]`);
        refreshData();
        return { success: true, role: res.user.role as UserRole };
      }
      return { success: false, message: res.message || 'Invalid company credentials or password.' };
    } catch (err: any) {
      const msg = err.message || 'Invalid company credentials or password.';
      showToast(`AUTH FAILED: ${msg}`);
      return { success: false, message: msg };
    }
  };

  const register = async (payload: {
    companyName: string;
    companyEmailOrId: string;
    password?: string;
    confirmPassword?: string;
    role?: string;
    fullName?: string;
    email?: string;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await apiAuth.register(payload);
      // Explicitly DO NOT authenticate user or save token. User must sign in first.
      const msg = res.message || 'Company account created successfully. Please sign in with your Company Email/ID to continue.';
      showToast(msg);
      return { success: true, message: msg };
    } catch (err: any) {
      const msg = err.message || 'Registration failed. Please check your inputs.';
      showToast(`SIGNUP FAILED: ${msg}`);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    removeToken();
    setIsAuthenticated(false);
    setUserUid(null);
    setUserRole(null);
    setUserProfile(null);
    showToast('TERMINAL SESSION LOGGED OUT // SEAL APPLIED');
  };

  const updateProfile = async (name: string, avatarUrl: string) => {
    try {
      const res = await apiAuth.updateProfile({ name, avatarUrl });
      if (res.success) {
        setUserProfile((prev) => (prev ? { ...prev, name, avatarUrl } : null));
        showToast('PROFILE REVISED IN CENTRAL DIRECTORY');
      }
    } catch (err: any) {
      showToast(`PROFILE UPDATE FAILED: ${err.message}`);
    }
  };

  // Product Operations
  const addProduct = async (product: Product) => {
    try {
      await apiProducts.create(product);
      showToast(`SKU INSCRIBED TO MONGODB: ${product.sku}`);
      await refreshData();
    } catch (err: any) {
      showToast(`ADD PRODUCT FAILED: ${err.message}`);
      throw err;
    }
  };

  const updateProduct = async (sku: string, updatedProduct: Product) => {
    try {
      await apiProducts.update(sku, updatedProduct);
      showToast(`SKU UPDATED: ${sku}`);
      await refreshData();
    } catch (err: any) {
      showToast(`UPDATE FAILED: ${err.message}`);
      throw err;
    }
  };

  const deleteProduct = async (sku: string) => {
    try {
      await apiProducts.delete(sku);
      showToast(`SKU PURGED: ${sku}`);
      await refreshData();
    } catch (err: any) {
      showToast(`DELETE FAILED: ${err.message}`);
      throw err;
    }
  };

  // Purchase & Inbound Receipts
  const addReceipt = async (receipt: Receipt) => {
    try {
      await apiReceipts.create(receipt);
      showToast(`INBOUND PO REGISTERED: ${receipt.id}`);
      await refreshData();
    } catch (err: any) {
      showToast(`FAILED TO CREATE RECEIPT: ${err.message}`);
      throw err;
    }
  };

  const updateReceiptStatus = async (id: string, status: OperationalStatus) => {
    try {
      await apiReceipts.update(id, { status });
      showToast(`STATUS REVISED: ${id} → ${status}`);
      await refreshData();
    } catch (err: any) {
      showToast(`STATUS UPDATE FAILED: ${err.message}`);
    }
  };

  const validateReceipt = async (id: string) => {
    try {
      await apiReceipts.validate(id);
      showToast(`RECEIPT ${id} COMMITTED TO INVENTORY LEDGER`);
      await refreshData();
    } catch (err: any) {
      showToast(`VALIDATION FAILED: ${err.message}`);
      throw err;
    }
  };

  // Sales Orders & Outbound Delivery
  const delivery = deliveries.find((d) => d.id === selectedDeliveryId) || deliveries[0];

  const toggleDeliveryChecklist = async (field: 'pick' | 'pack') => {
    if (!delivery) return;
    try {
      await apiDeliveries.toggleChecklist(delivery.id, field);
      await refreshData();
    } catch (err: any) {
      showToast(`CHECKLIST ERROR: ${err.message}`);
    }
  };

  const validateDelivery = async () => {
    if (!delivery) return;
    try {
      await apiDeliveries.validate(delivery.id);
      showToast('DISPATCH ATTESTED & COMMITTED TO MONGODB LEDGER');
      await refreshData();
    } catch (err: any) {
      showToast(`DISPATCH FAILED: ${err.message}`);
      throw err;
    }
  };

  // Physical Inventory Adjustments
  const updateCountedQuantity = async (id: string, qty: number) => {
    try {
      await apiAdjustments.updateCount(id, qty);
      await refreshData();
    } catch (err: any) {
      showToast(`COUNT UPDATE FAILED: ${err.message}`);
    }
  };

  const appendAdjustmentItem = async (item: StockAdjustmentItem) => {
    try {
      await apiAdjustments.create(item);
      showToast(`LINE APPENDED: ${item.sku} // ${item.location}`);
      await refreshData();
    } catch (err: any) {
      showToast(`APPEND FAILED: ${err.message}`);
    }
  };

  const postAdjustmentRecord = async (notes: string) => {
    try {
      await apiAdjustments.commit(notes);
      showToast('PHYSICAL TALLY POSTED & AUDIT REGISTRY SEALED');
      await refreshData();
    } catch (err: any) {
      showToast(`POST FAILED: ${err.message}`);
    }
  };

  // Movements History
  const addMoveRecord = async (record: MoveRecord) => {
    try {
      await apiMoves.create(record);
      await refreshData();
    } catch (err: any) {
      showToast(`RECORD FAILED: ${err.message}`);
    }
  };

  // Suppliers
  const addSupplier = async (supplier: any) => {
    try {
      await apiSuppliers.create(supplier);
      showToast(`SUPPLIER ONBOARDED: ${supplier.name}`);
      await refreshData();
    } catch (err: any) {
      showToast(`SUPPLIER ERROR: ${err.message}`);
      throw err;
    }
  };

  const updateSupplier = async (id: string, supplier: any) => {
    try {
      await apiSuppliers.update(id, supplier);
      showToast(`SUPPLIER UPDATED`);
      await refreshData();
    } catch (err: any) {
      showToast(`UPDATE FAILED: ${err.message}`);
      throw err;
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      await apiSuppliers.delete(id);
      showToast(`SUPPLIER ARCHIVED`);
      await refreshData();
    } catch (err: any) {
      showToast(`DELETE FAILED: ${err.message}`);
      throw err;
    }
  };

  // Reorder Trigger
  const triggerReorder = async (sku: string, quantity?: number, supplierName?: string) => {
    try {
      const res = await apiAlerts.reorder(sku, quantity, supplierName);
      showToast(`AUTOMATIC REORDER PO DISPATCHED: ${res.receipt?.id}`);
      await refreshData();
    } catch (err: any) {
      showToast(`REORDER FAILED: ${err.message}`);
    }
  };

  // Warehouses
  const addWarehouse = async (wh: WarehouseSite) => {
    try {
      await apiWarehouses.create(wh);
      showToast(`WAREHOUSE SITE ADDED: ${wh.code} - ${wh.title}`);
      await refreshData();
    } catch (err: any) {
      showToast(`FAILED TO ADD WAREHOUSE: ${err.message}`);
    }
  };

  const archiveWarehouse = async (code: string) => {
    try {
      await apiWarehouses.delete(code);
      showToast(`WAREHOUSE ${code} ARCHIVED`);
      await refreshData();
    } catch (err: any) {
      showToast(`ARCHIVE FAILED: ${err.message}`);
    }
  };

  const subLocations: SubLocationZone[] = [
    { code: 'BAY-01', parentWarehouse: 'WH-A', name: 'Dock Inbound Staging', capacity: '90%', status: 'HEAVY USE' },
    { code: 'BAY-02', parentWarehouse: 'WH-A', name: 'Tempered Glass Buffer', capacity: '75%', status: 'NORMAL' },
    { code: 'RACK-14', parentWarehouse: 'WH-A', name: 'Fastener Bulk High-Rack', capacity: '60%', status: 'NORMAL' },
    { code: 'SHELF-04', parentWarehouse: 'WH-B', name: 'Polymer Seal Shelving', capacity: '40%', status: 'LOW' },
    { code: 'SEC-09', parentWarehouse: 'WH-C', name: 'Hydraulic Drums Vault', capacity: '85%', status: 'MONITORED' },
  ];

  const exportCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`EXPORT COMPLETED: ${filename}.csv`);
  };

  return (
    <AppContext.Provider
      value={{
        selectedReceiptId,
        setSelectedReceiptId,
        selectedDeliveryId,
        setSelectedDeliveryId,
        isDarkMode,
        toggleDarkMode,
        isAuthenticated,
        authLoading,
        userRole,
        userUid,
        userProfile,
        login,
        register,
        logout,
        updateProfile,

        products,
        addProduct,
        updateProduct,
        deleteProduct,

        receipts,
        addReceipt,
        updateReceiptStatus,
        validateReceipt,

        delivery,
        deliveries,
        toggleDeliveryChecklist,
        validateDelivery,

        adjustmentItems,
        updateCountedQuantity,
        appendAdjustmentItem,
        postAdjustmentRecord,

        moveRecords,
        addMoveRecord,

        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,

        alerts,
        criticalAlertsCount,
        warningAlertsCount,
        triggerReorder,

        warehouses,
        addWarehouse,
        archiveWarehouse,
        subLocations,

        refreshData,
        toast,
        showToast,
        exportCsv,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
