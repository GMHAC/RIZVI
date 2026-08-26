import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Smartphone, 
  ShieldCheck, 
  KeyRound, 
  Mail, 
  Phone, 
  UserSquare2, 
  Building2, 
  Briefcase, 
  Fingerprint, 
  Lock, 
  Save, 
  RefreshCw,
  Award,
  BookOpen
} from 'lucide-react';

export const MyProfileView: React.FC = () => {
  const { currentUser, users, roles, effectiveRole, addToast } = useAuth();
  
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [avatar, setAvatar] = useState(currentUser?.avatarUrl || '');
  const [curPassword, setCurPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    
    setTimeout(() => {
      setIsSavingProfile(false);
      addToast('Profile Updated', 'Your profile details have been saved successfully.', 'success');
    }, 600);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!curPassword) {
      addToast('Verification Required', 'Please enter your current password.', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('Match Error', 'New passwords do not match.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      addToast('Security Requirement', 'New password must be at least 6 characters long.', 'warning');
      return;
    }

    setIsChangingPass(true);
    setTimeout(() => {
      setIsChangingPass(false);
      setCurPassword('');
      setNewPassword('');
      setConfirmPassword('');
      addToast('Password Changed', 'Your account password has been updated securely.', 'success');
    }, 700);
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 select-none">
      {/* Top Welcome Card */}
      <div className="bg-[#0a0d14] border border-cyan-500/20 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-center gap-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
        <div className="relative group">
          <img
            src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
            alt={currentUser.name}
            className="w-20 h-20 rounded-2xl object-cover ring-2 ring-cyan-500/30 group-hover:ring-cyan-400 transition-all shadow-md"
          />
          <span className="absolute -bottom-1 -right-1 bg-cyan-500 text-slate-950 p-1 rounded-lg text-[10px] font-bold shadow-md">
            ACTIVE
          </span>
        </div>

        <div className="text-center md:text-left space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h2 className="text-xl font-bold text-slate-100">{currentUser.name}</h2>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${effectiveRole.badgeBg}`}>
              {effectiveRole.badgeText}
            </span>
          </div>
          <p className="text-xs text-cyan-400 font-mono">
            Employee Card No: {currentUser.employeeCardNo || currentUser.id}
          </p>
          <p className="text-xs text-slate-400">
            Registered Email: <span className="font-mono text-slate-300">{currentUser.email}</span>
          </p>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-center md:text-left shrink-0">
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Security Identity</div>
          <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-1 justify-center md:justify-start">
            <Fingerprint className="w-3.5 h-3.5" />
            <span>2FA {currentUser.twoFactorEnabled ? 'PROTECTED' : 'DEACTIVATED'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal details form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0a0d14] border border-cyan-900/30 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-2.5">
              <UserSquare2 className="w-4 h-4 text-cyan-400" />
              <span>আমার প্রোফাইল বিবরণী (Personal Profile Details)</span>
            </h3>

            <form onSubmit={handleProfileSave} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">পূর্ণ নাম (Full Name)</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 focus:outline-none rounded-xl px-3 py-2 text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">মোবাইল নম্বর (Phone / Mobile)</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 focus:outline-none rounded-xl pl-9 pr-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">ডিপার্টমেন্ট (Department)</label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    disabled
                    value={currentUser.department}
                    className="w-full bg-slate-950 border border-slate-850 text-slate-400 rounded-xl pl-9 pr-3 py-2 cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">পদবী (Designation)</label>
                <div className="relative">
                  <Briefcase className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    disabled
                    value={currentUser.designation || 'Staff Operator'}
                    className="w-full bg-slate-950 border border-slate-850 text-slate-400 rounded-xl pl-9 pr-3 py-2 cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">প্রোফাইল ছবি লিংক (Avatar Image URL)</label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 focus:outline-none rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div className="md:col-span-2 pt-2 text-right">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center space-x-2 ml-auto"
                >
                  {isSavingProfile ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>প্রোফাইল সংরক্ষণ করুন (Save Profile)</span>
                </button>
              </div>
            </form>
          </div>

          {/* Personal Permissions & Access Mapping */}
          <div className="bg-[#0a0d14] border border-cyan-900/30 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>আপনার রোলে অনুমোদিত অ্যাক্সেস লিস্ট (Your Active Permissions)</span>
            </h3>

            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                আপনার বর্তমান রোল <strong className="text-cyan-400">"{effectiveRole.name}"</strong> অনুযায়ী সিস্টেমে নিচের কাজের ক্ষমতা দেওয়া আছে:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {effectiveRole.permissions.map((p, idx) => (
                  <div key={idx} className="flex items-center space-x-2 p-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                    <span className="text-slate-300 truncate font-mono">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Password change & personal Security settings */}
        <div className="space-y-6">
          {/* Password Change Card */}
          <div className="bg-[#0a0d14] border border-cyan-900/30 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-2.5">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>পাসওয়ার্ড পরিবর্তন (Change Password)</span>
            </h3>

            <form onSubmit={handlePasswordChange} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">বর্তমান পাসওয়ার্ড (Current Password)</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={curPassword}
                    onChange={(e) => setCurPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 focus:outline-none rounded-xl pl-9 pr-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">নতুন পাসওয়ার্ড (New Password)</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 focus:outline-none rounded-xl pl-9 pr-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">পাসওয়ার্ড নিশ্চিত করুন (Confirm Password)</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 focus:outline-none rounded-xl pl-9 pr-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isChangingPass}
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center justify-center space-x-2"
              >
                {isChangingPass ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>পাসওয়ার্ড আপডেট করুন</span>
              </button>
            </form>
          </div>

          {/* Quick Stats/Credentials Card */}
          <div className="bg-[#0a0d14] border border-cyan-900/30 rounded-2xl p-5 space-y-4 shadow-xl text-xs">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-2.5">
              <Award className="w-4 h-4 text-purple-400" />
              <span>অ্যাকাউন্ট স্ট্যাটাস (Account Stats)</span>
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-850">
                <span className="text-slate-400">Account status</span>
                <span className="text-emerald-400 font-bold font-mono">ACTIVE</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-850">
                <span className="text-slate-400">Supervisor</span>
                <span className="text-slate-200 font-bold font-mono">{currentUser.supervisor || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-850">
                <span className="text-slate-400">Last login date</span>
                <span className="text-slate-200 font-mono">{currentUser.lastLogin || 'Just Now'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
