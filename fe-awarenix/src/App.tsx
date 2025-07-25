  import { lazy, Suspense, useEffect } from "react"; // Import useEffect
  import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"; // Import useLocation

  import AppLayout from "./layout/AppLayout";
  import ProtectedRoute from "./components/utils/ProtectedRoute";
  import PublicRoute from "./components/utils/PublicRoute";
  import { ScrollToTop } from "./components/common/ScrollToTop";
  import { AlertContainer } from "./components/utils/AlertContainer";
  import AuthWatcher from "./components/utils/AuthWatcher";
  import { UserSessionProvider } from "./components/context/UserSessionContext";
  import { AccountSettings } from "./pages/AccountSettings/AccountSettings";
  import ThankYouReport from "./pages/OtherPage/ThanksReport";

  const Lander = lazy(() => import("./pages/LandingPages/Lander"));
  const SignIn = lazy(() => import("./pages/AuthPages/SignIn"));
  const NotFound = lazy(() => import("./pages/OtherPage/NotFound"));
  const UserProfiles = lazy(() => import("./pages/UserProfiles"));
  const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
  const CampaignDetail = lazy(() => import("./pages/Dashboard/CampaignDetail"));  
  const Campaigns = lazy(() => import("./pages/Campaings/Campaigns"));
  const RoleManagement = lazy(() => import("./pages/RoleManagement/RoleManagement"));
  const UserManagement = lazy(() => import("./pages/UserManagement/UserManagement"));
  const MembersGroups = lazy(() => import("./pages/UsersGroups/MembersGroups"));
  const EmailTemplates = lazy(() => import("./pages/EmailTemplates/EmailTemplates"));
  const SendingProfiles = lazy(() => import("./pages/SendingProfiles/SendingProfiles"));
  const LandingPages = lazy(() => import("./pages/LandingPages/LandingPages"));
  const PhishingEmail = lazy(() => import("./pages/PhisingEmail/PhisingEmail"));
  const PhishingWebsite = lazy(() => import("./pages/PhisingWebsite/PhisingWebsite"));
  const TrainingModules = lazy(() => import("./pages/TrainingModules/TrainingModules"));
  const LoggingActivity = lazy(() => import("./pages/LoggingActivity/LoggingActivity"));
  const CommingSoon = lazy(() => import("./pages/OtherPage/CommingSoon"));
  const Unauthorized = lazy(() => import("./pages/OtherPage/Unauthorized"));

  import { routeTitles } from "./components/utils/RouteTiles";

  function PageTitleUpdater() {
    const location = useLocation();
    // const baseTitle = "Awarenix"; 

    useEffect(() => {
      const path = location.pathname;
      const pageTitle = routeTitles[path] || routeTitles["*"];
      document.title = `${pageTitle} `;
    }, [location.pathname]);

    return null; 
  }

  export default function App() {
    return (
      <>
        {/* Hapus Helmet di sini */}
        <Router>
          <UserSessionProvider>
            <ScrollToTop />
            <AuthWatcher />
            <PageTitleUpdater /> 
            <Suspense fallback={<div className="flex items-center justify-center h-screen text-lg font-semibold text-gray-700">Loading...</div>}>
              <Routes>
                {/* Protected Routes (di dalam layout) */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route index path="/profile" element={<UserProfiles />} />
                    <Route index path="/dashboard" element={<Dashboard />} />
                    <Route path="/dashboard/campaign-detail/:campaignId" element={<CampaignDetail />} />
                    <Route path="/campaigns" element={<Campaigns />} />
                    <Route path="/role-management" element={<RoleManagement />} />
                    <Route path="/user-management" element={<UserManagement />} />
                    <Route path="/groups-members" element={<MembersGroups />} />
                    <Route path="/email-templates" element={<EmailTemplates />} />
                    <Route path="/sending-profiles" element={<SendingProfiles />} />
                    <Route path="/landing-pages" element={<LandingPages />} />
                    <Route path="/phishing-emails" element={<PhishingEmail />} />
                    <Route path="/phishing-websites" element={<PhishingWebsite />} />
                    <Route path="/training-modules" element={<TrainingModules />} />
                    {/* <Route path="/subscription-billing" element={<CommingSoon />} /> */}
                    <Route path="/account-settings" element={<AccountSettings />} />
                    <Route path="/logging-activity" element={<LoggingActivity />} />
                    <Route path="/environtment-check" element={<CommingSoon />} />
                  </Route>
                </Route>

                {/* PUBLIC ROUTE */}
                <Route path="/lander" element={<Lander />} />
                <Route path="/report-thanks" element={<ThankYouReport />} />

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

                {/* Fallback */}
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </UserSessionProvider>
        </Router>
        <AlertContainer />
      </>
    );
  }