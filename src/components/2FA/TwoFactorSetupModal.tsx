import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TwoFactorMethod } from '../../types';
import { 
  generateBase32Secret, 
  buildOtpAuthUri, 
  generateQrCodeDataUrl, 
  calculateTotpCode, 
  verifyTotpCode 
} from '../../utils/totp';
import { 
  ShieldCheck, 
  QrCode, 
  Smartphone, 
  Mail, 
  Copy, 
  Check, 
  Download, 
  ArrowRight, 
  X,
  KeyRound,
  AlertTriangle
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const TwoFactorSetupModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { currentUser, enable2FA, addToast } = useAuth();
  
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [method, setMethod] = useState<TwoFactorMethod>('totp');
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [userCode, setUserCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [liveDevCode, setLiveDevCode] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      const newSecret = generateBase32Secret(16);
      setSecret(newSecret);
      setUserCode('');
      setErrorMsg('');
      setCopiedSecret(false);
      setCopiedCodes(false);
    }
  }, [isOpen]);

  // Generate QR Code when method or secret changes
  useEffect(() => {
    if (secret && currentUser) {
      const otpAuthUri = buildOtpAuthUri(currentUser.email, 'Acme Corp Internal', secret);
      generateQrCodeDataUrl(otpAuthUri).then((url) => setQrCodeUrl(url));
      
      const live = calculateTotpCode(secret);
      setLiveDevCode(live);
    }
  }, [secret, currentUser]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, isCodes = false) => {
    navigator.clipboard.writeText(text);
    if (isCodes) {
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2500);
    } else {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2500);
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userCode || userCode.trim().length < 6) {
      setErrorMsg('Please enter a 6-digit verification code.');
      return;
    }

    const isValid = verifyTotpCode(secret, userCode);
    if (!isValid) {
      setErrorMsg('Invalid verification code. Enter "123456" or the live TOTP code.');
      return;
    }

    // Successfully verified! Save 2FA settings and proceed to backup codes step
    const { backupCodes: generatedCodes } = enable2FA(method, secret);
    setBackupCodes(generatedCodes);
    setStep(4);
  };

  const downloadBackupCodes = () => {
    const text = `ACME CORP INTERNAL SETTINGS - RECOVERY BACKUP CODES\nAccount: ${currentUser?.email}\nGenerated: ${new Date().toISOString()}\n\nKeep these codes in a secure offline location. Each code can be used once.\n\n` + backupCodes.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_codes_${currentUser?.email.split('@')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Backup Codes Downloaded', 'Saved to text file.', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Setup Two-Factor Authentication</h3>
              <p className="text-xs text-slate-400">Step {step} of 4 — Enhance Account Security</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* STEP 1: Choose Method */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-300">
                Select your preferred Two-Factor Authentication method to safeguard your internal staff account.
              </p>

              <div className="grid grid-cols-1 gap-3">
                {/* Method 1: Authenticator App */}
                <button
                  onClick={() => setMethod('totp')}
                  className={`p-4 rounded-xl border text-left flex items-start space-x-4 transition-all ${
                    method === 'totp'
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-slate-100 ring-1 ring-emerald-500/30'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className={`p-3 rounded-lg ${method === 'totp' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-slate-100">Authenticator App (TOTP)</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium">Recommended</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Use Google Authenticator, Authy, or 1Password to generate time-based 6-digit passcodes.
                    </p>
                  </div>
                </button>

                {/* Method 2: SMS OTP */}
                <button
                  onClick={() => setMethod('sms')}
                  className={`p-4 rounded-xl border text-left flex items-start space-x-4 transition-all ${
                    method === 'sms'
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-slate-100 ring-1 ring-emerald-500/30'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className={`p-3 rounded-lg ${method === 'sms' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-sm text-slate-100">SMS Text Message</span>
                    <p className="text-xs text-slate-400 mt-1">
                      Receive security codes via SMS to <strong className="text-slate-300">{currentUser?.phone || '+1 (555) 234-5678'}</strong>.
                    </p>
                  </div>
                </button>

                {/* Method 3: Email OTP */}
                <button
                  onClick={() => setMethod('email')}
                  className={`p-4 rounded-xl border text-left flex items-start space-x-4 transition-all ${
                    method === 'email'
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-slate-100 ring-1 ring-emerald-500/30'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className={`p-3 rounded-lg ${method === 'email' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-sm text-slate-100">Email Verification</span>
                    <p className="text-xs text-slate-400 mt-1">
                      Send instant single-use OTP codes to <strong className="text-slate-300">{currentUser?.email}</strong>.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Scan QR Code or View Instructions */}
          {step === 2 && (
            <div className="space-y-5">
              {method === 'totp' ? (
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* QR Code */}
                  <div className="bg-white p-3 rounded-2xl shadow-lg border border-slate-200 shrink-0">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="2FA QR Code" className="w-44 h-44 rounded-lg" />
                    ) : (
                      <div className="w-44 h-44 bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                        Generating QR...
                      </div>
                    )}
                  </div>

                  {/* Manual Key */}
                  <div className="space-y-3 flex-1 text-xs">
                    <p className="text-slate-300">
                      1. Open your authenticator app (Google Authenticator, Authy, or 1Password).
                    </p>
                    <p className="text-slate-300">
                      2. Scan the QR code or enter this secret key manually:
                    </p>

                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between font-mono text-sm text-emerald-400">
                      <span>{secret}</span>
                      <button
                        onClick={() => copyToClipboard(secret)}
                        className="p-1.5 text-slate-400 hover:text-emerald-400 transition-colors"
                        title="Copy Secret"
                      >
                        {copiedSecret ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-lg text-slate-400">
                      💡 <strong className="text-slate-300">Test Helper:</strong> Live TOTP Code right now is <code className="text-emerald-400 font-mono font-bold bg-slate-900 px-1.5 py-0.5 rounded">{liveDevCode}</code>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    {method === 'sms' ? <Smartphone className="w-6 h-6" /> : <Mail className="w-6 h-6" />}
                  </div>
                  <h4 className="text-base font-bold text-slate-100">
                    Verification Code Sent
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    We sent a 6-digit confirmation security code to{' '}
                    <strong className="text-slate-200">
                      {method === 'sms' ? currentUser?.phone || '+1 (555) 234-5678' : currentUser?.email}
                    </strong>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Enter 6-digit verification code */}
          {step === 3 && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="text-center space-y-1">
                <h4 className="text-base font-bold text-slate-100">Verify 6-Digit Code</h4>
                <p className="text-xs text-slate-400">
                  Enter the code generated by your {method === 'totp' ? 'Authenticator app' : method.toUpperCase()} to complete activation.
                </p>
              </div>

              <div className="max-w-xs mx-auto">
                <input
                  type="text"
                  maxLength={6}
                  value={userCode}
                  onChange={(e) => {
                    setUserCode(e.target.value.replace(/\D/g, ''));
                    setErrorMsg('');
                  }}
                  placeholder="000000"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-3xl font-mono tracking-widest text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-slate-700"
                  autoFocus
                />
                {errorMsg && (
                  <p className="text-xs text-rose-400 text-center font-medium mt-2">{errorMsg}</p>
                )}
              </div>

              {/* Dev Shortcut */}
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs text-slate-400">
                <span>Dev Quick-Fill:</span>
                <button
                  type="button"
                  onClick={() => setUserCode(liveDevCode)}
                  className="text-emerald-400 hover:underline font-mono font-bold"
                >
                  Use Live Code ({liveDevCode})
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Backup Recovery Codes */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 flex items-center space-x-3 text-emerald-400">
                <ShieldCheck className="w-6 h-6 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-slate-100">2FA Protection Activated!</h4>
                  <p className="text-xs text-emerald-300/80">
                    Your internal staff account is now protected with Two-Factor Authentication.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>Emergency Recovery Backup Codes</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(backupCodes.join('\n'), true)}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1"
                  >
                    {copiedCodes ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCodes ? 'Copied' : 'Copy All'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-950 border border-slate-800 p-4 rounded-xl font-mono text-sm text-amber-300/90 text-center">
                  {backupCodes.map((code, idx) => (
                    <div key={idx} className="bg-slate-900/80 py-1.5 px-3 rounded border border-slate-800/80">
                      {code}
                    </div>
                  ))}
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 text-[11px] text-amber-300 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <span>
                    Store these backup codes in a safe offline location. If you lose your primary 2FA device, you can use any of these single-use codes to access your account.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
          {step > 1 && step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors"
            >
              Back
            </button>
          ) : (
            <div></div>
          )}

          {step === 1 && (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="ml-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-xl transition-colors flex items-center space-x-2 shadow-lg shadow-emerald-500/20"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(3)}
              className="ml-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-xl transition-colors flex items-center space-x-2 shadow-lg shadow-emerald-500/20"
            >
              <span>Next: Enter Code</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 3 && (
            <button
              type="button"
              onClick={handleVerifyCode}
              className="ml-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-xl transition-colors flex items-center space-x-2 shadow-lg shadow-emerald-500/20"
            >
              <span>Verify & Activate</span>
            </button>
          )}

          {step === 4 && (
            <div className="flex items-center space-x-3 ml-auto">
              <button
                type="button"
                onClick={downloadBackupCodes}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Codes</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
