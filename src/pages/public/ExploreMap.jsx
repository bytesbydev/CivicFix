
import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import Navbar from "../../components/common/Navbar";
import { supabase } from "../../services/supabase";
import Footer from "../../components/common/Footer";

const DEHRADUN_CENTER = [30.3165, 78.0322];

const createIssuePin = (status, selected = false) => {
  const color = getStatusColor(status);
  const size = selected ? 45 : 40;

  return L.divIcon({
    className: "",
    html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        filter: drop-shadow(0 2px 3px rgba(0,0,0,0.35));
      ">
        <div style="
          position: absolute;
          top: 2px;
          left: 4px;
          width: ${size - 8}px;
          height: ${size - 8}px;
          background: ${color};
          border: 2px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-sizing: border-box;
        "></div>

        <div style="
          position: absolute;
          top: 11px;
          left: 50%;
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
          transform: translateX(-50%);
        "></div>

        ${
          selected
            ? `<div style="
                position: absolute;
                inset: 0;

                opacity: 0.8;
              "></div>`
            : ""
        }
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size + 3],
  });
};
const STATUS_COLORS = {
  "Pending Review": "#f59e0b",
  "In Progress": "#2563eb",
  Resolved: "#16a34a",
  Rejected: "#dc2626",
};

const CATEGORIES = [
  "All Categories",
  "Potholes",
  "Garbage",
  "Streetlights",
  "Drainage",
  "Water",
  "Other",
];

const STATUSES = [
  "All Statuses",
  "Pending Review",
  "In Progress",
  "Resolved",
  "Rejected",
];

