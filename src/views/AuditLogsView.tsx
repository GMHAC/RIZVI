import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  Download, 
  Search, 
  Lock, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs, exportAuditLogs, hasPermission, roles } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const isViewAllowed = hasPermission('audit:view_logs');
  const isExportAllowed = hasPermission('audit:export_logs');

  if (!isViewAllowed) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 max-w-lg mx-auto my-12 shadow-2xl">
        <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-100">Access Restricted by RBAC</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Your active role does not possess the <code className="text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono">audit:view_logs</code> permission required to inspect security audit trail logs.
        </p>
      </div>
    );
  }

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.includes(searchQuery);
    
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-sky-400" />
            <span>System Audit Trail & Compliance Logs</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable log of all administrative setting modifications, 2FA challenges, and RBAC permission checks.
          </p>
        </div>

        {isExportAllowed && (
          <button
            onClick={exportAuditLogs}
            className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-sky-500/20 flex items-center space-x-2 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Export Audit Trail (CSV)</span>
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by actor, action, details, or IP address..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
          />
        </div>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
        >
          <option value="all">All Severities</option>
          <option value="info">Info Events</option>
          <option value="warning">Warning Events</option>
          <option value="danger">Security Alerts (Danger)</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 border-b border-slate-800 text-[10px] uppercase font-mono tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Actor & Role</th>
                <th className="px-5 py-3.5">Action Event</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">IP Address</th>
                <th className="px-5 py-3.5">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLogs.map((log) => {
                const roleObj = roles.find((r) => r.id === log.roleId);

                const severityBadges = {
                  info: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
                  warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
                  danger: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
                };

                return (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-200">{log.actorName}</div>
                      <div className="text-[10px] text-slate-500">{log.actorEmail}</div>
                      <span className={`inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono border ${roleObj?.badgeBg}`}>
                        {roleObj?.badgeText}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border font-bold uppercase ${severityBadges[log.severity]}`}>
                        {log.action}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      {log.status === 'success' ? (
                        <span className="text-emerald-400 font-mono text-[11px] font-semibold flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>SUCCESS</span>
                        </span>
                      ) : (
                        <span className="text-rose-400 font-mono text-[11px] font-semibold flex items-center space-x-1">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>DENIED</span>
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400">{log.ipAddress}</td>

                    <td className="px-5 py-3.5 text-slate-300 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
