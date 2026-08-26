import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Permission } from '../types';
import { 
  LockKeyhole, 
  Check, 
  X, 
  ShieldCheck, 
  Sparkles,
  Layers
} from 'lucide-react';

export const RolesPermissionsView: React.FC = () => {
  const { roles, effectiveRoleId, switchEffectiveRole } = useAuth();

  const allPermissions: { key: Permission; label: string; category: string }[] = [
    { key: 'settings:read_general', label: 'View General Portal Settings', category: 'General' },
    { key: 'settings:edit_general', label: 'Modify General Settings', category: 'General' },
    { key: 'settings:read_security', label: 'View Security & 2FA Policies', category: 'Security' },
    { key: 'settings:edit_security', label: 'Modify Security Policies & Session TTL', category: 'Security' },
    { key: 'settings:enforce_2fa', label: 'Configure Mandatory 2FA Enforcement', category: 'Security' },
    { key: 'settings:read_api', label: 'View API Tokens & Webhooks', category: 'API Keys' },
    { key: 'settings:rotate_api_keys', label: 'Generate & Rotate API Key Secrets', category: 'API Keys' },
    { key: 'settings:read_database', label: 'View Database & Infra Config', category: 'Infrastructure' },
    { key: 'settings:edit_database', label: 'Modify DB Connection Pool & Backups', category: 'Infrastructure' },
    { key: 'users:view', label: 'View Staff Roster & 2FA Status', category: 'User Management' },
    { key: 'users:create', label: 'Provision New Staff Accounts', category: 'User Management' },
    { key: 'users:manage_roles', label: 'Reassign User RBAC Roles', category: 'User Management' },
    { key: 'users:reset_2fa', label: 'Force Reset User 2FA Credentials', category: 'User Management' },
    { key: 'audit:view_logs', label: 'View System Audit Trail Logs', category: 'Audit' },
    { key: 'audit:export_logs', label: 'Export Audit Logs (CSV)', category: 'Audit' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <LockKeyhole className="w-5 h-5 text-indigo-400" />
            <span>Role-Based Access Control (RBAC) Matrix</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            System capability matrix comparing access rights across defined corporate staff roles.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-300 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Click any role column header to test system under that role!</span>
        </div>
      </div>

      {/* Roles Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {roles.map((role) => {
          const isSelected = role.id === effectiveRoleId;
          return (
            <div
              key={role.id}
              onClick={() => switchEffectiveRole(role.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                isSelected
                  ? 'bg-gradient-to-br from-indigo-500/15 to-slate-900 border-indigo-500/60 ring-1 ring-indigo-500/30 shadow-xl'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${role.badgeBg}`}>
                  {role.name}
                </span>
                {isSelected && (
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-mono font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <Layers className="w-3 h-3" />
                    <span>ACTIVE TEST ROLE</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">{role.description}</p>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>{role.permissions.length} Permissions Active</span>
                <span className="text-indigo-400 hover:underline">Impersonate →</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Permission Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 border-b border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-4 min-w-[260px]">System Capability Scope</th>
                {roles.map((role) => (
                  <th
                    key={role.id}
                    onClick={() => switchEffectiveRole(role.id)}
                    className="px-4 py-4 text-center cursor-pointer hover:bg-slate-900/80 transition-colors"
                  >
                    <div className="font-bold text-slate-200">{role.badgeText}</div>
                    <div className="text-[9px] font-normal text-slate-500 mt-0.5">
                      {role.permissions.length}/15 Perms
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {allPermissions.map((perm) => (
                <tr key={perm.key} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-slate-200">{perm.label}</div>
                    <code className="text-[10px] text-indigo-400 font-mono">{perm.key}</code>
                  </td>

                  {roles.map((role) => {
                    const hasPerm = role.permissions.includes(perm.key);
                    const isSelectedRole = role.id === effectiveRoleId;

                    return (
                      <td
                        key={role.id}
                        className={`px-4 py-3.5 text-center ${isSelectedRole ? 'bg-indigo-500/5' : ''}`}
                      >
                        {hasPerm ? (
                          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-lg bg-slate-950 border border-slate-800 text-slate-600 flex items-center justify-center mx-auto opacity-50">
                            <X className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
