export type RoleId = 
  | 'admin'
  | 'manager'
  | 'employee'
  | 'super_admin' 
  | 'security_admin' 
  | 'it_ops' 
  | 'compliance_auditor' 
  | 'content_manager' 
  | 'guest_staff';

export type Permission = 
  | 'settings:read_general'
  | 'settings:edit_general'
  | 'settings:read_security'
  | 'settings:edit_security'
  | 'settings:enforce_2fa'
  | 'settings:read_api'
  | 'settings:rotate_api_keys'
  | 'settings:read_database'
  | 'settings:edit_database'
  | 'users:view'
  | 'users:create'
  | 'users:manage_roles'
  | 'users:reset_2fa'
  | 'audit:view_logs'
  | 'audit:export_logs'
  | 'tasks:manage'
  | 'tasks:view_own'
  | 'evaluations:manage'
  | 'evaluations:view_own'
  | 'employees:import'
  | 'feedback:submit'
  | 'feedback:manage'
  | 'location:track';

export interface RoleDefinition {
  id: RoleId;
  name: string;
  description: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  permissions: Permission[];
  isSystemRole?: boolean;
}

export type TwoFactorMethod = 'totp' | 'sms' | 'email' | 'hardware_key' | 'none';

export interface UserSession {
  id: string;
  deviceName: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  roleId: RoleId;
  department: string;
  twoFactorEnabled: boolean;
  twoFactorMethod: TwoFactorMethod;
  twoFactorSecret?: string;
  backupCodesLeft: number;
  lastLogin: string;
  status: 'active' | 'suspended' | 'pending';
  phone?: string;
  employeeCardNo?: string;
  designation?: string;
  supervisor?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string;
  createdBy: string;
  environment: 'production' | 'staging' | 'development';
  scopes: string[];
  isRevoked: boolean;
}

export interface SystemSetting {
  id: string;
  key: string;
  category: 'security' | 'general' | 'database' | 'api' | 'notifications';
  title: string;
  description: string;
  value: any;
  type: 'boolean' | 'string' | 'number' | 'select';
  options?: { label: string; value: any }[];
  requiredPermission: Permission;
  requiresStepUp2FA?: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorEmail: string;
  roleId: RoleId;
  action: string;
  category: 'auth' | 'security' | 'user' | 'api' | 'system';
  severity: 'info' | 'warning' | 'danger';
  ipAddress: string;
  status: 'success' | 'denied' | 'failed';
  details: string;
}

// Enterprise KPI & Evaluation Model Types
export type SchedulePeriod = 'daily' | 'weekly' | 'monthly' | 'half_yearly' | 'annual';

export interface WorkTaskItem {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  period: SchedulePeriod;
  taskTitle: string;
  category: string;
  weightMarks: number;
  completed: boolean;
  completedAt?: string;
  note?: string;
  isExtraWork?: boolean;
  bonusAwarded?: number;
}

export interface KPIModel100 {
  // Base Marks (Total 100)
  dailyAssignedTasks: number; // Max 60
  qualityOfWork: number;       // Max 15
  productivity: number;        // Max 10
  attendancePunctuality: number; // Max 5
  disciplineCompliance: number;  // Max 5
  teamworkOwnership: number;     // Max 5
  // Extra Achievements Bonus (Can exceed 100)
  additionalTaskBonus: number;   // +2 per item
  processImprovementBonus: number; // +5
  costSavingBonus: number;        // +10
  customerAppreciationBonus: number; // +5
  emergencySupportBonus: number; // +5
}

export type PerformanceRating = 
  | 'Outstanding'       // 95-100%
  | 'Excellent'         // 90-94%
  | 'Very Good'         // 85-89%
  | 'Good'              // 80-84%
  | 'Satisfactory'      // 70-79%
  | 'Needs Improvement' // 60-69%
  | 'Unsatisfactory';   // Below 60%

export type PromotionRecommendation = 
  | 'Fast Track Promotion'
  | 'Promotion Eligible'
  | 'Increment Priority'
  | 'Continue Development'
  | 'Improvement Plan';

export interface EmployeeEvaluationRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  supervisor: string;
  date: string;
  kpiMarks: KPIModel100;
  dailyObtainedMarks: number; // Out of 100 base
  dailyBonusMarks: number;    // Bonus sum
  dailyPercentage: number;    // (Obtained / 100) * 100
  weeklyAveragePct: number;
  monthlyAveragePct: number;
  quarterlyAveragePct: number;
  halfYearlyAveragePct: number;
  annualAveragePct: number;
  finalRating: PerformanceRating;
  recommendation: PromotionRecommendation;
}

export interface FeedbackGrievanceItem {
  id: string;
  employeeId: string;
  employeeName: string;
  employeePhone: string;
  type: 'complaint' | 'suggestion' | 'training_block';
  title: string;
  description: string;
  attachmentName?: string;
  attachmentType?: 'word' | 'excel' | 'csv' | 'pdf' | 'image';
  attachmentUrl?: string;
  submittedAt: string;
  status: 'Pending' | 'Under Review' | 'Resolved' | 'Action Taken';
  managementDecision?: string;
  decisionDate?: string;
}

export interface EmployeeLocation {
  employeeId: string;
  employeeName: string;
  employeeCardNo: string;
  phone: string;
  department: string;
  status: 'On Floor' | 'In Transit' | 'Remote Site' | 'Off Duty' | 'Geofence Alert';
  address: string;
  latitude: number;
  longitude: number;
  lastPing: string;
  batteryLevel: number;
}

export type ActiveTab = 
  | 'overview' 
  | 'tasks'
  | 'evaluations'
  | 'employees'
  | 'location_tracker'
  | 'feedback'
  | 'roles' 
  | 'security' 
  | 'users' 
  | 'api_keys' 
  | 'infrastructure' 
  | 'audit_logs'
  | 'admin_settings'
  | 'my_profile';
