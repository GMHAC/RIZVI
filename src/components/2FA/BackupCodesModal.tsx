import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { KeyRound, Copy, Check, Download, Printer, X, ShieldAlert } from 'lucide-react';
import { generateBackupCodes } from '../../utils/totp';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupCodesModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { currentUser, triggerStepUp2FA, addToast } = useAuth();
  const [codes, setCodes] = useState<string[]>(() => generateBackupCodes(8));
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyCodes = () => {
    navigator.clipboard.writeText(codes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    addToast('Codes Copied', 'Copied recovery codes to clipboard.', 'info');
  };

  const regenerateNewCodes = () => {
    triggerStepUp2FA('Regenerate Backup Recovery Codes', () => {
      const newCodes = generateBackupCodes(8);
      setCodes(newCodes);
      addToast('Backup Codes Regenerated', 'Old recovery codes have been invalidated.', 'warning');
    });
  };

  const downloadFile = () => {
    const text = `ACME CORP INTERNAL SETTINGS - BACKUP CODES\nAccount: ${currentUser?.email}\nDate: ${new Date().toISOString()}\n\nCodes:\n` + codes.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_codes_${currentUser?.email.split('@')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">2FA Emergency Recovery Codes</h3>
              <p className="text-xs text-slate-400">Account: {currentUser?.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-300">
            Each backup code can be used <strong className="text-slate-100">exactly once</strong> to log in if you lose access to your primary authenticator device.
          </p>

          <div className="grid grid-cols-2 gap-2.5 bg-slate-950 border border-slate-800 p-4 rounded-xl font-mono text-sm text-amber-300 text-center">
            {codes.map((code, idx) => (
              <div key={idx} className="bg-slate-900/90 border border-slate-800 py-2 px-3 rounded-lg shadow-sm">
                {code}
              </div>
            ))}
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-300 flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              If you suspect these codes have been compromised, click "Regenerate Codes" to instantly revoke all old codes and create a new set.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <button
            type="button"
            onClick={regenerateNewCodes}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-medium rounded-xl transition-colors"
          >
            Regenerate Codes
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={copyCodes}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors flex items-center space-x-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              type="button"
              onClick={downloadFile}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
