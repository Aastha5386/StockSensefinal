import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
  authLoading: boolean;
  userRole: string | null;
  userUid: string | null;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (email: string, password?: string, firstName?: string, lastName?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (name: string, avatarUrl: string) => Promise<void>;

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
  userProfile: UserProfile | null;

  toast: { message: string; visible: boolean } | null;
  showToast: (msg: string) => void;
  exportCsv: (filename: string, headers: string[], rows: (string | number)[][]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ViewScreen>('dashboard');
  const [selectedReceiptId, setSelectedReceiptId] = useState<string>('RCV-2023-88401');
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>('WH/OUT/0042');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userUid, setUserUid] = useState<string | null>(null);

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
    try {
      const saved = localStorage.getItem('stocksense_products');
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed || initialProducts;
    } catch { return initialProducts; }
  });

  const [receipts, setReceipts] = useState<Receipt[]>(() => {
    try {
      const saved = localStorage.getItem('stocksense_receipts');
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed || initialReceipts;
    } catch { return initialReceipts; }
  });

  const [delivery, setDelivery] = useState<OutboundDelivery>(() => {
    try {
      const saved = localStorage.getItem('stocksense_delivery');
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed || initialDelivery;
    } catch { return initialDelivery; }
  });

  const [adjustmentItems, setAdjustmentItems] = useState<StockAdjustmentItem[]>(() => {
    try {
      const saved = localStorage.getItem('stocksense_adjustments');
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed || initialAdjustmentItems;
    } catch { return initialAdjustmentItems; }
  });

  const [moveRecords, setMoveRecords] = useState<MoveRecord[]>(() => {
    try {
      const saved = localStorage.getItem('stocksense_move_records');
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed || initialMoveRecords;
    } catch { return initialMoveRecords; }
  });

  const [warehouses, setWarehouses] = useState<WarehouseSite[]>(() => {
    try {
      const saved = localStorage.getItem('stocksense_warehouses');
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed || initialWarehouses;
    } catch { return initialWarehouses; }
  });

  const [subLocations] = useState<SubLocationZone[]>(initialSubLocations);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; visible: boolean } | null>(null);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserUid(user.uid);
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserRole(data.role || 'warehouse_staff');
            setUserProfile({
              id: user.uid,
              name: `${data.firstName || 'Unknown'} ${data.lastName || 'User'}`.trim(),
              email: data.email || user.email || '',
              role: data.role || 'warehouse_staff',
              operatorId: data.firstName || 'OP-NEW',
              avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.uid
            });
          } else {
            setUserRole('warehouse_staff');
            setUserProfile({
              id: user.uid,
              name: user.email || 'Unknown User',
              email: user.email || '',
              role: 'warehouse_staff',
              operatorId: 'OP-NEW',
              avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.uid
            });
          }
        } catch (e) {
          setUserRole('warehouse_staff');
        }
        if (currentScreen === 'login') {
          setCurrentScreen('dashboard');
        }
      } else {
        setIsAuthenticated(false);
        setUserUid(null);
        setUserRole(null);
        setCurrentScreen('login');
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, [currentScreen]);

  const login = async (email: string, password?: string) => {
    if (!password) return false;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showToast(`OPERATOR SESSION ESTABLISHED // ${email.toUpperCase()}`);
      return true;
    } catch (err: any) {
      showToast(`AUTH FAILED: ${err.message}`);
      return false;
    }
  };

  const register = async (email: string, password?: string, firstName?: string, lastName?: string) => {
    if (!password) return false;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Create user document in Firestore with default role
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        firstName: firstName || '',
        lastName: lastName || '',
        role: 'warehouse_staff',
        createdAt: new Date().toISOString()
      });
      showToast(`NEW TERMINAL ID REGISTERED // ${email.toUpperCase()}`);
      return true;
    } catch (err: any) {
      showToast(`REGISTRATION FAILED: ${err.message}`);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      showToast('TERMINAL SESSION LOGGED OUT // ARCHIVE SEAL APPLIED');
    } catch (err: any) {
      showToast(`LOGOUT ERROR: ${err.message}`);
    }
  };

  const updateProfile = async (name: string, avatarUrl: string) => {
    if (!userUid) return;
    try {
      const parts = name.split(' ');
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || '';
      await setDoc(doc(db, 'users', userUid), {
        firstName,
        lastName,
        avatarUrl
      }, { merge: true });
      setUserProfile((prev) => prev ? { ...prev, name, avatarUrl } : null);
      showToast(`PROFILE UPDATED SUCCESSFULLY`);
    } catch (err: any) {
      showToast(`PROFILE UPDATE FAILED: ${err.message}`);
    }
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
    // Add to Move Records and Update Products
    const target = receipts.find((r) => r.id === id);
    if (target) {
      setProducts((prev) => 
        prev.map(p => {
          const matchedItem = target.items.find(i => i.sku === p.sku);
          if (matchedItem) {
            return {
              ...p,
              onHand: p.onHand + matchedItem.quantity,
              freeToUse: p.freeToUse + matchedItem.quantity
            };
          }
          return p;
        })
      );

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
    if (delivery.status === 'DONE') return; // Prevent double validation

    setDelivery((prev) => ({
      ...prev,
      status: 'DONE',
      pickVerified: true,
      packInspected: true,
      stageName: 'DISPATCHED & SEALED',
    }));

    // Update Products
    setProducts((prev) => 
      prev.map(p => {
        const matchedItem = delivery.items.find(i => i.sku === p.sku);
        if (matchedItem) {
          const qty = parseInt(matchedItem.quantity.replace(/[^0-9]/g, '')) || 0;
          return {
            ...p,
            onHand: Math.max(0, p.onHand - qty),
            freeToUse: Math.max(0, p.freeToUse - qty)
          };
        }
        return p;
      })
    );

    // Add to move records
    const qtyTotal = delivery.items.reduce((acc, i) => acc + (parseInt(i.quantity.replace(/[^0-9]/g, '')) || 0), 0);
    const newMove: MoveRecord = {
      reference: `MOV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      timestampUtc: `${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} // ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} UTC`,
      carrier: `Outbound Dispatch / ${delivery.routing.split('//')[0].trim()}`,
      carrierTag: 'OUT-DSP',
      from: 'STAGE-NORTH',
      to: 'CUSTOMER',
      quantity: `-${qtyTotal} UNITS`,
      isPositive: false,
      status: 'DONE',
      kind: 'outbound',
    };
    setMoveRecords((prev) => [newMove, ...prev]);

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
    // Update Products
    setProducts((prev) => 
      prev.map(p => {
        const matchedItem = adjustmentItems.find(i => i.sku === p.sku);
        if (matchedItem) {
          const diff = matchedItem.countedQuantity - matchedItem.systemQuantity;
          return {
            ...p,
            onHand: Math.max(0, p.onHand + diff),
            freeToUse: Math.max(0, p.freeToUse + diff)
          };
        }
        return p;
      })
    );

    // Add to move records
    const diff = adjustmentItems.reduce((acc, i) => acc + (i.countedQuantity - i.systemQuantity), 0);
    if (diff !== 0) {
      const newMove: MoveRecord = {
        reference: `MOV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        timestampUtc: `${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} // ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} UTC`,
        carrier: `Physical Reconciliation / Team A-3`,
        carrierTag: 'ADJ-CYCLE',
        from: 'PHYSICAL-COUNT',
        to: 'LEDGER-BALANCE',
        quantity: `${diff > 0 ? '+' : ''}${diff} UNITS`,
        isPositive: diff > 0,
        status: 'DONE',
        kind: 'internal',
      };
      setMoveRecords((prev) => [newMove, ...prev]);
    }
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
        authLoading,
        userRole,
        userUid,
        login,
        register,
        logout,
        updateProfile,
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
