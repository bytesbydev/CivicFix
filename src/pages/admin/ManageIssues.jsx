
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import { supabase } from "../../services/supabase";
import Footer from "../../components/common/Footer";
const PAGE_SIZE_OPTIONS = [10, 25, 50];

const STATUS_FILTERS = [
  "All",
  "Pending",
  "Verified",
  "Assigned",
  "In Progress",
  "Resolved",
  "Rejected",
];

const CATEGORY_OPTIONS = [
  { value: "roads", label: "Road Infrastructure" },
  { value: "utilities", label: "Water & Utilities" },
  { value: "sanitation", label: "Sanitation & Waste" },
  { value: "lighting", label: "Street Lighting" },
  { value: "parks", label: "Parks & Forestry" },
];

const SEVERITY_OPTIONS = ["Critical", "High", "Medium", "Low"];

const MaterialIcon = ({ children, className = "", fill = false }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{
      fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
    }}
    aria-hidden="true"
  >
    {children}
  </span>
);

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

const getStatusLabel = (status) => {
  const value = normalize(status);

  const labels = {
    pending: "Pending",
    "pending review": "Pending",
    submitted: "Pending",
    verified: "Verified",
    assigned: "Assigned",
    "in progress": "In Progress",
    resolved: "Resolved",
    completed: "Resolved",
    rejected: "Rejected",
  };

  return labels[value] || (status || "Unknown");
};

const getPriorityLabel = (priority) => {
  const value = normalize(priority);

  const labels = {
    urgent: "Critical",
    critical: "Critical",
    high: "High",
    medium: "Medium",
    normal: "Medium",
    low: "Low",
  };

  return labels[value] || (priority ? String(priority) : "—");
};

const getStatusClasses = (status) => {
  switch (getStatusLabel(status)) {
    case "Pending":
      return "bg-[#ffdbcb] text-[#773205]";
    case "Verified":
      return "bg-[#dce9ff] text-[#00236f]";
    case "Assigned":
      return "bg-[#e6eeff] text-[#1e3a8a]";
    case "In Progress":
      return "bg-[#fff0c2] text-[#775900]";
    case "Resolved":
      return "bg-[#d5f5ee] text-[#006a61]";
    case "Rejected":
      return "bg-[#ffdad6] text-[#ba1a1a]";
    default:
      return "bg-[#e6e7f0] text-[#444651]";
  }
};

const getPriorityClasses = (priority) => {
  switch (getPriorityLabel(priority)) {
    case "Critical":
      return "bg-[#ffdad6] text-[#ba1a1a]";
    case "High":
      return "bg-[#ffdbcb] text-[#773205]";
    case "Medium":
      return "bg-[#fff0c2] text-[#775900]";
    case "Low":
      return "bg-[#d5f5ee] text-[#006a61]";
    default:
      return "bg-[#e6e7f0] text-[#444651]";
  }
};

const getCategoryIcon = (category) => {
  const value = normalize(category);

  if (value.includes("road") || value.includes("pothole")) {
    return "construction";
  }

  if (
    value.includes("water") ||
    value.includes("drain") ||
    value.includes("sewer")
  ) {
    return "water_drop";
  }

  if (
    value.includes("garbage") ||
    value.includes("waste") ||
    value.includes("sanitation")
  ) {
    return "delete";
  }

  if (value.includes("light")) {
    return "lightbulb";
  }

  if (value.includes("park") || value.includes("tree")) {
    return "park";
  }

  return "location_city";
};

const getCategoryClasses = (category) => {
  const value = normalize(category);

  if (value.includes("road") || value.includes("pothole")) {
    return {
      bg: "bg-[#dce9ff]",
      text: "text-[#00236f]",
      border: "border-[#c5d7ff]",
    };
  }

  if (value.includes("water") || value.includes("drain")) {
    return {
      bg: "bg-[#d5f5ee]",
      text: "text-[#006a61]",
      border: "border-[#b5e8dc]",
    };
  }

  if (value.includes("garbage") || value.includes("waste")) {
    return {
      bg: "bg-[#ffdbcb]",
      text: "text-[#773205]",
      border: "border-[#ffb691]",
    };
  }

  return {
    bg: "bg-[#e6eeff]",
    text: "text-[#1e3a8a]",
    border: "border-[#c5c5d3]",
  };
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatTimeAgo = (value) => {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);

  if (minutes < 0) return formatDate(value);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);

  if (days < 7) return `${days}d ago`;

  return formatDate(value);
};

