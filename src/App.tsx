import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
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

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <HashRouter>
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
        </HashRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
