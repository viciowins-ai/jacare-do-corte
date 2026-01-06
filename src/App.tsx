import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './layouts';

// Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { HomePage } from './pages/HomePage';
import { SchedulePage } from './pages/SchedulePage';
import { ProfilePage } from './pages/ProfilePage';
import { SuccessBookingPage } from './pages/SuccessBookingPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

// Secondary Pages (Placeholder for now, mapped to Support/About/Settings if they exist or fallback)
// Assuming SecondaryPages.tsx exists or we might need to create placeholders if they break build.
// For now, I will comment them out if I'm not sure they exist, OR verify existence.
// Previous read of App.tsx showed them imported. I'll keep them but might need to ensure they exist.
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


export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Auth Routes - Public (No Bottom Nav) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<OTPVerificationPage />} />
          <Route path="/reset-success" element={<PasswordResetSuccessPage />} />

          {/* App Routes - Protected (With Bottom Nav) */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
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
            <Route path="/admin" element={<AdminDashboardPage />} />

            {/* Success Booking might technically be full screen, but usually fits in app flow. 
                Screenshot showed no nav? Actually Step 200 Image 2 shows Bottom Nav!
                So it stays here. */}
            <Route path="/booking-success" element={<SuccessBookingPage />} />
          </Route>

        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