const getIssueNumber = (issue) => {
  if (issue.issue_number) return issue.issue_number;

  if (issue.id) {
    return `#${String(issue.id).slice(0, 8).toUpperCase()}`;
  }

  return "—";
};

const getIssueId = (issue) => issue.id ?? issue.issue_number;

const isResolvedToday = (issue) => {
  if (getStatusLabel(issue.status) !== "Resolved") return false;

  const resolvedAt = issue.resolved_at || issue.updated_at;

  if (!resolvedAt) return false;

  const date = new Date(resolvedAt);

  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

const matchesCategory = (issue, selectedCategory) => {
  if (!selectedCategory) return true;

  const category = normalize(issue.category);

  const categoryGroups = {
    roads: ["road", "roads", "pothole", "street", "infrastructure"],
    utilities: ["water", "utility", "utilities", "drain", "sewer"],
    sanitation: ["sanitation", "garbage", "waste", "cleanliness"],
    lighting: ["lighting", "light", "streetlight", "street light"],
    parks: ["park", "parks", "forestry", "tree"],
  };

  const terms = categoryGroups[selectedCategory] || [selectedCategory];

  return terms.some((term) => category.includes(term));
};

function IssueRow({ issue, selected, onToggle, onInspect }) {
  const categoryStyle = getCategoryClasses(issue.category);
  const status = getStatusLabel(issue.status);
  const priority = getPriorityLabel(issue.priority);

  const title = issue.title || "Untitled issue";
  const category = issue.category || "Uncategorized";
  const location = issue.address || "Location not provided";

  return (
    <tr className="group transition-colors hover:bg-[#eff4ff]/60">
      <td className="px-4 py-3">
        <input
          aria-label={`Select issue ${getIssueNumber(issue)}`}
          checked={selected}
          onChange={() => onToggle(getIssueId(issue))}
          className="h-4 w-4 cursor-pointer rounded border-[#c5c5d3] text-[#00236f] focus:ring-[#00236f]"
          type="checkbox"
        />
      </td>

      <td className="px-3 py-3">
        <div className="font-mono text-xs font-bold text-[#00236f]">
          {getIssueNumber(issue)}
        </div>

        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-[#757682]">
          <MaterialIcon className="text-[13px]">schedule</MaterialIcon>
          {formatTimeAgo(issue.created_at)}
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}
          >
            <MaterialIcon className="text-[20px]">
              {getCategoryIcon(issue.category)}
            </MaterialIcon>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 font-semibold text-[#0d1c2e]">
              <span className="whitespace-normal">{title}</span>
              {priority === "Critical" && (
                <MaterialIcon
                  className="shrink-0 text-[15px] text-[#ba1a1a]"
                  fill
                >
                  warning
                </MaterialIcon>
              )}
            </div>

            <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px] text-[#757682]">
              <span>Citizen report</span>
              <span className="text-[#c5c5d3]">•</span>
              <span className="max-w-64 truncate">
                {issue.description || "No description provided"}
              </span>
            </div>
          </div>
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="font-medium text-[#0d1c2e]">{category}</div>

        <div className="mt-0.5 flex items-center gap-1 text-xs text-[#444651]">
          <MaterialIcon className="text-[14px] text-[#757682]">
            location_on
          </MaterialIcon>
          <span className="max-w-56 truncate">{location}</span>
        </div>
      </td>

      <td className="px-3 py-3">
        <div className="flex flex-col items-start gap-1">
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${getPriorityClasses(issue.priority)}`}
          >
            {priority === "Critical" && (
              <MaterialIcon className="text-[13px]" fill>
                crisis_alert
              </MaterialIcon>
            )}
            {priority}
          </span>

          <span className="inline-flex items-center gap-1 rounded bg-[#e6eeff] px-1.5 py-0.5 text-[11px] font-medium text-[#444651]">
            <MaterialIcon className="text-[12px]">
              {status === "Resolved" ? "done_all" : "info"}
            </MaterialIcon>
            {status}
          </span>
        </div>
      </td>

      <td className="px-3 py-3">
        <span
          className="font-mono text-xs font-medium text-[#757682]"
          title="Impact score is not stored in the available issue fields"
        >
          —
        </span>
      </td>

      <td className="px-4 py-3">
        <div className="font-medium text-[#444651]">
          {issue.department_name || "—"}
        </div>

        <div className="mt-0.5 text-[11px] text-[#757682]">
          {issue.assignee_name || "Not assigned"}
        </div>
      </td>

      <td className="px-3 py-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusClasses(issue.status)}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {status}
        </span>
      </td>

      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onInspect(issue)}
            className="rounded px-2.5 py-1 text-xs font-semibold text-[#00236f] transition hover:bg-[#e6eeff]"
          >
            Inspect
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function ManageIssues() {
  const navigate = useNavigate();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");

  const [selectedIssues, setSelectedIssues] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    let active = true;

    const fetchIssues = async () => {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("issues")
        .select("*")
        .order("created_at", { ascending: false });

      if (!active) return;

      if (fetchError) {
        console.error("Failed to fetch issues:", fetchError);
        setError(
          "Unable to load issues. Check your Supabase connection and admin read permissions."
        );
        setIssues([]);
      } else {
        setIssues(data ?? []);
      }

      setLoading(false);
    };

    fetchIssues();

    return () => {
      active = false;
    };
  }, []);

  const counts = useMemo(() => {
    const result = {
      total: issues.length,
      active: 0,
      critical: 0,
      pending: 0,
      resolvedToday: 0,
      statuses: {},
    };

    STATUS_FILTERS.forEach((status) => {
      result.statuses[status] =
        status === "All"
          ? issues.length
          : issues.filter(
              (issue) => getStatusLabel(issue.status) === status
            ).length;
    });

    issues.forEach((issue) => {
      const status = getStatusLabel(issue.status);
      const priority = getPriorityLabel(issue.priority);

      if (status !== "Resolved" && status !== "Rejected") {
        result.active += 1;
      }

      if (priority === "Critical") {
        result.critical += 1;
      }

      if (status === "Pending") {
        result.pending += 1;
      }

      if (isResolvedToday(issue)) {
        result.resolvedToday += 1;
      }
    });

    return result;
  }, [issues]);

  const filteredIssues = useMemo(() => {
    const query = normalize(search);

    return issues.filter((issue) => {
      const matchesSearch =
        !query ||
        [
          issue.issue_number,
          issue.id,
          issue.title,
          issue.description,
          issue.category,
          issue.address,
          issue.status,
          issue.priority,
        ].some((value) => normalize(value).includes(query));

      const matchesStatus =
        statusFilter === "All" ||
        getStatusLabel(issue.status) === statusFilter;

      const matchesSeverity =
        !severityFilter ||
        getPriorityLabel(issue.priority) === severityFilter;

      const matchesZone =
        !zoneFilter ||
        normalize(issue.zone).includes(normalize(zoneFilter)) ||
        normalize(issue.address).includes(normalize(zoneFilter));

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory(issue, categoryFilter) &&
        matchesSeverity &&
        matchesZone
      );
    });
  }, [
    issues,
    search,
    statusFilter,
    categoryFilter,
    severityFilter,
    zoneFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredIssues.length / rowsPerPage)
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedIssues = useMemo(() => {
    const start = (safePage - 1) * rowsPerPage;

    return filteredIssues.slice(start, start + rowsPerPage);
  }, [filteredIssues, safePage, rowsPerPage]);

  const selectedOnPage = paginatedIssues.filter((issue) =>
    selectedIssues.includes(getIssueId(issue))
  );

  const allPageSelected =
    paginatedIssues.length > 0 &&
    selectedOnPage.length === paginatedIssues.length;

  const toggleIssue = (id) => {
    if (id == null) return;

    setSelectedIssues((previous) =>
      previous.includes(id)
        ? previous.filter((selectedId) => selectedId !== id)
        : [...previous, id]
    );
  };

  const togglePageSelection = () => {
    const pageIds = paginatedIssues
      .map(getIssueId)
      .filter((id) => id != null);

    if (allPageSelected) {
      setSelectedIssues((previous) =>
        previous.filter((id) => !pageIds.includes(id))
      );
    } else {
      setSelectedIssues((previous) =>
        [...new Set([...previous, ...pageIds])]
      );
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setCategoryFilter("");
    setSeverityFilter("");
    setZoneFilter("");
    setCurrentPage(1);
  };

  const inspectIssue = (issue) => {
    if (issue.id) {
      navigate(`/admin/issues/${issue.id}`);
    }
  };

  const exportCSV = () => {
    if (filteredIssues.length === 0) return;

    const columns = [
      ["Issue ID", (issue) => getIssueNumber(issue)],
      ["Title", (issue) => issue.title],
      ["Description", (issue) => issue.description],
      ["Category", (issue) => issue.category],
      ["Address", (issue) => issue.address],
      ["Priority", (issue) => getPriorityLabel(issue.priority)],
      ["Status", (issue) => getStatusLabel(issue.status)],
      ["Created At", (issue) => issue.created_at],
    ];

    const escapeCSV = (value) => {
      const text = String(value ?? "");
      return `"${text.replace(/"/g, '""')}"`;
    };

    const csv = [
      columns.map(([heading]) => escapeCSV(heading)).join(","),
      ...filteredIssues.map((issue) =>
        columns
          .map(([, getValue]) => escapeCSV(getValue(issue)))
          .join(",")
      ),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "civicfix-issues.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };



  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9ff] font-['Inter'] text-[#0d1c2e] antialiased">
      <Navbar />

      <main className="flex min-w-0 flex-1 flex-col bg-[#f8f9ff]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-10">
          <div className="flex flex-col gap-4 pb-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-[#0d1c2e]">
                  Issues Management
                </h1>

                <span className="rounded-full border border-[#00236f]/20 bg-[#00236f]/10 px-2.5 py-0.5 text-xs font-semibold text-[#00236f]">
                  Dehradun
                </span>
              </div>

              <p className="mt-1 text-sm text-[#444651]">
                Review, prioritize, and manage citizen-reported civic issues.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={exportCSV}
                disabled={filteredIssues.length === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-[#00236f] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1e3a8a] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <MaterialIcon className="text-[18px]">download</MaterialIcon>
                Export CSV
              </button>
            </div>
          </div>

          {/* Summary cards use actual Supabase records. */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="flex items-center gap-3 rounded-xl border border-[#c5c5d3]/80 bg-white p-3.5 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#dce9ff] text-[#00236f]">
                <MaterialIcon className="text-[22px]">inbox</MaterialIcon>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-[#444651]">
                  Total Issues
                </div>
                <div className="text-xl font-bold text-[#0d1c2e]">
                  {loading ? "—" : counts.total.toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-[#ba1a1a]/20 bg-white p-3.5 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ffdad6] text-[#ba1a1a]">
                <MaterialIcon className="text-[22px]">emergency</MaterialIcon>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-[#ba1a1a]">
                  Critical Priority
                </div>
                <div className="text-xl font-bold text-[#ba1a1a]">
                  {loading ? "—" : counts.critical.toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-[#ffb691]/40 bg-white p-3.5 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ffdbcb] text-[#773205]">
                <MaterialIcon className="text-[22px]">
                  hourglass_top
                </MaterialIcon>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-[#773205]">
                  Pending Review
                </div>
                <div className="text-xl font-bold text-[#0d1c2e]">
                  {loading ? "—" : counts.pending.toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-[#006a61]/20 bg-white p-3.5 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#86f2e4]/40 text-[#006a61]">
                <MaterialIcon className="text-[22px]">task_alt</MaterialIcon>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-[#006a61]">
                  Resolved Today
                </div>
                <div className="text-xl font-bold text-[#006a61]">
                  {loading
                    ? "—"
                    : counts.resolvedToday.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          </div>

          {/* Search and filters */}
          <div className="flex flex-col gap-3.5 rounded-xl border border-[#c5c5d3] bg-white p-4 shadow-sm">
            <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
                {STATUS_FILTERS.map((status) => {
                  const active = statusFilter === status;

                  return (
                    <button
                      key={status}
                      type="button"
                    onClick={() => {
  setStatusFilter(status);
  setCurrentPage(1);
}}
                      className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        active
                          ? "bg-[#00236f] text-white shadow-sm"
                          : "bg-[#e6eeff] text-[#444651] hover:bg-[#d5e3fc]"
                      }`}
                    >
                      {status}
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                          active
                            ? "bg-white/20 text-white"
                            : "text-[#757682]"
                        }`}
                      >
                        {loading
                          ? "—"
                          : counts.statuses[status].toLocaleString("en-IN")}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full shrink-0 lg:w-80">
                <MaterialIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#757682]">
                  search
                </MaterialIcon>

                <input
                  value={search}
                 onChange={(event) => {
  setSearch(event.target.value);
  setCurrentPage(1);
}}
                  className="w-full rounded-lg border border-[#c5c5d3] bg-[#f8f9ff] py-2 pl-9 pr-3 text-xs text-[#0d1c2e] transition-shadow placeholder:text-[#757682] focus:border-[#00236f] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                  placeholder="Search ID, keyword, address..."
                  type="search"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 border-t border-[#c5c5d3]/60 pt-3">
              <div className="min-w-36 max-w-56 flex-1">
                <select
                  value={categoryFilter}
                 onChange={(event) => {
  setCategoryFilter(event.target.value);
  setCurrentPage(1);
}}
                  className="w-full cursor-pointer rounded-lg border border-[#c5c5d3] bg-[#f8f9ff] px-2.5 py-2 text-xs text-[#0d1c2e] focus:border-[#00236f] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                >
                  <option value="">All Categories</option>
                  {CATEGORY_OPTIONS.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-36 max-w-56 flex-1">
                <select
                  value={zoneFilter}
                  onChange={(event) => {
  setZoneFilter(event.target.value);
  setCurrentPage(1);
}}
                  className="w-full cursor-pointer rounded-lg border border-[#c5c5d3] bg-[#f8f9ff] px-2.5 py-2 text-xs text-[#0d1c2e] focus:border-[#00236f] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                >
                  <option value="">All Locations</option>
                  <option value="Rajpur Road">Rajpur Road</option>
                  <option value="Patel Nagar">Patel Nagar</option>
                  <option value="Clement Town">Clement Town</option>
                  <option value="Central Town">Central Town</option>
                  <option value="Mussoorie">Mussoorie Road</option>
                </select>
              </div>

              <div className="min-w-32 max-w-40 flex-1">
                <select
                  value={severityFilter}
      onChange={(event) => {
  setSeverityFilter(event.target.value);
  setCurrentPage(1);
}}
                  className="w-full cursor-pointer rounded-lg border border-[#c5c5d3] bg-[#f8f9ff] px-2.5 py-2 text-xs text-[#0d1c2e] focus:border-[#00236f] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                >
                  <option value="">All Priorities</option>
                  {SEVERITY_OPTIONS.map((severity) => (
                    <option key={severity} value={severity}>
                      {severity}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#757682] transition hover:bg-[#e6eeff] hover:text-[#00236f]"
              >
                <MaterialIcon className="text-[16px]">
                  filter_alt_off
                </MaterialIcon>
                Clear Filters
              </button>
            </div>
          </div>

          {/* Issues table */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-[#c5c5d3] bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-2 border-b border-[#c5c5d3]/60 bg-[#eff4ff] px-4 py-3 text-xs text-[#444651] sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    loading ? "animate-pulse bg-[#757682]" : "bg-[#006a61]"
                  }`}
                />
                <span className="font-medium text-[#0d1c2e]">
                  {loading ? "Loading reports" : "Supabase Reports"}
                </span>
                <span>
                  {loading
                    ? "Fetching citizen issues..."
                    : `${filteredIssues.length.toLocaleString("en-IN")} matching reports`}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[#757682]">
                  {selectedIssues.length} selected
                </span>

                <button
                  type="button"
                  disabled={selectedIssues.length === 0}
                  onClick={() =>
                    alert(
                      "Bulk assignment is not connected yet. It requires the CivicFix assignment schema and update permissions."
                    )
                  }
                  className="font-medium text-[#00236f] transition hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Batch Assign
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="m-4 flex items-start gap-3 rounded-lg border border-[#ba1a1a]/20 bg-[#ffdad6]/40 p-4 text-sm text-[#ba1a1a]"
              >
                <MaterialIcon className="text-xl">error</MaterialIcon>
                <div>
                  <p className="font-semibold">Unable to load issues</p>
                  <p className="mt-1">{error}</p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-2 font-semibold underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-300 border-collapse text-left">
                <thead className="border-b border-[#c5c5d3] bg-[#eff4ff] text-[11px] font-semibold uppercase tracking-wider text-[#444651]">
                  <tr>
                    <th className="w-10 px-4 py-3">
                      <input
                        aria-label="Select all issues on this page"
                        type="checkbox"
                        checked={allPageSelected}
                        onChange={togglePageSelection}
                        disabled={paginatedIssues.length === 0}
                        className="h-4 w-4 cursor-pointer rounded border-[#c5c5d3] text-[#00236f] focus:ring-[#00236f] disabled:cursor-not-allowed"
                      />
                    </th>
                    <th className="px-3 py-3">Issue ID</th>
                    <th className="min-w-60 px-4 py-3">
                      Issue & Citizen Report
                    </th>
                    <th className="px-4 py-3">Category & Location</th>
                    <th className="px-3 py-3">Priority & Status</th>
                    <th className="px-3 py-3">Impact Score</th>
                    <th className="px-4 py-3">Department & Assignee</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#c5c5d3]/60 text-sm text-[#0d1c2e]">
                  {loading &&
                    Array.from({ length: 3 }).map((_, index) => (
                      <tr key={`loading-${index}`}>
                        <td colSpan={9} className="px-4 py-5">
                          <div className="h-4 w-full animate-pulse rounded bg-[#eff4ff]" />
                        </td>
                      </tr>
                    ))}

                  {!loading && !error && paginatedIssues.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-16 text-center">
                        <MaterialIcon className="text-4xl text-[#757682]">
                          search_off
                        </MaterialIcon>
                        <p className="mt-3 font-semibold text-[#0d1c2e]">
                          No issues found
                        </p>
                        <p className="mt-1 text-xs text-[#757682]">
                          {issues.length === 0
                            ? "No citizen reports are available in the issues table yet."
                            : "Try changing your search or filters."}
                        </p>
                        {(search ||
                          statusFilter !== "All" ||
                          categoryFilter ||
                          severityFilter ||
                          zoneFilter) && (
                          <button
                            type="button"
                            onClick={clearFilters}
                            className="mt-3 text-xs font-semibold text-[#00236f] hover:underline"
                          >
                            Clear all filters
                          </button>
                        )}
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    !error &&
                    paginatedIssues.map((issue) => (
                      <IssueRow
                        key={getIssueId(issue)}
                        issue={issue}
                        selected={selectedIssues.includes(getIssueId(issue))}
                        onToggle={toggleIssue}
                        onInspect={inspectIssue}
                      />
                    ))}
                </tbody>
              </table>
            </div>

            {/* Pagination uses the filtered results, not sample totals. */}
            <div className="flex shrink-0 flex-col items-center justify-between gap-3 border-t border-[#c5c5d3] bg-[#f8f9ff] px-4 py-3 sm:flex-row">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-xs text-[#444651]">
                  Showing{" "}
                  <span className="font-semibold text-[#0d1c2e]">
                    {filteredIssues.length === 0
                      ? 0
                      : (safePage - 1) * rowsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-[#0d1c2e]">
                    {Math.min(safePage * rowsPerPage, filteredIssues.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-[#0d1c2e]">
                    {filteredIssues.length}
                  </span>{" "}
                  issues
                </span>

                <div className="flex items-center gap-2 border-l border-[#c5c5d3]/60 pl-4 text-xs text-[#444651]">
                  <label htmlFor="rows-per-page">Rows per page:</label>
                  <select
                    id="rows-per-page"
                    value={rowsPerPage}
                   onChange={(event) => {
  setRowsPerPage(Number(event.target.value));
  setCurrentPage(1);
}}
                    className="rounded border border-[#c5c5d3] bg-white px-2 py-1 text-xs text-[#0d1c2e] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Previous page"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  disabled={safePage <= 1 || loading}
                  className="rounded-lg border border-[#c5c5d3] p-1.5 text-[#757682] transition hover:bg-[#e6eeff] hover:text-[#00236f] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <MaterialIcon className="text-[18px]">
                    chevron_left
                  </MaterialIcon>
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - safePage) <= 1
                  )
                  .reduce((items, page, index, pages) => {
                    if (index > 0 && page - pages[index - 1] > 1) {
                      items.push(
                        <span
                          key={`ellipsis-${page}`}
                          className="px-1 text-xs text-[#444651]"
                        >
                          ...
                        </span>
                      );
                    }

                    items.push(
                      <button
                        key={page}
                        type="button"
                        aria-current={safePage === page ? "page" : undefined}
                        onClick={() => setCurrentPage(page)}
                        disabled={loading}
                        className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs transition ${
                          safePage === page
                            ? "bg-[#00236f] font-semibold text-white shadow-sm"
                            : "text-[#444651] hover:bg-[#e6eeff]"
                        }`}
                      >
                        {page}
                      </button>
                    );

                    return items;
                  }, [])}

                <button
                  type="button"
                  aria-label="Next page"
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  disabled={safePage >= totalPages || loading}
                  className="rounded-lg border border-[#c5c5d3] p-1.5 text-[#757682] transition hover:bg-[#e6eeff] hover:text-[#00236f] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <MaterialIcon className="text-[18px]">
                    chevron_right
                  </MaterialIcon>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
<Footer type="admin" />
    </div>
  );
}
