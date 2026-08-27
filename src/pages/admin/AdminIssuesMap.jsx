
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Footer from "../../components/common/Footer";
import { supabase } from "../../services/supabase";
import Button from "../../components/common/Button";
import Navbar from "../../components/common/Navbar";

const DEHRADUN_CENTER = [30.3165, 78.0322];

// Different marker colors for issue statuses.
const createIssueIcon = (status) => {
  const color =
    status === "In Progress" ? "#d97706" : "#1d4ed8";

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 34px;
        height: 34px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          color: white;
          font-size: 17px;
          transform: rotate(45deg);
          font-weight: bold;
        ">!</span>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32],
  });
};

// Zoom the map to the reported issue markers.
const FitIssues = ({ issues }) => {
  const map = useMap();

  useEffect(() => {
    if (issues.length === 1) {
      map.setView(
        [Number(issues[0].latitude), Number(issues[0].longitude)],
        15
      );
    } else if (issues.length > 1) {
      const bounds = L.latLngBounds(
        issues.map((issue) => [
          Number(issue.latitude),
          Number(issue.longitude),
        ])
      );

      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [issues, map]);

  return null;
};

const AdminIssuesMap = () => {
  const navigate = useNavigate();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    let active = true;
    let isFirstLoad = true;

    // Fetch unresolved issues with valid map coordinates.
    const loadIssues = async () => {
      if (active) {
        setError("");
      }

      const { data, error: fetchError } = await supabase
        .from("issues")
        .select(
          "id, issue_number, title, category, status, priority, address, latitude, longitude, created_at"
        )
        .neq("status", "Resolved")
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .order("created_at", { ascending: false });

      if (!active) return;

      if (fetchError) {
        console.error("Failed to fetch map issues:", fetchError);
        setError("Unable to load issue locations. Please try again.");
        setLoading(false);
        isFirstLoad = false;
        return;
      }

      const validIssues = (data || []).filter((issue) => {
        const latitude = Number(issue.latitude);
        const longitude = Number(issue.longitude);

        return (
          Number.isFinite(latitude) &&
          Number.isFinite(longitude) &&
          Math.abs(latitude) <= 90 &&
          Math.abs(longitude) <= 180
        );
      });

      setIssues(validIssues);
      setError("");
      setLoading(false);
      isFirstLoad = false;
    };

    // Initial load is started directly by the effect.
    loadIssues();

    // Refresh when issue records change in Supabase.
    const channel = supabase
      .channel("admin-issues-map")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "issues",
        },
        () => {
          loadIssues();
        }
      )
      .subscribe();

    // Fallback refresh if realtime is unavailable.
    const refreshInterval = setInterval(() => {
      if (active && !isFirstLoad) {
        loadIssues();
      }
    }, 30000);

    return () => {
      active = false;
      supabase.removeChannel(channel);
      clearInterval(refreshInterval);
    };
  }, []);

  const visibleIssues =
    filter === "All"
      ? issues
      : issues.filter((issue) => issue.status === filter);

  const pendingCount = issues.filter(
    (issue) => issue.status === "Pending Review"
  ).length;

  const inProgressCount = issues.filter(
    (issue) => issue.status === "In Progress"
  ).length;

  return (
    <div className="min-h-screen bg-[#f8f9ff] font-['Inter'] text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-blue-800">
              Admin Dashboard / Issue Locations
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#00236f] md:text-3xl">
              Reported Issues Map
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              View all unresolved reports with available map coordinates.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              // Trigger a refresh without changing the current filters.
              window.dispatchEvent(
                new CustomEvent("civicfix-refresh-issues-map")
              );
            }}
            disabled={loading}
            icon="refresh"
          >
            Refresh Map
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Unresolved Issues on Map
            </p>
            <p className="mt-2 text-3xl font-bold text-[#00236f]">
              {issues.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Pending Review</p>
            <p className="mt-2 text-3xl font-bold text-blue-700">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">In Progress</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {inProgressCount}
            </p>
          </div>
        </div>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold text-slate-900">
                Issue Locations
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Select a marker to view report information.
              </p>
            </div>

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-700"
              aria-label="Filter issues by status"
            >
              <option value="All">All unresolved issues</option>
              <option value="Pending Review">Pending Review</option>
              <option value="In Progress">In Progress</option>
            </select>
          </div>

          {error && (
            <div
              role="alert"
              className="m-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex h-125 items-center justify-center text-slate-500">
              Loading issue locations...
            </div>
          ) : (
            <div className="relative h-125 w-full md:h-155">
              <MapContainer
                center={DEHRADUN_CENTER}
                zoom={12}
                className="h-full w-full"
                scrollWheelZoom
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitIssues issues={visibleIssues} />

                {visibleIssues.map((issue) => (
                  <Marker
                    key={issue.id}
                    position={[
                      Number(issue.latitude),
                      Number(issue.longitude),
                    ]}
                    icon={createIssueIcon(issue.status)}
                  >
                    <Popup>
                      <div className="min-w-50 space-y-2">
                        <p className="font-bold text-slate-900">
                          #{issue.issue_number} — {issue.title}
                        </p>

                        <p className="text-sm text-slate-600">
                          {issue.category}
                        </p>

                        <p className="text-sm text-slate-600">
                          {issue.address || "Address not available"}
                        </p>

                        <p className="text-sm">
                          <strong>Status:</strong> {issue.status}
                        </p>

                        <p className="text-sm">
                          <strong>Priority:</strong> {issue.priority}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            navigate("/admin/manage-issues", {
                              state: { issueId: issue.id },
                            })
                          }
                          className="mt-1 rounded-md bg-blue-800 px-3 py-2 text-sm font-semibold text-white"
                        >
                          Open Issue Management
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>

              {!error && visibleIssues.length === 0 && (
                <div className="absolute left-1/2 top-4 z-1000 -translate-x-1/2 rounded-lg bg-white px-4 py-3 text-center text-sm shadow-md">
                  {issues.length === 0
                    ? "No unresolved issues with coordinates found."
                    : "No issues match this filter."}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-5 border-t border-slate-200 p-4 text-sm text-slate-600">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-blue-700" />
              Pending Review
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-amber-600" />
              In Progress
            </span>
            <span className="text-xs text-slate-500">
              Resolved issues are excluded.
            </span>
          </div>
        </section>
      </main>

      <Footer type="admin" />
    </div>
  );
};

export default AdminIssuesMap;
