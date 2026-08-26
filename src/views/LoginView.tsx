import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { calculateTotpCode } from '../utils/totp';
import { 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  AlertCircle,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  Building2,
  Phone,
  CreditCard,
  User,
  Undo2,
  Check,
  ShieldAlert
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { 
    loginWithEmail, 
    complete2FAChallenge, 
    requires2FAChallenge, 
    pendingLoginUser,
    loginAsDemoUser,
    createNewUser,
    updateUserPassword,
    users,
    roles
  } = useAuth();

  // Authentication mode: 'signin' | 'signup' | 'forgot'
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');

  // Sign In States
  const [loginIdentifier, setLoginIdentifier] = useState('complianceapt@gmail.com');
  const [password, setPassword] = useState('RizviCompliance2026!');
  const [totpCode, setTotpCode] = useState('');
  const [isBackupCode, setIsBackupCode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sign Up States
  const [signupName, setSignupName] = useState('');
  const [signupCardNo, setSignupCardNo] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupDepartment, setSignupDepartment] = useState('General Floor');
  const [signupDesignation, setSignupDesignation] = useState('Staff Operator');

  // Forgot Password States
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [generatedCode, setGeneratedCode] = useState('');
  const [verificationInput, setVerificationInput] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');

  const handlePrimaryLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      const res = loginWithEmail(loginIdentifier, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMsg(res.message || 'Login failed. Please check credentials.');
      }
    }, 400);
  };

  const handle2FAChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      const res = complete2FAChallenge(totpCode, isBackupCode);
      setIsLoading(false);
      if (!res.success) {
        setErrorMsg(res.message || 'Verification failed. Try entering "123456" for dev mode.');
      }
    }, 400);
  };

  const fillLiveTotp = () => {
    const secret = pendingLoginUser?.twoFactorSecret || 'JBSWY3DPEHPK3PXP';
    const live = calculateTotpCode(secret);
    setTotpCode(live);
    setErrorMsg('');
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (signupPassword !== signupConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (signupPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    const exists = users.find(
      (u) => 
        u.email.toLowerCase() === signupEmail.trim().toLowerCase() ||
        (u.employeeCardNo && u.employeeCardNo.toLowerCase() === signupCardNo.trim().toLowerCase())
    );

    if (exists) {
      setErrorMsg('User with this Card ID or Email already exists.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      // Create user
      createNewUser({
        name: signupName,
        employeeCardNo: signupCardNo,
        email: signupEmail,
        phone: signupPhone,
        department: signupDepartment,
        designation: signupDesignation,
        roleId: 'employee', // default registered role
      });

      setIsLoading(false);
      setLoginIdentifier(signupEmail);
      setPassword(signupPassword);
      setAuthMode('signin');
      setSignupName('');
      setSignupCardNo('');
      setSignupEmail('');
      setSignupPhone('');
      setSignupPassword('');
      setSignupConfirmPassword('');
    }, 600);
  };

  const handleForgotStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const user = users.find(
      (u) => 
        u.email.toLowerCase() === forgotIdentifier.trim().toLowerCase() ||
        (u.employeeCardNo && u.employeeCardNo.toLowerCase() === forgotIdentifier.trim().toLowerCase())
    );

    if (!user) {
      setErrorMsg('Employee account not found. Please verify Card ID or Email.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      // Mock generated verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      setForgotStep(2);
      setIsLoading(false);
    }, 500);
  };

  const handleForgotStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationInput === generatedCode || verificationInput === '123456') {
      setForgotStep(3);
      setErrorMsg('');
    } else {
      setErrorMsg('Invalid verification code. Enter "123456" for dev bypass.');
    }
  };

  const handleForgotStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotNewPassword !== forgotConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (forgotNewPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      updateUserPassword(forgotIdentifier, forgotNewPassword);
      setIsLoading(false);
      setLoginIdentifier(forgotIdentifier);
      setPassword(forgotNewPassword);
      setAuthMode('signin');
      setForgotIdentifier('');
      setForgotStep(1);
      setForgotNewPassword('');
      setForgotConfirmPassword('');
      setVerificationInput('');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#050608] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden select-none font-sans antialiased">
      {/* Background High-Tech Grid & Lighting */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20"></div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 via-indigo-500 to-emerald-500 p-0.5 mx-auto shadow-[0_0_30px_rgba(6,182,212,0.3)]">
            <div className="w-full h-full bg-[#080a0f] rounded-[14px] flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-bold uppercase tracking-widest">
              RIZVI FASHIONS & BUYER COMPLIANCE PORTAL
            </span>
            <h1 className="text-2xl font-black tracking-tight text-slate-100 mt-1">RIZVI ERP SECURE GATE</h1>
          </div>
        </div>

        {/* Dynamic Auth Card */}
        <div className="bg-[#0a0d14]/95 border border-cyan-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500/0 via-cyan-400 to-cyan-500/0"></div>

          {/* MODE 1: SIGN IN */}
          {authMode === 'signin' && (
            <div className="space-y-4">
              {!requires2FAChallenge ? (
                /* Primary Credentials Login Form */
                <form onSubmit={handlePrimaryLogin} className="space-y-4">
                  <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-slate-100">Staff Account Entry</h2>
                      <p className="text-[11px] text-slate-400">Card ID / Phone Number / Master Email</p>
                    </div>
                    <Lock className="w-4 h-4 text-cyan-400" />
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      ID Card No / Mobile Phone / Master Email
                    </label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-cyan-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all font-mono"
                        placeholder="EMP-1003 / 01700000001 / complianceapt@gmail.com"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        Password (পাসওয়ার্ড)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('forgot');
                          setErrorMsg('');
                        }}
                        className="text-[11px] text-amber-400 hover:underline font-medium"
                      >
                        পাসওয়ার্ড ভুলে গেছেন?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all font-mono"
                        placeholder="••••••••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>প্রবেশ করুন (Dashboard Access)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <span className="text-xs text-slate-400">নতুন স্টাফ অ্যাকাউন্ট? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signup');
                        setErrorMsg('');
                      }}
                      className="text-xs text-cyan-400 hover:underline font-bold"
                    >
                      নিবন্ধন বা সাইন-আপ করুন (Sign Up Now)
                    </button>
                  </div>
                </form>
              ) : (
                /* Authenticator 2FA passcode required */
                <form onSubmit={handle2FAChallenge} className="space-y-5 animate-in fade-in duration-200">
                  <div className="bg-cyan-950/40 border border-cyan-500/40 rounded-2xl p-4 flex items-center space-x-3 text-cyan-300">
                    <Smartphone className="w-6 h-6 shrink-0 text-cyan-400" />
                    <div className="text-xs">
                      <span className="font-bold block text-slate-100">2FA Passcode Required</span>
                      Account <strong className="text-cyan-300">{pendingLoginUser?.name}</strong> is protected with 2FA Security.
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-300">
                        {isBackupCode ? 'Emergency Recovery Code' : '6-Digit TOTP Passcode'}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsBackupCode(!isBackupCode);
                          setTotpCode('');
                          setErrorMsg('');
                        }}
                        className="text-[11px] text-amber-400 hover:underline font-medium"
                      >
                        {isBackupCode ? 'Use Authenticator Code' : 'Use Backup Recovery Code'}
                      </button>
                    </div>

                    <input
                      type="text"
                      maxLength={isBackupCode ? 10 : 6}
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value)}
                      placeholder={isBackupCode ? '4B29-8A11' : '000000'}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all placeholder:text-slate-700"
                      autoFocus
                    />
                  </div>

                  {!isBackupCode && (
                    <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs text-slate-400">
                      <span>Dev Test Auto-Fill:</span>
                      <button
                        type="button"
                        onClick={fillLiveTotp}
                        className="text-emerald-400 hover:underline font-mono font-bold flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Fill Live TOTP Code</span>
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(52,211,153,0.4)] flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>যাচাই করে প্রবেশ করুন (Verify & Enter)</span>
                    )}
                  </button>
                </form>
              )}

              {/* Demo test logins footer */}
              {!requires2FAChallenge && (
                <div className="pt-4 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>1-Click Test Logins</span>
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono">Master Accounts</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
                    {users.slice(0, 3).map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => loginAsDemoUser(u.id)}
                        className="p-2 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-left transition-all flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-200">{u.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                            {u.employeeCardNo || u.id} • {u.department}
                          </div>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono border font-bold ${
                          u.roleId === 'admin' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' :
                          'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}>
                          {u.roleId === 'admin' ? 'Admin' : 'Staff'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODE 2: SIGN UP / REGISTRATION */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-100">স্টাফ সাইন-আপ (Staff Registration)</h2>
                  <p className="text-[11px] text-slate-400">Create a new secure employee workspace portal account</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className="p-1 bg-slate-950 border border-slate-800 rounded-lg text-cyan-400 hover:bg-slate-900 flex items-center space-x-1"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold px-1">Sign In</span>
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">পূর্ণ নাম (Staff Full Name)</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="Md. Saifullah"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">কার্ড আইডি নম্বর (Employee Card ID)</label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={signupCardNo}
                      onChange={(e) => setSignupCardNo(e.target.value)}
                      placeholder="EMP-1025"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">মোবাইল ফোন (Mobile Phone)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="01711223344"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">মাস্টার ইমেইল (Master Email)</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="saif@rizvifashions.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">ডিপার্টমেন্ট (Department)</label>
                  <select
                    value={signupDepartment}
                    onChange={(e) => setSignupDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  >
                    <option>General Floor</option>
                    <option>Sewing Production</option>
                    <option>Quality Assurance</option>
                    <option>Cutting Room</option>
                    <option>IT & Infrastructure</option>
                    <option>HR & Compliance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">পদবী (Designation)</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={signupDesignation}
                      onChange={(e) => setSignupDesignation(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">পাসওয়ার্ড (Password)</label>
                  <input
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">পাসওয়ার্ড নিশ্চিত করুন</label>
                  <input
                    type="password"
                    required
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)] flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>অ্যাকাউন্ট তৈরি করুন (Create Account)</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 3: FORGOT PASSWORD */}
          {authMode === 'forgot' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-100">পাসওয়ার্ড পুনরুদ্ধার (Password Reset)</h2>
                  <p className="text-[11px] text-slate-400">Secure simulated password reset sequence</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setForgotStep(1);
                    setErrorMsg('');
                  }}
                  className="p-1 bg-slate-950 border border-slate-800 rounded-lg text-cyan-400 hover:bg-slate-900 flex items-center space-x-1"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold px-1">Cancel</span>
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* FORGOT STEP 1: Find Account */}
              {forgotStep === 1 && (
                <form onSubmit={handleForgotStep1} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      আপনার কার্ড আইডি নম্বর বা ইমেইল লিখুন
                    </label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-cyan-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        placeholder="EMP-1003 / complianceapt@gmail.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center space-x-1"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>অ্যাকাউন্ট খুঁজুন (Find Account)</span>
                    )}
                  </button>
                </form>
              )}

              {/* FORGOT STEP 2: Verification Code */}
              {forgotStep === 2 && (
                <form onSubmit={handleForgotStep2} className="space-y-4">
                  <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-xs space-y-2">
                    <p className="text-slate-300 font-medium">নিরাপত্তা কোড প্রেরণ করা হয়েছে!</p>
                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      সিমুলেটেড কোড: <strong className="text-cyan-300 font-mono">{generatedCode}</strong> বা আপনি সাধারণ ডিভ বাইপাস কোড <strong className="text-amber-400 font-mono">123456</strong> ব্যবহার করতে পারেন।
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      ৬-ডিজিটের ভেরিফিকেশন কোড (Verification Code)
                    </label>
                    <input
                      type="text"
                      required
                      value={verificationInput}
                      onChange={(e) => setVerificationInput(e.target.value)}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest text-slate-100 focus:outline-none placeholder:text-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(52,211,153,0.3)] flex items-center justify-center space-x-1"
                  >
                    <span>কোড যাচাই করুন (Verify Code)</span>
                  </button>
                </form>
              )}

              {/* FORGOT STEP 3: Enter New Password */}
              {forgotStep === 3 && (
                <form onSubmit={handleForgotStep3} className="space-y-4">
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs flex items-center space-x-2 text-emerald-300">
                    <Check className="w-4 h-4" />
                    <span>ভেরিফিকেশন সফল! নতুন পাসওয়ার্ড দিন।</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">নতুন পাসওয়ার্ড (New Password)</label>
                    <input
                      type="password"
                      required
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">পাসওয়ার্ডটি নিশ্চিত করুন</label>
                    <input
                      type="password"
                      required
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center justify-center space-x-1"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>পাসওয়ার্ড আপডেট করুন (Update Password)</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-center text-slate-500 font-mono">
          Strict Compliance Standards Enforced • ISO 9001 Certified Enterprise Portal
        </p>
      </div>
    </div>
  );
};
