import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Receipt,
  OutboundDelivery,
  StockAdjustmentItem,
  MoveRecord,
  WarehouseSite,
  SubLocationZone,
  UserProfile,
  ViewScreen,
  OperationalStatus,
} from '../types';
import {
  initialProducts,
  initialReceipts,
  initialDelivery,
  initialAdjustmentItems,
  initialMoveRecords,
  initialWarehouses,
  initialSubLocations,
  initialUserProfile,
} from '../data/initialData';

interface AppContextType {
  currentScreen: ViewScreen;
  setCurrentScreen: (screen: ViewScreen) => void;
  selectedReceiptId: string;
  setSelectedReceiptId: (id: string) => void;
  selectedDeliveryId: string;
  setSelectedDeliveryId: (id: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => boolean;
  logout: () => void;

  products: Product[];
  addProduct: (product: Product) => void;

  receipts: Receipt[];
  addReceipt: (receipt: Receipt) => void;
  updateReceiptStatus: (id: string, status: OperationalStatus) => void;
  validateReceipt: (id: string) => void;

  delivery: OutboundDelivery;
  toggleDeliveryChecklist: (field: 'pick' | 'pack') => void;
  validateDelivery: () => void;

  adjustmentItems: StockAdjustmentItem[];
  updateCountedQuantity: (id: string, qty: number) => void;
  appendAdjustmentItem: (item: StockAdjustmentItem) => void;
  postAdjustmentRecord: (notes: string) => void;

  moveRecords: MoveRecord[];
  addMoveRecord: (record: MoveRecord) => void;

  warehouses: WarehouseSite[];
  addWarehouse: (wh: WarehouseSite) => void;
  archiveWarehouse: (code: string) => void;

  subLocations: SubLocationZone[];
  userProfile: UserProfile;

  toast: { message: string; visible: boolean } | null;
  showToast: (msg: string) => void;
  exportCsv: (filename: string, headers: string[], rows: (string | number)[][]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ViewScreen>('dashboard');
  const [selectedReceiptId, setSelectedReceiptId] = useState<string>('RCV-2023-88401');
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>('WH/OUT/0042');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  // Dark mode state
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

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Ledger state
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('stocksense_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [receipts, setReceipts] = useState<Receipt[]>(() => {
    const saved = localStorage.getItem('stocksense_receipts');
    return saved ? JSON.parse(saved) : initialReceipts;
  });

  const [delivery, setDelivery] = useState<OutboundDelivery>(() => {
    const saved = localStorage.getItem('stocksense_delivery');
    return saved ? JSON.parse(saved) : initialDelivery;
  });

  const [adjustmentItems, setAdjustmentItems] = useState<StockAdjustmentItem[]>(() => {
    const saved = localStorage.getItem('stocksense_adjustments');
    return saved ? JSON.parse(saved) : initialAdjustmentItems;
  });

  const [moveRecords, setMoveRecords] = useState<MoveRecord[]>(() => {
    const saved = localStorage.getItem('stocksense_move_records');
    return saved ? JSON.parse(saved) : initialMoveRecords;
  });

  const [warehouses, setWarehouses] = useState<WarehouseSite[]>(() => {
    const saved = localStorage.getItem('stocksense_warehouses');
    return saved ? JSON.parse(saved) : initialWarehouses;
  });

  const [subLocations] = useState<SubLocationZone[]>(initialSubLocations);
  const [userProfile] = useState<UserProfile>(initialUserProfile);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; visible: boolean } | null>(null);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const login = (email: string) => {
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
    showToast(`OPERATOR SESSION ESTABLISHED // ${email.toUpperCase()}`);
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentScreen('login');
    showToast('TERMINAL SESSION LOGGED OUT // ARCHIVE SEAL APPLIED');
  };

  const addProduct = (product: Product) => {
    setProducts((prev) => [product, ...prev]);
    showToast(`SKU INSCRIBED TO CATALOG: ${product.sku}`);
  };

  const addReceipt = (receipt: Receipt) => {
    setReceipts((prev) => [receipt, ...prev]);
    showToast(`INBOUND MANIFEST REGISTERED: ${receipt.id}`);
  };

