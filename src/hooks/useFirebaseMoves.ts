import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, doc, runTransaction } from 'firebase/firestore';
import { MoveRecord, OperationalStatus } from '../types';

export const useFirebaseMoves = () => {
  const [moveRecords, setMoveRecords] = useState<MoveRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'moves'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const list: MoveRecord[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push(docSnap.data() as MoveRecord);
      });
      setMoveRecords(list);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching moves: ", err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addMoveRecord = async (record: MoveRecord): Promise<void> => {
    try {
      const safeId = record.reference.replace(/\//g, '--');
      const ref = doc(collection(db, 'moves'), safeId);
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(ref);
        if (snap.exists()) {
          throw new Error("Move Record already exists.");
        }
        transaction.set(ref, record);
      });
    } catch (err: any) {
      throw new Error(`Failed to add move record: ${err.message}`);
    }
  };

  return { moveRecords, loading, error, addMoveRecord };
};
