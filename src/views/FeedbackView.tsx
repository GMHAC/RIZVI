import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FeedbackGrievanceItem } from '../types';
import { 
  MessageSquareWarning, 
  Send, 
  Paperclip, 
  FileText, 
  FileSpreadsheet, 
  FileCode, 
  Image, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  X,
  AlertOctagon,
  Sparkles,
  HardDrive,
  ExternalLink
} from 'lucide-react';
import { GoogleDriveModal, SelectedDriveAttachment } from '../components/GoogleDriveModal';

export const FeedbackView: React.FC = () => {
  const { 
    currentUser, 
    feedbackItems, 
    submitFeedback, 
    updateFeedbackDecision, 
    hasPermission 
  } = useAuth();

  const [type, setType] = useState<'complaint' | 'suggestion' | 'training_block'>('complaint');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attachmentName, setAttachmentName] = useState<string | undefined>(undefined);
  const [attachmentType, setAttachmentType] = useState<'word'|'excel'|'csv'|'pdf'|'image'|undefined>(undefined);
  const [attachmentUrl, setAttachmentUrl] = useState<string | undefined>(undefined);
  const [isDriveAttachment, setIsDriveAttachment] = useState<boolean>(false);

  // Google Drive Modal state
  const [showDriveModal, setShowDriveModal] = useState<boolean>(false);

  // Admin decision state
  const [activeDecisionId, setActiveDecisionId] = useState<string | null>(null);
  const [decisionText, setDecisionText] = useState('');
  const [decisionStatus, setDecisionStatus] = useState<'Resolved' | 'Action Taken' | 'Under Review'>('Resolved');

  const canManage = hasPermission('feedback:manage');

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachmentName(file.name);
    setIsDriveAttachment(false);
    setAttachmentUrl(undefined);

    if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
      setAttachmentType('word');
    } else if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
      setAttachmentType('excel');
    } else if (file.name.endsWith('.csv')) {
      setAttachmentType('csv');
    } else if (file.name.endsWith('.pdf')) {
      setAttachmentType('pdf');
    } else {
      setAttachmentType('image');
    }
  };

  const handleDriveAttachmentsSelected = (selected: SelectedDriveAttachment[]) => {
    if (selected.length === 0) return;
    const item = selected[0];
    setAttachmentName(item.name);
    setAttachmentUrl(item.webViewLink);
    setIsDriveAttachment(true);

    if (item.fileType === 'excel' || item.fileType === 'gsheet') {
      setAttachmentType('excel');
    } else if (item.fileType === 'word' || item.fileType === 'gdoc') {
      setAttachmentType('word');
    } else if (item.fileType === 'pdf') {
      setAttachmentType('pdf');
    } else if (item.fileType === 'image') {
      setAttachmentType('image');
    } else if (item.fileType === 'csv') {
      setAttachmentType('csv');
    } else {
      setAttachmentType('word');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    submitFeedback(
      type,
      title,
      description,
      isDriveAttachment ? `[Google Drive] ${attachmentName}` : attachmentName,
      attachmentType,
      attachmentUrl || (attachmentName ? `uploaded_${attachmentName}` : undefined)
    );

    setTitle('');
    setDescription('');
    setAttachmentName(undefined);
    setAttachmentType(undefined);
    setAttachmentUrl(undefined);
    setIsDriveAttachment(false);
  };

  const handleDecisionSubmit = (id: string) => {
    if (!decisionText.trim()) return;
    updateFeedbackDecision(id, decisionText, decisionStatus);
    setActiveDecisionId(null);
    setDecisionText('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 select-none">
      {/* Header */}
      <div className="bg-[#0a0d14] border border-cyan-500/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <MessageSquareWarning className="w-5 h-5 text-rose-400" />
            <h2 className="text-lg font-bold text-slate-100">
              অভিযোগ, পরামর্শ ও ট্রেনিং ব্লক রিপোর্ট সিস্টেম
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            দৈনন্দিন কাজে বাঁধা পেলে, ফ্লোর থেকে ট্রেনিংয়ে লোক না দিলে লিখিতভাবে অভিযোগ বা পরামর্শ জানান। ওয়ার্ড, এক্সেল, পিডিএফ ও ছবি অ্যাটাচমেন্ট সাপোর্ট করবে।
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-cyan-300 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Management Oversight: Direct MD Office Line</span>
        </div>
      </div>

      {/* Grid: Submission Form (Left) & Transparency Board (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submission Form */}
        <div className="bg-[#0a0d14] border border-cyan-900/30 rounded-2xl p-5 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-2">
            <Send className="w-4 h-4 text-cyan-400" />
            <span>নতুন বার্তা জমা দিন (Submit Report)</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">ক্যাটাগরি (Report Category)</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setType('complaint')}
                  className={`p-2 rounded-xl border text-center font-bold transition-all ${
                    type === 'complaint'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  অভিযোগ (Complaint)
                </button>

                <button
                  type="button"
                  onClick={() => setType('suggestion')}
                  className={`p-2 rounded-xl border text-center font-bold transition-all ${
                    type === 'suggestion'
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  পরামর্শ (Guideline)
                </button>

                <button
                  type="button"
                  onClick={() => setType('training_block')}
                  className={`p-2 rounded-xl border text-center font-bold transition-all ${
                    type === 'training_block'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  ট্রেনিং বাধা (Training Block)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">শিরোনাম (Subject Title)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="বিষয়টি সংক্ষেপে লিখুন..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">বিস্তারিত বিবরণ (Detailed Description)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="সমস্যা বা প্রস্তাবনাটি বিস্তারিত বর্ণনা করুন..."
                rows={4}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            {/* File Attachment Upload */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">সংযুক্তি / ডকুমেন্ট (Word, Excel, PDF, Picture, Google Drive)</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Local File Input */}
                <div>
                  <input
                    type="file"
                    onChange={handleAttachmentChange}
                    accept=".doc,.docx,.xls,.xlsx,.csv,.pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    id="feedback-attachment-input"
                  />
                  <label
                    htmlFor="feedback-attachment-input"
                    className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-slate-900 border border-slate-700 hover:border-slate-500 rounded-xl cursor-pointer text-slate-300 w-full transition-all text-[11px]"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">লোকাল ফাইল আপলোড</span>
                  </label>
                </div>

                {/* Google Drive Picker Button */}
                <button
                  type="button"
                  onClick={() => setShowDriveModal(true)}
                  className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-cyan-950/80 border border-cyan-500/50 hover:border-cyan-400 rounded-xl text-cyan-300 w-full transition-all text-[11px] font-bold shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                >
                  <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Google Drive থেকে বাছাই করুন</span>
                </button>
              </div>

              {/* Current Attachment Indicator */}
              {attachmentName && (
                <div className="mt-2 p-2 bg-cyan-950/30 border border-cyan-500/40 rounded-xl flex items-center justify-between text-[11px] text-cyan-300 font-mono">
                  <div className="flex items-center space-x-1.5 min-w-0">
                    {isDriveAttachment ? <HardDrive className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> : <Paperclip className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                    <span className="truncate">{attachmentName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachmentName(undefined);
                      setAttachmentUrl(undefined);
                      setIsDriveAttachment(false);
                    }}
                    className="text-slate-400 hover:text-rose-400 p-0.5 ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center space-x-2 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>জমা দিন (Submit Message)</span>
            </button>
          </form>
        </div>

        {/* Transparency Board (Right 2 Cols) */}
        <div className="lg:col-span-2 bg-[#0a0d14] border border-cyan-900/30 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>ম্যানেজমেন্ট সিদ্ধান্ত ও ট্র্যাকিং বোর্ড (Transparency Board)</span>
            </h3>
            <span className="text-[10px] font-mono text-cyan-400">{feedbackItems.length} Total Reports</span>
          </div>

          <div className="space-y-3">
            {feedbackItems.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.2 rounded text-[9px] font-mono font-bold uppercase border ${
                        item.type === 'complaint' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                        item.type === 'training_block' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                        'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      }`}>
                        {item.type === 'complaint' ? 'অভিযোগ' : item.type === 'training_block' ? 'ট্রেনিং বাধা' : 'পরামর্শ'}
                      </span>
                      <h4 className="text-xs font-bold text-slate-100">{item.title}</h4>
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono">
                      {item.employeeName} ({item.employeePhone}) • {item.submittedAt}
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border shrink-0 ${
                    item.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                    item.status === 'Action Taken' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' :
                    'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
                  {item.description}
                </p>

                {item.attachmentName && (
                  <div className="flex items-center justify-between text-[11px] text-cyan-300 font-mono bg-cyan-950/30 p-2.5 rounded-xl border border-cyan-900/40">
                    <div className="flex items-center space-x-2 min-w-0">
                      {item.attachmentName.includes('Google Drive') || item.attachmentUrl?.includes('drive.google.com') || item.attachmentUrl?.includes('docs.google.com') ? (
                        <HardDrive className="w-4 h-4 text-cyan-400 shrink-0" />
                      ) : (
                        <Paperclip className="w-4 h-4 text-cyan-400 shrink-0" />
                      )}
                      <span className="truncate">সংযুক্ত ফাইল: {item.attachmentName}</span>
                    </div>

                    {item.attachmentUrl && (
                      <a
                        href={item.attachmentUrl.startsWith('http') ? item.attachmentUrl : `https://${item.attachmentUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-cyan-900/50 hover:bg-cyan-800 text-cyan-200 border border-cyan-500/40 rounded-lg flex items-center space-x-1 shrink-0 transition-all font-bold text-[10px]"
                      >
                        <span>ওপেন ড্রাইভ</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}

                {/* Management Decision Display */}
                {item.managementDecision ? (
                  <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-xl p-3 space-y-1">
                    <div className="text-[10px] uppercase font-mono font-bold text-emerald-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ম্যানেজমেন্ট গৃহিত সিদ্ধান্ত (Management Decision) — {item.decisionDate}</span>
                    </div>
                    <p className="text-xs text-emerald-200 font-medium">{item.managementDecision}</p>
                  </div>
                ) : (
                  canManage && (
                    <div className="pt-2 border-t border-slate-800">
                      {activeDecisionId === item.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={decisionText}
                            onChange={(e) => setDecisionText(e.target.value)}
                            placeholder="ম্যানেজমেন্ট এর সিদ্ধান্ত ও প্রতিক্রিয়া লিখুন..."
                            rows={2}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-slate-100"
                          />

                          <div className="flex items-center justify-between">
                            <select
                              value={decisionStatus}
                              onChange={(e) => setDecisionStatus(e.target.value as any)}
                              className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2 py-1"
                            >
                              <option value="Resolved">Resolved (নিষ্পত্তি)</option>
                              <option value="Action Taken">Action Taken (পদক্ষেপ নেয়া হয়েছে)</option>
                              <option value="Under Review">Under Review (বিবেচনাধীন)</option>
                            </select>

                            <div className="flex space-x-2">
                              <button
                                onClick={() => setActiveDecisionId(null)}
                                className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg font-bold"
                              >
                                বাতিল
                              </button>
                              <button
                                onClick={() => handleDecisionSubmit(item.id)}
                                className="px-3 py-1 bg-emerald-500 text-slate-950 text-xs rounded-lg font-bold"
                              >
                                সিদ্ধান্ত প্রকাশ করুন
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveDecisionId(item.id)}
                          className="text-xs text-cyan-400 hover:underline font-bold"
                        >
                          + সিদ্ধান্ত প্রকাশ করুন (Record Management Decision)
                        </button>
                      )}
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Google Drive Modal */}
      <GoogleDriveModal
        isOpen={showDriveModal}
        onClose={() => setShowDriveModal(false)}
        onSelectAttachments={handleDriveAttachmentsSelected}
        title="Google Drive থেকে ফাইল সংযুক্ত করুন (Feedback Document Attachment)"
        subtitle="গুগল ড্রাইভ থেকে সরাসরি অভিযোগ বা পরামর্শের সাথে যেকোনো ডকুমেন্ট নির্বাচন করুন।"
      />
    </div>
  );
};
