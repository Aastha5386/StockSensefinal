import { apiAuth } from './api';
import { UserRole } from '../types';

export type { UserRole };

/**
 * Promotes or changes a user's role by calling the StockSense Express API.
 * Only authenticated administrators can execute this endpoint.
 */
export const changeUserRole = async (uid: string, role: UserRole): Promise<void> => {
  try {
    await apiAuth.updateUserRole(uid, role);
  } catch (error: any) {
    console.error('Failed to change user role:', error);
    throw error;
  }
};
