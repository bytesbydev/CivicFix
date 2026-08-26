
import { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { supabase } from "../../services/supabase";

const COLORS = [
  "#1e3a8a",
  "#006a61",
  "#6385d6",
  "#e59b48",
  "#ba1a1a",
  "#8b5cf6",
];

const ranges = [
  { label: "Last 7 Days", days: 7 },
  { label: "Last 30 Days", days: 30 },
  { label: "Last 90 Days", days: 90 },
  { label: "All Time", days: 0 },
];


const MetricCard = ({ label, value, icon, detail }) => (
    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-900">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500">{detail}</p>
    </div>
  );
const AdminAnalytics = () => {
  const [issues, setIssues] = useState([]);
  const [timeRange, setTimeRange] = useState(30);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch issues from Supabase.
  // Do not synchronously set loading/error before the first await.
  const fetchIssues = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("issues")
        .select(
          "id, issue_number, title, category, status, priority, created_at, resolved_at, latitude, longitude"
        )
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setIssues(data || []);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and real-time updates.
  useEffect(() => {
    let active = true;

    const loadIssues = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("issues")
          .select(
            "id, issue_number, title, category, status, priority, created_at, resolved_at, latitude, longitude"
          )
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;

        if (active) {
          setIssues(data || []);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load analytics.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadIssues();

    const channel = supabase
      .channel("admin-analytics-issues")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "issues" },
        () => {
          loadIssues();
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Retry is called by a user interaction, not directly by an effect.
  const handleRetry = () => {
    setLoading(true);
    fetchIssues();
  };

  // Apply date and category filters.
 const [currentTime, setCurrentTime] = useState(() => Date.now());

useEffect(() => {
  const updateTime = () => setCurrentTime(Date.now());
  updateTime();
}, []);

const filteredIssues = useMemo(() => {
  const cutoff =
    timeRange === 0
      ? null
      : currentTime - timeRange * 24 * 60 * 60 * 1000;

  return issues.filter((issue) => {
    const matchesDate =
      cutoff === null ||
      new Date(issue.created_at).getTime() >= cutoff;

    const matchesCategory =
      categoryFilter === "All" ||
      issue.category === categoryFilter;

    return matchesDate && matchesCategory;
  });
}, [issues, timeRange, categoryFilter, currentTime]);

  // Calculate summary statistics.
  const stats = useMemo(() => {
    const total = filteredIssues.length;

    const resolved = filteredIssues.filter(
      (issue) => issue.status === "Resolved"
    );

    const active = filteredIssues.filter(
      (issue) => issue.status === "In Progress"
    );

    const pending = filteredIssues.filter(
      (issue) => issue.status === "Pending Review"
    );

    const rejected = filteredIssues.filter(
      (issue) => issue.status === "Rejected"
    );

    const resolutionDurations = resolved
      .filter((issue) => issue.resolved_at)
      .map(
        (issue) =>
          (new Date(issue.resolved_at) -
            new Date(issue.created_at)) /
          (1000 * 60 * 60 * 24)
      )
      .filter((days) => days >= 0);

    const averageResolution = resolutionDurations.length
      ? resolutionDurations.reduce((sum, days) => sum + days, 0) /
        resolutionDurations.length
      : null;

    return {
      total,
      resolved: resolved.length,
      active: active.length,
      pending: pending.length,
      rejected: rejected.length,
      resolutionRate: total ? (resolved.length / total) * 100 : 0,
      averageResolution,
      located: filteredIssues.filter(
        (issue) =>
          issue.latitude != null && issue.longitude != null
      ).length,
      highPriority: filteredIssues.filter(
        (issue) =>
          issue.priority === "High" ||
          issue.priority === "Critical"
      ).length,
    };
  }, [filteredIssues]);

  // Monthly reported and resolved issues.
  const monthlyData = useMemo(() => {
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      date.setMonth(date.getMonth() - i);

      const year = date.getFullYear();
      const month = date.getMonth();

      const monthIssues = filteredIssues.filter((issue) => {
        const created = new Date(issue.created_at);

        return (
          created.getFullYear() === year &&
          created.getMonth() === month
        );
      });

      months.push({
        month: date.toLocaleDateString("en-IN", {
          month: "short",
        }),
        reported: monthIssues.length,
        resolved: monthIssues.filter(
          (issue) => issue.status === "Resolved"
        ).length,
      });
    }

    return months;
  }, [filteredIssues]);

  // Category chart data.
  const categoryData = useMemo(() => {
    const counts = {};

    filteredIssues.forEach((issue) => {
      const category = issue.category || "Uncategorized";
      counts[category] = (counts[category] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredIssues]);

  // Status chart data.
  const statusData = [
    { name: "Pending Review", value: stats.pending },
    { name: "In Progress", value: stats.active },
    { name: "Resolved", value: stats.resolved },
    { name: "Rejected", value: stats.rejected },
  ].filter((item) => item.value > 0);

  // Export filtered issues to CSV.
  const exportCSV = () => {
    const columns = [
      "Issue Number",
      "Title",
      "Category",
      "Status",
      "Priority",
      "Created At",
      "Resolved At",
      "Latitude",
      "Longitude",
    ];

    const rows = filteredIssues.map((issue) => [
      issue.issue_number,
      issue.title,
      issue.category,
      issue.status,
      issue.priority,
      issue.created_at,
      issue.resolved_at || "",
      issue.latitude ?? "",
      issue.longitude ?? "",
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [columns, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "civicfix-analytics.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };
  return (
    <div className="min-h-screen font-['Inter'] text-[#0d1c2e]">
      <Navbar />

      <main className="min-h-screen bg-[#f8f9ff] px-4 py-8 text-[#0d1c2e] sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          {/* Page heading and filters */}
          <section className="flex flex-col justify-between gap-5 rounded-xl bg-white p-5 shadow-sm lg:flex-row lg:items-end lg:p-7">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-900">
                <span className="material-symbols-outlined text-base">
                  analytics
                </span>
                Live Issue Analytics
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[#00236f] md:text-3xl">
                Municipal Performance &amp; Issue Analytics
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Monitor reported issues, resolution performance,
                priorities, and issue categories across CivicFix.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                aria-label="Time range"
                value={timeRange}
                onChange={(e) =>
                  setTimeRange(Number(e.target.value))
                }
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-800"
              >
                {ranges.map((range) => (
                  <option key={range.label} value={range.days}>
                    {range.label}
                  </option>
                ))}
              </select>

              <select
                aria-label="Issue category"
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(e.target.value)
                }
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-800"
              >
                <option value="All">All Categories</option>
                {[
                  "Potholes",
                  "Garbage",
                  "Streetlights",
                  "Drainage",
                  "Water",
                  "Other",
                ].map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={exportCSV}
                disabled={loading || filteredIssues.length === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-[#1e3a8a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#00236f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-lg">
                  file_download
                </span>
                Export CSV
              </button>
            </div>
          </section>

          {/* Error message */}
          {error && (
            <section
              role="alert"
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            >
              <span>{error}</span>

              <button
                type="button"
                onClick={handleRetry}
                className="font-semibold underline"
              >
                Try again
              </button>
            </section>
          )}

          {loading ? (
            <div className="rounded-xl bg-white p-12 text-center text-slate-500 shadow-sm">
              <span className="material-symbols-outlined animate-spin text-3xl">
                progress_activity
              </span>
              <p className="mt-3 text-sm">
                Loading analytics from Supabase...
              </p>
            </div>
          ) : (
            <>
              {/* KPI cards */}
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  label="Total Issues Reported"
                  value={stats.total.toLocaleString("en-IN")}
                  icon="assignment"
                  detail="Issues created in the selected period"
                />

                <MetricCard
                  label="Resolved Issues"
                  value={stats.resolved.toLocaleString("en-IN")}
                  icon="task_alt"
                  detail={`${stats.resolutionRate.toFixed(1)}% of reported issues resolved`}
                />

                <MetricCard
                  label="Average Resolution Time"
                  value={
                    stats.averageResolution == null
                      ? "—"
                      : `${stats.averageResolution.toFixed(1)}d`
                  }
                  icon="timer"
                  detail="Calculated from created and resolved timestamps"
                />

                <MetricCard
                  label="High / Critical Priority"
                  value={stats.highPriority.toLocaleString("en-IN")}
                  icon="priority_high"
                  detail="Issues requiring higher attention"
                />
              </section>

              {/* Secondary metrics */}
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  {
                    label: "Pending Review",
                    value: stats.pending,
                    color: "text-orange-700",
                    bg: "bg-orange-50",
                  },
                  {
                    label: "In Progress",
                    value: stats.active,
                    color: "text-blue-800",
                    bg: "bg-blue-50",
                  },
                  {
                    label: "Issues with Coordinates",
                    value: stats.located,
                    color: "text-teal-800",
                    bg: "bg-teal-50",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm"
                  >
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-lg ${item.bg} ${item.color}`}
                    >
                      <span className="material-symbols-outlined">
                        {item.label === "Pending Review"
                          ? "pending_actions"
                          : item.label === "In Progress"
                            ? "engineering"
                            : "location_on"}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        {item.label}
                      </p>
                      <p className="mt-1 text-2xl font-bold">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </section>

              {/* Charts */}
              <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-7">
                <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-4 lg:p-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-[#00236f]">
                      Issue Volume &amp; Resolution
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Reported and resolved issues by month
                    </p>
                  </div>

                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={monthlyData}
                        margin={{
                          top: 8,
                          right: 8,
                          left: -18,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#e2e8f0"
                        />
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          axisLine={false}
                          tick={{
                            fill: "#64748b",
                            fontSize: 12,
                          }}
                        />
                        <YAxis
                          allowDecimals={false}
                          tickLine={false}
                          axisLine={false}
                          tick={{
                            fill: "#64748b",
                            fontSize: 12,
                          }}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="reported"
                          name="Reported"
                          fill="#b6c4ff"
                          radius={[5, 5, 0, 0]}
                        />
                        <Bar
                          dataKey="resolved"
                          name="Resolved"
                          fill="#006a61"
                          radius={[5, 5, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <p className="mt-3 text-xs text-slate-500">
                    Monthly chart shows the last six calendar months.
                    The cards and category breakdown follow your
                    selected filters.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-3 lg:p-6">
                  <h2 className="text-lg font-bold text-[#00236f]">
                    Issue Status Distribution
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Current status of filtered reports
                  </p>

                  <div className="h-64 w-full">
                    {statusData.length ? (
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >
                        <PieChart>
                          <Pie
                            data={statusData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={58}
                            outerRadius={88}
                            paddingAngle={3}
                          >
                            {statusData.map((entry, index) => (
                              <Cell
                                key={entry.name}
                                fill={
                                  COLORS[index % COLORS.length]
                                }
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-slate-400">
                        No issues found for this selection.
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Category breakdown */}
              <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-[#00236f]">
                    Issue Categories Distribution
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Report count and active workload for each category
                  </p>
                </div>

                {categoryData.length ? (
                  <div className="space-y-5">
                    {categoryData.map((item, index) => {
                      const percentage = stats.total
                        ? (item.value / stats.total) * 100
                        : 0;

                      const activeCount = filteredIssues.filter(
                        (issue) =>
                          (issue.category || "Uncategorized") ===
                            item.name &&
                          issue.status !== "Resolved" &&
                          issue.status !== "Rejected"
                      ).length;

                      return (
                        <div key={item.name}>
                          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="font-semibold text-slate-800">
                                {item.name}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {item.value} total · {activeCount} active
                              </p>
                            </div>

                            <span className="text-sm font-bold text-[#00236f]">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>

                          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor:
                                  COLORS[index % COLORS.length],
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-slate-500">
                    No category data available for this selection.
                  </p>
                )}
              </section>
            </>
          )}
        </div>
      </main>

      <Footer type="admin" />
    </div>
  );
};

export default AdminAnalytics;
