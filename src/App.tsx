import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RequireProfileCompletion } from './components/RequireProfileCompletion';
import { AppLayout } from './layouts';

// Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CompleteRegisterPage } from './pages/CompleteRegisterPage';
import { HomePage } from './pages/HomePage';
import { SchedulePage } from './pages/SchedulePage';
import { ProfilePage } from './pages/ProfilePage';
import { SuccessBookingPage } from './pages/SuccessBookingPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { PaymentPage } from './pages/PaymentPage';
import { MaintenancePage } from './pages/MaintenancePage';

// ✅ Wrapper: shows maintenance page when admin blocks the app
// Admin email is always exempt (so they can re-enable it)
function AppStatusGate({ children }: { children: React.ReactNode }) {
  const { appStatus, user } = useAuth();
  const isMaster = user?.email === 'araucariainforma@gmail.com';
  if (appStatus === 'blocked' && !isMaster) {
    return <MaintenancePage />;
  }
  return <>{children}</>;
}

// Secondary Pages
import {
  OTPVerificationPage,
  PasswordResetSuccessPage,
  AboutAppPage,
  SettingsPage,
  SupportPage,
  RatingPage,
  FAQPage,
  ChatPage,
  ReportProblemPage,
  PrivacyPage,
  TermsPage
} from './pages/SecondaryPages';


import { ThemeProvider } from './contexts/ThemeContext';
import React from 'react';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <HashRouter>
          <AppStatusGate>
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />

              {/* Auth Routes - Public (No Bottom Nav) */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-otp" element={<OTPVerificationPage />} />
              <Route path="/reset-success" element={<PasswordResetSuccessPage />} />

              {/* Complete Profile Route - Protected but NOT checked for completion (to avoid loops) */}
              <Route path="/complete-register" element={
                <ProtectedRoute>
                  <CompleteRegisterPage />
                </ProtectedRoute>
              } />

              {/* Payment Route - Protected, Full Screen (No Nav) */}
              <Route path="/payment" element={
                <ProtectedRoute>
                  <RequireProfileCompletion>
                    <PaymentPage />
                  </RequireProfileCompletion>
                </ProtectedRoute>
              } />

              {/* App Routes - Protected & Require Profile Completion (With Bottom Nav) */}
              <Route element={
                <ProtectedRoute>
                  <RequireProfileCompletion>
                    <AppLayout />
                  </RequireProfileCompletion>
                </ProtectedRoute>
              }>
                <Route path="/home" element={<HomePage />} />
                <Route path="/agendar" element={<SchedulePage />} />
                <Route path="/perfil" element={<ProfilePage />} />

                <Route path="/about" element={<AboutAppPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/rating" element={<RatingPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/report" element={<ReportProblemPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/booking-success" element={<SuccessBookingPage />} />
              </Route>

              {/* Admin Route - Protected but WITHOUT AppLayout (Custom Nav) */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminDashboardPage />
                </ProtectedRoute>
              } />
            </Routes>
          </AppStatusGate>
        </HashRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
