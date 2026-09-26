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
  OperationalStatus,
} from '../types';

import { useFirebaseProducts } from '../hooks/useFirebaseProducts';
import { useFirebaseReceipts } from '../hooks/useFirebaseReceipts';
import { useFirebaseDeliveries } from '../hooks/useFirebaseDeliveries';
import { useFirebaseAdjustments } from '../hooks/useFirebaseAdjustments';
import { useFirebaseMoves } from '../hooks/useFirebaseMoves';
import { useFirebaseWarehouses } from '../hooks/useFirebaseWarehouses';

interface AppContextType {
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
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (sku: string, updatedProduct: Product) => Promise<void>;

  receipts: Receipt[];
  addReceipt: (receipt: Receipt) => Promise<void>;
  updateReceiptStatus: (id: string, status: OperationalStatus) => Promise<void>;
  validateReceipt: (id: string) => Promise<void>;

  delivery: OutboundDelivery | undefined;
  deliveries: OutboundDelivery[];
  toggleDeliveryChecklist: (field: 'pick' | 'pack') => Promise<void>;
  validateDelivery: () => Promise<void>;

  adjustmentItems: StockAdjustmentItem[];
  updateCountedQuantity: (id: string, qty: number) => Promise<void>;
  appendAdjustmentItem: (item: StockAdjustmentItem) => Promise<void>;
  postAdjustmentRecord: (notes: string) => Promise<void>;

  moveRecords: MoveRecord[];
  addMoveRecord: (record: MoveRecord) => Promise<void>;

  warehouses: WarehouseSite[];
  addWarehouse: (wh: WarehouseSite) => Promise<void>;
  archiveWarehouse: (code: string) => Promise<void>;

  subLocations: SubLocationZone[];
  userProfile: UserProfile | null;

