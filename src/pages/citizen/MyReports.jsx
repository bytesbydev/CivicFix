
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Footer from "../../components/common/Footer";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import { supabase } from "../../services/supabase";

const STATUSES = [
  "All",
  "Pending Review",
  "In Progress",
  "Resolved",
  "Rejected",
];

const CATEGORIES = [
  "Potholes",
  "Garbage",
  "Streetlights",
  "Drainage",
  "Water",
  "Other",
];

const STATUS_STYLES = {
  "Pending Review": "bg-amber-50 text-amber-800 border-amber-200",
  "In Progress": "bg-blue-50 text-blue-800 border-blue-200",
  Resolved: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Rejected: "bg-red-50 text-red-800 border-red-200",
};

const PRIORITY_STYLES = {
  Low: "bg-slate-100 text-slate-700",
  Medium: "bg-blue-50 text-blue-700",
  High: "bg-orange-50 text-orange-700",
  Critical: "bg-red-50 text-red-700",
};

const formatDate = (value) => {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getIssueNumber = (issue) =>
  issue.issue_number != null
    ? `#CF-${issue.issue_number}`
    : `#${issue.id.slice(0, 8)}`;

const getStatusStyle = (status) =>
  STATUS_STYLES[status] ||
  "border-slate-200 bg-slate-50 text-slate-700";

const getCategoryIcon = (category) => {
  switch (category) {
    case "Potholes":
      return "road";
    case "Garbage":
      return "delete";
    case "Streetlights":
      return "lightbulb";
    case "Drainage":
      return "water";
    case "Water":
      return "water_drop";
    default:
      return "location_city";
  }
};

const Icon = ({ children, className = "" }) => (
  <span
    aria-hidden="true"
    className={`material-symbols-outlined select-none ${className}`}
  >
    {children}
  </span>
);

const MyReports = () => {
  const navigate = useNavigate();
const routeLocation = useLocation();
const targetIssueId =
  routeLocation.state?.issueId ||
  routeLocation.state?.focusIssueId ||
  null;

const issueRefs = useRef({});
  const [issues, setIssues] = useState([]);
  const [citizenId, setCitizenId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Admin update states
  const [expandedIssueId, setExpandedIssueId] = useState(null);
  const [updatesByIssue, setUpdatesByIssue] = useState({});
  const [loadingUpdatesId, setLoadingUpdatesId] = useState(null);
  const [updateErrors, setUpdateErrors] = useState({});

  const loadReports = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        navigate("/citizen/login", { replace: true });
        return;
      }

      setCitizenId(user.id);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile || profile.role !== "citizen") {
        setErrorMessage(
          "Your citizen profile could not be verified. Please contact the administrator."
        );
        return;
      }

      const { data, error } = await supabase
        .from("issues")
        .select(`
          id,
          issue_number,
          title,
          description,
          category,
          status,
          priority,
          address,
          image_url,
          created_at,
          updated_at,
          resolved_at,
          resolution_notes,
          resolution_image_url
        `)
        .eq("citizen_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setIssues(data || []);
    } catch (error) {
      console.error("My Reports loading error:", error);

      setErrorMessage(
        error.message || "Unable to load your reports. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);


  useEffect(() => {
  if (!targetIssueId) return;

  setSearch("");
  setSelectedStatus("All");
  setSelectedCategory("All");
}, [targetIssueId]);

useEffect(() => {
  if (loading || !targetIssueId) return;

  issueRefs.current[targetIssueId]?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}, [loading, targetIssueId, issues]);

const toggleIssueUpdates = async (issueId) => {
  if (expandedIssueId === issueId) {
    setExpandedIssueId(null);
    return;
  }

  setExpandedIssueId(issueId);

  if (!citizenId) {
    setUpdateErrors((previous) => ({
      ...previous,
      [issueId]:
        "Your citizen session could not be verified. Please log in again.",
    }));
    return;
  }

  // Avoid re-fetching messages that are already loaded
  if (Object.prototype.hasOwnProperty.call(updatesByIssue, issueId)) {
    return;
  }

  setLoadingUpdatesId(issueId);
  setUpdateErrors((previous) => ({
    ...previous,
    [issueId]: "",
  }));

  try {
    // 1. Fetch updates belonging to this citizen and issue
    const { data, error } = await supabase
      .from("issue_updates")
      .select("id, message, created_at, is_read")
      .eq("issue_id", issueId)
      .eq("citizen_id", citizenId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const updates = data || [];
    const unreadIds = updates
      .filter((update) => !update.is_read)
      .map((update) => update.id);

    // 2. Mark unread messages as read in Supabase
    if (unreadIds.length > 0) {
      const { error: updateError } = await supabase
        .from("issue_updates")
        .update({ is_read: true })
        .in("id", unreadIds)
        .eq("issue_id", issueId)
        .eq("citizen_id", citizenId);

      if (updateError) throw updateError;
    }

    // 3. Update the UI after the database operation succeeds
    setUpdatesByIssue((previous) => ({
      ...previous,
      [issueId]: updates.map((update) =>
        unreadIds.includes(update.id)
          ? { ...update, is_read: true }
          : update
      ),
    }));
  } catch (error) {
    console.error("Issue updates loading error:", error);

    setUpdateErrors((previous) => ({
      ...previous,
      [issueId]:
        error.message || "Unable to load updates. Please try again.",
    }));
  } finally {
    setLoadingUpdatesId(null);
  }
};

const retryIssueUpdates = async (issueId) => {
  setUpdatesByIssue((previous) => {
    const updated = { ...previous };
    delete updated[issueId];
    return updated;
  });

  setUpdateErrors((previous) => ({
    ...previous,
    [issueId]: "",
  }));

  setExpandedIssueId(issueId);

  if (!citizenId) {
    setUpdateErrors((previous) => ({
      ...previous,
      [issueId]: "Your citizen session could not be verified. Please log in again.",
    }));
    return;
  }

  setLoadingUpdatesId(issueId);

  try {
    const { data, error } = await supabase
      .from("issue_updates")
      .select("id, message, created_at, is_read")
      .eq("issue_id", issueId)
      .eq("citizen_id", citizenId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const updates = data || [];
    const unreadIds = updates
      .filter((update) => !update.is_read)
      .map((update) => update.id);

    if (unreadIds.length > 0) {
      const { error: updateError } = await supabase
        .from("issue_updates")
        .update({ is_read: true })
        .in("id", unreadIds)
        .eq("issue_id", issueId)
        .eq("citizen_id", citizenId);

      if (updateError) throw updateError;
    }

    setUpdatesByIssue((previous) => ({
      ...previous,
      [issueId]: updates.map((update) =>
        unreadIds.includes(update.id)
          ? { ...update, is_read: true }
          : update
      ),
    }));
  } catch (error) {
    console.error("Issue updates retry error:", error);

    setUpdateErrors((previous) => ({
      ...previous,
      [issueId]: error.message || "Unable to load updates. Please try again.",
    }));
  } finally {
    setLoadingUpdatesId(null);
  }
};
  const stats = useMemo(() => {
    return {
      total: issues.length,
      pending: issues.filter(
        (issue) => issue.status === "Pending Review"
      ).length,
      inProgress: issues.filter(
        (issue) => issue.status === "In Progress"
      ).length,
      resolved: issues.filter(
        (issue) => issue.status === "Resolved"
      ).length,
    };
  }, [issues]);

  const filteredIssues = useMemo(() => {
    const query = search.trim().toLowerCase();

    return issues.filter((issue) => {
      const matchesSearch =
        !query ||
        issue.title?.toLowerCase().includes(query) ||
        issue.description?.toLowerCase().includes(query) ||
        issue.address?.toLowerCase().includes(query) ||
        getIssueNumber(issue).toLowerCase().includes(query);

      const matchesStatus =
        selectedStatus === "All" ||
        issue.status === selectedStatus;

      const matchesCategory =
        selectedCategory === "All" ||
        issue.category === selectedCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [issues, search, selectedStatus, selectedCategory]);

  const resetFilters = () => {
    setSearch("");
    setSelectedStatus("All");
    setSelectedCategory("All");
  };

  const reportIssue = () => navigate("/capture-issue");

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 font-['Inter'] text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-350 space-y-6 px-4 py-6 md:px-8 md:py-8">
        {/* Page header */}
        <section className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center md:p-8">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
              <Icon>assignment</Icon>
              My Reports
            </div>

            <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Your submitted reports
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              View your civic reports, check their status, and read updates
              from the CivicFix administration.
            </p>
          </div>

          <button
            type="button"
            onClick={reportIssue}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-950"
          >
            <Icon>add_circle</Icon>
            Report New Issue
          </button>
        </section>

        {/* Error state */}
        {errorMessage && (
          <section
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-5"
          >
            <div className="flex items-start gap-3">
              <Icon className="text-2xl text-red-600">error</Icon>

              <div className="flex-1">
                <h2 className="font-semibold text-red-900">
                  Unable to load reports
                </h2>

                <p className="mt-1 text-sm leading-6 text-red-800">
                  {errorMessage}
                </p>

                <button
                  type="button"
                  onClick={loadReports}
                  className="mt-3 text-sm font-semibold text-red-900 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-900" />
            <p className="text-sm font-medium text-slate-600">
              Loading your reports...
            </p>
          </div>
        )}

        {!loading && !errorMessage && (
          <>
            {/* Statistics */}
            <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              <StatCard
                title="Total Reports"
                value={stats.total}
                icon="assignment"
                color="blue"
              />

              <StatCard
                title="Pending Review"
                value={stats.pending}
                icon="schedule"
                color="amber"
              />

              <StatCard
                title="In Progress"
                value={stats.inProgress}
                icon="engineering"
                color="indigo"
              />

              <StatCard
                title="Resolved"
                value={stats.resolved}
                icon="task_alt"
                color="emerald"
              />
            </section>

            {/* Search and filters */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <div className="flex flex-col gap-4 lg:flex-row">
                <label className="relative block flex-1">
                  <span className="sr-only">Search reports</span>

                  <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-slate-400">
                    search
                  </Icon>

                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search title, issue number, or address..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="block lg:w-56">
                  <span className="sr-only">Filter by category</span>

                  <select
                    value={selectedCategory}
                    onChange={(event) =>
                      setSelectedCategory(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="All">All Categories</option>

                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Filter by status
                </p>

                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((status) => {
                    const active = selectedStatus === status;

                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setSelectedStatus(status)}
                        aria-pressed={active}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                          active
                            ? "border-blue-900 bg-blue-900 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50"
                        }`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Report list */}
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-bold">
                  Reports
                  <span className="ml-2 text-sm font-medium text-slate-500">
                    ({filteredIssues.length})
                  </span>
                </h2>

                {(search ||
                  selectedStatus !== "All" ||
                  selectedCategory !== "All") && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-sm font-semibold text-blue-900 hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {filteredIssues.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-900">
                    <Icon className="text-3xl">
                      {issues.length === 0
                        ? "assignment_add"
                        : "search_off"}
                    </Icon>
                  </div>

                  <h3 className="mt-4 text-lg font-bold">
                    {issues.length === 0
                      ? "No reports yet"
                      : "No matching reports"}
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    {issues.length === 0
                      ? "Your submitted civic reports will appear here."
                      : "Try changing your search or filters."}
                  </p>

                  {issues.length === 0 ? (
                    <button
                      type="button"
                      onClick={reportIssue}
                      className="mt-5 rounded-xl bg-blue-900 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-950"
                    >
                      Report New Issue
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-5 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredIssues.map((issue) => {
                    const updates = updatesByIssue[issue.id] || [];
                    const updatesExpanded = expandedIssueId === issue.id;
                    const unreadCount = updates.filter(
                      (update) => !update.is_read
                    ).length;

                    return (
                     <article
  key={issue.id}
  ref={(element) => {
    issueRefs.current[issue.id] = element;
  }}
  className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md ${
    issue.id === targetIssueId
      ? "border-blue-700 ring-2 ring-blue-200"
      : "border-slate-200 hover:border-slate-300"
  }`}
                      >
                        <div className="p-4 sm:p-5">
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
) : (
                              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-900">
                                <Icon className="text-3xl">
                                  {getCategoryIcon(issue.category)}
                                </Icon>
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-700">
                                  {getIssueNumber(issue)}
                                </span>

                                <span
                                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(issue.status)}`}
                                >
                                  {issue.status}
                                </span>

                                {issue.priority && (
                                  <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                      PRIORITY_STYLES[issue.priority] ||
                                      "bg-slate-100 text-slate-600"
                                    }`}
                                  >
                                    {issue.priority}
                                  </span>
                                )}
                              </div>

                              <h3 className="mt-3 wrap-break-word text-lg font-bold text-slate-900">
                                {issue.title}
                              </h3>

                              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                                <span className="flex items-center gap-1.5">
                                  <Icon className="text-lg">
                                    {getCategoryIcon(issue.category)}
                                  </Icon>
                                  {issue.category}
                                </span>

                                <span className="flex items-center gap-1.5">
                                  <Icon className="text-lg">
                                    calendar_today
                                  </Icon>
                                  {formatDate(issue.created_at)}
                                </span>
                              </div>

                              {issue.address && (
                                <p className="mt-3 flex items-start gap-1.5 wrap-break-word text-sm text-slate-600">
                                  <Icon className="text-lg text-slate-400">
                                    location_on
                                  </Icon>
                                  {issue.address}
                                </p>
                              )}

                              {issue.description && (
                                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                                  {issue.description}
                                </p>
                              )}

                              {issue.resolution_notes && (
                                <div className="mt-3 rounded-xl bg-emerald-50 p-3">
                                  <p className="text-xs font-bold text-emerald-800">
                                    Resolution notes
                                  </p>
                                  <p className="mt-1 text-sm text-emerald-900">
                                    {issue.resolution_notes}
                                  </p>
                                </div>
                              )}

                              {issue.resolved_at && (
                                <p className="mt-3 text-xs text-emerald-700">
                                  Resolved on {formatDate(issue.resolved_at)}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* View Updates button */}
                          <div className="mt-5 border-t border-slate-100 pt-4">
                            <button
                              type="button"
                              onClick={() => toggleIssueUpdates(issue.id)}
                              aria-expanded={updatesExpanded}
                              className="flex w-full items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-left text-sm font-semibold text-blue-900 transition hover:border-blue-200 hover:bg-blue-100"
                            >
                              <span className="flex items-center gap-2">
                                <Icon className="text-xl">
                                  notifications
                                </Icon>
                                View Admin Updates
                                {updates.length > 0 && (
                                  <span className="rounded-full bg-blue-900 px-2 py-0.5 text-xs text-white">
                                    {updates.length}
                                  </span>
                                )}
                                {unreadCount > 0 && (
                                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                                    {unreadCount} unread
                                  </span>
                                )}
                              </span>

                              <Icon className="text-xl">
                                {updatesExpanded
                                  ? "expand_less"
                                  : "expand_more"}
                              </Icon>
                            </button>

                            {/* Admin messages */}
                            {updatesExpanded && (
                              <div className="mt-3 space-y-3">
                                {loadingUpdatesId === issue.id ? (
                                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-5">
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-100 border-t-blue-900" />
                                    <p className="text-sm text-slate-600">
                                      Loading admin updates...
                                    </p>
                                  </div>
                                ) : updateErrors[issue.id] ? (
                                  <div
                                    role="alert"
                                    className="rounded-xl border border-red-200 bg-red-50 p-4"
                                  >
                                    <p className="text-sm text-red-800">
                                      {updateErrors[issue.id]}
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        retryIssueUpdates(issue.id)
                                      }
                                      className="mt-2 text-sm font-semibold text-red-900 underline"
                                    >
                                      Try again
                                    </button>
                                  </div>
                                ) : updates.length === 0 ? (
                                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                                    <Icon className="text-3xl text-slate-400">
                                      mark_email_unread
                                    </Icon>
                                    <p className="mt-2 text-sm font-semibold text-slate-700">
                                      No admin updates yet
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                      Messages from the CivicFix administration
                                      about this report will appear here.
                                    </p>
                                  </div>
                                ) : (
                                  updates.map((update) => (
                                    <div
                                      key={update.id}
                                      className="rounded-xl border border-slate-200 bg-white p-4"
                                    >
                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-900">
                                            <Icon>support_agent</Icon>
                                          </span>
                                          CivicFix Administration
                                        </div>

                                        <span
                                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                            update.is_read
                                              ? "bg-slate-100 text-slate-600"
                                              : "bg-amber-100 text-amber-800"
                                          }`}
                                        >
                                          {update.is_read ? "Read" : "Unread"}
                                        </span>
                                      </div>

                                      <p className="mt-3 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-slate-700">
                                        {update.message}
                                      </p>

                                      <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                                        <Icon className="text-base">
                                          schedule
                                        </Icon>
                                        {formatDateTime(update.created_at)}
                                      </p>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>

     <Footer type="citizen" />
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-900",
    amber: "bg-amber-100 text-amber-800",
    indigo: "bg-indigo-100 text-indigo-800",
    emerald: "bg-emerald-100 text-emerald-800",
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-500">{title}</p>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colors[color]}`}
        >
          <Icon className="text-2xl">{icon}</Icon>
        </div>
      </div>

      <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
        {value}
      </p>
    </article>
  );
};

export default MyReports;
