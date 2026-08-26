import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Server, 
  Database, 
  HardDrive, 
  Lock, 
  RefreshCw, 
  CheckCircle2, 
  Cpu
} from 'lucide-react';

export const InfrastructureView: React.FC = () => {
  const { settings, updateSettingValue, hasPermission, addToast, triggerStepUp2FA } = useAuth();

  const isReadAllowed = hasPermission('settings:read_database');
  const isEditAllowed = hasPermission('settings:edit_database');

  if (!isReadAllowed) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 max-w-lg mx-auto my-12 shadow-2xl">
        <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-100">Access Restricted by RBAC</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Your active role does not possess the <code className="text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono">settings:read_database</code> permission required to view or alter infrastructure configurations.
        </p>
      </div>
    );
  }

  const poolSetting = settings.find((s) => s.key === 'db_max_connections');
  const backupSetting = settings.find((s) => s.key === 'database_backup_schedule');

  const purgeRedisCache = () => {
    triggerStepUp2FA('Purge Redis Cache Cluster', () => {
      addToast('Redis Cache Purged', 'Flushed 14,280 keys across production cache nodes.', 'success');
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
          <Server className="w-5 h-5 text-amber-400" />
          <span>Infrastructure & Database Configuration</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Internal PostgreSQL cluster connection pools, automated backup vaults, and Redis memory cache status.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Pool Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">PostgreSQL Primary Cluster</h3>
              <p className="text-xs text-slate-400">AWS Aurora Multi-AZ Replica</p>
            </div>
          </div>

          {poolSetting && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 block">
                {poolSetting.title}
              </label>
              <p className="text-[11px] text-slate-400">{poolSetting.description}</p>
              <input
                type="number"
                value={poolSetting.value}
                disabled={!isEditAllowed}
                onChange={(e) => updateSettingValue(poolSetting.id, Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          )}

          {backupSetting && (
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <label className="text-xs font-bold text-slate-200 block">
                {backupSetting.title}
              </label>
              <p className="text-[11px] text-slate-400">{backupSetting.description}</p>
              <select
                value={backupSetting.value}
                disabled={!isEditAllowed}
                onChange={(e) => updateSettingValue(backupSetting.id, e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                {backupSetting.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Redis Cache Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Redis Cache Memory Cluster</h3>
              <p className="text-xs text-slate-400">Cluster Mode Enabled (6 Shards)</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span>Memory Utilization</span>
              <span className="font-mono text-emerald-400 font-bold">4.2 GB / 16.0 GB (26%)</span>
            </div>

            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div className="bg-emerald-500 h-full w-[26%]"></div>
            </div>

            <div className="pt-3">
              <button
                onClick={purgeRedisCache}
                disabled={!isEditAllowed}
                className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Purge Redis Cache (2FA Step-Up Required)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
