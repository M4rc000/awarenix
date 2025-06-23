import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import Campaigns from "./pages/Campaings/Campaigns";
import ProtectedRoute from "./components/utils/ProtectedRoute";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { Helmet } from "react-helmet-async";
import Dashboard from "./pages/Dashboard/Dashboard";
import MembersGroups from "./pages/UsersGroups/MembersGroups";
import EmailTemplates from "./pages/EmailTemplates/EmailTemplates";
import ForgotPassword from "./components/auth/ForgotPassword";
import SendingProfiles from "./pages/SendingProfiles/SendingProfiles"
import LandingPages from "./pages/LandingPages/LandingPages";
import PhishingEmail from "./pages/PhisingEmail/PhisingEmail";
import { AlertContainer } from "./components/utils/AlertContainer";
import AuthWatcher from "./components/utils/AuthWatcher";
import { UserSessionProvider } from "./components/context/UserSessionContext";
import PublicRoute from "./components/utils/PublicRoute";
import UserManagement from "./pages/UserManagement/UserManagement";

export default function App() {
  return (
    <>
      <Helmet>
        <title>Awarenix - i3</title>
      </Helmet>
      <Router>
        <UserSessionProvider>
          <ScrollToTop />
          <AuthWatcher />
          <Routes>
            {/* Protected Routes (di dalam layout) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route index path="/dashboard" element={<Dashboard />} />
                <Route path="/campaigns" element={<Campaigns />} />
                <Route path="/user-management" element={<UserManagement />} />
                <Route path="/groups-members" element={<MembersGroups />} />
                <Route path="/email-templates" element={<EmailTemplates />} />
                <Route path="/sending-profiles" element={<SendingProfiles />} />
                <Route path="/landing-pages" element={<LandingPages />} />
                <Route path="/phising-emails" element={<PhishingEmail />} />
              </Route>
            </Route>

            {/* Auth Routes */}
            <Route path="/" element={
                <PublicRoute>
                  <SignIn />
                </PublicRoute>
              } />
              <Route path="/login" element={
                <PublicRoute>
                  <SignIn />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <SignUp />
                </PublicRoute>
              } />
              <Route path="/reset-password" element={<ForgotPassword />} />

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </UserSessionProvider>
      </Router>
      <AlertContainer />
    </>
  );
}