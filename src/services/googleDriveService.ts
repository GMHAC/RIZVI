import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User as FirebaseUser,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.readonly');
provider.addScope('https://www.googleapis.com/auth/drive.file');

let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  modifiedTime?: string;
  size?: string;
  fileExtension?: string;
  owners?: { displayName: string; emailAddress: string }[];
  shared?: boolean;
}

export const initDriveAuth = (
  onAuthSuccess?: (user: FirebaseUser, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user && cachedAccessToken) {
      onAuthSuccess?.(user, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        onAuthFailure?.();
      }
    }
  });
};

export const signInWithGoogleDrive = async (): Promise<{ user: FirebaseUser; token: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;

    if (!accessToken) {
      throw new Error('Failed to obtain Google Drive OAuth Access Token');
    }

    cachedAccessToken = accessToken;
    return { user: result.user, token: accessToken };
  } catch (err) {
    console.error('Google Drive sign in error:', err);
    throw err;
  } finally {
    isSigningIn = false;
  }
};

export const signOutGoogleDrive = async () => {
  cachedAccessToken = null;
  await signOut(auth);
};

export const getDriveAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const fetchGoogleDriveFiles = async (
  folderId: string = 'root',
  searchQuery: string = '',
  mimeTypeFilter: string = 'all'
): Promise<DriveFileItem[]> => {
  const token = getDriveAccessToken();
  if (!token) {
    throw new Error('AUTH_REQUIRED');
  }

  // Construct query parameter for Google Drive API v3
  let qParts: string[] = ["trashed = false"];

  if (folderId && folderId !== 'all') {
    qParts.push(`'${folderId}' in parents`);
  }

  if (searchQuery.trim()) {
    const safeQuery = searchQuery.replace(/'/g, "\\'");
    qParts.push(`name contains '${safeQuery}'`);
  }

  if (mimeTypeFilter === 'document') {
    qParts.push("(mimeType = 'application/vnd.google-apps.document' or mimeType = 'application/pdf' or mimeType = 'application/msword' or mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')");
  } else if (mimeTypeFilter === 'spreadsheet') {
    qParts.push("(mimeType = 'application/vnd.google-apps.spreadsheet' or mimeType = 'text/csv' or mimeType = 'application/vnd.ms-excel' or mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')");
  } else if (mimeTypeFilter === 'presentation') {
    qParts.push("(mimeType = 'application/vnd.google-apps.presentation' or mimeType = 'application/vnd.ms-powerpoint' or mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation')");
  } else if (mimeTypeFilter === 'image') {
    qParts.push("mimeType startsWith 'image/'");
  } else if (mimeTypeFilter === 'folder') {
    qParts.push("mimeType = 'application/vnd.google-apps.folder'");
  }

  const query = encodeURIComponent(qParts.join(' and '));
  const fields = encodeURIComponent('files(id, name, mimeType, webViewLink, webContentLink, iconLink, thumbnailLink, modifiedTime, size, fileExtension, owners, shared)');
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&pageSize=50&orderBy=folder,name`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    cachedAccessToken = null;
    throw new Error('AUTH_EXPIRED');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Google Drive API error: ${response.statusText}`);
  }

  const data = await response.json();
  return (data.files || []) as DriveFileItem[];
};

// Fallback sample files for demonstration / testing prior to live drive sync
export const MOCK_DRIVE_FILES: DriveFileItem[] = [
  {
    id: 'gdrive-doc-1',
    name: 'Kazi_Rizvi_Compliance_Policy_2026.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    webViewLink: 'https://docs.google.com/document/d/sample-compliance-policy/edit',
    modifiedTime: '2026-08-04T18:30:00Z',
    size: '142850',
    fileExtension: 'docx',
  },
  {
    id: 'gdrive-sheet-1',
    name: 'Master_Employee_KPI_Schedule_August_2026.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    webViewLink: 'https://docs.google.com/spreadsheets/d/sample-kpi-schedule/edit',
    modifiedTime: '2026-08-05T08:15:00Z',
    size: '89400',
    fileExtension: 'xlsx',
  },
  {
    id: 'gdrive-pdf-1',
    name: 'Floor_Safety_and_Grievance_Guidelines.pdf',
    mimeType: 'application/pdf',
    webViewLink: 'https://drive.google.com/file/d/sample-safety-guidelines/view',
    modifiedTime: '2026-08-01T12:00:00Z',
    size: '2540000',
    fileExtension: 'pdf',
  },
  {
    id: 'gdrive-img-1',
    name: 'Fabric_Inspection_Line4_Defect_Report.png',
    mimeType: 'image/png',
    webViewLink: 'https://drive.google.com/file/d/sample-defect-report/view',
    modifiedTime: '2026-08-04T14:10:00Z',
    size: '1850000',
    fileExtension: 'png',
  },
  {
    id: 'gdrive-doc-2',
    name: 'Daily_Tasks_Work_Schedule_Template.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    webViewLink: 'https://docs.google.com/document/d/sample-task-template/edit',
    modifiedTime: '2026-08-03T09:45:00Z',
    size: '98200',
    fileExtension: 'docx',
  },
  {
    id: 'gdrive-folder-1',
    name: 'Production & Audit Attachments',
    mimeType: 'application/vnd.google-apps.folder',
    modifiedTime: '2026-08-02T11:20:00Z',
  }
];
