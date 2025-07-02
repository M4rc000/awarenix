import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; 
import { Helmet } from "react-helmet-async";

// Import komponen yang tidak di-lazy-load (misalnya, komponen layout atau yang selalu ada)
import AppLayout from "./layout/AppLayout";
import ProtectedRoute from "./components/utils/ProtectedRoute";
import PublicRoute from "./components/utils/PublicRoute";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { AlertContainer } from "./components/utils/AlertContainer";
import AuthWatcher from "./components/utils/AuthWatcher";
import { UserSessionProvider } from "./components/context/UserSessionContext";
import Dashboard from "./pages/Dashboard/Dashboard";

// Lazy-load komponen halaman
const SignIn = lazy(() => import("./pages/AuthPages/SignIn"));
// const SignUp = lazy(() => import("./pages/AuthPages/SignUp"));
// const ForgotPassword = lazy(() => import("./components/auth/ForgotPassword"));
const NotFound = lazy(() => import("./pages/OtherPage/NotFound"));
// const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const Campaigns = lazy(() => import("./pages/Campaings/Campaigns"));
const UserManagement = lazy(() => import("./pages/UserManagement/UserManagement"));
const MembersGroups = lazy(() => import("./pages/UsersGroups/MembersGroups"));
const EmailTemplates = lazy(() => import("./pages/EmailTemplates/EmailTemplates"));
const SendingProfiles = lazy(() => import("./pages/SendingProfiles/SendingProfiles"));
const LandingPages = lazy(() => import("./pages/LandingPages/LandingPages"));
const PhishingEmail = lazy(() => import("./pages/PhisingEmail/PhisingEmail"));


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
          {/* Suspense untuk menangani lazy loading */}
          <Suspense fallback={<div className="flex items-center justify-center h-screen text-lg font-semibold text-gray-700">Loading...</div>}>
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
              <Route
                path="/"
                element={
                  <PublicRoute>
                    <SignIn />
                  </PublicRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <SignIn />
                  </PublicRoute>
                }
              />
              {/* <Route
                path="/register"
                element={
                  <PublicRoute>
                    <SignUp />
                  </PublicRoute>
                }
              /> */}
              {/* <Route path="/reset-password" element={<ForgotPassword />} /> */}

              {/* Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </UserSessionProvider>
      </Router>
      <AlertContainer />
    </>
  );
}