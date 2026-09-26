import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export type UserRole = 'admin' | 'inventory_manager' | 'warehouse_staff';

/**
 * Promotes or changes a user's role by updating their Firestore document.
 * This will only succeed if the caller's own Firestore document has role: 'admin',
 * as enforced by firestore.rules.
 */
export const changeUserRole = async (uid: string, role: UserRole): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { role });
  } catch (error: any) {
    console.error('Failed to change user role:', error);
    throw error;
  }
};
