import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  KeyRound, 
  Globe, 
  Smartphone, 
  AlertTriangle,
  LockKeyhole,
  Laptop,
  XCircle,
  Clock
} from 'lucide-react';

interface Props {
  onOpen2FASetup: () => void;
  onOpenBackupCodes: () => void;
}

export const SecuritySettingsView: React.FC<Props> = ({ onOpen2FASetup, onOpenBackupCodes }) => {
  const { 
    currentUser, 
    settings, 
    updateSettingValue, 
    sessions, 
    revokeSession, 
    disable2FA,
    hasPermission
  } = useAuth();

  const isSecurityAllowed = hasPermission('settings:read_security');
  const isSecurityEditAllowed = hasPermission('settings:edit_security');

  if (!isSecurityAllowed) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 max-w-lg mx-auto my-12 shadow-2xl">
        <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
          <LockKeyhole className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-100">Access Restricted by RBAC</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Your current active role does not possess the <code className="text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono">settings:read_security</code> permission required to view or modify security policies.
        </p>
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400">
          💡 Switch your active RBAC role in the top header bar to <strong>Super Admin</strong> or <strong>Security Officer</strong> to test this view.
        </div>
      </div>
    );
  }

  const enforce2FaSetting = settings.find((s) => s.key === 'enforce_2fa_policy');
  const sessionTtlSetting = settings.find((s) => s.key === 'session_timeout_minutes');
  const ipWhitelistSetting = settings.find((s) => s.key === 'ip_whitelist_enabled');
  const passLengthSetting = settings.find((s) => s.key === 'password_min_length');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <span>Security & Two-Factor Authentication Policies</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Enforce authentication standards, session timeouts, and IP access constraints across all staff accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal 2FA Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 h-fit">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl border ${currentUser?.twoFactorEnabled ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Personal 2FA Status</h3>
              <p className="text-xs text-slate-400">Account: {currentUser?.email}</p>
            </div>
          </div>

          {currentUser?.twoFactorEnabled ? (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs space-y-1">
                <div className="font-bold text-emerald-300 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Two-Factor Protection Enabled</span>
                </div>
                <p className="text-slate-300">
                  Method: <strong className="text-emerald-400 uppercase">{currentUser.twoFactorMethod}</strong>
                </p>
                <p className="text-slate-400">
                  Backup Codes Remaining: <strong className="text-amber-300">{currentUser.backupCodesLeft}</strong>
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={onOpenBackupCodes}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center space-x-2"
                >
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>View Emergency Backup Codes</span>
                </button>

                <button
                  onClick={disable2FA}
                  className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold rounded-xl transition-colors"
                >
                  Disable 2FA Protection
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs space-y-1 text-amber-300">
                <div className="font-bold flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>2FA Not Configured</span>
                </div>
                <p className="text-slate-300">
                  Your account is relying solely on password authentication. Activate 2FA now to protect system controls.
                </p>
              </div>

              <button
                onClick={onOpen2FASetup}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Configure 2FA Protection</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: System Security Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Policy Enforcements */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-3 flex items-center space-x-2">
              <Lock className="w-4 h-4 text-indigo-400" />
              <span>System-Wide Authentication Constraints</span>
            </h3>

            {/* Setting 1: Mandatory 2FA */}
            {enforce2FaSetting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-200 block">
                      {enforce2FaSetting.title}
                    </label>
                    <p className="text-[11px] text-slate-400">{enforce2FaSetting.description}</p>
                  </div>
                  <span className="text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded font-mono">
                    Requires 2FA Step-Up
                  </span>
                </div>

                <select
                  value={enforce2FaSetting.value}
                  disabled={!isSecurityEditAllowed}
                  onChange={(e) => updateSettingValue(enforce2FaSetting.id, e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  {enforce2FaSetting.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Setting 2: Session Timeout */}
            {sessionTtlSetting && (
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-200 block flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                      <span>{sessionTtlSetting.title}</span>
                    </label>
                    <p className="text-[11px] text-slate-400">{sessionTtlSetting.description}</p>
                  </div>
                </div>

                <select
                  value={sessionTtlSetting.value}
                  disabled={!isSecurityEditAllowed}
                  onChange={(e) => updateSettingValue(sessionTtlSetting.id, Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  {sessionTtlSetting.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Setting 3: IP Whitelist Toggle */}
            {ipWhitelistSetting && (
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-200 block flex items-center space-x-1.5">
                      <Globe className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{ipWhitelistSetting.title}</span>
                    </label>
                    <p className="text-[11px] text-slate-400">{ipWhitelistSetting.description}</p>
                  </div>

                  <button
                    onClick={() => updateSettingValue(ipWhitelistSetting.id, !ipWhitelistSetting.value)}
                    disabled={!isSecurityEditAllowed}
                    className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all ${
                      ipWhitelistSetting.value
                        ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {ipWhitelistSetting.value ? 'Whitelisting Enabled' : 'Whitelisting Disabled'}
                  </button>
                </div>
              </div>
            )}

            {/* Setting 4: Password Length */}
            {passLengthSetting && (
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-200 block">
                      {passLengthSetting.title}
                    </label>
                    <p className="text-[11px] text-slate-400">{passLengthSetting.description}</p>
                  </div>

                  <input
                    type="number"
                    min={8}
                    max={32}
                    value={passLengthSetting.value}
                    disabled={!isSecurityEditAllowed}
                    onChange={(e) => updateSettingValue(passLengthSetting.id, Number(e.target.value))}
                    className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-center text-slate-100"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Active Sessions Management */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                  <Laptop className="w-4 h-4 text-sky-400" />
                  <span>Active Device Sessions ({sessions.length})</span>
                </h3>
                <p className="text-xs text-slate-400">View logged in browsers and terminate untrusted sessions.</p>
              </div>
            </div>

            <div className="space-y-3">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-200">{sess.deviceName}</span>
                      {sess.isCurrent && (
                        <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono px-1.5 rounded">
                          Current Device
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-[11px]">{sess.browser} • {sess.location}</p>
                    <p className="text-slate-500 font-mono text-[10px]">IP: {sess.ipAddress} • Last Active: {sess.lastActive}</p>
                  </div>

                  {!sess.isCurrent && (
                    <button
                      onClick={() => revokeSession(sess.id)}
                      className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Revoke</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
