import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, setDoc, doc, runTransaction } from 'firebase/firestore';
import { Product } from '../types';

export const useFirebaseProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'products'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productsList: Product[] = [];
      querySnapshot.forEach((docSnap) => {
        productsList.push(docSnap.data() as Product);
      });
      setProducts(productsList);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching products: ", err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addProduct = async (product: Product): Promise<void> => {
    try {
      await runTransaction(db, async (transaction) => {
        // Enforce uniqueness
        const productRef = doc(collection(db, 'products'), product.id);
        const existingDoc = await transaction.get(productRef);
        if (existingDoc.exists()) {
          throw new Error("A product with this ID already exists.");
        }
        
        transaction.set(productRef, product);
      });
    } catch (err: any) {
      throw new Error(`Failed to add product: ${err.message}`);
    }
  };

  const updateProduct = async (sku: string, updatedProduct: Product): Promise<void> => {
    try {
      const productRef = doc(collection(db, 'products'), updatedProduct.id);
      await setDoc(productRef, updatedProduct, { merge: true });
    } catch (err: any) {
      throw new Error(`Failed to update product: ${err.message}`);
    }
  };

  return { products, loading, error, addProduct, updateProduct };
};
