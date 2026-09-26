import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, doc, runTransaction } from 'firebase/firestore';
import { Receipt, OperationalStatus } from '../types';

export const useFirebaseReceipts = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'receipts'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const list: Receipt[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Receipt);
      });
      setReceipts(list);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching receipts: ", err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addReceipt = async (receipt: Receipt): Promise<void> => {
    try {
      await runTransaction(db, async (transaction) => {
        const ref = doc(collection(db, 'receipts'), receipt.id);
        const existing = await transaction.get(ref);
        if (existing.exists()) {
          throw new Error("Receipt already exists.");
        }
        transaction.set(ref, receipt);
      });
    } catch (err: any) {
      throw new Error(`Failed to add receipt: ${err.message}`);
    }
  };

  const updateReceiptStatus = async (id: string, status: OperationalStatus): Promise<void> => {
    try {
      await runTransaction(db, async (transaction) => {
        const ref = doc(collection(db, 'receipts'), id);
        const docSnap = await transaction.get(ref);
        if (!docSnap.exists()) {
          throw new Error("Receipt not found");
        }
        transaction.update(ref, { status });
      });
    } catch (err: any) {
      throw new Error(`Failed to update receipt: ${err.message}`);
    }
  };

  const validateReceipt = async (id: string): Promise<void> => {
    try {
      await runTransaction(db, async (transaction) => {
        const receiptRef = doc(collection(db, 'receipts'), id);
        const receiptSnap = await transaction.get(receiptRef);
        
        if (!receiptSnap.exists()) {
          throw new Error("Receipt not found");
        }
        
        const receipt = receiptSnap.data() as Receipt;
        
        if (receipt.status === 'DONE') {
          throw new Error("Receipt is already validated.");
        }

        // Increase inventory for each item
        for (const item of receipt.items) {
          // Find the product by SKU
          // Note: In a robust schema, we'd query by SKU, but transaction queries are tricky.
          // We will assume product doc ID === product.sku for atomic updates.
          const productRef = doc(collection(db, 'products'), item.sku);
          const productSnap = await transaction.get(productRef);
          
          if (!productSnap.exists()) {
            throw new Error(`Product ${item.sku} not found`);
          }
          
          const product = productSnap.data();
          const newQuantity = product.onHand + item.quantity;
          
          transaction.update(productRef, { onHand: newQuantity });
        }

        // Update receipt status
        transaction.update(receiptRef, { 
          status: 'DONE',
          clearanceStatus: 'CUSTOMS CLEARED // VALIDATED',
          completedAt: new Date().toISOString()
        });
        
        // Record ledger entry
        const ledgerRef = doc(collection(db, 'moves')); // Auto ID not easily supported in runTransaction without .id, we use a custom generated ID
        const ledgerId = `MOV-${Date.now()}`;
        const ledgerDocRef = doc(collection(db, 'moves'), ledgerId);
        
        transaction.set(ledgerDocRef, {
          id: ledgerId,
          reference: receipt.id,
          kind: 'inbound',
          from: receipt.vendor || 'SUPPLIER',
          to: receipt.toLocation || 'WH-A',
          status: 'DONE',
          timestampUtc: new Date().toISOString(),
          carrier: 'SYSTEM',
          carrierTag: 'AUTO-RECV'
        });
      });
    } catch (err: any) {
      throw new Error(`Failed to validate receipt: ${err.message}`);
    }
  };

  return { receipts, loading, error, addReceipt, updateReceiptStatus, validateReceipt };
};
