import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DemoProvider, useDemo } from './context/DemoContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import PaySureCopilot from './components/assistant/PaySureCopilot';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import RecoveryPage from './pages/RecoveryPage';
import SureEnginePage from './pages/SureEnginePage';
import DuplicateGuardianPage from './pages/DuplicateGuardianPage';
import FailureDetectivePage from './pages/FailureDetectivePage';
import ReconciliationPage from './pages/ReconciliationPage';
import DisputesPage from './pages/DisputesPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [targetTxRef, setTargetTxRef] = useState(null);

  // If user clicks explore or starts demo, navigate to dashboard
  const handleExploreDashboard = () => {
    setCurrentTab('dashboard');
  };

  const handleSelectTransactionForRecovery = (txRef) => {
    setTargetTxRef(txRef);
    setCurrentTab('recovery');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-brand-navy flex items-center justify-center text-brand-cyan animate-pulse">
            <span className="font-black text-xs">PS</span>
          </div>
          <p className="text-xs font-bold text-slate-600">Initializing PaySure AI Environment...</p>
        </div>
      </div>
    );
  }

  // Standalone public routes
  if (currentTab === 'landing') {
    return (
      <LandingPage
        onExploreDashboard={handleExploreDashboard}
        onLogin={() => setCurrentTab('login')}
      />
    );
  }

  if (currentTab === 'login') {
    return (
      <LoginPage
        onNavigateToDashboard={() => setCurrentTab('dashboard')}
        onNavigateToRegister={() => setCurrentTab('register')}
      />
    );
  }

  if (currentTab === 'register') {
    return (
      <RegisterPage
        onNavigateToDashboard={() => setCurrentTab('dashboard')}
        onNavigateToLogin={() => setCurrentTab('login')}
      />
    );
  }

  // Main Authenticated / Demo Layout
  return (
    <div className="min-h-screen bg-brand-lightBg flex flex-col">
      {/* 1. Top Global Navigation Header */}
      <Navbar onNavigate={setCurrentTab} currentTab={currentTab} />

      {/* 3. Main Workspace Area: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar currentTab={currentTab} onNavigate={setCurrentTab} />

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage
              onNavigate={setCurrentTab}
              onSelectTransactionForRecovery={handleSelectTransactionForRecovery}
            />
          )}

          {currentTab === 'recovery' && (
            <RecoveryPage initialTxRef={targetTxRef} />
          )}

          {currentTab === 'sure-engine' && (
            <SureEnginePage />
          )}

          {currentTab === 'duplicates' && (
            <DuplicateGuardianPage />
          )}

          {currentTab === 'failure-detective' && (
            <FailureDetectivePage onNavigateToRecovery={handleSelectTransactionForRecovery} />
          )}

          {currentTab === 'reconciliation' && (
            <ReconciliationPage />
          )}

          {currentTab === 'disputes' && (
            <DisputesPage />
          )}

          {currentTab === 'subscriptions' && (
            <SubscriptionsPage />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsPage />
          )}

          {currentTab === 'settings' && (
            <SettingsPage />
          )}
        </main>
      </div>

      {/* 4. Global PaySure Assistant Copilot */}
      <PaySureCopilot />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DemoProvider>
        <AppContent />
      </DemoProvider>
    </AuthProvider>
  );
}