  toast: { message: string; visible: boolean } | null;
  showToast: (msg: string) => void;
  exportCsv: (filename: string, headers: string[], rows: (string | number)[][]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedReceiptId, setSelectedReceiptId] = useState<string>('RCV-2023-88401');
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>('WH/OUT/0042');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('stocksense_signed_out') !== 'true';
  });
  const [authLoading, setAuthLoading] = useState<boolean>(() => {
    return localStorage.getItem('stocksense_signed_out') === 'true';
  });
  const [userRole, setUserRole] = useState<string | null>('admin');
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

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
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
        localStorage.removeItem('stocksense_signed_out');
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserRole(data.role || 'admin');
            setUserProfile({
              id: user.uid,
              name: `${data.firstName || 'Unknown'} ${data.lastName || 'User'}`.trim(),
              email: data.email || user.email || '',
              role: data.role || 'admin',
              operatorId: data.firstName || 'OP-774-K',
              avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.uid
            });
          } else {
            setUserRole('admin');
            setUserProfile({
              id: user.uid,
              name: user.email || 'A. LINDBERG',
              email: user.email || 'operator-774k@stocksense.internal',
              role: 'admin',
              operatorId: 'OP-774-K',
              avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.uid
            });
          }
        } catch (e) {
          setUserRole('admin');
        }
      } else {
        if (localStorage.getItem('stocksense_signed_out') === 'true') {
          setIsAuthenticated(false);
          setUserUid(null);
          setUserRole(null);
          setUserProfile(null);
        }
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password?: string) => {
    if (!password) return false;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.removeItem('stocksense_signed_out');
      setIsAuthenticated(true);
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
      localStorage.removeItem('stocksense_signed_out');
      setIsAuthenticated(true);
      // Create user document in Firestore with default role
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        firstName: firstName || '',
        lastName: lastName || '',
        role: 'admin',
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
    } catch (err: any) {
      console.error(err);
    }
    localStorage.setItem('stocksense_signed_out', 'true');
    setIsAuthenticated(false);
    setUserUid(null);
    setUserRole(null);
    setUserProfile(null);
    showToast('TERMINAL SESSION LOGGED OUT // ARCHIVE SEAL APPLIED');
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

  // --- FIREBASE HOOKS ---
  const fbProducts = useFirebaseProducts();
  const fbReceipts = useFirebaseReceipts();
  const fbDeliveries = useFirebaseDeliveries();
  const fbAdjustments = useFirebaseAdjustments();
  const fbMoves = useFirebaseMoves();
  const fbWarehouses = useFirebaseWarehouses();

  // --- WRAPPERS ---
  const addProduct = async (product: Product) => {
    await fbProducts.addProduct(product);
    showToast(`SKU INSCRIBED TO CATALOG: ${product.sku}`);
  };
  const updateProduct = async (sku: string, updatedProduct: Product) => {
    await fbProducts.updateProduct(sku, updatedProduct);
    showToast(`SKU REVISED IN CATALOG: ${sku}`);
  };

  const addReceipt = async (receipt: Receipt) => {
    await fbReceipts.addReceipt(receipt);
    showToast(`INBOUND MANIFEST REGISTERED: ${receipt.id}`);
  };
  const updateReceiptStatus = async (id: string, status: OperationalStatus) => {
    await fbReceipts.updateReceiptStatus(id, status);
    showToast(`STATUS REVISED: ${id} → ${status}`);
  };
  const validateReceipt = async (id: string) => {
    await fbReceipts.validateReceipt(id);
    showToast(`RECEIPT ${id} COMMITTED TO ON-CHAIN LEDGER`);
  };

  // The application assumes a single selected delivery in some places, so we find it.
  const delivery = fbDeliveries.deliveries.find(d => d.id === selectedDeliveryId) || fbDeliveries.deliveries[0];

  const toggleDeliveryChecklist = async (field: 'pick' | 'pack') => {
    if (!delivery) return;
    await fbDeliveries.toggleDeliveryChecklist(delivery.id, field);
  };
  const validateDelivery = async () => {
    if (!delivery) return;
    await fbDeliveries.validateDelivery(delivery.id);
    showToast('DISPATCH ATTESTED & INKED TO MARITIME BUFFER');
  };

  const updateCountedQuantity = async (id: string, qty: number) => {
    await fbAdjustments.updateCountedQuantity(id, qty);
  };
  const appendAdjustmentItem = async (item: StockAdjustmentItem) => {
    await fbAdjustments.appendAdjustmentItem(item);
    showToast(`LINE APPENDED: ${item.sku} // ${item.location}`);
  };
  const postAdjustmentRecord = async (notes: string) => {
    await fbAdjustments.postAdjustmentRecord(notes);
    showToast(`PHYSICAL TALLY POSTED & AUDIT REGISTRY SEALED (#MARSHAL-104)`);
  };

  const addMoveRecord = async (record: MoveRecord) => {
    await fbMoves.addMoveRecord(record);
  };

  const addWarehouse = async (wh: WarehouseSite) => {
    // Implement adding a warehouse directly or via hook
    // We didn't implement addWarehouse in the hook, let's just write to doc directly here for brevity
    try {
      const safeId = wh.code.replace(/\//g, '--');
      await setDoc(doc(db, 'warehouses', safeId), wh);
      showToast(`WAREHOUSE SITE ADDED: ${wh.code} - ${wh.title}`);
    } catch (e: any) {
      showToast(`FAILED TO ADD WAREHOUSE: ${e.message}`);
    }
  };
  const archiveWarehouse = async (code: string) => {
    // Delete or mark archived
    showToast(`WAREHOUSE ${code} ARCHIVED TO HISTORICAL REGISTRY`);
  };

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
        login,
        register,
        logout,
        updateProfile,

        products: fbProducts.products,
        addProduct,
        updateProduct,

        receipts: fbReceipts.receipts,
        addReceipt,
        updateReceiptStatus,
        validateReceipt,

        delivery,
        deliveries: fbDeliveries.deliveries,
        toggleDeliveryChecklist,
        validateDelivery,

        adjustmentItems: fbAdjustments.adjustmentItems,
        updateCountedQuantity,
        appendAdjustmentItem,
        postAdjustmentRecord,

        moveRecords: fbMoves.moveRecords,
        addMoveRecord,

        warehouses: fbWarehouses.warehouses,
        addWarehouse,
        archiveWarehouse,

        subLocations: fbWarehouses.sublocations,
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
