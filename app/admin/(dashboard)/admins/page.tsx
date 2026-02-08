'use client';

import { useState, useCallback } from 'react';
import { useCachedFetch } from '@/hooks/useAdminCache';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Plus,
  Search,
  Edit2,
  UserX,
  UserCheck,
  X,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';

interface AdminUser {
  id: number;
  userId: number;
  role: string;
  permissions: any;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
  };
}

const ROLES = ['super_admin', 'admin', 'moderator'] as const;

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  moderator: 'Moderator',
};

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-800',
  admin: 'bg-blue-100 text-blue-800',
  moderator: 'bg-gray-100 text-gray-800',
};

const PERMISSION_RESOURCES = [
  { key: 'users', label: 'Users', actions: ['read', 'create', 'update', 'delete', 'block'] },
  { key: 'packages', label: 'Packages', actions: ['read', 'create', 'update', 'delete', 'assign'] },
  { key: 'fees', label: 'Fees', actions: ['read', 'update'] },
  { key: 'specialItems', label: 'Special Items', actions: ['read', 'create', 'update', 'delete'] },
  { key: 'announcements', label: 'Announcements', actions: ['read', 'create', 'update', 'delete', 'publish'] },
  { key: 'analytics', label: 'Analytics', actions: ['read', 'export'] },
];

