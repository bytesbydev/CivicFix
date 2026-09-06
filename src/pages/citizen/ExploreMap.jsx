
import { useEffect, useState } from "react";
import Footer from "../../components/common/Footer";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import Navbar from "../../components/common/Navbar";
import { supabase } from "../../services/supabase";

const DEFAULT_CENTER = [30.3165, 78.0322];

const STATUS_COLORS = {
  "Pending Review": "#d97706",
  "In Progress": "#2563eb",
  Resolved: "#059669",
  Rejected: "#dc2626",
};

const formatIssueNumber = (issue) =>
  issue.issue_number != null
    ? `#CF-${issue.issue_number}`
    : `#${issue.id.slice(0, 8)}`;

const RecenterMap = ({ issue }) => {
  const map = useMap();

  useEffect(() => {
    if (
      issue &&
      Number.isFinite(Number(issue.latitude)) &&
      Number.isFinite(Number(issue.longitude))
    ) {
      map.flyTo(
        [Number(issue.latitude), Number(issue.longitude)],
        16,
        { duration: 1 }
      );
    }
  }, [issue, map]);

  return null;
};

const ExploreMap = () => {
  const navigate = useNavigate();
  const routeLocation = useLocation();

  const targetIssueId =
    routeLocation.state?.issueId ||
    routeLocation.state?.focusIssueId ||
    null;

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIssue, setSelectedIssue] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadIssues = async () => {
      setLoading(true);
      setError("");

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

        const { data, error: queryError } = await supabase
          .from("issues")
          .select(
            "id, issue_number, title, category, status, priority, address, latitude, longitude, created_at"
          )
          .order("created_at", { ascending: false });

        if (queryError) throw queryError;

        if (cancelled) return;

        const validIssues = (data || []).filter(
          (issue) =>
            issue.latitude != null &&
            issue.longitude != null &&
            Number.isFinite(Number(issue.latitude)) &&
            Number.isFinite(Number(issue.longitude))
        );

        setIssues(validIssues);

        const target = validIssues.find(
          (issue) => issue.id === targetIssueId
        );

        setSelectedIssue(target || null);
      } catch (err) {
        console.error("Explore Map loading error:", err);

        if (!cancelled) {
          setError(
            err.message || "Unable to load reports on the map."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadIssues();

    return () => {
      cancelled = true;
    };
  }, [navigate, targetIssueId]);

  const openMyReports = () => {
    navigate("/my-reports", {
      state: {
        issueId: selectedIssue?.id || targetIssueId,
        focusIssueId: selectedIssue?.id || targetIssueId,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-['Inter'] text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-350 space-y-6 px-4 py-6 md:px-8 md:py-8">
        <section className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-blue-900">
              <span className="material-symbols-outlined">
                map
              </span>
              CivicFix Map
            </p>

            <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">
              Explore Civic Issues
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Explore reported civic issues and select a marker to
              view its details.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/my-reports")}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <span className="material-symbols-outlined">
              assignment
            </span>
            My Reports
          </button>
        </section>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-80 items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-100 border-t-blue-900" />
              Loading issue locations...
            </div>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">
                  Issues with locations
                </p>
                <p className="mt-2 text-2xl font-bold">
                  {issues.length}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">
                  Pending Review
                </p>
                <p className="mt-2 text-2xl font-bold text-amber-700">
                  {
                    issues.filter(
                      (issue) => issue.status === "Pending Review"
                    ).length
                  }
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">Resolved</p>
                <p className="mt-2 text-2xl font-bold text-emerald-700">
                  {
                    issues.filter(
                      (issue) => issue.status === "Resolved"
                    ).length
                  }
                </p>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
                <div>
                  <h2 className="font-bold">Issue Locations</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Select a marker to view the report.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-amber-600" />
                    Pending
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-blue-600" />
                    In Progress
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-emerald-600" />
                    Resolved
                  </span>
                </div>
              </div>

              <div className="relative h-[60vh] min-h-95 w-full">
                <MapContainer
                  center={
                    selectedIssue
                      ? [
                          Number(selectedIssue.latitude),
                          Number(selectedIssue.longitude),
                        ]
                      : DEFAULT_CENTER
                  }
                  zoom={selectedIssue ? 16 : 12}
                  scrollWheelZoom
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <RecenterMap issue={selectedIssue} />

                  {issues.map((issue) => (
                    <CircleMarker
                      key={issue.id}
                      center={[
                        Number(issue.latitude),
                        Number(issue.longitude),
                      ]}
                      radius={issue.id === selectedIssue?.id ? 11 : 8}
                      pathOptions={{
                        color:
                          STATUS_COLORS[issue.status] || "#475569",
                        fillColor:
                          STATUS_COLORS[issue.status] || "#475569",
                        fillOpacity: 0.85,
                        weight: issue.id === selectedIssue?.id ? 4 : 2,
                      }}
                      eventHandlers={{
                        click: () => setSelectedIssue(issue),
                      }}
                    >
                      <Popup>
                        <div className="min-w-40">
                          <p className="font-bold">
                            {issue.title}
                          </p>
                          <p className="mt-1 text-sm">
                            {formatIssueNumber(issue)}
                          </p>
                          <p className="mt-1 text-sm">
                            {issue.status}
                          </p>
                          {issue.address && (
                            <p className="mt-1 text-sm">
                              {issue.address}
                            </p>
                          )}
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>

              {issues.length === 0 && (
                <div className="border-t border-slate-200 p-5 text-center">
                  <p className="font-semibold text-slate-700">
                    No mapped issues found
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Reports appear here when they have saved latitude
                    and longitude coordinates and are accessible to
                    your account.
                  </p>
                </div>
              )}
            </section>

            {selectedIssue && (
              <section className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="font-mono text-xs font-semibold text-blue-900">
                      {formatIssueNumber(selectedIssue)}
                    </p>

                    <h2 className="mt-2 text-xl font-bold">
                      {selectedIssue.title}
                    </h2>

                    <p className="mt-2 text-sm text-slate-600">
                      {selectedIssue.category} · {selectedIssue.status}
                    </p>

                    <p className="mt-2 flex items-start gap-2 text-sm text-slate-600">
                      <span className="material-symbols-outlined text-lg">
                        location_on
                      </span>
                      {selectedIssue.address || "Address unavailable"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={openMyReports}
                    className="shrink-0 rounded-xl bg-blue-900 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-950"
                  >
                    Track in My Reports
                  </button>
                </div>
              </section>
            )}
          </>
        )}
      </main>
      <Footer type="citizen" />
    </div>
  );
};

export default ExploreMap;
