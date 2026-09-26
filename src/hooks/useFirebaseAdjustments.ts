import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, doc, runTransaction } from 'firebase/firestore';
import { StockAdjustmentItem } from '../types';

export const useFirebaseAdjustments = () => {
  const [adjustmentItems, setAdjustmentItems] = useState<StockAdjustmentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'adjustments'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const list: StockAdjustmentItem[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push(docSnap.data() as StockAdjustmentItem);
      });
      setAdjustmentItems(list);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching adjustments: ", err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const appendAdjustmentItem = async (item: StockAdjustmentItem): Promise<void> => {
    try {
      const safeId = item.id.replace(/\//g, '--');
      const ref = doc(collection(db, 'adjustments'), safeId);
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(ref);
        if (snap.exists()) {
          throw new Error("Adjustment already exists.");
        }
        transaction.set(ref, item);
      });
    } catch (err: any) {
      throw new Error(`Failed to append adjustment: ${err.message}`);
    }
  };

  const postAdjustmentRecord = async (notes: string): Promise<void> => {
    try {
      await runTransaction(db, async (transaction) => {
        // Find all pending adjustments (simplified, we just take all currently loaded items that differ)
        // In reality we should query a specific "pending" state.
        // For atomic updates, we will update the corresponding products.
        for (const adj of adjustmentItems) {
            if (adj.countedQuantity !== adj.systemQuantity) {
                const productRef = doc(collection(db, 'products'), adj.sku.replace(/\//g, '--'));
                const productSnap = await transaction.get(productRef);
                if (productSnap.exists()) {
                    transaction.update(productRef, { onHand: adj.countedQuantity });
                }
            }
        }
        
        // Ledger entry
        const ledgerId = `ADJ-${Date.now()}`;
        const ledgerDocRef = doc(collection(db, 'moves'), ledgerId);
        transaction.set(ledgerDocRef, {
          id: ledgerId,
          reference: 'PHYSICAL_INVENTORY',
          kind: 'internal',
          from: 'MULTIPLE',
          to: 'ADJUSTMENT',
          status: 'DONE',
          timestampUtc: new Date().toISOString(),
          carrier: 'SYSTEM',
          carrierTag: notes || 'AUTO-ADJ'
        });
      });
    } catch (err: any) {
      throw new Error(`Failed to post adjustment: ${err.message}`);
    }
  };

  const updateCountedQuantity = async (id: string, qty: number): Promise<void> => {
      try {
        const safeId = id.replace(/\//g, '--');
        const ref = doc(collection(db, 'adjustments'), safeId);
        await runTransaction(db, async (transaction) => {
            transaction.update(ref, { countedQuantity: qty });
        });
      } catch (err: any) {
          throw new Error(`Failed to update counted quantity: ${err.message}`);
      }
  }

  return { adjustmentItems, loading, error, appendAdjustmentItem, postAdjustmentRecord, updateCountedQuantity };
};