export default function AdminManagementPage() {
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<string>('admin');
  const [formPermissions, setFormPermissions] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAdmins = useCallback(async () => {
    const res = await fetch('/api/admin/admins');
    if (!res.ok) {
      if (res.status === 403) throw new Error('Access denied: super_admin only');
      throw new Error('Failed to fetch');
    }
    const data = await res.json();
    return data.admins as AdminUser[];
  }, []);

  const { data, loading, refreshing, refresh } = useCachedFetch<AdminUser[]>(
    'admin-admins',
    fetchAdmins,
  );

  const adminsList = data || [];

  const getDefaultPermissions = (role: string) => {
    const defaults: Record<string, any> = {
      super_admin: Object.fromEntries(
        PERMISSION_RESOURCES.map(r => [r.key, Object.fromEntries(r.actions.map(a => [a, true]))])
      ),
      admin: {
        users: { read: true, create: false, update: true, delete: false, block: false },
        packages: { read: true, create: true, update: true, delete: true, assign: true },
        fees: { read: true, update: false },
        specialItems: { read: true, create: true, update: true, delete: false },
        announcements: { read: true, create: true, update: true, delete: false, publish: false },
        analytics: { read: true, export: false },
      },
      moderator: {
        users: { read: true, create: false, update: false, delete: false, block: false },
        packages: { read: true, create: true, update: true, delete: false, assign: false },
        fees: { read: true, update: false },
        specialItems: { read: true, create: false, update: false, delete: false },
        announcements: { read: true, create: false, update: false, delete: false, publish: false },
        analytics: { read: true, export: false },
      },
    };
    return defaults[role] || defaults.admin;
  };

  const resetForm = () => {
    setFormEmail('');
    setFormPassword('');
    setFormFirstName('');
    setFormLastName('');
    setFormPhone('');
    setFormRole('admin');
    setFormPermissions(getDefaultPermissions('admin'));
    setShowPassword(false);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setFormRole(admin.role);
    setFormPermissions(admin.permissions || getDefaultPermissions(admin.role));
    setFormPassword('');
    setShowPassword(false);
    setShowEditModal(true);
  };

  const handleCreate = async () => {
    if (!formEmail || !formPassword) {
      showToast('Email and password are required', 'error');
      return;
    }
    if (formPassword.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formEmail,
          password: formPassword,
          firstName: formFirstName || undefined,
          lastName: formLastName || undefined,
          phone: formPhone || undefined,
          role: formRole,
          permissions: formPermissions,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to create admin', 'error');
        return;
      }

      showToast('Admin created successfully', 'success');
      setShowCreateModal(false);
      refresh();
    } catch (err) {
      showToast('Failed to create admin', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingAdmin) return;

    setSubmitting(true);
    try {
      const body: any = {
        id: editingAdmin.id,
        role: formRole,
        permissions: formPermissions,
      };
      if (formPassword) {
        if (formPassword.length < 8) {
          showToast('Password must be at least 8 characters', 'error');
          setSubmitting(false);
          return;
        }
        body.password = formPassword;
      }

      const res = await fetch('/api/admin/admins', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to update admin', 'error');
        return;
      }

      showToast('Admin updated successfully', 'success');
      setShowEditModal(false);
      setEditingAdmin(null);
      refresh();
    } catch (err) {
      showToast('Failed to update admin', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (admin: AdminUser) => {
    try {
      const res = await fetch('/api/admin/admins', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: admin.id,
          isActive: !admin.isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to update admin', 'error');
        return;
      }

      showToast(
        admin.isActive ? 'Admin deactivated' : 'Admin activated',
        'success'
      );
      refresh();
    } catch (err) {
      showToast('Failed to update admin', 'error');
    }
  };

  const togglePermission = (resource: string, action: string) => {
    setFormPermissions((prev: any) => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        [action]: !prev[resource]?.[action],
      },
    }));
  };

  const filteredAdmins = adminsList.filter((admin) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      admin.user?.email?.toLowerCase().includes(q) ||
      admin.user?.firstName?.toLowerCase().includes(q) ||
      admin.user?.lastName?.toLowerCase().includes(q) ||
      admin.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage administrator accounts and permissions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Admin
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search admins..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="theme-card rounded-2xl p-8 text-center text-gray-500">
          Loading...
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="theme-card rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {admin.user?.firstName} {admin.user?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{admin.user?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                          ROLE_COLORS[admin.role] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {ROLE_LABELS[admin.role] || admin.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                          admin.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {admin.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {admin.lastLoginAt
                        ? new Date(admin.lastLoginAt).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(admin)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(admin)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            admin.isActive
                              ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                          }`}
                          title={admin.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {admin.isActive ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAdmins.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No admins found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="theme-card rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Add New Admin</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="admin@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Min 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => {
                      setFormRole(e.target.value);
                      setFormPermissions(getDefaultPermissions(e.target.value));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Permissions Grid */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Resource</th>
                        {['read', 'create', 'update', 'delete', 'other'].map((a) => (
                          <th key={a} className="px-3 py-2 text-center font-medium text-gray-600 capitalize">
                            {a}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {PERMISSION_RESOURCES.map((res) => (
                        <tr key={res.key}>
                          <td className="px-3 py-2 font-medium text-gray-700">{res.label}</td>
                          {['read', 'create', 'update', 'delete'].map((action) => (
                            <td key={action} className="px-3 py-2 text-center">
                              {res.actions.includes(action) ? (
                                <input
                                  type="checkbox"
                                  checked={formPermissions[res.key]?.[action] || false}
                                  onChange={() => togglePermission(res.key, action)}
                                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                              ) : (
                                <span className="text-gray-300">-</span>
                              )}
                            </td>
                          ))}
                          <td className="px-3 py-2 text-center">
                            {res.actions.filter(a => !['read', 'create', 'update', 'delete'].includes(a)).map((action) => (
                              <label key={action} className="inline-flex items-center gap-1 text-xs">
                                <input
                                  type="checkbox"
                                  checked={formPermissions[res.key]?.[action] || false}
                                  onChange={() => togglePermission(res.key, action)}
                                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                {action}
                              </label>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Creating...' : 'Create Admin'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="theme-card rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                Edit Admin - {editingAdmin.user?.email}
              </h2>
              <button
                onClick={() => { setShowEditModal(false); setEditingAdmin(null); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => {
                      setFormRole(e.target.value);
                      setFormPermissions(getDefaultPermissions(e.target.value));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password (leave empty to keep current)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Min 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Permissions Grid */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Resource</th>
                        {['read', 'create', 'update', 'delete', 'other'].map((a) => (
                          <th key={a} className="px-3 py-2 text-center font-medium text-gray-600 capitalize">
                            {a}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {PERMISSION_RESOURCES.map((res) => (
                        <tr key={res.key}>
                          <td className="px-3 py-2 font-medium text-gray-700">{res.label}</td>
                          {['read', 'create', 'update', 'delete'].map((action) => (
                            <td key={action} className="px-3 py-2 text-center">
                              {res.actions.includes(action) ? (
                                <input
                                  type="checkbox"
                                  checked={formPermissions[res.key]?.[action] || false}
                                  onChange={() => togglePermission(res.key, action)}
                                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                              ) : (
                                <span className="text-gray-300">-</span>
                              )}
                            </td>
                          ))}
                          <td className="px-3 py-2 text-center">
                            {res.actions.filter(a => !['read', 'create', 'update', 'delete'].includes(a)).map((action) => (
                              <label key={action} className="inline-flex items-center gap-1 text-xs">
                                <input
                                  type="checkbox"
                                  checked={formPermissions[res.key]?.[action] || false}
                                  onChange={() => togglePermission(res.key, action)}
                                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                {action}
                              </label>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={() => { setShowEditModal(false); setEditingAdmin(null); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
