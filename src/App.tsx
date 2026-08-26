import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ActiveTab } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/ToastContainer';
import { StepUpModal } from './components/StepUpModal';
import { TwoFactorSetupModal } from './components/2FA/TwoFactorSetupModal';
import { BackupCodesModal } from './components/2FA/BackupCodesModal';

import { LoginView } from './views/LoginView';
import { DashboardOverview } from './views/DashboardOverview';
import { DailyTasksView } from './views/DailyTasksView';
import { EvaluationsView } from './views/EvaluationsView';
import { MasterEmployeesView } from './views/MasterEmployeesView';
import { FeedbackView } from './views/FeedbackView';
import { LocationTrackerView } from './views/LocationTrackerView';
import { SecuritySettingsView } from './views/SecuritySettingsView';
import { RolesPermissionsView } from './views/RolesPermissionsView';
import { ApiKeysView } from './views/ApiKeysView';
import { InfrastructureView } from './views/InfrastructureView';
import { AuditLogsView } from './views/AuditLogsView';
import { AdminSettingsView } from './views/AdminSettingsView';
import { MyProfileView } from './views/MyProfileView';

const MainLayout: React.FC = () => {
  const { isAuthenticated, requires2FAChallenge } = useAuth();
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [show2FASetupModal, setShow2FASetupModal] = useState(false);
  const [showBackupCodesModal, setShowBackupCodesModal] = useState(false);

  // If not logged in OR pending 2FA login challenge, show Login View
  if (!isAuthenticated || requires2FAChallenge) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-[#050608] text-slate-100 flex flex-col font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Bar */}
      <Navbar
        onOpen2FASetup={() => setShow2FASetupModal(true)}
        onOpenBackupCodes={() => setShowBackupCodesModal(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic View Panel */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {activeTab === 'overview' && (
            <DashboardOverview
              setActiveTab={setActiveTab}
              onOpen2FASetup={() => setShow2FASetupModal(true)}
            />
          )}

          {activeTab === 'tasks' && <DailyTasksView />}

          {activeTab === 'evaluations' && <EvaluationsView />}

          {activeTab === 'employees' && <MasterEmployeesView />}

          {activeTab === 'feedback' && <FeedbackView />}

          {activeTab === 'location_tracker' && <LocationTrackerView />}

          {activeTab === 'roles' && <RolesPermissionsView />}

          {activeTab === 'security' && (
            <SecuritySettingsView
              onOpen2FASetup={() => setShow2FASetupModal(true)}
              onOpenBackupCodes={() => setShowBackupCodesModal(true)}
            />
          )}

          {activeTab === 'api_keys' && <ApiKeysView />}

          {activeTab === 'infrastructure' && <InfrastructureView />}

          {activeTab === 'audit_logs' && <AuditLogsView />}

          {activeTab === 'admin_settings' && <AdminSettingsView />}

          {activeTab === 'my_profile' && <MyProfileView />}
        </main>
      </div>

      {/* Modals & Overlay Alerts */}
      <StepUpModal />
      <TwoFactorSetupModal
        isOpen={show2FASetupModal}
        onClose={() => setShow2FASetupModal(false)}
      />
      <BackupCodesModal
        isOpen={showBackupCodesModal}
        onClose={() => setShowBackupCodesModal(false)}
      />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
