
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Button from "../../components/common/Button";

const DEHRADUN_CENTER = [30.3165, 78.0322];

const markerIcon = L.divIcon({
  className: "",
  html: `
    <div style="color:#ba1a1a;font-size:38px;filter:drop-shadow(0 2px 3px #777);">
      <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1;">
        location_on
      </span>
    </div>
  `,
  iconSize: [38, 42],
  iconAnchor: [19, 40],
});

const MapClickHandler = ({ onSelect }) => {
  useMapEvents({
    click(event) {
      onSelect(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
};

const MapController = ({ center, zoom }) => {
  const map = useMap();

  ReactUseMapEffect(map, center, zoom);

  return null;
};

// Keep map movement synchronized with search and zoom controls.
const ReactUseMapEffect = (map, center, zoom) => {
  map.setView(center, zoom, { animate: true });
};

const IssueLocation = () => {
  const navigate = useNavigate();
  const routeLocation = useLocation();

  const imageFile = routeLocation.state?.imageFile;
  const imagePreview = routeLocation.state?.imagePreview;

  const [search, setSearch] = useState("");
  const [center, setCenter] = useState(DEHRADUN_CENTER);
  const [zoom, setZoom] = useState(13);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

 const selectCoordinates = async (latitude, longitude, address = "") => {
  const lat = Number(latitude.toFixed(6));
  const lon = Number(longitude.toFixed(6));

  setSelectedLocation({
    latitude: lat,
    longitude: lon,
    address: address || "Finding address...",
  });

  setCenter([lat, lon]);

  if (address) return;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
    );

    if (!response.ok) {
      throw new Error("Unable to find address");
    }

    const data = await response.json();

    setSelectedLocation((previous) => {
      if (
        !previous ||
        previous.latitude !== lat ||
        previous.longitude !== lon
      ) {
        return previous;
      }

      return {
        ...previous,
        address:
          data.name ||
          data.display_name ||
          "Address not found for this location",
      };
    });
  } catch (error) {
    console.error("Reverse geocoding failed:", error);

    setSelectedLocation((previous) => {
      if (
        !previous ||
        previous.latitude !== lat ||
        previous.longitude !== lon
      ) {
        return previous;
      }

      return {
        ...previous,
        address: "Address unavailable",
      };
    });
  }
};
  const handleSearch = async () => {
    const query = search.trim();

    if (!query) {
      setSearchError("Enter an address or landmark to search.");
      return;
    }

    setSearching(true);
    setSearchError("");

    try {
      const url = new URL(
        "https://nominatim.openstreetmap.org/search"
      );

      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("q", `${query}, Dehradun, India`);
      url.searchParams.set("limit", "1");
      url.searchParams.set("countrycodes", "in");

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error("The location search service is unavailable.");
      }

      const results = await response.json();

      if (!results.length) {
        setSearchError("Location not found. Try another landmark.");
        return;
      }

      const result = results[0];

      selectCoordinates(
        Number(result.lat),
        Number(result.lon),
        result.display_name
      );

      setZoom(16);
    } catch (error) {
      setSearchError(
        error.message || "Unable to search for this location."
      );
    } finally {
      setSearching(false);
    }
  };

  const handleConfirm = () => {
    if (!imageFile) {
      alert("Please capture or select an issue image first.");
      navigate("/report");
      return;
    }

    if (!selectedLocation) {
      alert("Please select the issue location on the map first.");
      return;
    }

    navigate("/issue-details", {
      state: {
        imageFile,
        imagePreview,
        issueLocation: {
          issueLocation: {
  latitude: selectedLocation.latitude,
  longitude: selectedLocation.longitude,
  address: selectedLocation.address,
},
        },
      },
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9ff] text-[#0d1c2e] antialiased">
      <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-[#c5c5d3] bg-[#f8f9ff] px-4 py-4 shadow-sm md:px-10">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/report")}
            className="-ml-2 flex items-center justify-center rounded-full p-2 text-[#444651] transition-colors hover:bg-[#eff4ff]"
            aria-label="Go back"
          >
            <span className="material-symbols-outlined">
              arrow_back
            </span>
          </button>

          <span className="font-['Plus_Jakarta_Sans'] text-2xl font-bold leading-8 text-[#00236f]">
            Report Issue
          </span>
        </div>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="text-sm font-semibold tracking-wider text-[#444651] transition-colors hover:text-[#00236f]"
        >
          Cancel
        </button>
      </header>

      <main className="mx-auto flex w-full max-w-5xl grow flex-col gap-8 px-4 py-8 md:px-10">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-wider text-[#444651]">
              Step 2 of 5
            </h2>

            <span className="text-xs font-medium text-[#00236f]">
              Location
            </span>
          </div>

          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#dce9ff]">
            <div className="h-full w-2/5 rounded-full bg-[#00236f]" />
          </div>
        </section>

        <section>
          <h1 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold md:text-3xl">
            Where is the issue located?
          </h1>

          <p className="mt-2 text-base leading-6 text-[#444651]">
            Search for a landmark or click directly on the map to
            select the exact issue location.
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Your device's current location is not accessed.
          </p>
        </section>

        {/* Search */}
        <section className="flex flex-col gap-3 sm:flex-row">
          <label className="relative min-w-0 flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#444651]">
              search
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSearch();
                }
              }}
              placeholder="Search address or landmark in Dehradun..."
              className="w-full rounded-xl border border-[#c5c5d3] bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-[#00236f] focus:ring-2 focus:ring-[#dce1ff]"
            />
          </label>

          <Button
            type="button"
            onClick={handleSearch}
            disabled={searching}
            icon="search"
          >
            {searching ? "Searching..." : "Search"}
          </Button>
        </section>

        {searchError && (
          <p role="alert" className="text-sm text-red-700">
            {searchError}
          </p>
        )}

        {/* Interactive map */}
        <section className="relative z-0 h-[400px] overflow-hidden rounded-xl border border-[#c5c5d3] bg-slate-100 shadow-sm md:h-[500px]">
          <MapContainer
            center={DEHRADUN_CENTER}
            zoom={13}
            scrollWheelZoom
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapController center={center} zoom={zoom} />

            <MapClickHandler
              onSelect={(latitude, longitude) =>
                selectCoordinates(latitude, longitude)
              }
            />

            {selectedLocation && (
              <Marker
                position={[
                  selectedLocation.latitude,
                  selectedLocation.longitude,
                ]}
                icon={markerIcon}
              />
            )}
          </MapContainer>

          <div className="absolute bottom-4 left-4 z-[1000] rounded-lg bg-white/95 px-3 py-2 text-xs font-medium text-slate-700 shadow">
            Click the map to place your pin
          </div>

          <div className="absolute right-3 top-3 z-[1000] flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setZoom((value) => Math.min(value + 1, 19))}
              aria-label="Zoom in"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-800 shadow hover:bg-slate-50"
            >
              <span className="material-symbols-outlined">add</span>
            </button>

            <button
              type="button"
              onClick={() => setZoom((value) => Math.max(value - 1, 3))}
              aria-label="Zoom out"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-800 shadow hover:bg-slate-50"
            >
              <span className="material-symbols-outlined">remove</span>
            </button>
          </div>
        </section>

        {/* Selected coordinates */}
        <section className="flex flex-col gap-4 rounded-xl border border-[#c5c5d3] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-[#eff4ff] p-2 text-[#00236f]">
              <span className="material-symbols-outlined">location_on</span>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#444651]">
                Selected issue coordinates
              </p>

              {selectedLocation ? (
                <div className="mt-2 space-y-1">
                  <p className="text-sm font-semibold">
                    Latitude: {selectedLocation.latitude}
                  </p>
                  <p className="text-sm font-semibold">
                    Longitude: {selectedLocation.longitude}
                  </p>
                  {selectedLocation.address && (
                    <p className="mt-2 max-w-xl text-sm leading-5 text-slate-500">
                      {selectedLocation.address}
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  No location selected. Click the map or search for a landmark.
                </p>
              )}
            </div>
          </div>

          {selectedLocation && (
            <button
              type="button"
              onClick={() => setSelectedLocation(null)}
              className="self-start text-sm font-semibold text-red-700 hover:underline sm:self-center"
            >
              Clear selection
            </button>
          )}
        </section>

        <section className="mt-auto flex flex-col-reverse justify-end gap-4 border-t border-[#c5c5d3] pt-6 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/report")}
            className="rounded-lg px-6 py-3 text-sm font-semibold tracking-wider text-[#444651] transition-colors hover:bg-[#eff4ff]"
          >
            Back
          </button>

          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedLocation}
            icon="arrow_forward"
            iconPosition="after"
          >
            Confirm Location
          </Button>
        </section>
      </main>
    </div>
  );
};

export default IssueLocation;
