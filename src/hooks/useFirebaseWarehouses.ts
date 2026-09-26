import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, doc, runTransaction } from 'firebase/firestore';
import { WarehouseSite, SubLocationZone } from '../types';

export const useFirebaseWarehouses = () => {
  const [warehouses, setWarehouses] = useState<WarehouseSite[]>([]);
  const [sublocations, setSublocations] = useState<SubLocationZone[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let pending = 2;
    let localError: string | null = null;
    
    const wq = query(collection(db, 'warehouses'));
    const wUnsub = onSnapshot(wq, (snapshot) => {
      const list: WarehouseSite[] = [];
      snapshot.forEach(docSnap => list.push(docSnap.data() as WarehouseSite));
      setWarehouses(list);
      pending--;
      if (pending === 0 && !localError) setLoading(false);
    }, (err) => {
      localError = err.message;
      setError(err.message);
      setLoading(false);
    });

    const sq = query(collection(db, 'sublocations'));
    const sUnsub = onSnapshot(sq, (snapshot) => {
      const list: SubLocationZone[] = [];
      snapshot.forEach(docSnap => list.push(docSnap.data() as SubLocationZone));
      setSublocations(list);
      pending--;
      if (pending === 0 && !localError) setLoading(false);
    }, (err) => {
      localError = err.message;
      setError(err.message);
      setLoading(false);
    });

    return () => {
      wUnsub();
      sUnsub();
    };
  }, []);

  return { warehouses, sublocations, loading, error };
};
