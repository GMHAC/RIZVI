import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, KeyRound, CheckCircle2, X } from 'lucide-react';
import { calculateTotpCode } from '../utils/totp';

export const StepUpModal: React.FC = () => {
  const { stepUpChallenge, confirmStepUp2FA, cancelStepUp2FA, currentUser } = useAuth();
  const [code, setCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!stepUpChallenge) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.trim().length < 6) {
      setErrorMsg('Please enter a 6-digit verification code.');
      return;
    }

    const success = confirmStepUp2FA(code.trim());
    if (!success) {
      setErrorMsg('Invalid code. Try entering "123456" for dev verification.');
    }
  };

  const fillDevCode = () => {
    const secret = currentUser?.twoFactorSecret || 'JBSWY3DPEHPK3PXP';
    const liveCode = calculateTotpCode(secret);
    setCode(liveCode);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Step-Up 2FA Verification</h3>
              <p className="text-xs text-slate-400">Privileged Action Authorization</p>
            </div>
          </div>
          <button
            onClick={cancelStepUp2FA}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 text-xs text-amber-300 flex items-start space-x-2.5">
            <KeyRound className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-amber-200 mb-0.5">Authorization Required</span>
              You are modifying: <strong className="text-amber-100">{stepUpChallenge.actionName}</strong>. Please enter your 6-digit Authenticator TOTP code to authorize this change.
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Authenticator 2FA Code
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, ''));
                  setErrorMsg('');
                }}
                placeholder="000000"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:text-slate-600"
                autoFocus
              />
            </div>
            {errorMsg && (
              <p className="text-xs text-rose-400 font-medium mt-2 flex items-center space-x-1">
                <span>{errorMsg}</span>
              </p>
            )}
          </div>

          {/* Dev Mode Live Helper */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs">
            <span className="text-slate-400">Dev Helper (Test Mode):</span>
            <button
              type="button"
              onClick={fillDevCode}
              className="text-amber-400 hover:text-amber-300 font-mono font-medium underline underline-offset-2 flex items-center space-x-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Fill Live TOTP Code</span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={cancelStepUp2FA}
              className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-bold rounded-xl transition-colors shadow-lg shadow-amber-500/20"
            >
              Authorize Action
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
