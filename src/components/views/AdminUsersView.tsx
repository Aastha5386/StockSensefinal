import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiAuth } from '../../lib/api';
import { UserRole } from '../../types';
import {
  ShieldCheck,
  Briefcase,
  HardHat,
  Users,
  RefreshCw,
  Trash2,
  Loader2,
  Lock,
} from 'lucide-react';

interface UserData {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  operatorId?: string;
  dept?: string;
}

export const AdminUsersView: React.FC = () => {
  const { userRole, showToast } = useApp();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiAuth.getUsers();
      if (res.success && res.users) {
        const usersList = res.users.map((u: any) => ({
          uid: u._id || u.id,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
          email: u.email,
          role: (u.role as UserRole) || 'warehouse_staff',
          operatorId: u.operatorId,
          dept: u.dept,
        }));
        setUsers(usersList);
      }
    } catch (e: any) {
      console.error('Failed to fetch users', e);
      showToast(`FAILED TO FETCH USERS: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === 'admin') {
      fetchUsers();
    }
  }, [userRole]);

  if (userRole !== 'admin') {
    return (
      <div className="p-12 text-center text-rose-500 max-w-md mx-auto my-12 bg-white dark:bg-slate-800 rounded-2xl border border-rose-200 dark:border-rose-900 shadow-sm">
        <Lock className="w-10 h-10 mx-auto text-rose-500 mb-2" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Access Restricted</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Administrator privileges are required to configure user role policies.
        </p>
      </div>
    );
  }

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    try {
      showToast(`UPDATING PERMISSION POLICY TO ${newRole}...`);
      await apiAuth.updateUserRole(uid, newRole);
      setUsers(users.map((u) => (u.uid === uid ? { ...u, role: newRole } : u)));
      showToast(`SUCCESSFULLY ASSIGNED ROLE: ${newRole.toUpperCase()}`);
    } catch (err: any) {
      showToast(`FAILED: ${err.message}`);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!window.confirm('Revoke access and purge this operator profile from MongoDB?')) return;
    try {
      showToast('PURGING OPERATOR CREDENTIAL...');
      await apiAuth.deleteUser(uid);
      setUsers(users.filter((u) => u.uid !== uid));
      showToast('OPERATOR RECORD DELETED FROM REGISTRY');
    } catch (err: any) {
      showToast(`FAILED TO DELETE: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-[1400px] mx-auto py-7 px-4 sm:px-8 space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-end">
        <button
          onClick={fetchUsers}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Role Definitions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs border-l-4 border-l-purple-500">
          <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Administrator</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Full root privileges: user management, catalog deletions, financial valuations, and database controls.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs border-l-4 border-l-blue-500">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span>Inventory Manager</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Operational leadership: products, suppliers, PO requisitions, outbound shipments, and AI forecasting.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs border-l-4 border-l-slate-400">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider mb-1">
            <HardHat className="w-4 h-4 text-slate-500" />
            <span>Warehouse Staff</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Floor execution: barcode scanning, pick/pack verification, stock checks, and transit logging.
          </p>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700/70 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Active Registered Operators ({users.length})
          </h2>
          <span className="text-xs text-slate-400 font-mono">ENFORCING JWT + RBAC</span>
        </div>

        {loading ? (
          <div className="p-12 text-slate-400 text-center flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-xs">Querying MongoDB User Directory...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/60 dark:bg-slate-900/40 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-5">Operator ID</th>
                  <th className="py-3 px-4">Operator Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u.uid} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                      {u.operatorId || u.uid.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      {u.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-semibold rounded-lg outline-none cursor-pointer focus:border-blue-500 text-slate-800 dark:text-slate-200"
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                      >
                        <option value="admin">Admin</option>
                        <option value="inventory_manager">Inventory Manager</option>
                        <option value="warehouse_staff">Warehouse Staff</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleDeleteUser(u.uid)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Purge Operator Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
