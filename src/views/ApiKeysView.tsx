import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Key, 
  Plus, 
  Lock, 
  Copy, 
  Check, 
  Trash2, 
  X,
  Code
} from 'lucide-react';

export const ApiKeysView: React.FC = () => {
  const { 
    apiKeys, 
    createApiKey, 
    revokeApiKey, 
    hasPermission 
  } = useAuth();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [environment, setEnvironment] = useState<'production' | 'staging' | 'development'>('production');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['payments:read', 'webhooks:write']);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const isReadAllowed = hasPermission('settings:read_api');
  const isRotateAllowed = hasPermission('settings:rotate_api_keys');

  if (!isReadAllowed) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 max-w-lg mx-auto my-12 shadow-2xl">
        <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-100">Access Restricted by RBAC</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Your active role does not possess the <code className="text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono">settings:read_api</code> permission required to view or rotate API secret tokens.
        </p>
      </div>
    );
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName) return;

    createApiKey(keyName, environment, selectedScopes);
    setKeyName('');
    setShowCreateModal(false);
  };

  const copyKey = (id: string, prefix: string) => {
    navigator.clipboard.writeText(`${prefix}_SECRET_KEY_FULL_TOKEN`);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2500);
  };

  const availableScopes = [
    'payments:read',
    'webhooks:write',
    'users:read',
    'audit:read',
    'infrastructure:write',
  ];

  const toggleScope = (scope: string) => {
    if (selectedScopes.includes(scope)) {
      setSelectedScopes(selectedScopes.filter((s) => s !== scope));
    } else {
      setSelectedScopes([...selectedScopes, scope]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Key className="w-5 h-5 text-amber-400" />
            <span>API Secret Tokens & Webhooks</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage programmatic API credentials for external services. Production key changes require 2FA Step-Up authorization.
          </p>
        </div>

        {isRotateAllowed && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center space-x-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New API Secret Key</span>
          </button>
        )}
      </div>

      {/* Keys List */}
      <div className="space-y-3">
        {apiKeys.map((key) => {
          const envBadges = {
            production: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
            staging: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
            development: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
          };

          return (
            <div
              key={key.id}
              className={`bg-slate-900 border rounded-2xl p-5 space-y-3 transition-all ${
                key.isRevoked ? 'border-slate-800/60 opacity-60' : 'border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-bold text-sm text-slate-100">{key.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border font-bold uppercase ${envBadges[key.environment]}`}>
                      {key.environment}
                    </span>
                    {key.isRevoked && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 font-bold">
                        REVOKED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">Created by {key.createdBy} on {key.createdAt}</p>
                </div>

                {!key.isRevoked && isRotateAllowed && (
                  <button
                    onClick={() => revokeApiKey(key.id)}
                    className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold rounded-xl transition-colors flex items-center space-x-1.5 self-start sm:self-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Revoke Key (2FA Step-Up)</span>
                  </button>
                )}
              </div>

              {/* Key Secret Prefix Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between font-mono text-xs">
                <div className="flex items-center space-x-2 text-amber-300">
                  <Code className="w-4 h-4 text-slate-500" />
                  <span>{key.keyPrefix}••••••••••••••••</span>
                </div>

                <button
                  onClick={() => copyKey(key.id, key.keyPrefix)}
                  className="text-slate-400 hover:text-amber-400 flex items-center space-x-1 transition-colors"
                >
                  {copiedKeyId === key.id ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span>{copiedKeyId === key.id ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Scopes */}
              <div className="flex items-center justify-between text-[11px] pt-1">
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                  <span className="text-slate-500 font-semibold">Scopes:</span>
                  {key.scopes.map((sc, i) => (
                    <span key={i} className="bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                      {sc}
                    </span>
                  ))}
                </div>
                <span className="text-slate-500">Last used: {key.lastUsedAt}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span>Generate API Secret Token</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Key Description / Purpose</label>
                <input
                  type="text"
                  required
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="e.g. Stripe Payment Sync Worker"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Target Environment</label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="production">Production (Requires Step-Up 2FA)</option>
                  <option value="staging">Staging Sandbox</option>
                  <option value="development">Local Development</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Granted Token Scopes</label>
                <div className="space-y-1.5 bg-slate-950 border border-slate-800 p-3 rounded-xl">
                  {availableScopes.map((scope) => (
                    <label key={scope} className="flex items-center space-x-2 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={selectedScopes.includes(scope)}
                        onChange={() => toggleScope(scope)}
                        className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
                      />
                      <span className="font-mono text-[11px]">{scope}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20"
                >
                  Generate Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
