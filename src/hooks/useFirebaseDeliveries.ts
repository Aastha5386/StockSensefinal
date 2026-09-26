import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, doc, runTransaction } from 'firebase/firestore';
import { OutboundDelivery } from '../types';

export const useFirebaseDeliveries = () => {
  const [deliveries, setDeliveries] = useState<OutboundDelivery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'deliveries'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const list: OutboundDelivery[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push(docSnap.data() as OutboundDelivery);
      });
      setDeliveries(list);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching deliveries: ", err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const validateDelivery = async (id: string): Promise<void> => {
    try {
      await runTransaction(db, async (transaction) => {
        const deliveryRef = doc(collection(db, 'deliveries'), id);
        const deliverySnap = await transaction.get(deliveryRef);
        
        if (!deliverySnap.exists()) {
          throw new Error("Delivery not found");
        }
        
        const delivery = deliverySnap.data() as OutboundDelivery;
        
        if (delivery.status === 'DONE') {
          throw new Error("Delivery is already validated.");
        }

        // Decrease inventory for each item
        for (const item of delivery.items) {
          const docId = item.sku.replace(/\//g, '--');
          const productRef = doc(collection(db, 'products'), docId);
          const productSnap = await transaction.get(productRef);
          
          if (!productSnap.exists()) {
            throw new Error(`Product ${item.sku} not found`);
          }
          
          const product = productSnap.data();
          const newQuantity = product.onHand - item.quantity;

          if (newQuantity < 0) {
            throw new Error(`Insufficient stock for ${item.sku}. Available: ${product.onHand}, Required: ${item.quantity}`);
          }
          
          transaction.update(productRef, { onHand: newQuantity });
        }

        // Update delivery status
        transaction.update(deliveryRef, { 
          status: 'DONE',
          completedAt: new Date().toISOString()
        });
        
        // Record ledger entry
        const ledgerId = `MOV-${Date.now()}`;
        const ledgerDocRef = doc(collection(db, 'moves'), ledgerId);
        
        transaction.set(ledgerDocRef, {
          id: ledgerId,
          reference: delivery.id,
          kind: 'outbound',
          from: 'WH-A',
          to: 'CUSTOMER',
          status: 'DONE',
          timestampUtc: new Date().toISOString(),
          carrier: 'SYSTEM',
          carrierTag: 'AUTO-DELIV'
        });
      });
    } catch (err: any) {
      throw new Error(`Failed to validate delivery: ${err.message}`);
    }
  };

  const toggleDeliveryChecklist = async (id: string, field: 'pick' | 'pack'): Promise<void> => {
      try {
        await runTransaction(db, async (transaction) => {
          const ref = doc(collection(db, 'deliveries'), id);
          const snap = await transaction.get(ref);
          if (!snap.exists()) throw new Error("Delivery not found");
          
          const data = snap.data();
          transaction.update(ref, {
              checklist: {
                  ...data.checklist,
                  [field]: !data.checklist[field]
              }
          });
        });
      } catch (err: any) {
          throw new Error(`Failed to update checklist: ${err.message}`);
      }
  };

  return { deliveries, loading, error, validateDelivery, toggleDeliveryChecklist };
};
