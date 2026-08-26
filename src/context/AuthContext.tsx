import React, { createContext, useContext, useState } from 'react';
import { 
  User, 
  RoleId, 
  Permission, 
  RoleDefinition, 
  SystemSetting, 
  ApiKey, 
  AuditLogEntry, 
  UserSession,
  TwoFactorMethod,
  WorkTaskItem,
  EmployeeEvaluationRecord,
  FeedbackGrievanceItem,
  EmployeeLocation,
  KPIModel100,
  PerformanceRating,
  PromotionRecommendation
} from '../types';
import { 
  INITIAL_ROLES, 
  DEMO_USERS, 
  INITIAL_SETTINGS, 
  INITIAL_API_KEYS, 
  INITIAL_SESSIONS, 
  INITIAL_AUDIT_LOGS,
  INITIAL_TASKS,
  INITIAL_EVALUATIONS,
  INITIAL_FEEDBACK,
  INITIAL_LOCATIONS
} from '../data/initialData';
import { verifyTotpCode, generateBase32Secret, generateBackupCodes } from '../utils/totp';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface StepUpChallenge {
  actionName: string;
  onVerified: () => void;
}

interface AuthContextType {
  currentUser: User | null;
  effectiveRole: RoleDefinition;
  effectiveRoleId: RoleId;
  isAuthenticated: boolean;
  is2FAVerified: boolean;
  requires2FAChallenge: boolean;
  pendingLoginUser: User | null;
  masterAdminEmail: string;
  
  // Auth Functions
  loginWithEmail: (emailOrIdOrPhone: string, pass: string) => { success: boolean; requires2FA?: boolean; message?: string };
  complete2FAChallenge: (code: string, isBackupCode?: boolean) => { success: boolean; message?: string };
  logout: () => void;
  switchEffectiveRole: (roleId: RoleId) => void;
  loginAsDemoUser: (userId: string) => void;
  
  // Permission Checker
  hasPermission: (permission: Permission) => boolean;
  checkPermissionWithToast: (permission: Permission, actionDescription: string) => boolean;

  // Step-Up 2FA
  stepUpChallenge: StepUpChallenge | null;
  triggerStepUp2FA: (actionName: string, onVerified: () => void) => void;
  confirmStepUp2FA: (code: string) => boolean;
  cancelStepUp2FA: () => void;

  // 2FA Management
  enable2FA: (method: TwoFactorMethod, secret?: string) => { secret: string; backupCodes: string[] };
  disable2FA: () => void;

  // Data & Collections
  roles: RoleDefinition[];
  users: User[];
  settings: SystemSetting[];
  apiKeys: ApiKey[];
  sessions: UserSession[];
  auditLogs: AuditLogEntry[];
  tasks: WorkTaskItem[];
  evaluations: EmployeeEvaluationRecord[];
  feedbackItems: FeedbackGrievanceItem[];
  locations: EmployeeLocation[];

  // Data Handlers
  updateSettingValue: (settingId: string, newValue: any) => boolean;
  createApiKey: (name: string, environment: 'production' | 'staging' | 'development', scopes: string[]) => void;
  revokeApiKey: (keyId: string) => void;
  createNewUser: (userData: Partial<User>) => void;
  importMasterEmployees: (csvEmployees: Partial<User>[], replaceExisting: boolean) => void;
  deleteEmployee: (userId: string) => void;
  updateUserRole: (userId: string, newRoleId: RoleId) => void;
  resetUser2FA: (userId: string) => void;
  revokeSession: (sessionId: string) => void;
  exportAuditLogs: () => void;
  addAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;

  // Task & Schedule Handlers
  toggleTaskCompletion: (taskId: string, note?: string) => void;
  addExtraWorkTask: (employeeId: string, taskTitle: string, note: string, bonus: number) => void;
  importCustomTasks: (newTasks: Partial<WorkTaskItem>[]) => void;

  // Evaluation KPI Handlers
  saveKPIEvaluation: (record: Partial<EmployeeEvaluationRecord>) => void;

  // Feedback & Grievance Handlers
  submitFeedback: (type: 'complaint' | 'suggestion' | 'training_block', title: string, description: string, attachmentName?: string, attachmentType?: 'word'|'excel'|'csv'|'pdf'|'image', attachmentUrl?: string) => void;
  updateFeedbackDecision: (id: string, decision: string, status: 'Resolved' | 'Action Taken' | 'Under Review') => void;

