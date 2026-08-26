import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Key, 
  LogOut, 
  UserCheck, 
  Sparkles,
  Smartphone
} from 'lucide-react';

interface Props {
  onOpen2FASetup: () => void;
  onOpenBackupCodes: () => void;
}

export const Navbar: React.FC<Props> = ({ onOpen2FASetup, onOpenBackupCodes }) => {
  const { 
    currentUser, 
    effectiveRole, 
    logout, 
    users, 
    loginAsDemoUser,
    hasPermission 
  } = useAuth();

  return (
    <header className="h-16 border-b border-cyan-900/40 bg-[#080a0f] flex items-center justify-between px-4 sm:px-6 shrink-0 z-30 select-none shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
      {/* Brand & Protocol */}
      <div className="flex items-center space-x-3.5">
        <div className="w-9 h-9 bg-cyan-500 rounded flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.6)]">
          <div className="w-4 h-4 border-2 border-slate-950 rotate-45 font-bold"></div>
        </div>
        <div>
          <h1 className="text-xs font-bold tracking-widest uppercase text-cyan-400 flex items-center space-x-1.5">
            <span>RIZVI.RIZVIMANEGEMENT.APP</span>
            <span className="bg-cyan-950/80 border border-cyan-800/50 text-[9px] text-cyan-300 font-mono px-1.5 py-0.2 rounded">
              v4.2.1
            </span>
          </h1>
          <p className="text-[10px] text-cyan-700 font-mono tracking-tight hidden sm:block">
            PROTOCOL: AES-256-GCM / RIZVI FASHIONS ISO COMPLIANCE
          </p>
        </div>
      </div>

      {/* Center Status Indicators */}
      <div className="hidden lg:flex items-center space-x-6 text-xs">
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-wider text-slate-500">System Status</span>
          <span className="text-xs text-emerald-400 font-mono flex items-center">
            <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
            Operational
          </span>
        </div>

        <div className="w-px h-7 bg-slate-800"></div>

        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-wider text-slate-500">Network Latency</span>
          <span className="text-xs text-cyan-400 font-mono">0.04 ms</span>
        </div>

        <div className="w-px h-7 bg-slate-800"></div>

        {/* Impersonate User Quick Switcher */}
        <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800/80 rounded-xl px-3 py-1.5">
          <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-[10px] text-slate-400 uppercase font-mono">Test User:</span>
          <select
            value={currentUser?.id}
            onChange={(e) => loginAsDemoUser(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-cyan-200 font-medium rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.employeeCardNo || u.roleId})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right User Bar */}
      <div className="flex items-center space-x-3">
        {/* Active Role Badge */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[140px]">
            {currentUser?.name}
          </span>
          <span className={`px-2 py-0.2 rounded text-[9px] font-mono border font-bold ${effectiveRole.badgeBg}`}>
            {effectiveRole.badgeText}
          </span>
        </div>

        {/* Avatar */}
        <div className="relative">
          <img
            src={currentUser?.avatarUrl}
            alt={currentUser?.name}
            className="w-8 h-8 rounded-lg object-cover ring-1 ring-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
          />
          {currentUser?.twoFactorEnabled && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950" title="2FA Protected"></div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
          title="Sign Out Session"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
