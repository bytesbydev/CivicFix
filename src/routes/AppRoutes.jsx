import { Routes, Route } from "react-router-dom";

import Landing from "../pages/public/Landing";
import HowItWorks from "../pages/public/HowItWorks";
import Contact from "../pages/public/Contact";
import PubliceMap from "../pages/public/ExploreMap";



import CitizenLogin from "../pages/auth/CitizenLogin";
import CitizenSignup from "../pages/auth/CitizenSignup";
import AdminLogin from "../pages/auth/AdminLogin";

import Dashboard from "../pages/citizen/Dashboard";
import MyReports from "../pages/citizen/MyReports";
import ExploreMap from "../pages/citizen/ExploreMap";
import CaptureIssue from "../pages/citizen/CaptureIssue";
import IssueLocation from "../pages/citizen/IssueLocation";
import IssueDetails from "../pages/citizen/IssueDetails";
import ReviewIssue from "../pages/citizen/ReviewIssue";
import ReportSubmitted from "../pages/citizen/ReportSubmitted";
import Profile from "../pages/citizen/Profile";

import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageIssues from "../pages/admin/ManageIssues";
import AdminIssueDetails from "../pages/admin/IssueDetails";
import Login from "../pages/auth/Login";
import AdminIssuesMap from "../pages/admin/AdminIssuesMap"
import AdminAnalytics from "../pages/admin/AdminAnalytics";

const AppRoutes = () => {
  return (
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
      <Route path="/login" element={<Login/>}/>

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
      <Route path="/explore-map" element={<ExploreMap />} />


      {/* Admin */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/issues" element={<ManageIssues />} />
      <Route path="/admin/issues/:id" element={<AdminIssueDetails />} />
   <Route path="/admin/map" element={<AdminIssuesMap />}/>
   <Route path="/admin/analytics" element={<AdminAnalytics />} />

    </Routes>
  );
};

export default AppRoutes;