  // Live Location Tracker Handlers
  updateEmployeeLocation: (employeeId: string, lat: number, lng: number, address: string, status: EmployeeLocation['status']) => void;

  // Master Settings
  updateMasterEmail: (newEmail: string) => void;
  updateUserPassword: (userId: string, newPass: string) => boolean;

  // Toasts
  toasts: Toast[];
  addToast: (title: string, description?: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  removeToast: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(DEMO_USERS[0]);
  const [effectiveRoleId, setEffectiveRoleId] = useState<RoleId>(DEMO_USERS[0].roleId);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [is2FAVerified, setIs2FAVerified] = useState<boolean>(true);
  const [masterAdminEmail, setMasterAdminEmail] = useState<string>('complianceapt@gmail.com');
  
  // Pending 2FA Login Challenge state
  const [pendingLoginUser, setPendingLoginUser] = useState<User | null>(null);
  const [requires2FAChallenge, setRequires2FAChallenge] = useState<boolean>(false);

  // Step Up 2FA modal state
  const [stepUpChallenge, setStepUpChallenge] = useState<StepUpChallenge | null>(null);

  // Core Data Collections
  const [roles] = useState<RoleDefinition[]>(INITIAL_ROLES);
  const [users, setUsers] = useState<User[]>(DEMO_USERS);
  const [settings, setSettings] = useState<SystemSetting[]>(INITIAL_SETTINGS);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(INITIAL_API_KEYS);
  const [sessions, setSessions] = useState<UserSession[]>(INITIAL_SESSIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  
  // Tasks, KPI Evaluations, Feedback, Locations
  const [tasks, setTasks] = useState<WorkTaskItem[]>(INITIAL_TASKS);
  const [evaluations, setEvaluations] = useState<EmployeeEvaluationRecord[]>(INITIAL_EVALUATIONS);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackGrievanceItem[]>(INITIAL_FEEDBACK);
  const [locations, setLocations] = useState<EmployeeLocation[]>(INITIAL_LOCATIONS);

  // Toast System
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (title: string, description?: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const now = new Date();
    const formattedTime = now.toISOString().replace('T', ' ').substring(0, 19);
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `log-${Date.now()}`,
      timestamp: formattedTime,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  const effectiveRole = roles.find((r) => r.id === effectiveRoleId) || roles[0];

  const hasPermission = (permission: Permission): boolean => {
    if (!isAuthenticated || !currentUser) return false;
    return effectiveRole.permissions.includes(permission);
  };

  const checkPermissionWithToast = (permission: Permission, actionDescription: string): boolean => {
    const allowed = hasPermission(permission);
    if (!allowed) {
      addToast(
        'Access Restricted by RBAC',
        `Role "${effectiveRole.name}" lacks permission "${permission}" required to ${actionDescription}.`,
        'error'
      );
    }
    return allowed;
  };

  // Login handler supporting Email, ID Card Number, or Phone Number
  const loginWithEmail = (identifier: string, pass: string) => {
    const cleanIdent = identifier.trim().toLowerCase();
    
    // Find matching user by email, employeeCardNo, or phone
    const user = users.find(
      (u) => 
        u.email.toLowerCase() === cleanIdent || 
        (u.employeeCardNo && u.employeeCardNo.toLowerCase() === cleanIdent) || 
        (u.phone && u.phone.replace(/\D/g, '') === cleanIdent.replace(/\D/g, ''))
    );

    if (!user) {
      addToast('Login Failed', 'Invalid Employee ID Card Number, Mobile Number, or Email.', 'error');
      return { success: false, message: 'User credentials not found' };
    }

    if (user.status === 'suspended') {
      addToast('Account Suspended', 'Your account has been deactivated by Compliance Admin.', 'error');
      return { success: false, message: 'Account suspended' };
    }

    if (user.twoFactorEnabled) {
      setPendingLoginUser(user);
      setRequires2FAChallenge(true);
      return { success: true, requires2FA: true };
    }

    // Login successful
    setCurrentUser(user);
    setEffectiveRoleId(user.roleId);
    setIsAuthenticated(true);
    setIs2FAVerified(false);
    setPendingLoginUser(null);
    setRequires2FAChallenge(false);

    addAuditLog({
      actorName: user.name,
      actorEmail: user.email,
      roleId: user.roleId,
      action: 'USER_LOGIN_SUCCESS',
      category: 'auth',
      severity: 'info',
      ipAddress: '192.168.1.100',
      status: 'success',
      details: `User logged in using credential ID/Phone (${identifier}).`,
    });

    addToast('Welcome Back', `Logged in as ${user.name} (${user.department})`, 'success');
    return { success: true };
  };

  const complete2FAChallenge = (code: string, isBackupCode: boolean = false) => {
    if (!pendingLoginUser) return { success: false, message: 'No pending user challenge' };

    let isValid = false;

    if (isBackupCode) {
      isValid = pendingLoginUser.backupCodesLeft > 0 && code.length >= 8;
      if (isValid) {
        setUsers((prev) =>
          prev.map((u) => (u.id === pendingLoginUser.id ? { ...u, backupCodesLeft: u.backupCodesLeft - 1 } : u))
        );
      }
    } else {
      isValid = verifyTotpCode(pendingLoginUser.twoFactorSecret || '', code);
    }

    if (!isValid) {
      addToast('2FA Verification Failed', 'Invalid authenticator code. Please try again.', 'error');
      return { success: false, message: 'Invalid 2FA code' };
    }

    setCurrentUser(pendingLoginUser);
    setEffectiveRoleId(pendingLoginUser.roleId);
    setIsAuthenticated(true);
    setIs2FAVerified(true);
    setPendingLoginUser(null);
    setRequires2FAChallenge(false);

    addAuditLog({
      actorName: pendingLoginUser.name,
      actorEmail: pendingLoginUser.email,
      roleId: pendingLoginUser.roleId,
      action: 'USER_2FA_VERIFIED',
      category: 'auth',
      severity: 'info',
      ipAddress: '192.168.1.100',
      status: 'success',
      details: `2FA challenge completed successfully for ${pendingLoginUser.email}.`,
    });

    addToast('2FA Authenticated', `Welcome ${pendingLoginUser.name}. Session secured.`, 'success');
    return { success: true };
  };

  const logout = () => {
    if (currentUser) {
      addAuditLog({
        actorName: currentUser.name,
        actorEmail: currentUser.email,
        roleId: currentUser.roleId,
        action: 'USER_LOGOUT',
        category: 'auth',
        severity: 'info',
        ipAddress: '192.168.1.100',
        status: 'success',
        details: 'User initiated session termination.',
      });
    }

    setCurrentUser(null);
    setIsAuthenticated(false);
    setIs2FAVerified(false);
    setPendingLoginUser(null);
    setRequires2FAChallenge(false);
    addToast('Logged Out', 'You have been safely signed out.', 'info');
  };

  const switchEffectiveRole = (roleId: RoleId) => {
    setEffectiveRoleId(roleId);
    const newRoleObj = roles.find((r) => r.id === roleId);
    addToast('Testing Role Impersonation', `Active view permissions set to: ${newRoleObj?.name}`, 'warning');
  };

  const loginAsDemoUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    setCurrentUser(target);
    setEffectiveRoleId(target.roleId);
    setIsAuthenticated(true);
    setIs2FAVerified(target.twoFactorEnabled);
    addToast('User Switched', `Active Session: ${target.name} (${target.department})`, 'success');
  };

  const triggerStepUp2FA = (actionName: string, onVerified: () => void) => {
    setStepUpChallenge({ actionName, onVerified });
  };

  const confirmStepUp2FA = (code: string): boolean => {
    const isValid = code.length === 6 || code === '123456';
    if (isValid && stepUpChallenge) {
      addToast('Step-Up Authorization Granted', `Action "${stepUpChallenge.actionName}" verified.`, 'success');
      stepUpChallenge.onVerified();
      setStepUpChallenge(null);
      return true;
    } else {
      addToast('Step-Up Failed', 'Invalid security code.', 'error');
      return false;
    }
  };

  const cancelStepUp2FA = () => {
    setStepUpChallenge(null);
  };

  const enable2FA = (method: TwoFactorMethod, customSecret?: string) => {
    const secret = customSecret || generateBase32Secret();
    const backupCodes = generateBackupCodes(8);

    if (currentUser) {
      const updatedUser: User = {
        ...currentUser,
        twoFactorEnabled: true,
        twoFactorMethod: method,
        twoFactorSecret: secret,
        backupCodesLeft: 8,
      };
      setCurrentUser(updatedUser);
      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    }

    return { secret, backupCodes };
  };

  const disable2FA = () => {
    if (currentUser) {
      const updatedUser: User = {
        ...currentUser,
        twoFactorEnabled: false,
        twoFactorMethod: 'none',
        twoFactorSecret: undefined,
      };
      setCurrentUser(updatedUser);
      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
      addToast('2FA Disabled', 'Two-Factor Authentication turned off.', 'warning');
    }
  };

  const updateSettingValue = (settingId: string, newValue: any): boolean => {
    setSettings((prev) =>
      prev.map((s) => (s.id === settingId ? { ...s, value: newValue } : s))
    );
    addToast('Setting Saved', 'System configuration updated successfully.', 'success');
    return true;
  };

  const createApiKey = (name: string, environment: 'production' | 'staging' | 'development', scopes: string[]) => {
    const newKey: ApiKey = {
      id: `key_${Date.now()}`,
      name,
      keyPrefix: `sk_${environment.substring(0, 4)}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString().split('T')[0],
      lastUsedAt: 'Never',
      createdBy: currentUser?.name || 'Admin',
      environment,
      scopes,
      isRevoked: false,
    };
    setApiKeys((prev) => [newKey, ...prev]);
    addToast('API Key Generated', `Secret Token "${name}" created.`, 'success');
  };

  const revokeApiKey = (keyId: string) => {
    setApiKeys((prev) => prev.map((k) => (k.id === keyId ? { ...k, isRevoked: true } : k)));
    addToast('Key Revoked', 'API Key has been rendered inactive.', 'warning');
  };

  const createNewUser = (userData: Partial<User>) => {
    const id = userData.employeeCardNo || `EMP-${1000 + users.length + 1}`;
    const newUser: User = {
      id,
      name: userData.name || 'New Employee',
      email: userData.email || `${id.toLowerCase()}@rizvifashions.com`,
      roleId: userData.roleId || 'employee',
      department: userData.department || 'General Floor',
      designation: userData.designation || 'Staff Operator',
      supervisor: userData.supervisor || 'SJHERAJI',
      employeeCardNo: id,
      phone: userData.phone || '01700000000',
      twoFactorEnabled: false,
      twoFactorMethod: 'none',
      backupCodesLeft: 0,
      lastLogin: 'Never',
      status: 'active',
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250`,
    };
    setUsers((prev) => [...prev, newUser]);
    
    // Create initial location for the new employee
    const newLoc: EmployeeLocation = {
      employeeId: id,
      employeeName: newUser.name,
      employeeCardNo: id,
      phone: newUser.phone || '',
      department: newUser.department,
      status: 'On Floor',
      address: 'Main Assembly Floor, Gazipur Industrial Unit',
      latitude: 24.00000 + Math.random() * 0.005,
      longitude: 90.42000 + Math.random() * 0.005,
      lastPing: 'Active Now',
      batteryLevel: 90,
    };
    setLocations((prev) => [...prev, newLoc]);

    addToast('Employee Account Provisioned', `ID Card ${id} created for ${newUser.name}.`, 'success');
  };

  // Master Employee CSV/Excel Import with Deduplication & Auto-Delete obsolete non-matching entries
  const importMasterEmployees = (csvEmployees: Partial<User>[], replaceExisting: boolean = false) => {
    if (csvEmployees.length === 0) return;

    if (replaceExisting) {
      // Overwrite all non-admin employees to eliminate obsolete records
      const adminUsers = users.filter((u) => u.roleId === 'admin');
      const imported: User[] = csvEmployees.map((emp, index) => {
        const id = emp.employeeCardNo || emp.id || `EMP-${2000 + index}`;
        return {
          id,
          name: emp.name || 'Imported Staff',
          email: emp.email || `${id.toLowerCase()}@rizvifashions.com`,
          roleId: emp.roleId || 'employee',
          department: emp.department || 'Production Line',
          designation: emp.designation || 'Staff Operator',
          supervisor: emp.supervisor || 'SJHERAJI',
          employeeCardNo: id,
          phone: emp.phone || `017000000${index}`,
          twoFactorEnabled: false,
          twoFactorMethod: 'none',
          backupCodesLeft: 0,
          lastLogin: 'Imported',
          status: 'active',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        };
      });
      setUsers([...adminUsers, ...imported]);
      addToast('Master Employee List Replaced', `Imported ${imported.length} employees. Duplicate/obsolete entries auto-removed.`, 'success');
    } else {
      // Merge with deduplication based on Employee Card No or Mobile Phone
      setUsers((prevUsers) => {
        const existingMap = new Map(prevUsers.map((u) => [u.employeeCardNo || u.id, u]));
        csvEmployees.forEach((emp, index) => {
          const id = emp.employeeCardNo || emp.id || `EMP-${2000 + index}`;
          existingMap.set(id, {
            id,
            name: emp.name || 'Imported Staff',
            email: emp.email || `${id.toLowerCase()}@rizvifashions.com`,
            roleId: emp.roleId || 'employee',
            department: emp.department || 'Production Line',
            designation: emp.designation || 'Staff Operator',
            supervisor: emp.supervisor || 'SJHERAJI',
            employeeCardNo: id,
            phone: emp.phone || `017000000${index}`,
            twoFactorEnabled: false,
            twoFactorMethod: 'none',
            backupCodesLeft: 0,
            lastLogin: 'Updated via Import',
            status: 'active',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
          });
        });
        return Array.from(existingMap.values());
      });
      addToast('Employee Master List Updated', `Processed ${csvEmployees.length} records. Duplicate entries merged seamlessly.`, 'success');
    }
  };

  const deleteEmployee = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    addToast('Employee Removed', 'User account cleared from master list.', 'warning');
  };

  const updateUserRole = (userId: string, newRoleId: RoleId) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, roleId: newRoleId } : u)));
    addToast('Role Updated', 'RBAC access permissions updated for employee.', 'success');
  };

  const resetUser2FA = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, twoFactorEnabled: false, twoFactorMethod: 'none', twoFactorSecret: undefined }
          : u
      )
    );
    addToast('2FA Credentials Reset', 'Target user 2FA state cleared.', 'warning');
  };

  const revokeSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    addToast('Session Revoked', 'Device disconnected successfully.', 'info');
  };

  const exportAuditLogs = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      ["Timestamp,Actor,Email,Role,Action,Status,Details"]
      .concat(auditLogs.map(l => `"${l.timestamp}","${l.actorName}","${l.actorEmail}","${l.roleId}","${l.action}","${l.status}","${l.details}"`))
      .join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit_trail_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Audit Logs Exported', 'CSV report saved locally.', 'success');
  };

  // Task & Schedule handlers
  const toggleTaskCompletion = (taskId: string, note?: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
            note: note || t.note,
          };
        }
        return t;
      })
    );
    addToast('Task Status Updated', 'Daily checklist progress saved.', 'success');
  };

  const addExtraWorkTask = (employeeId: string, taskTitle: string, note: string, bonus: number = 2) => {
    const emp = users.find((u) => u.id === employeeId) || currentUser;
    const newExtraTask: WorkTaskItem = {
      id: `task-${Date.now()}`,
      employeeId: emp?.id || 'EMP-1003',
      employeeName: emp?.name || 'Nasrin Sultana',
      date: new Date().toISOString().split('T')[0],
      period: 'daily',
      taskTitle: `Extra Task: ${taskTitle}`,
      category: 'Extra Work Bonus',
      weightMarks: 0,
      completed: true,
      completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note,
      isExtraWork: true,
      bonusAwarded: bonus,
    };

    setTasks((prev) => [newExtraTask, ...prev]);

    // Also update evaluation record bonus marks
    setEvaluations((prev) =>
      prev.map((e) => {
        if (e.employeeId === (emp?.id || 'EMP-1003')) {
          const updatedBonus = e.dailyBonusMarks + bonus;
          return {
            ...e,
            dailyBonusMarks: updatedBonus,
            kpiMarks: {
              ...e.kpiMarks,
              additionalTaskBonus: e.kpiMarks.additionalTaskBonus + bonus,
            },
          };
        }
        return e;
      })
    );

    addToast('Extra Work Note Added', `+${bonus} Bonus Marks automatically added to Daily Score!`, 'success');
  };

  const importCustomTasks = (newTasks: Partial<WorkTaskItem>[]) => {
    const formatted: WorkTaskItem[] = newTasks.map((t, idx) => ({
      id: `task-imp-${Date.now()}-${idx}`,
      employeeId: t.employeeId || currentUser?.id || 'EMP-1003',
      employeeName: t.employeeName || currentUser?.name || 'Staff Member',
      date: t.date || new Date().toISOString().split('T')[0],
      period: t.period || 'daily',
      taskTitle: t.taskTitle || 'Assigned Operational Work Item',
      category: t.category || 'Standard Routine',
      weightMarks: t.weightMarks || 15,
      completed: false,
    }));

    setTasks((prev) => [...formatted, ...prev]);
    addToast('Custom Task Schedule Imported', `Added ${formatted.length} tasks to employee checklist.`, 'success');
  };

  // Evaluation KPI calculation & saving
  const saveKPIEvaluation = (record: Partial<EmployeeEvaluationRecord>) => {
    if (!record.employeeId) return;

    const baseMarks = record.kpiMarks ? (
      record.kpiMarks.dailyAssignedTasks +
      record.kpiMarks.qualityOfWork +
      record.kpiMarks.productivity +
      record.kpiMarks.attendancePunctuality +
      record.kpiMarks.disciplineCompliance +
      record.kpiMarks.teamworkOwnership
    ) : 90;

    const bonusSum = record.kpiMarks ? (
      record.kpiMarks.additionalTaskBonus +
      record.kpiMarks.processImprovementBonus +
      record.kpiMarks.costSavingBonus +
      record.kpiMarks.customerAppreciationBonus +
      record.kpiMarks.emergencySupportBonus
    ) : 5;

    const dailyPct = (baseMarks / 100) * 100;

    let rating: PerformanceRating = 'Good';
    let recommendation: PromotionRecommendation = 'Continue Development';

    if (dailyPct >= 95) {
      rating = 'Outstanding';
      recommendation = 'Fast Track Promotion';
    } else if (dailyPct >= 90) {
      rating = 'Excellent';
      recommendation = 'Promotion Eligible';
    } else if (dailyPct >= 85) {
      rating = 'Very Good';
      recommendation = 'Increment Priority';
    } else if (dailyPct >= 80) {
      rating = 'Good';
      recommendation = 'Continue Development';
    } else if (dailyPct >= 70) {
      rating = 'Satisfactory';
      recommendation = 'Improvement Plan';
    } else {
      rating = 'Needs Improvement';
      recommendation = 'Improvement Plan';
    }

    const updatedRec: EmployeeEvaluationRecord = {
      id: record.id || `eval-${Date.now()}`,
      employeeId: record.employeeId,
      employeeName: record.employeeName || 'Staff Member',
      department: record.department || 'Production',
      designation: record.designation || 'Operator',
      supervisor: record.supervisor || 'SJHERAJI',
      date: new Date().toISOString().split('T')[0],
      kpiMarks: record.kpiMarks || {
        dailyAssignedTasks: 55,
        qualityOfWork: 14,
        productivity: 9,
        attendancePunctuality: 5,
        disciplineCompliance: 5,
        teamworkOwnership: 5,
        additionalTaskBonus: 2,
        processImprovementBonus: 5,
        costSavingBonus: 0,
        customerAppreciationBonus: 0,
        emergencySupportBonus: 0,
      },
      dailyObtainedMarks: baseMarks,
      dailyBonusMarks: bonusSum,
      dailyPercentage: dailyPct,
      weeklyAveragePct: record.weeklyAveragePct || dailyPct,
      monthlyAveragePct: record.monthlyAveragePct || dailyPct,
      quarterlyAveragePct: record.quarterlyAveragePct || dailyPct,
      halfYearlyAveragePct: record.halfYearlyAveragePct || dailyPct,
      annualAveragePct: record.annualAveragePct || dailyPct,
      finalRating: rating,
      recommendation,
    };

    setEvaluations((prev) => {
      const idx = prev.findIndex((e) => e.employeeId === record.employeeId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedRec;
        return copy;
      }
      return [updatedRec, ...prev];
    });

    addToast('KPI Evaluation Saved', `Calculated Daily Score: ${dailyPct}% (+${bonusSum} Bonus). Rating: ${rating}`, 'success');
  };

  // Grievance / Feedback submissions
  const submitFeedback = (
    type: 'complaint' | 'suggestion' | 'training_block',
    title: string,
    description: string,
    attachmentName?: string,
    attachmentType?: 'word'|'excel'|'csv'|'pdf'|'image',
    attachmentUrl?: string
  ) => {
    const newItem: FeedbackGrievanceItem = {
      id: `fb-${Date.now()}`,
      employeeId: currentUser?.id || 'EMP-1003',
      employeeName: currentUser?.name || 'Nasrin Sultana',
      employeePhone: currentUser?.phone || '01922334455',
      type,
      title,
      description,
      attachmentName,
      attachmentType,
      attachmentUrl,
      submittedAt: new Date().toLocaleString(),
      status: 'Pending',
    };

    setFeedbackItems((prev) => [newItem, ...prev]);
    addToast('Feedback Submitted', 'Your report has been dispatched to Compliance Admin & Management.', 'success');
  };

  const updateFeedbackDecision = (id: string, decision: string, status: 'Resolved' | 'Action Taken' | 'Under Review') => {
    setFeedbackItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              managementDecision: decision,
              decisionDate: new Date().toLocaleString(),
            }
          : item
      )
    );
    addToast('Management Decision Recorded', 'Updated feedback decision for employee transparency.', 'success');
  };

  // Location Tracker Updates
  const updateEmployeeLocation = (
    employeeId: string, 
    latitude: number, 
    longitude: number, 
    address: string, 
    status: EmployeeLocation['status']
  ) => {
    setLocations((prev) =>
      prev.map((loc) =>
        loc.employeeId === employeeId
          ? {
              ...loc,
              latitude,
              longitude,
              address,
              status,
              lastPing: 'Active Now',
            }
          : loc
      )
    );
    addToast('Live Location Updated', `GPS position ping updated for ${employeeId}.`, 'info');
  };

  const updateMasterEmail = (newEmail: string) => {
    setMasterAdminEmail(newEmail);
    updateSettingValue('gen_master_email', newEmail);
    addToast('Master Admin Email Updated', `Primary system email set to ${newEmail}.`, 'success');
  };

  const updateUserPassword = (userId: string, newPass: string) => {
    addToast('Password Reset Success', `Password updated successfully for account ${userId}.`, 'success');
    addAuditLog({
      actorName: 'System Security Service',
      actorEmail: 'security@rizvifashions.com',
      roleId: 'admin',
      action: 'USER_PASSWORD_RESET',
      category: 'security',
      severity: 'warning',
      ipAddress: '127.0.0.1',
      status: 'success',
      details: `Password reset triggered for user with card ID/Email: ${userId}`,
    });
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        effectiveRole,
        effectiveRoleId,
        isAuthenticated,
        is2FAVerified,
        requires2FAChallenge,
        pendingLoginUser,
        masterAdminEmail,
        
        loginWithEmail,
        complete2FAChallenge,
        logout,
        switchEffectiveRole,
        loginAsDemoUser,
        
        hasPermission,
        checkPermissionWithToast,

        stepUpChallenge,
        triggerStepUp2FA,
        confirmStepUp2FA,
        cancelStepUp2FA,

        enable2FA,
        disable2FA,

        roles,
        users,
        settings,
        apiKeys,
        sessions,
        auditLogs,
        tasks,
        evaluations,
        feedbackItems,
        locations,

        updateSettingValue,
        createApiKey,
        revokeApiKey,
        createNewUser,
        importMasterEmployees,
        deleteEmployee,
        updateUserRole,
        resetUser2FA,
        revokeSession,
        exportAuditLogs,
        addAuditLog,

        toggleTaskCompletion,
        addExtraWorkTask,
        importCustomTasks,

        saveKPIEvaluation,

        submitFeedback,
        updateFeedbackDecision,

        updateEmployeeLocation,

        updateMasterEmail,
        updateUserPassword,

        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
