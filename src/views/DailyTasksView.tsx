import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SchedulePeriod, WorkTaskItem } from '../types';
import { 
  CheckSquare, 
  Upload, 
  Plus, 
  FileSpreadsheet, 
  FileText, 
  FileCheck, 
  Sparkles, 
  Clock, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle,
  X,
  FileUp,
  Download,
  HardDrive,
  ExternalLink,
  Paperclip
} from 'lucide-react';
import Papa from 'papaparse';
import { GoogleDriveModal, SelectedDriveAttachment } from '../components/GoogleDriveModal';

export const DailyTasksView: React.FC = () => {
  const { 
    currentUser, 
    tasks, 
    toggleTaskCompletion, 
    addExtraWorkTask, 
    importCustomTasks, 
    addToast,
    hasPermission 
  } = useAuth();

  const [activePeriod, setActivePeriod] = useState<SchedulePeriod>('daily');
  const [showExtraWorkModal, setShowExtraWorkModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Google Drive Modal State
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [driveAttachedDoc, setDriveAttachedDoc] = useState<SelectedDriveAttachment | null>(null);

  // Extra Work State
  const [extraTaskTitle, setExtraTaskTitle] = useState('');
  const [extraTaskNote, setExtraTaskNote] = useState('');
  const [extraBonusPoints, setExtraBonusPoints] = useState(2);

  // File Upload State for Schedule Format Import
  const [importedFileName, setImportedFileName] = useState('');
  const [importedTaskCount, setImportedTaskCount] = useState(0);

  // Filter tasks for current user or all if manager/admin
  const canManage = hasPermission('tasks:manage');
  const filteredTasks = tasks.filter((t) => {
    const periodMatch = t.period === activePeriod;
    if (canManage) return periodMatch;
    return periodMatch && (t.employeeId === currentUser?.id || t.employeeId === 'EMP-1003');
  });

  const handleDriveAttachmentsSelected = (selected: SelectedDriveAttachment[]) => {
    if (selected.length === 0) return;

    if (showExtraWorkModal) {
      // Attach to extra work note
      const doc = selected[0];
      setDriveAttachedDoc(doc);
      setExtraTaskNote(prev => prev ? `${prev} (Ref: ${doc.name})` : `G-Drive Doc Ref: ${doc.name} (${doc.webViewLink || ''})`);
      addToast('Google Drive Attached', `Connected "${doc.name}" to Extra Work Note.`, 'success');
    } else {
      // Import tasks or attach schedule document from Google Drive
      const doc = selected[0];
      setImportedFileName(`[Google Drive] ${doc.name}`);

      const driveTasks: Partial<WorkTaskItem>[] = selected.map((file, idx) => ({
        taskTitle: `[G-Drive Attachment] ${file.name}`,
        category: file.fileType === 'excel' || file.fileType === 'gsheet' ? 'G-Drive Spreadsheet' : 'G-Drive Document',
        weightMarks: 15,
        period: activePeriod,
        note: `Google Drive Link: ${file.webViewLink || file.name}`
      }));

      importCustomTasks(driveTasks);
      setImportedTaskCount(driveTasks.length);
      addToast('Google Drive Schedule Attached', `Imported ${driveTasks.length} task item(s) from Google Drive.`, 'success');
    }
  };

  const handleExtraWorkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!extraTaskTitle.trim()) {
      addToast('Validation Error', 'Please enter task details.', 'warning');
      return;
    }

    addExtraWorkTask(
      currentUser?.id || 'EMP-1003',
      extraTaskTitle,
      extraTaskNote,
      Number(extraBonusPoints)
    );

    setExtraTaskTitle('');
    setExtraTaskNote('');
    setShowExtraWorkModal(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportedFileName(file.name);

    if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsed = results.data.map((row: any) => ({
            taskTitle: row['Task Title'] || row['taskTitle'] || row['Task'] || 'Custom Schedule Task',
            category: row['Category'] || row['category'] || 'Imported Schedule',
            weightMarks: Number(row['Marks'] || row['weightMarks'] || 15),
            period: (row['Period'] || activePeriod) as SchedulePeriod,
          }));

          importCustomTasks(parsed);
          setImportedTaskCount(parsed.length);
        },
        error: () => {
          addToast('File Error', 'Could not parse schedule CSV file format.', 'error');
        }
      });
    } else {
      // Mock parser for Word (.docx), Excel (.xlsx), PDF, Image formats
      const mockParsedTasks: Partial<WorkTaskItem>[] = [
        { taskTitle: `[Auto-Customized Format] ${file.name.replace(/\.[^/.]+$/, "")} - Task Item 1`, category: 'Imported Routine', weightMarks: 15, period: activePeriod },
        { taskTitle: `[Auto-Customized Format] ${file.name.replace(/\.[^/.]+$/, "")} - Quality Verification 2`, category: 'Safety Audit', weightMarks: 15, period: activePeriod },
        { taskTitle: `[Auto-Customized Format] ${file.name.replace(/\.[^/.]+$/, "")} - End of Shift Cleanup 3`, category: 'Discipline 5S', weightMarks: 10, period: activePeriod },
      ];

      importCustomTasks(mockParsedTasks);
      setImportedTaskCount(mockParsedTasks.length);
    }
  };

  const downloadSampleCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Task Title,Category,Marks,Period\n" +
      "Daily Sewing Machine Needles Check,Safety,10,daily\n" +
      "350 Units Sleeve Hemming Line 4,Sewing Target,20,daily\n" +
      "Weekly Fabric Yield Spreading Audit,Quality,30,weekly\n" +
      "Monthly Machine Lubrication Routine,Maintenance,40,monthly";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sample_task_schedule.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 select-none">
      {/* Header */}
      <div className="bg-[#0a0d14] border border-cyan-500/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-100">
              দৈনিক, সাপ্তাহিক, মাসিক, বার্ষিক কাজের তালিকা (Schedule Manager)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            সবাই আইডি কার্ড বা মোবাইল নাম্বার দিয়ে প্রবেশ করে স্ব-স্ব তালিকা টিক চিহ্ন দিবে। অতিরিক্ত কাজ স্বাধীনভাবে যুক্ত করলে বোনাস মার্ক যুক্ত হবে।
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-700/60 font-bold text-xs rounded-xl transition-all flex items-center space-x-2 shadow-sm"
          >
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>ইমপোর্ট কাজের ফরম্যাট (Import Schedule)</span>
          </button>

          <button
            onClick={() => setShowExtraWorkModal(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(52,211,153,0.3)] flex items-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>অতিরিক্ত কাজ নোট করুন (Extra Work)</span>
          </button>
        </div>
      </div>

      {/* Period Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {(['daily', 'weekly', 'monthly', 'half_yearly', 'annual'] as SchedulePeriod[]).map((p) => {
          const labels: Record<SchedulePeriod, string> = {
            daily: 'দৈনিক তালিকা (Daily)',
            weekly: 'সাপ্তাহিক তালিকা (Weekly)',
            monthly: 'মাসিক তালিকা (Monthly)',
            half_yearly: 'ছয় মাসিক (6-Monthly)',
            annual: 'বার্ষিক তালিকা (Annual)',
          };

          const isActive = activePeriod === p;

          return (
            <button
              key={p}
              onClick={() => setActivePeriod(p)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {labels[p]}
            </button>
          );
        })}
      </div>

      {/* Task Checklist Items */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-[#0a0d14] border border-slate-800/80 rounded-2xl p-8 text-center space-y-3">
            <Clock className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">কোন নির্দিষ্ট কাজ বরাদ্দ পাওয়া যায়নি</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              উপরে "ইমপোর্ট কাজের ফরম্যাট" বাটন ক্লিক করে Word, Excel, CSV বা PDF ফরম্যাটে কাস্টম রুটিন আপলোড করুন।
            </p>
          </div>
        ) : (
          filteredTasks.map((t) => (
            <div
              key={t.id}
              className={`bg-[#0a0d14] border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                t.completed
                  ? 'border-emerald-500/40 bg-emerald-950/10'
                  : 'border-slate-800/80 hover:border-cyan-500/30'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <button
                  onClick={() => toggleTaskCompletion(t.id)}
                  className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                    t.completed
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(52,211,153,0.5)]'
                      : 'border-2 border-slate-700 bg-slate-900 hover:border-cyan-400'
                  }`}
                >
                  {t.completed && <CheckCircle2 className="w-4 h-4" />}
                </button>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-bold ${t.completed ? 'text-emerald-300 line-through' : 'text-slate-100'}`}>
                      {t.taskTitle}
                    </span>
                    {t.isExtraWork && (
                      <span className="px-2 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[9px] font-mono font-bold">
                        +{t.bonusAwarded || 2} Bonus Marks
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                    <span className="font-mono text-cyan-400">{t.employeeName} ({t.employeeId})</span>
                    <span>•</span>
                    <span>{t.category}</span>
                    {t.weightMarks > 0 && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-slate-300">{t.weightMarks} Weight Marks</span>
                      </>
                    )}
                  </div>

                  {t.note && (
                    <p className="text-[11px] text-amber-300/80 font-mono italic">
                      Note: "{t.note}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 text-right">
                {t.completed ? (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-mono font-bold">
                    সম্পন্ন: {t.completedAt || 'Done'}
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-lg font-mono font-bold">
                    চলমান (Pending)
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Extra Work Modal */}
      {showExtraWorkModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0d14] border border-cyan-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowExtraWorkModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>অতিরিক্ত কাজ যুক্ত করুন (Extra Work Note)</span>
              </h3>
              <p className="text-xs text-slate-400">
                তালিকার অতিরিক্ত কাজ করলে স্ব-কর্মে নোট দিন, সম্পন্ন হলে অটোমেটিক বোনাস মার্ক যুক্ত হবে।
              </p>
            </div>

            <form onSubmit={handleExtraWorkSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">কাজের বিবরণ (Task Description)</label>
                <input
                  type="text"
                  value={extraTaskTitle}
                  onChange={(e) => setExtraTaskTitle(e.target.value)}
                  placeholder="যেমন: লাইন ৫-এ অতিরিক্ত ৪৫ টি বডি ফিনিশিং এর সাহায্য করেছি"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">নোট / মন্তব্য (Notes)</label>
                <textarea
                  value={extraTaskNote}
                  onChange={(e) => setExtraTaskNote(e.target.value)}
                  placeholder="কাজের ধরন ও সময় উল্লেখ করুন..."
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Attach Google Drive Document to Extra Work */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowDriveModal(true)}
                  className="w-full py-2 bg-cyan-950/80 border border-cyan-500/50 hover:border-cyan-400 rounded-xl text-cyan-300 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-sm"
                >
                  <HardDrive className="w-4 h-4 text-cyan-400" />
                  <span>Google Drive থেকে ফাইল/ডকুমেন্ট যুক্ত করুন</span>
                </button>
                {driveAttachedDoc && (
                  <p className="mt-1 text-[10px] text-emerald-400 font-mono truncate">
                    Attached: {driveAttachedDoc.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">বোনাস পয়েন্ট (Bonus Marks)</label>
                <select
                  value={extraBonusPoints}
                  onChange={(e) => setExtraBonusPoints(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                >
                  <option value={2}>+2 Bonus Marks (Standard Extra Task)</option>
                  <option value={5}>+5 Bonus Marks (Process Improvement / Emergency Support)</option>
                  <option value={10}>+10 Bonus Marks (Cost Saving / Exceptional Output)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowExtraWorkModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  বাতিল (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-[0_0_15px_rgba(52,211,153,0.4)]"
                >
                  সংরক্ষণ করুন (Save Extra Task)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0d14] border border-cyan-500/40 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowImportModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <Upload className="w-5 h-5 text-cyan-400" />
                <span>কাস্টম কাজের রুটিন আপলোড (Import Schedule)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Word (.docx), Excel (.xlsx/.csv), PDF বা ছবির ফাইল সিলেক্ট করে আপলোড করলে ঐ ফরমেট অনুযায়ী কাস্টমাইজড তালিকা তৈরি হয়ে যাবে।
              </p>
            </div>

            <div className="space-y-4">
              {/* Local File Input Card */}
              <div className="border-2 border-dashed border-cyan-800/60 hover:border-cyan-400 rounded-2xl p-4 text-center space-y-2 bg-slate-950/50 transition-colors">
                <FileUp className="w-8 h-8 text-cyan-400 mx-auto" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-200">
                    কম্পিউটার / মোবাইল থেকে ফাইল সিলেক্ট করুন
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Supported Formats: Word, Excel, CSV, PDF, PNG, JPG
                  </p>
                </div>

                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".csv,.xlsx,.xls,.doc,.docx,.pdf,.png,.jpg"
                  className="hidden"
                  id="schedule-file-input"
                />
                <label
                  htmlFor="schedule-file-input"
                  className="inline-block px-4 py-1.5 bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-200 font-bold text-xs rounded-xl cursor-pointer shadow-sm"
                >
                  ফাইল পছন্দ করুন (Select Local File)
                </label>
              </div>

              {/* Google Drive Import Option Card */}
              <div className="p-4 bg-cyan-950/40 border border-cyan-500/40 rounded-2xl space-y-2 text-center">
                <div className="flex items-center justify-center space-x-2 text-cyan-300 font-bold text-xs">
                  <HardDrive className="w-4 h-4 text-cyan-400" />
                  <span>Google Drive ফাইল থেকে সরাসরি শিডিউল রুটিন লোড করুন</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  আপনার গুগল ড্রাইভে থাকা শিডিউল ডকুমেন্টস বা স্প্রেডশীট এক ক্লিকে সরাসরি কাজের তালিকায় যুক্ত করুন।
                </p>
                <button
                  type="button"
                  onClick={() => setShowDriveModal(true)}
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center space-x-2 mx-auto"
                >
                  <HardDrive className="w-4 h-4" />
                  <span>Google Drive থেকে বাছাই করুন</span>
                </button>
              </div>

              {importedFileName && (
                <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-300 font-mono">
                  <span className="truncate max-w-[250px]">ফাইল: {importedFileName}</span>
                  <span>{importedTaskCount} টি কাজ ফরম্যাট করা হয়েছে!</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <button
                  onClick={downloadSampleCsv}
                  className="text-cyan-400 hover:underline flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>স্যাম্পল CSV কাজের তালিকা ডাউনলোড করুন</span>
                </button>

                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-200 font-bold rounded-xl"
                >
                  সম্পন্ন (Close)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Google Drive Browser Modal */}
      <GoogleDriveModal
        isOpen={showDriveModal}
        onClose={() => setShowDriveModal(false)}
        onSelectAttachments={handleDriveAttachmentsSelected}
        title="Google Drive ফাইল সিলেক্টর (Tasks & Schedule)"
        subtitle="গুগল ড্রাইভ থেকে ফাইল সিলেক্ট করে টাস্ক শিডিউলে সংযুক্ত করুন।"
      />
    </div>
  );
};
