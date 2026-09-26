import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { changeUserRole, UserRole } from '../../lib/auth';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface UserData {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
}

export const AdminUsersView: React.FC = () => {
  const { userRole, showToast } = useApp();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userRole === 'admin') {
      const fetchUsers = async () => {
        try {
          const snapshot = await getDocs(collection(db, 'users'));
          const usersList = snapshot.docs.map(doc => {
            const data = doc.data();
            const name = `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Unknown';
            return {
              uid: doc.id,
              name,
              email: data.email || 'Unknown',
              role: (data.role as UserRole) || 'warehouse_staff'
            };
          });
          setUsers(usersList);
        } catch (e) {
          console.error("Failed to fetch users", e);
          showToast("FAILED TO FETCH USERS");
        } finally {
          setLoading(false);
        }
      };
      fetchUsers();
    }
  }, [userRole]);

  if (userRole !== 'admin') {
    return (
      <div className="p-8 text-center text-error">
        <h2 className="font-headline-lg">Permission Denied</h2>
        <p>You must be an admin to view this page.</p>
      </div>
    );
  }

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    try {
      showToast(`UPDATING ROLE TO ${newRole}...`);
      await changeUserRole(uid, newRole);
      setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole } : u));
      showToast(`SUCCESSFULLY ASSIGNED ${newRole}`);
      // Token refresh is typically done on the target user's client,
      // but if an admin changes their own role, we could refresh it here.
    } catch (err: any) {
      showToast(`FAILED: ${err.message}`);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!window.confirm("Are you sure you want to delete this user profile?")) return;
    try {
      showToast("DELETING USER PROFILE...");
      await deleteDoc(doc(db, 'users', uid));
      setUsers(users.filter(u => u.uid !== uid));
      showToast("USER PROFILE DELETED");
    } catch (err: any) {
      showToast(`FAILED TO DELETE: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-[1400px] mx-auto py-8 px-4 sm:px-6">
      <header className="mb-8">
        <h1 className="font-headline-lg text-on-surface">User Management</h1>
        <p className="text-secondary font-body-md mt-1">Admin control panel for Role-Based Access.</p>
      </header>

      <div className="bg-surface-low border border-rule rounded flex flex-col p-4">
        {loading ? (
          <div className="p-4 text-secondary text-center">Loading users...</div>
        ) : (
          <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-rule">
              <th className="py-2 px-4 font-label-md text-secondary">User ID</th>
              <th className="py-2 px-4 font-label-md text-secondary">Name</th>
              <th className="py-2 px-4 font-label-md text-secondary">Email / Phone</th>
              <th className="py-2 px-4 font-label-md text-secondary">Role</th>
              <th className="py-2 px-4 font-label-md text-secondary text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.uid} className="border-b border-rule hover:bg-surface-lowest">
                <td className="py-3 px-4 font-body-sm text-secondary font-mono text-[11px]">{u.uid}</td>
                <td className="py-3 px-4 font-body-sm font-semibold">{u.name}</td>
                <td className="py-3 px-4 font-body-sm">{u.email}</td>
                <td className="py-3 px-4">
                  <select
                    className="bg-surface border border-rule px-2 py-1 text-sm rounded outline-none cursor-pointer"
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                  >
                    <option value="admin">Admin</option>
                    <option value="inventory_manager">Inventory Manager</option>
                    <option value="warehouse_staff">Warehouse Staff</option>
                  </select>
                </td>
                <td className="py-3 px-4 text-right">
                  <button 
                    onClick={() => handleDeleteUser(u.uid)}
                    className="p-1.5 text-error hover:bg-error/10 rounded transition-colors"
                    title="Delete User Profile"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
};
