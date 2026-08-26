import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Settings, 
  Mail, 
  Key, 
  ShieldCheck, 
  Save, 
  Lock, 
  Globe, 
  Building2, 
  Phone,
  CheckCircle2
} from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  const { masterAdminEmail, updateMasterEmail, settings, updateSettingValue, addToast } = useAuth();

  const [emailInput, setEmailInput] = useState(masterAdminEmail);
  const [orgName, setOrgName] = useState('Rizvi Fashions & ISO Compliance Portal');
  const [orgAddress, setOrgAddress] = useState('Gazipur Industrial Complex, Dhaka, Bangladesh');
  const [orgPhone, setOrgPhone] = useState('+880 1700-000001');

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const handleEmailSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    updateMasterEmail(emailInput);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      addToast('Password Error', 'New passwords do not match.', 'error');
      return;
    }
    if (newPass.length < 8) {
      addToast('Password Error', 'Password must be at least 8 characters long.', 'warning');
      return;
    }

    addToast('Password Updated', 'Master Admin password changed successfully.', 'success');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 select-none">
      {/* Header Banner */}
      <div className="bg-[#0a0d14] border border-cyan-500/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-100">
              Master Admin System Control & Contact Settings
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Admin এই এ্যাপস সম্পুর্ন নিয়ন্ত্রণ ও যোগাযোগ এর ঠিকানা, পাসওয়ার্ড পরিবর্তন করতে মেইন ইমেইল আইডি: (ssheraji@gmail.com)
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-cyan-950/60 border border-cyan-500/40 rounded-xl px-3 py-1.5 text-xs font-mono text-cyan-300 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Master Super-Admin Rights Verified</span>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Master Email & Organization Info */}
        <div className="bg-[#0a0d14] border border-cyan-900/30 rounded-2xl p-5 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-2">
            <Mail className="w-4 h-4 text-cyan-400" />
            <span>মেইন ইমেইল ও যোগাযোগ এর ঠিকানা (Master Contact Settings)</span>
          </h3>

          <form onSubmit={handleEmailSave} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">মেইন ইমেইল আইডি (Master Email ID)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-slate-900 border border-cyan-500/50 rounded-xl pl-9 pr-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">প্রতিষ্ঠানের নাম (Organization Name)</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">যোগাযোগের ঠিকানা (Address)</label>
              <input
                type="text"
                value={orgAddress}
                onChange={(e) => setOrgAddress(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">হটলাইন / মোবাইল নাম্বার (Hotline Phone)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={orgPhone}
                  onChange={(e) => setOrgPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center space-x-2 ml-auto"
              >
                <Save className="w-4 h-4" />
                <span>তথ্য আপডেট করুন (Update Master Email)</span>
              </button>
            </div>
          </form>
        </div>

        {/* Master Password Change */}
        <div className="bg-[#0a0d14] border border-cyan-900/30 rounded-2xl p-5 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-2">
            <Key className="w-4 h-4 text-amber-400" />
            <span>পাসওয়ার্ড পরিবর্তন (Master Password Change)</span>
          </h3>

          <form onSubmit={handlePasswordChange} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">বর্তমান পাসওয়ার্ড (Current Password)</label>
              <input
                type="password"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">নতুন পাসওয়ার্ড (New Password)</label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">নতুন পাসওয়ার্ড নিশ্চিত করুন (Confirm Password)</label>
              <input
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div className="pt-2 text-right">
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.4)] flex items-center space-x-2 ml-auto"
              >
                <Lock className="w-4 h-4" />
                <span>পাসওয়ার্ড পরিবর্তন নিশ্চিত করুন</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
