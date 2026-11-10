
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

// Public
const Landing = lazy(() => import("../pages/public/Landing"));
const HowItWorks = lazy(() => import("../pages/public/HowItWorks"));
const Contact = lazy(() => import("../pages/public/Contact"));
const PubliceMap = lazy(() => import("../pages/public/ExploreMap"));

// Auth
const CitizenLogin = lazy(() => import("../pages/auth/CitizenLogin"));
const CitizenSignup = lazy(() => import("../pages/auth/CitizenSignup"));
const AdminLogin = lazy(() => import("../pages/auth/AdminLogin"));
const Login = lazy(() => import("../pages/auth/Login"));

// Citizen
const Dashboard = lazy(() => import("../pages/citizen/Dashboard"));
const MyReports = lazy(() => import("../pages/citizen/MyReports"));
const ExploreMap = lazy(() => import("../pages/citizen/ExploreMap"));
const CaptureIssue = lazy(() => import("../pages/citizen/CaptureIssue"));
const IssueLocation = lazy(() => import("../pages/citizen/IssueLocation"));
const IssueDetails = lazy(() => import("../pages/citizen/IssueDetails"));
const ReviewIssue = lazy(() => import("../pages/citizen/ReviewIssue"));
const ReportSubmitted = lazy(() => import("../pages/citizen/ReportSubmitted"));
const Profile = lazy(() => import("../pages/citizen/Profile"));

// Admin
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const ManageIssues = lazy(() => import("../pages/admin/ManageIssues"));
const AdminIssueDetails = lazy(() => import("../pages/admin/IssueDetails"));
const AdminIssuesMap = lazy(() => import("../pages/admin/AdminIssuesMap"));
const AdminAnalytics = lazy(() => import("../pages/admin/AdminAnalytics"));

const AppRoutes = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/explore-publicmap" element={<PubliceMap />} />

        {/* Auth */}
        <Route path="/citizen/login" element={<CitizenLogin />} />
        <Route path="/signup" element={<CitizenSignup />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/login" element={<Login />} />

        {/* Citizen */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-reports" element={<MyReports />} />
        <Route path="/explore-map" element={<ExploreMap />} />
        <Route path="/capture-issue" element={<CaptureIssue />} />
        <Route path="/issue-location" element={<IssueLocation />} />
        <Route path="/issue-details" element={<IssueDetails />} />
        <Route path="/review-issue" element={<ReviewIssue />} />
        <Route path="/report-submitted" element={<ReportSubmitted />} />
        <Route path="/profile" element={<Profile />} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/issues" element={<ManageIssues />} />
        <Route path="/admin/issues/:id" element={<AdminIssueDetails />} />
        <Route path="/admin/map" element={<AdminIssuesMap />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