  const updateReceiptStatus = (id: string, status: OperationalStatus) => {
    setReceipts((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    showToast(`STATUS REVISED: ${id} → ${status}`);
  };

  const validateReceipt = (id: string) => {
    setReceipts((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'DONE' as OperationalStatus,
              clearanceStatus: 'CUSTOMS CLEARED // VALIDATED',
            }
          : r
      )
    );
    // Add to Move Records
    const target = receipts.find((r) => r.id === id);
    if (target) {
      const newMove: MoveRecord = {
        reference: `MOV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        timestampUtc: `${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} // ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} UTC`,
        carrier: target.contact,
        carrierTag: target.carrierCode || 'RCV-VAL',
        from: target.toLocation.split('/')[0].trim(),
        to: 'WH-A / RACK-14',
        quantity: `+${target.items.reduce((acc, curr) => acc + curr.quantity, 0)} UNITS`,
        isPositive: true,
        status: 'DONE',
        kind: 'inbound',
      };
      setMoveRecords((prev) => [newMove, ...prev]);
    }
    showToast(`RECEIPT ${id} COMMITTED TO ON-CHAIN LEDGER`);
  };

  const toggleDeliveryChecklist = (field: 'pick' | 'pack') => {
    setDelivery((prev) => {
      const nowUtc = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' UTC';
      if (field === 'pick') {
        const next = !prev.pickVerified;
        return {
          ...prev,
          pickVerified: next,
          pickVerifiedTime: next ? `VERIFIED // ${nowUtc}` : 'PENDING // 08:30 UTC',
        };
      } else {
        const next = !prev.packInspected;
        return {
          ...prev,
          packInspected: next,
          packInspectedTime: next ? `CONFIRMED // MARSHAL 04` : 'PENDING // MARSHAL 04',
        };
      }
    });
  };

  const validateDelivery = () => {
    setDelivery((prev) => ({
      ...prev,
      status: prev.status === 'DONE' ? 'READY' : 'DONE',
      pickVerified: true,
      packInspected: true,
      stageName: prev.status === 'DONE' ? 'STAGE VERIFIED' : 'DISPATCHED & SEALED',
    }));
    showToast('DISPATCH ATTESTED & INKED TO MARITIME BUFFER');
  };

  const updateCountedQuantity = (id: string, qty: number) => {
    setAdjustmentItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, countedQuantity: qty } : item))
    );
  };

  const appendAdjustmentItem = (item: StockAdjustmentItem) => {
    setAdjustmentItems((prev) => [...prev, item]);
    showToast(`LINE APPENDED: ${item.sku} // ${item.location}`);
  };

  const postAdjustmentRecord = (notes: string) => {
    showToast(`PHYSICAL TALLY POSTED & AUDIT REGISTRY SEALED (#MARSHAL-104)`);
    // Add to move records
    const diff = adjustmentItems.reduce((acc, i) => acc + (i.countedQuantity - i.systemQuantity), 0);
    const newMove: MoveRecord = {
      reference: `MOV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      timestampUtc: `${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} // ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} UTC`,
      carrier: `Physical Reconciliation / Team A-3`,
      carrierTag: 'ADJ-CYCLE',
      from: 'PHYSICAL-COUNT',
      to: 'LEDGER-BALANCE',
      quantity: `${diff >= 0 ? '+' : ''}${diff} UNITS`,
      isPositive: diff >= 0,
      status: 'DONE',
      kind: 'internal',
    };
    setMoveRecords((prev) => [newMove, ...prev]);
  };

  const addMoveRecord = (record: MoveRecord) => {
    setMoveRecords((prev) => [record, ...prev]);
  };

  const addWarehouse = (wh: WarehouseSite) => {
    setWarehouses((prev) => [wh, ...prev]);
    showToast(`WAREHOUSE SITE ADDED: ${wh.code} - ${wh.title}`);
  };

  const archiveWarehouse = (code: string) => {
    setWarehouses((prev) => prev.filter((w) => w.code !== code));
    showToast(`WAREHOUSE ${code} ARCHIVED TO HISTORICAL REGISTRY`);
  };

  const exportCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join(
        '\n'
      );
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
        currentScreen,
        setCurrentScreen,
        selectedReceiptId,
        setSelectedReceiptId,
        selectedDeliveryId,
        setSelectedDeliveryId,
        isDarkMode,
        toggleDarkMode,
        isAuthenticated,
        login,
        logout,
        products,
        addProduct,
        receipts,
        addReceipt,
        updateReceiptStatus,
        validateReceipt,
        delivery,
        toggleDeliveryChecklist,
        validateDelivery,
        adjustmentItems,
        updateCountedQuantity,
        appendAdjustmentItem,
        postAdjustmentRecord,
        moveRecords,
        addMoveRecord,
        warehouses,
        addWarehouse,
        archiveWarehouse,
        subLocations,
        userProfile,
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
