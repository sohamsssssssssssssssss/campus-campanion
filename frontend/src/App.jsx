import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const DocumentUpload = lazy(() => import('./pages/DocumentUpload'));
const RoommateMatcher = lazy(() => import('./pages/RoommateMatcher'));
const SafetyPage = lazy(() => import('./pages/SafetyPage'));
const AcademAI = lazy(() => import('./pages/AcademAI'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));

// Parent Portal Components
const ParentLogin = lazy(() => import('./pages/parent/ParentLogin'));
const ParentLayout = lazy(() => import('./layouts/ParentLayout'));
const ParentDashboard = lazy(() => import('./pages/parent/ParentDashboard'));
const ParentProgress = lazy(() => import('./pages/parent/ParentProgress'));
const ParentFees = lazy(() => import('./pages/parent/ParentFees'));
const ParentAcademics = lazy(() => import('./pages/parent/ParentAcademics'));
const ParentLocation = lazy(() => import('./pages/parent/ParentLocation'));
const ParentAlerts = lazy(() => import('./pages/parent/ParentAlerts'));
const ParentMentor = lazy(() => import('./pages/parent/ParentMentor'));

function Loading() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#0f172a]">
      <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isParentPortal = location.pathname.startsWith('/parent');

  return (
    <div className={`min-h-screen ${isParentPortal ? 'bg-[#0f172a]' : 'bg-surface text-content'}`}>
      {!isLanding && !isParentPortal && <Sidebar />}

      <main className={!isLanding && !isParentPortal ? 'sidebar-offset pt-14 lg:pt-0' : ''}>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Student/Main Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/onboarding" element={<OnboardingPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/documents" element={<DocumentUpload />} />
            <Route path="/roommates" element={<RoommateMatcher />} />
            <Route path="/safety" element={<SafetyPage />} />
            <Route path="/acad" element={<AcademAI />} />
            <Route path="/payment" element={<PaymentPage />} />

            {/* Parent Portal Routes */}
            <Route path="/parent-login" element={<ParentLogin />} />
            <Route path="/parent" element={<ParentLayout />}>
              <Route path="dashboard" element={<ParentDashboard />} />
              <Route path="progress" element={<ParentProgress />} />
              <Route path="fees" element={<ParentFees />} />
              <Route path="academics" element={<ParentAcademics />} />
              <Route path="location" element={<ParentLocation />} />
              <Route path="alerts" element={<ParentAlerts />} />
              <Route path="mentor" element={<ParentMentor />} />
            </Route>
          </Routes>
        </Suspense>
      </main>
      <Toaster position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
