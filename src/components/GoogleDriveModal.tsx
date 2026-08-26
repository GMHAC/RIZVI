import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Folder, 
  FileText, 
  FileSpreadsheet, 
  Presentation, 
  Image as ImageIcon, 
  File, 
  HardDrive, 
  RefreshCw, 
  Check, 
  ExternalLink, 
  LogIn, 
  LogOut, 
  ChevronRight, 
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { 
  DriveFileItem, 
  fetchGoogleDriveFiles, 
  signInWithGoogleDrive, 
  signOutGoogleDrive, 
  getDriveAccessToken, 
  initDriveAuth,
  MOCK_DRIVE_FILES 
} from '../services/googleDriveService';

export interface SelectedDriveAttachment {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  fileType: 'word' | 'excel' | 'csv' | 'pdf' | 'image' | 'gdoc' | 'gsheet' | 'other';
  size?: string;
  formattedSize?: string;
  isGoogleDrive: true;
}

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAttachments: (attachments: SelectedDriveAttachment[]) => void;
  allowMultiple?: boolean;
  title?: string;
  subtitle?: string;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  onSelectAttachments,
  allowMultiple = false,
  title = "Google Drive ডকুমেন্ট অ্যাটাচ করুন (Google Drive File Browser)",
  subtitle = "গুগল ড্রাইভ থেকে সরাসরি ডকুমেন্ট বা স্প্রেডশীট সিলেক্ট করে রিপোর্ট বা টাস্কে যুক্ত করুন।"
}) => {
  const [useLiveApi, setUseLiveApi] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mimeFilter, setMimeFilter] = useState<'all' | 'document' | 'spreadsheet' | 'presentation' | 'image' | 'folder'>('all');
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [folderBreadcrumbs, setFolderBreadcrumbs] = useState<{ id: string; name: string }[]>([
    { id: 'root', name: 'My Drive' }
  ]);

  // Selected Items
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

  // Monitor auth state on load
  useEffect(() => {
    if (!isOpen) return;

    const token = getDriveAccessToken();
    if (token) {
      setIsAuthenticated(true);
    }

    const unsubscribe = initDriveAuth(
      (user) => {
        setIsAuthenticated(true);
        setCurrentUserEmail(user.email || user.displayName || 'Google Account');
      },
      () => {
        setIsAuthenticated(false);
        setCurrentUserEmail(null);
      }
    );

    return () => unsubscribe();
  }, [isOpen]);

  // Load files when modal opens or filter/folder changes
  useEffect(() => {
    if (!isOpen) return;
    loadDriveFiles();
  }, [isOpen, currentFolderId, mimeFilter, isAuthenticated, useLiveApi]);

  const loadDriveFiles = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    if (useLiveApi && isAuthenticated) {
      try {
        const liveFiles = await fetchGoogleDriveFiles(currentFolderId, searchQuery, mimeFilter);
        setFiles(liveFiles);
      } catch (err: any) {
        if (err.message === 'AUTH_REQUIRED' || err.message === 'AUTH_EXPIRED') {
          setIsAuthenticated(false);
          setErrorMsg('গুগল ড্রাইভের সেশন মেয়াদোত্তীর্ণ হয়েছে। অনুগ্রহ করে পুনরায় গুগল ড্রাইভে সাইন-ইন করুন।');
        } else {
          setErrorMsg(`গুগল ড্রাইভ ফাইল লোড করতে সমস্যা হয়েছে: ${err.message}`);
          // Fall back to demo files gracefully
          setFiles(getFilteredMockFiles());
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      // Use Mock Drive Files
      setFiles(getFilteredMockFiles());
      setIsLoading(false);
    }
  };

  const getFilteredMockFiles = () => {
    let result = [...MOCK_DRIVE_FILES];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(f => f.name.toLowerCase().includes(q));
    }

    if (mimeFilter === 'document') {
      result = result.filter(f => f.name.endsWith('.docx') || f.mimeType.includes('document') || f.mimeType.includes('pdf'));
    } else if (mimeFilter === 'spreadsheet') {
      result = result.filter(f => f.name.endsWith('.xlsx') || f.mimeType.includes('spreadsheet') || f.mimeType.includes('csv'));
    } else if (mimeFilter === 'image') {
      result = result.filter(f => f.mimeType.startsWith('image/'));
    } else if (mimeFilter === 'folder') {
      result = result.filter(f => f.mimeType.includes('folder'));
    }

    return result;
  };

  const handleSignIn = async () => {
    setIsAuthLoading(true);
    setErrorMsg(null);
    try {
      const res = await signInWithGoogleDrive();
      if (res) {
        setIsAuthenticated(true);
        setCurrentUserEmail(res.user.email || 'Google User');
        setUseLiveApi(true);
      }
    } catch (err: any) {
      setErrorMsg('গুগল সাইন-ইন সম্পন্ন করা যায়নি। অনুগ্রহ করে পপ-আপ এলাউ করুন বা স্যাম্পল ফাইল ড্রাইভ মোড ব্যবহার করুন।');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOutGoogleDrive();
    setIsAuthenticated(false);
    setCurrentUserEmail(null);
    setSelectedFileIds([]);
  };

  const handleToggleFileSelection = (file: DriveFileItem) => {
    if (file.mimeType.includes('folder')) {
      // Navigate into folder
      setCurrentFolderId(file.id);
      setFolderBreadcrumbs(prev => [...prev, { id: file.id, name: file.name }]);
      return;
    }

    if (allowMultiple) {
      if (selectedFileIds.includes(file.id)) {
        setSelectedFileIds(prev => prev.filter(id => id !== file.id));
      } else {
        setSelectedFileIds(prev => [...prev, file.id]);
      }
    } else {
      setSelectedFileIds([file.id]);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    const target = folderBreadcrumbs[index];
    setCurrentFolderId(target.id);
    setFolderBreadcrumbs(prev => prev.slice(0, index + 1));
  };

  const mapMimeToFileType = (mimeType: string, fileName: string): SelectedDriveAttachment['fileType'] => {
    const lower = fileName.toLowerCase();
    if (mimeType.includes('spreadsheet') || lower.endsWith('.xlsx') || lower.endsWith('.xls')) return 'excel';
    if (mimeType.includes('csv') || lower.endsWith('.csv')) return 'csv';
    if (mimeType.includes('document') || lower.endsWith('.docx') || lower.endsWith('.doc')) return 'word';
    if (mimeType.includes('pdf') || lower.endsWith('.pdf')) return 'pdf';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.includes('vnd.google-apps.document')) return 'gdoc';
    if (mimeType.includes('vnd.google-apps.spreadsheet')) return 'gsheet';
    return 'other';
  };

  const formatByteSize = (bytesStr?: string) => {
    if (!bytesStr) return 'G-Drive Link';
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes)) return 'G-Drive File';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleConfirmSelection = () => {
    const selectedItems = files.filter(f => selectedFileIds.includes(f.id));
    
    // If no live items matched (e.g. from mock), check mock array
    const attachments: SelectedDriveAttachment[] = selectedFileIds.map(id => {
      const match = files.find(f => f.id === id) || MOCK_DRIVE_FILES.find(f => f.id === id);
      const name = match ? match.name : 'Google Drive Attachment';
      const mime = match ? match.mimeType : 'application/octet-stream';
      const type = mapMimeToFileType(mime, name);

      return {
        id,
        name,
        mimeType: mime,
        webViewLink: match?.webViewLink || `https://drive.google.com/file/d/${id}/view`,
        fileType: type,
        size: match?.size,
        formattedSize: formatByteSize(match?.size),
        isGoogleDrive: true,
      };
    });

    onSelectAttachments(attachments);
    onClose();
  };

  const renderFileIcon = (mimeType: string, fileName: string) => {
    const lower = fileName.toLowerCase();
    if (mimeType.includes('folder')) {
      return <Folder className="w-5 h-5 text-amber-400 shrink-0" />;
    }
    if (mimeType.includes('spreadsheet') || lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0" />;
    }
    if (mimeType.includes('document') || lower.endsWith('.docx') || lower.endsWith('.doc') || mimeType.includes('google-apps.document')) {
      return <FileText className="w-5 h-5 text-cyan-400 shrink-0" />;
    }
    if (mimeType.includes('pdf') || lower.endsWith('.pdf')) {
      return <FileText className="w-5 h-5 text-rose-400 shrink-0" />;
    }
    if (mimeType.startsWith('image/')) {
      return <ImageIcon className="w-5 h-5 text-purple-400 shrink-0" />;
    }
    if (mimeType.includes('presentation')) {
      return <Presentation className="w-5 h-5 text-amber-500 shrink-0" />;
    }
    return <File className="w-5 h-5 text-slate-400 shrink-0" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200">
      <div className="bg-[#080b11] border border-cyan-500/40 rounded-2xl max-w-3xl w-full flex flex-col max-h-[90vh] shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden">
        {/* Top Accent Bar */}
        <div className="h-1 bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-start justify-between gap-3 bg-[#0a0d14]">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-cyan-950/80 border border-cyan-500/40 rounded-xl text-cyan-400">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                  <span>{title}</span>
                  <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded-md text-[10px] font-mono font-bold">
                    Official Workspace Integration
                  </span>
                </h3>
                <p className="text-xs text-slate-400">{subtitle}</p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-all shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar & Sign-In Controls */}
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <span className="flex items-center space-x-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>অ্যাটাচড ড্রাইভ: <strong className="text-slate-200">{currentUserEmail || 'Google Drive Active'}</strong></span>
              </span>
            ) : (
              <span className="flex items-center space-x-1.5 text-amber-400">
                <AlertCircle className="w-4 h-4" />
                <span>ড্রাইভ অ্যাকাউন্ট কানেক্টেড নেই (Sample / Offline Mode Active)</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {!isAuthenticated ? (
              <button
                onClick={handleSignIn}
                disabled={isAuthLoading}
                className="gsi-material-button px-3 py-1 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-lg text-xs flex items-center space-x-2 transition-all shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{isAuthLoading ? 'Connecting...' : 'Sign in with Google Drive'}</span>
              </button>
            ) : (
              <button
                onClick={handleSignOut}
                className="px-2.5 py-1 bg-slate-900 border border-slate-700 hover:border-rose-500 text-slate-300 hover:text-rose-300 rounded-lg text-[11px] flex items-center space-x-1 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            )}

            <button
              onClick={loadDriveFiles}
              disabled={isLoading}
              title="Refresh Drive Files"
              className="p-1.5 bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-300 rounded-lg transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Errors / Warnings */}
        {errorMsg && (
          <div className="bg-rose-950/30 border-b border-rose-500/30 px-4 py-2 text-xs text-rose-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Search & Category Filter Tabs */}
        <div className="p-4 bg-[#0a0d14] border-b border-slate-800/80 space-y-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadDriveFiles()}
              placeholder="গুগল ড্রাইভে ফাইল খুঁজুন (Search documents, spreadsheets, PDFs)..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
            />
          </div>

          {/* Quick Mime Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: 'All Files', icon: HardDrive },
              { id: 'document', label: 'Docs & Word', icon: FileText },
              { id: 'spreadsheet', label: 'Sheets & Excel', icon: FileSpreadsheet },
              { id: 'presentation', label: 'Slides', icon: Presentation },
              { id: 'image', label: 'Images', icon: ImageIcon },
              { id: 'folder', label: 'Folders', icon: Folder },
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = mimeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setMimeFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 shrink-0 transition-all ${
                    isActive
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Breadcrumbs Navigation */}
          <div className="flex items-center space-x-1 text-[11px] font-mono text-slate-400 pt-1">
            <span className="text-slate-500">Path:</span>
            {folderBreadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.id}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
                <button
                  onClick={() => handleBreadcrumbClick(idx)}
                  className={`hover:underline ${
                    idx === folderBreadcrumbs.length - 1 ? 'text-cyan-400 font-bold' : 'text-slate-300'
                  }`}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* File Browser Grid / List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[250px] max-h-[360px] bg-[#050608]">
          {isLoading ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-mono">Connecting to Google Drive API & loading items...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="py-12 text-center space-y-2 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
              <Folder className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs font-bold text-slate-300">কোন ড্রাইভ ফাইল পাওয়া যায়নি</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                অন্য কোনো ফাইল টাইপ সিলেক্ট করুন অথবা উপরে গুগল সাইন-ইন করে আপনার গুগল ড্রাইভের ফাইল ফিল্টার করুন।
              </p>
            </div>
          ) : (
            files.map((file) => {
              const isSelected = selectedFileIds.includes(file.id);
              const isFolder = file.mimeType.includes('folder');

              return (
                <div
                  key={file.id}
                  onClick={() => handleToggleFileSelection(file)}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : 'bg-[#0a0d14] border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    {!isFolder && (
                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                            : 'border-slate-700 bg-slate-900'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    )}

                    {renderFileIcon(file.mimeType, file.name)}

                    <div className="min-w-0 space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-100 truncate hover:text-cyan-300">
                        {file.name}
                      </h4>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                        <span>{isFolder ? 'Folder' : formatByteSize(file.size)}</span>
                        {file.modifiedTime && (
                          <>
                            <span>•</span>
                            <span>{new Date(file.modifiedTime).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {isFolder ? (
                      <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
                        Open Folder →
                      </span>
                    ) : (
                      file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title="Open in Google Drive"
                          className="p-1.5 bg-slate-900 text-slate-400 hover:text-cyan-300 rounded-lg border border-slate-800 hover:border-cyan-500/40 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Items Summary Footer */}
        <div className="p-4 bg-[#0a0d14] border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs font-mono text-slate-300 flex items-center space-x-2">
            <Paperclip className="w-4 h-4 text-cyan-400" />
            <span>
              সিলেক্টেড ফাইল: <strong className="text-cyan-300">{selectedFileIds.length} টি</strong>
            </span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 transition-all"
            >
              বাতিল (Cancel)
            </button>

            <button
              type="button"
              disabled={selectedFileIds.length === 0}
              onClick={handleConfirmSelection}
              className="flex-1 sm:flex-none px-5 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all"
            >
              <Paperclip className="w-4 h-4" />
              <span>
                {selectedFileIds.length > 0 ? `ফাইল যুক্ত করুন (${selectedFileIds.length})` : 'ফাইল সিলেক্ট করুন'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
