import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ActiveTab, Permission } from '../types';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Award, 
  Users, 
  MapPin, 
  MessageSquareWarning, 
  LockKeyhole, 
  ShieldCheck, 
  Key, 
  Server, 
  FileText, 
  Settings,
  Lock,
  User
} from 'lucide-react';

interface Props {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const { hasPermission, effectiveRole, currentUser } = useAuth();

  const coreItems: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    requiredPermission?: Permission;
    badge?: string;
  }[] = [
    {
      id: 'overview',
      label: 'Home Dashboard (Graphics)',
      icon: <LayoutDashboard className="w-4 h-4 text-cyan-400" />,
    },
    {
      id: 'tasks',
      label: 'দৈনিক কাজের তালিকা (Schedule)',
      icon: <CheckSquare className="w-4 h-4 text-emerald-400" />,
      requiredPermission: 'tasks:view_own',
    },
    {
      id: 'evaluations',
      label: '100 Marks KPI Evaluation',
      icon: <Award className="w-4 h-4 text-amber-400" />,
      requiredPermission: 'evaluations:view_own',
    },
    {
      id: 'employees',
      label: 'Master Employees List',
      icon: <Users className="w-4 h-4 text-indigo-400" />,
      requiredPermission: 'users:view',
    },
    {
      id: 'feedback',
      label: 'অভিযোগ ও পরামর্শ (Grievance)',
      icon: <MessageSquareWarning className="w-4 h-4 text-rose-400" />,
      requiredPermission: 'feedback:submit',
    },
    {
      id: 'location_tracker',
      label: 'লাইভ লোকেশন ট্র্যাকিং',
      icon: <MapPin className="w-4 h-4 text-sky-400" />,
      requiredPermission: 'location:track',
    },
  ];

  const userItems: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    requiredPermission?: Permission;
    badge?: string;
  }[] = [
    {
      id: 'my_profile',
      label: 'You (My Profile & Settings)',
      icon: <User className="w-4 h-4 text-cyan-400" />,
    }
  ];

  const adminItems: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    requiredPermission?: Permission;
    badge?: string;
  }[] = [
    {
      id: 'admin_settings',
      label: 'Master Admin Settings',
      icon: <Settings className="w-4 h-4 text-rose-400" />,
      requiredPermission: 'settings:edit_general',
    },
    {
      id: 'roles',
      label: 'RBAC Access Matrix',
      icon: <LockKeyhole className="w-4 h-4 text-purple-400" />,
    },
    {
      id: 'security',
      label: 'Security & 2FA Policies',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
      requiredPermission: 'settings:read_security',
    },
    {
      id: 'api_keys',
      label: 'API Keys & Webhooks',
      icon: <Key className="w-4 h-4 text-amber-400" />,
      requiredPermission: 'settings:read_api',
    },
    {
      id: 'infrastructure',
      label: 'Database & Infra Config',
      icon: <Server className="w-4 h-4 text-blue-400" />,
      requiredPermission: 'settings:read_database',
    },
    {
      id: 'audit_logs',
      label: 'System Audit Trail Logs',
      icon: <FileText className="w-4 h-4 text-teal-400" />,
      requiredPermission: 'audit:view_logs',
    },
  ];

  const renderNavGroup = (items: typeof coreItems) => {
    return items.map((item) => {
      const isActive = activeTab === item.id;
      const isAllowed = !item.requiredPermission || hasPermission(item.requiredPermission);

      return (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            isActive
              ? 'bg-cyan-950/50 border border-cyan-500/40 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
              : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border border-transparent'
          }`}
        >
          <div className="flex items-center space-x-2.5 min-w-0">
            <span className="shrink-0">{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            {!isAllowed && (
              <Lock className="w-3.5 h-3.5 text-slate-600" title="Locked by RBAC permission" />
            )}
            {item.badge && isAllowed && (
              <span className="text-[9px] bg-cyan-900/40 text-cyan-300 font-mono px-1.5 py-0.5 rounded border border-cyan-800/50">
                {item.badge}
              </span>
            )}
          </div>
        </button>
      );
    });
  };

  return (
    <aside className="w-full md:w-64 bg-[#080a0f]/90 border-r border-cyan-900/30 shrink-0 p-4 space-y-6 select-none">
      {/* User Card */}
      <div className="bg-[#0a0d14] border border-cyan-900/30 rounded-xl p-3.5 space-y-2 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-500/0 via-cyan-400/80 to-cyan-500/0"></div>
        <div className="flex items-center space-x-3">
          <img
            src={currentUser?.avatarUrl}
            alt={currentUser?.name}
            className="w-9 h-9 rounded-lg object-cover ring-1 ring-cyan-500/30"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-100 truncate">{currentUser?.name}</h4>
            <p className="text-[10px] text-cyan-400/80 truncate font-mono">
              ID: {currentUser?.employeeCardNo || currentUser?.id}
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="text-slate-500">Department:</span>
          <span className="text-slate-300 font-medium truncate max-w-[120px]" title={currentUser?.department}>
            {currentUser?.department}
          </span>
        </div>
      </div>

      {/* Group 1: Core Operations */}
      <div className="space-y-1">
        <p className="text-[10px] uppercase font-mono tracking-widest text-cyan-600 px-3 pb-1.5 font-bold">
          Core Operations
        </p>
        {renderNavGroup(coreItems)}
      </div>

      {/* Group 2: You Settings */}
      <div className="space-y-1">
        <p className="text-[10px] uppercase font-mono tracking-widest text-emerald-500 px-3 pb-1.5 font-bold">
          You (My Account)
        </p>
        {renderNavGroup(userItems)}
      </div>

      {/* Group 3: Apps Admin Settings */}
      <div className="space-y-1">
        <p className="text-[10px] uppercase font-mono tracking-widest text-rose-500 px-3 pb-1.5 font-bold">
          Apps Admin Control
        </p>
        {renderNavGroup(adminItems)}
      </div>

      {/* RBAC Capabilities Box */}
      <div className="bg-[#0a0d14] border border-cyan-900/20 rounded-xl p-3 space-y-1.5 text-xs">
        <div className="flex items-center justify-between text-slate-300">
          <span className="text-[10px] uppercase font-mono text-slate-400">Active Role</span>
          <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono border ${effectiveRole.badgeBg}`}>
            {effectiveRole.badgeText}
          </span>
        </div>
        <p className="text-[10px] text-slate-500 leading-tight">
          {effectiveRole.permissions.length} active System Permissions out of 23 defined.
        </p>
      </div>
    </aside>
  );
};