function formatDate(date) {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusColor(status) {
  return STATUS_COLORS[status] || "#64748b";
}

export default function ExploreMap() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Statuses");
  const [search, setSearch] = useState("");
  const [selectedIssue, setSelectedIssue] = useState(null);

  useEffect(() => {
    let active = true;

    async function fetchIssues() {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
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
          latitude,
          longitude,
          created_at
        `)
        .order("created_at", { ascending: false });

      if (!active) return;

      if (fetchError) {
        setError(
          "Unable to load public issues. Check your internet connection or Supabase access policies."
        );
        setIssues([]);
      } else {
        setIssues(data || []);
      }

      setLoading(false);
    }

    fetchIssues();

    return () => {
      active = false;
    };
  }, []);

  const mappedIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (issue.latitude == null || issue.longitude == null) return false;

      const latitude = Number(issue.latitude);
      const longitude = Number(issue.longitude);

      return (
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        Math.abs(latitude) <= 90 &&
        Math.abs(longitude) <= 180
      );
    });
  }, [issues]);

  const filteredIssues = useMemo(() => {
    const term = search.trim().toLowerCase();

    return mappedIssues.filter((issue) => {
      const matchesCategory =
        category === "All Categories" || issue.category === category;

      const matchesStatus =
        status === "All Statuses" || issue.status === status;

      const matchesSearch =
        !term ||
        String(issue.issue_number).includes(term) ||
        (issue.title || "").toLowerCase().includes(term) ||
        (issue.address || "").toLowerCase().includes(term) ||
        (issue.category || "").toLowerCase().includes(term);

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [mappedIssues, category, status, search]);

  const stats = useMemo(() => {
    return {
      total: issues.length,
      pending: issues.filter((i) => i.status === "Pending Review").length,
      progress: issues.filter((i) => i.status === "In Progress").length,
      resolved: issues.filter((i) => i.status === "Resolved").length,
    };
  }, [issues]);

  function clearFilters() {
    setCategory("All Categories");
    setStatus("All Statuses");
    setSearch("");
    setSelectedIssue(null);
  }

  return (
    <div className="min-h-screen bg-slate-50 font-['Inter'] text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <section className="mb-7">
          <p className="mb-2 text-sm font-bold uppercase tracking-wider text-blue-800">
            CivicFix · Public Access
          </p>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Explore Civic Issues
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Explore civic issues reported across Dehradun, view their current
            status, and find reported problems near different locations.
            Anyone can view this map without logging in.
          </p>
        </section>

        {/* Statistics */}
        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {
              label: "Total Reports",
              value: stats.total,
              color: "text-slate-900",
            },
            {
              label: "Pending Review",
              value: stats.pending,
              color: "text-amber-600",
            },
            {
              label: "In Progress",
              value: stats.progress,
              color: "text-blue-600",
            },
            {
              label: "Resolved",
              value: stats.resolved,
              color: "text-green-600",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className={`mt-2 text-3xl font-bold ${item.color}`}>
                {item.value}
              </p>
            </div>
          ))}
        </section>

        {/* Map and Filters */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4 sm:p-5">
            <div className="mb-4">
              <h2 className="text-lg font-bold">Reported Issue Locations</h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredIssues.length} of {mappedIssues.length} mapped issues
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search issue or address..."
                aria-label="Search public issues"
                className="min-w-0 rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              />

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                aria-label="Filter by category"
                className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-700"
              >
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                aria-label="Filter by status"
                className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-700"
              >
                {STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={clearFilters}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {error && (
            <div className="m-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex h-125 items-center justify-center text-sm text-slate-500">
              Loading public issues...
            </div>
          ) : (
            <MapContainer
              center={DEHRADUN_CENTER}
              zoom={12}
              scrollWheelZoom={true}
              className="z-0 h-125 w-full sm:h-150"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {filteredIssues.map((issue) => (
                <Marker
  key={issue.id}
  position={[
    Number(issue.latitude),
    Number(issue.longitude),
  ]}
  icon={createIssuePin(
    issue.status,
    selectedIssue?.id === issue.id
  )}
  eventHandlers={{
    click: () => setSelectedIssue(issue),
  }}
>
  <Popup>
    <div className="min-w-40">
      <p className="font-bold">{issue.title}</p>
      <p className="mt-1 text-sm">
        #CF-{issue.issue_number}
      </p>
      <p className="mt-1 text-sm">{issue.status}</p>
      {issue.address && (
        <p className="mt-1 text-sm">{issue.address}</p>
      )}
    </div>
  </Popup>
</Marker>
              ))}
            </MapContainer>
          )}

          {!loading && !error && filteredIssues.length === 0 && (
            <p className="border-t border-slate-200 px-5 py-4 text-sm text-slate-500">
              No mapped issues match your filters. Try changing the filters.
            </p>
          )}

          {/* Map Legend */}
          <div className="flex flex-wrap gap-x-5 gap-y-3 border-t border-slate-200 px-4 py-4">
            {Object.entries(STATUS_COLORS).map(([label, color]) => (
              <div
                key={label}
                className="flex items-center gap-2 text-xs text-slate-600"
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {label}
              </div>
            ))}
          </div>
        </section>

        {/* Selected Issue Details */}
        {selectedIssue && (
          <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-blue-800">
                  Report #{selectedIssue.issue_number}
                </p>

                <h2 className="text-xl font-bold">
                  {selectedIssue.title}
                </h2>

                <p className="mt-2 text-sm text-slate-600">
                  {selectedIssue.category} · {selectedIssue.priority} priority
                </p>

                {selectedIssue.address && (
                  <p className="mt-2 text-sm text-slate-600">
                    Location: {selectedIssue.address}
                  </p>
                )}

                {selectedIssue.description && (
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                    {selectedIssue.description}
                  </p>
                )}

                <p className="mt-3 text-xs text-slate-500">
                  Reported on {formatDate(selectedIssue.created_at)}
                </p>
              </div>

              <span
                className="inline-flex w-fit shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-white"
                style={{
                  backgroundColor: getStatusColor(selectedIssue.status),
                }}
              >
                {selectedIssue.status}
              </span>
            </div>
          </section>
        )}

        <p className="mt-5 text-xs leading-5 text-slate-500">
          Only issues with valid coordinates appear on the map. Public access
          depends on your Supabase Row Level Security policies.
        </p>
      </main>
     <Footer type="public" />
    </div>
  );
}
