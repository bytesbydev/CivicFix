import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import { supabase } from "../../services/supabase";
import Footer from "../../components/common/Footer";
const AdminDashboard = () => {
const navigate = useNavigate();
const [priorityFilter, setPriorityFilter] = useState("All");
const [statusFilter, setStatusFilter] = useState("All");
const [showFilters, setShowFilters] = useState(false);
const [stats, setStats] = useState({
  total: 0,
  pending: 0,
  inProgress: 0,
  resolved: 0,
});

const [issues, setIssues] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      const [
        totalResult,
        pendingResult,
        inProgressResult,
        resolvedResult,
        recentResult,
      ] = await Promise.all([
        supabase.from("issues").select("*", {
          count: "exact",
          head: true,
        }),

        supabase
          .from("issues")
          .select("*", { count: "exact", head: true })
          .eq("status", "Pending Review"),

        supabase
          .from("issues")
          .select("*", { count: "exact", head: true })
          .eq("status", "In Progress"),

        supabase
          .from("issues")
          .select("*", { count: "exact", head: true })
          .eq("status", "Resolved"),

        supabase
          .from("issues")
          .select(
            "id, issue_number, title, category, address, created_at, priority, status"
          )
          .in("priority", ["Critical", "High"])
          .order("created_at", { ascending: false })
          .limit(7),
      ]);

      const results = [
        totalResult,
        pendingResult,
        inProgressResult,
        resolvedResult,
        recentResult,
      ];

      const failedResult = results.find((result) => result.error);

      if (failedResult) {
        throw failedResult.error;
      }

      setStats({
        total: totalResult.count ?? 0,
        pending: pendingResult.count ?? 0,
        inProgress: inProgressResult.count ?? 0,
        resolved: resolvedResult.count ?? 0,
      });

      setIssues(recentResult.data ?? []);
    } catch (err) {
      console.error("Dashboard loading failed:", err);
      setError("Unable to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  fetchDashboardData();
}, []);


  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-700";
      case "High":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getStatusStyle = (status) => {
  switch (status) {
    case "Pending Review":
      return "bg-red-50 text-red-600";
    case "In Progress":
      return "bg-blue-100 text-blue-800";
    case "Resolved":
      return "bg-emerald-50 text-emerald-700";
    case "Rejected":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-slate-100 text-slate-600";
  }
};
const filteredIssues = issues.filter((issue) => {
  const matchesPriority =
    priorityFilter === "All" || issue.priority === priorityFilter;

  const matchesStatus =
    statusFilter === "All" || issue.status === statusFilter;

  return matchesPriority && matchesStatus;
});
  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9ff] font-['Inter']  text-[#0d1c2e]">
      
      <main className="h-full flex-1 overflow-y-auto">
        
        <Navbar />

        
        <div className="mx-auto max-w-7xl px-4 pb-32 pt-8 md:px-10">
          
          <header className="mb-8">
            <h1 className="mb-2 hidden text-3xl font-bold tracking-tight text-[#0d1c2e] md:block">
              Good morning, Admin
            </h1>

            <h1 className="mb-2 text-2xl font-bold text-[#0d1c2e] md:hidden">
              Good morning, Admin
            </h1>

            <p className="text-lg leading-7 text-[#444651]">
              Here's what's happening across your civic network.
            </p>
          </header>

          
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            
            <div className="flex flex-col justify-between rounded-xl border border-[#c5c5d3] bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-start justify-between">
                <span className="text-sm font-semibold uppercase tracking-wide text-[#444651]">
                  Total Issues
                </span>

                <div className="rounded-lg bg-[#e6eeff] p-2 text-[#00236f]">
                  <span className="material-symbols-outlined text-xl">
                    dataset
                  </span>
                </div>
              </div>

              <div>
                <div className="text-4xl font-bold tracking-tight text-[#0d1c2e]">
                 {loading ? "..." : stats.total.toLocaleString("en-IN")}
                </div>

                <div className="mt-2 flex items-center gap-1 text-sm font-semibold text-[#006a61]">
                  <span className="material-symbols-outlined text-sm">
                    trending_up
                  </span>
                  <span>+4.2% from last month</span>
                </div>
              </div>
            </div>

            
            <div className="flex flex-col justify-between rounded-xl border border-[#c5c5d3] bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-start justify-between">
                <span className="text-sm font-semibold uppercase tracking-wide text-[#444651]">
                  Open
                </span>

                <div className="rounded-lg bg-[#ffdad6] p-2 text-[#ba1a1a]">
                  <span className="material-symbols-outlined text-xl">
                    error
                  </span>
                </div>
              </div>

              <div>
                <div className="text-4xl font-bold tracking-tight text-[#0d1c2e]">
                 {loading ? "..." : stats.pending.toLocaleString("en-IN")}
                </div>

                <div className="mt-2 flex items-center gap-1 text-sm font-semibold text-[#ba1a1a]">
                  <span className="material-symbols-outlined text-sm">
                    trending_up
                  </span>
                  <span>+12% urgent</span>
                </div>
              </div>
            </div>

            
            <div className="flex flex-col justify-between rounded-xl border border-[#c5c5d3] bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-start justify-between">
                <span className="text-sm font-semibold uppercase tracking-wide text-[#444651]">
                  In Progress
                </span>

                <div className="rounded-lg bg-[#d5e3fc] p-2 text-[#1e3a8a]">
                  <span className="material-symbols-outlined text-xl">
                    engineering
                  </span>
                </div>
              </div>

              <div>
                <div className="text-4xl font-bold tracking-tight text-[#0d1c2e]">
                {loading ? "..." : stats.inProgress.toLocaleString("en-IN")}
                </div>

                <div className="mt-2 flex items-center gap-1 text-sm font-semibold text-[#444651]">
                  <span className="material-symbols-outlined text-sm">
                    horizontal_rule
                  </span>
                  <span>Stable workload</span>
                </div>
              </div>
            </div>

            
            <div className="flex flex-col justify-between rounded-xl border border-[#c5c5d3] bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-start justify-between">
                <span className="text-sm font-semibold uppercase tracking-wide text-[#444651]">
                  Resolved
                </span>

                <div className="rounded-lg bg-[#86f2e4] p-2 text-[#006f66]">
                  <span className="material-symbols-outlined text-xl">
                    check_circle
                  </span>
                </div>
              </div>

              <div>
                <div className="text-4xl font-bold tracking-tight text-[#0d1c2e]">
                 {loading ? "..." : stats.resolved.toLocaleString("en-IN")}
                </div>

                <div className="mt-2 flex items-center gap-1 text-sm font-semibold text-[#006a61]">
                  <span className="material-symbols-outlined text-sm">
                    trending_up
                  </span>
                  <span>+8.1% resolution</span>
                </div>
              </div>
            </div>
          </div>

          
          <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            
            <div className="flex flex-col justify-between rounded-xl border border-[#c5c5d3] bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <span className="text-sm font-semibold uppercase tracking-wide text-[#444651]">
                    Resolution Rate
                  </span>

                  <h3 className="mt-1 text-2xl font-bold text-[#0d1c2e]">
                    81.4%
                  </h3>
                </div>

                <div className="rounded-lg bg-[#86f2e4] p-2 text-[#006f66]">
                  <span className="material-symbols-outlined text-xl">
                    verified
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#e6eeff]">
                  <div
                    className="h-2.5 rounded-full bg-[#006a61]"
                    style={{ width: "81.4%" }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-[#444651]">
                  <div className="flex items-center gap-1 font-semibold text-[#006a61]">
                    <span className="material-symbols-outlined text-sm">
                      trending_up
                    </span>
                    <span>+4.5% vs target</span>
                  </div>

                  <span>Target: 75% monthly SLA</span>
                </div>
              </div>
            </div>

            
            <div className="flex flex-col justify-between rounded-xl border border-[#c5c5d3] bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <span className="text-sm font-semibold uppercase tracking-wide text-[#444651]">
                    Average Resolution Time
                  </span>

                  <h3 className="mt-1 text-2xl font-bold text-[#0d1c2e]">
                    3.7 Days
                  </h3>
                </div>

                <div className="rounded-lg bg-[#e6eeff] p-2 text-[#00236f]">
                  <span className="material-symbols-outlined text-xl">
                    schedule
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#c5c5d3]/30 pt-2 text-xs">
                <div className="flex items-center gap-1 font-semibold text-[#006a61]">
                  <span className="material-symbols-outlined text-sm">
                    trending_down
                  </span>
                  <span>-0.8 days reduction</span>
                </div>

                <span className="text-[#444651]">
                  Turnaround across all municipal wards
                </span>
              </div>
            </div>
          </div>

          
          <div className="overflow-hidden rounded-xl border border-[#c5c5d3] bg-white shadow-sm">
            {error && (
  <div
    role="alert"
    className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
  >
    {error}
  </div>
)}

{loading && (
  <p className="mb-4 text-sm text-[#444651]">
    Loading dashboard data...
  </p>
)}
            <div className="flex flex-col items-start justify-between gap-3 border-b border-[#c5c5d3] bg-[#f8f9ff] p-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-base font-bold text-[#0d1c2e] sm:text-lg">
                  Recent Critical Issues
                </h2>

                <p className="mt-0.5 text-xs text-[#444651]">
                  High-priority citizen reports requiring administrative
                  review
                </p>
              </div>

              <div className="flex items-center gap-2">
               <button
  type="button"
  onClick={() => setShowFilters((prev) => !prev)}
  className="flex items-center gap-1.5 rounded-lg border border-[#c5c5d3] px-3 py-1.5 text-sm font-semibold text-[#00236f] transition-colors hover:bg-[#eff4ff]"
>
  <span className="material-symbols-outlined text-base">
    filter_list
  </span>
  Filter
</button>

                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg bg-[#00236f] px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1e3a8a]"
                >
                  <span className="material-symbols-outlined text-base">
                    download
                  </span>
                  Export Log
                </button>
              </div>
            </div>

            {showFilters && (
  <div className="flex flex-wrap gap-4 border-b border-[#c5c5d3] bg-white p-4">
    <div>
      <label className="mb-1 block text-sm font-medium">
        Priority
      </label>
      <select
        value={priorityFilter}
        onChange={(e) => setPriorityFilter(e.target.value)}
        className="rounded-lg border border-[#c5c5d3] px-3 py-2 text-sm"
      >
        <option value="All">All Priorities</option>
        <option value="Critical">Critical</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>
    </div>

    <div>
      <label className="mb-1 block text-sm font-medium">
        Status
      </label>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="rounded-lg border border-[#c5c5d3] px-3 py-2 text-sm"
      >
        <option value="All">All Statuses</option>
        <option value="Pending Review">Pending Review</option>
        <option value="In Progress">In Progress</option>
        <option value="Resolved">Resolved</option>
        <option value="Rejected">Rejected</option>
      </select>
    </div>

    <button
      type="button"
      onClick={() => {
        setPriorityFilter("All");
        setStatusFilter("All");
      }}
      className="self-end rounded-lg px-3 py-2 text-sm font-semibold text-[#00236f] hover:bg-[#eff4ff]"
    >
      Clear Filters
    </button>
  </div>
)}
            <div className="overflow-x-auto">
              <table className="w-full min-w-225 text-left">
                <thead className="border-b border-[#c5c5d3] bg-[#eff4ff]">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-[#444651]">
                    <th className="px-4 py-3">
                      Issue Title &amp; Category
                    </th>

                    <th className="px-4 py-3">Ward / Location</th>

                    <th className="px-4 py-3">Reported</th>

                    <th className="px-4 py-3">Priority</th>

                    <th className="px-4 py-3">Status</th>

                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#c5c5d3]/30">
               {filteredIssues.map((issue) => (
  <tr
    key={issue.id}
    className="transition-colors hover:bg-[#eff4ff]"
  >
    <td className="px-4 py-3.5">
      <div className="font-semibold text-[#0d1c2e]">
        {issue.title}
      </div>

      <div className="font-mono text-xs text-[#444651]">
        #CF-{issue.issue_number} • {issue.category}
      </div>
    </td>

    <td className="px-4 py-3.5">
      <span className="text-xs text-[#444651]">
        {issue.address || "Location not provided"}
      </span>
    </td>

    <td className="px-4 py-3.5 text-xs text-[#444651]">
      {new Date(issue.created_at).toLocaleDateString("en-IN")}
    </td>

    <td className="px-4 py-3.5">
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getPriorityStyle(
          issue.priority
        )}`}
      >
        {issue.priority}
      </span>
    </td>

    <td className="px-4 py-3.5">
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusStyle(
          issue.status
        )}`}
      >
        {issue.status}
      </span>
    </td>

    <td className="px-4 py-3.5 text-right">
    <button
  type="button"
  onClick={() => navigate(`/admin/issues/${issue.id}`)}
  className="rounded-lg bg-[#e6eeff] px-3 py-1 text-xs font-medium text-[#00236f] transition-colors hover:bg-[#d5e3fc]"
>
  View Details
</button>
    </td>
  </tr>
))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
<Footer type="admin" />
      </main>
    </div>
  );
};

export default AdminDashboard;