
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import { supabase } from "../../services/supabase";
import Footer from "../../components/common/Footer";

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getStatusStyle = (status) => {
  switch (status) {
    case "Resolved":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";

    case "In Progress":
      return "bg-blue-50 text-blue-800 border-blue-200";

    case "Rejected":
      return "bg-red-50 text-red-800 border-red-200";

    default:
      return "bg-amber-50 text-amber-800 border-amber-200";
  }
};

const Dashboard = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        // 1. Get the currently logged-in user.
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user) {
          navigate("/citizen/login", { replace: true });
          return;
        }

        // 2. Load this citizen's profile.
        const { data: profileData, error: profileError } =
          await supabase
            .from("profiles")
            .select("id, full_name, phone, role")
            .eq("id", user.id)
            .maybeSingle();

        if (profileError) throw profileError;

        if (profileData && profileData.role !== "citizen") {
          await supabase.auth.signOut();
          navigate("/citizen/login", { replace: true });
          return;
        }

        // 3. Load only this citizen's reports.
        const { data: issueData, error: issueError } =
          await supabase
            .from("issues")
            .select(
              "id, issue_number, title, description, category, status, priority, address, image_url, created_at, updated_at"
            )
            .eq("citizen_id", user.id)
            .order("created_at", { ascending: false });

        if (issueError) throw issueError;

        if (active) {
          setProfile(
            profileData || {
              full_name: user.user_metadata?.full_name || "Citizen",
              phone: user.user_metadata?.phone || "",
            }
          );

          setIssues(issueData || []);
        }
      } catch (error) {
        console.error("Dashboard loading error:", error);

        if (active) {
          setErrorMessage(
            error.message || "Unable to load your dashboard."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, [navigate]);

  const reportIssue = () => {
    navigate("/capture-issue");
  };

  const totalReports = issues.length;

  const inProgressCount = issues.filter(
    (issue) => issue.status === "In Progress"
  ).length;

  const resolvedCount = issues.filter(
    (issue) => issue.status === "Resolved"
  ).length;

  const pendingCount = issues.filter(
    (issue) => issue.status === "Pending Review"
  ).length;

  const resolutionRate =
    totalReports > 0
      ? Math.round((resolvedCount / totalReports) * 100)
      : 0;

  const categoryCounts = issues.reduce((counts, issue) => {
    const category = issue.category || "Other";
    counts[category] = (counts[category] || 0) + 1;
    return counts;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-900" />
          <p className="text-sm font-medium text-slate-600">
            Loading your CivicFix dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 font-['Inter'] text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-350 space-y-6 px-4 py-6 md:px-8 md:py-8">
        {/* Dashboard Error */}
        {errorMessage && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
          >
            <p>{errorMessage}</p>

            <button
              onClick={() => window.location.reload()}
              className="font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}
        {/* Welcome Section */}
        <section className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:p-8">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-900">
              <span className="material-symbols-outlined text-sm">
                verified_user
              </span>
              Citizen Dashboard
            </span>

            <h1 className="mt-4 text-2xl font-extrabold tracking-tight md:text-4xl">
              Welcome back, {profile?.full_name || "Citizen"}!
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
              Track your civic reports, follow their progress, and
              help make Dehradun a better place.
            </p>

            {profile?.phone && (
              <p className="mt-2 text-sm text-slate-500">
                Phone: {profile.phone}
              </p>
            )}
          </div>

          <button
            onClick={reportIssue}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-900 px-5 py-3 font-semibold text-white transition hover:bg-blue-950"
          >
            <span className="material-symbols-outlined">
              add_circle
            </span>
            Report New Issue
          </button>
        </section>

        {/* Live Statistics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Reports Logged"
            value={totalReports}
            description="Total reports submitted by you"
            icon="assignment"
            color="blue"
          />

          <StatCard
            title="Pending Review"
            value={pendingCount}
            description="Waiting for review"
            icon="schedule"
            color="amber"
          />

          <StatCard
            title="In Progress"
            value={inProgressCount}
            description="Currently being addressed"
            icon="engineering"
            color="indigo"
          />

          <StatCard
            title="Resolved"
            value={resolvedCount}
            description={`${resolutionRate}% of your reports resolved`}
            icon="task_alt"
            color="emerald"
          />
        </section>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          {/* My Recent Reports */}
          <section className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">
                  My Recent Reports
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your latest submissions and their current status.
                </p>
              </div>

              <button
                onClick={() => navigate("/my-reports")}
                className="flex shrink-0 items-center gap-1 text-sm font-bold text-blue-900 hover:underline"
              >
                View All
                <span className="material-symbols-outlined text-lg">
                  arrow_forward
                </span>
              </button>
            </div>

            {issues.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-900">
                  <span className="material-symbols-outlined text-3xl">
                    assignment_add
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-bold">
                  No reports yet
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                  Have you noticed a pothole, garbage buildup, or a
                  broken streetlight? Submit your first civic report.
                </p>

                <button
                  onClick={reportIssue}
                  className="mt-5 rounded-xl bg-blue-900 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-950"
                >
                  Submit Your First Report
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {issues.slice(0, 5).map((issue) => (
                  <article
                    key={issue.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row">
                      {issue.image_url ? (
  <img
    src={
      issue.image_url.startsWith("http")
        ? issue.image_url
        : supabase.storage
            .from("issue-images")
            .getPublicUrl(issue.image_url).data.publicUrl
    }
    alt={issue.title}
    onError={(e) => {
      e.currentTarget.style.display = "none";
    }}
    className="h-36 w-full rounded-xl border border-slate-200 object-cover sm:h-24 sm:w-24 sm:shrink-0"
  />
) :
                       (
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-900">
                          <span className="material-symbols-outlined text-3xl">
                            {issue.category === "Water"
                              ? "water_drop"
                              : issue.category === "Garbage"
                              ? "delete"
                              : issue.category === "Streetlights"
                              ? "lightbulb"
                              : issue.category === "Drainage"
                              ? "water"
                              : "construction"}
                          </span>
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-blue-50 px-2 py-1 font-mono text-xs font-bold text-blue-900">
                            #{issue.issue_number ?? issue.id.slice(0, 8)}
                          </span>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyle(issue.status)}`}
                          >
                            {issue.status}
                          </span>
                        </div>

                        <h3 className="mt-2 wrap-break-word text-base font-bold">
                          {issue.title}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {issue.category}
                          {" · "}
                          {formatDate(issue.created_at)}
                        </p>

                        {issue.address && (
                          <p className="mt-2 flex items-start gap-1 text-sm text-slate-600">
                            <span className="material-symbols-outlined text-base text-red-600">
                              location_on
                            </span>
                            <span>{issue.address}</span>
                          </p>
                        )}

                        {issue.description && (
                          <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                            {issue.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                ))}

                {issues.length > 5 && (
                  <button
                    onClick={() => navigate("/my-reports")}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-blue-900 hover:bg-blue-50"
                  >
                    View all {totalReports} reports
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Summary Sidebar */}
          <aside className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold">
                Your Report Summary
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Breakdown by category.
              </p>

              {Object.keys(categoryCounts).length === 0 ? (
                <p className="mt-6 text-sm text-slate-500">
                  Category statistics will appear after you submit
                  your first report.
                </p>
              ) : (
                <div className="mt-5 space-y-4">
                  {Object.entries(categoryCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, count]) => (
                      <div key={category}>
                        <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                          <span className="text-slate-600">
                            {category}
                          </span>
                          <span className="font-bold">{count}</span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-900"
                            style={{
                              width: `${(count / totalReports) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-teal-100 bg-linear-to-br from-teal-50 to-white p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
                <span className="material-symbols-outlined text-2xl">
                  volunteer_activism
                </span>
              </div>

              <h2 className="mt-4 text-lg font-bold">
                Make a Difference
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Your reports help authorities understand local
                problems and prioritize civic improvements.
              </p>

              <button
                onClick={reportIssue}
                className="mt-4 flex items-center gap-2 text-sm font-bold text-teal-800 hover:underline"
              >
                Report a Civic Issue
                <span className="material-symbols-outlined text-lg">
                  arrow_forward
                </span>
              </button>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-bold">Need Help?</h2>
              <p className="mt-2 text-sm text-slate-600">
                Having trouble with a report? Contact the CivicFix
                support team.
              </p>

              <button
                onClick={() => navigate("/contact")}
                className="mt-3 text-sm font-semibold text-blue-900 hover:underline"
              >
                Contact Support →
              </button>
            </section>
          </aside>
        </div>
      </main>
      <Footer type="citizen" />
    </div>
  );
};

const StatCard = ({ title, value, description, icon, color }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-900",
    amber: "bg-amber-100 text-amber-800",
    indigo: "bg-indigo-100 text-indigo-800",
    emerald: "bg-emerald-100 text-emerald-800",
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors[color]}`}
        >
          <span className="material-symbols-outlined text-2xl">
            {icon}
          </span>
        </div>
      </div>

      <p className="mt-5 text-sm font-semibold text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </article>
  );
};

export default Dashboard;
