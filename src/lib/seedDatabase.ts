import { db } from './firebase';
import { doc, writeBatch, collection } from 'firebase/firestore';
import { 
  initialProducts, 
  initialReceipts, 
  initialDelivery, 
  initialMoveRecords, 
  initialAdjustmentItems,
  initialWarehouses,
  initialSubLocations
} from '../data/initialData';

const sanitizeId = (id: string) => id.replace(/\//g, '--');

export const seedDatabase = async () => {
  try {
    const batch = writeBatch(db);

    // Products
    initialProducts.forEach(product => {
      const ref = doc(collection(db, 'products'), sanitizeId(product.sku));
      batch.set(ref, product);
    });

    // Receipts
    initialReceipts.forEach(receipt => {
      const ref = doc(collection(db, 'receipts'), sanitizeId(receipt.id));
      batch.set(ref, receipt);
    });

    // Deliveries
    if (initialDelivery) {
      const ref = doc(collection(db, 'deliveries'), sanitizeId(initialDelivery.id));
      batch.set(ref, initialDelivery);
    }

    // Move Records (Internal Transfers / Ledger)
    initialMoveRecords.forEach(move => {
      const ref = doc(collection(db, 'moves'), sanitizeId(move.reference));
      batch.set(ref, move);
    });

    // Adjustments
    initialAdjustmentItems.forEach(adj => {
      const ref = doc(collection(db, 'adjustments'), sanitizeId(adj.id));
      batch.set(ref, adj);
    });

    // Warehouses
    initialWarehouses.forEach(wh => {
      const ref = doc(collection(db, 'warehouses'), sanitizeId(wh.code));
      batch.set(ref, wh);
    });

    // SubLocations
    initialSubLocations.forEach(sub => {
      const ref = doc(collection(db, 'sublocations'), sanitizeId(sub.code));
      batch.set(ref, sub);
    });

    await batch.commit();
    console.log("Database successfully seeded!");
    return true;
  } catch (error) {
    console.error("Error seeding database: ", error);
    return false;
  }
};
