
import { Link, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import Navbar from "../../components/common/Navbar";
import Button from "../../components/common/Button";
import { supabase } from "../../services/supabase";
import Footer from "../../components/common/Footer";

const profileImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCy5DDOXb36lxOd_wYgRQ_BI0BpD_rRZNMjafHI3M13NOGsA9aFhJAVc2GtMkjud691iTkNnt1FdEtKK8KsuKkURDpsitUd993ziqtIKJXJZTWzrQDIQ4hQxlPCXfTmkhEtK5vDGmLGDgjjzmJkr3_MnGN1YdLrYbxf1ifGA43N5D73f97pRz3VWjvBiaZk5GMSOFREuhH2zzMykz9Xkjj1_iq2dYB0fkj9tu7HGltZjlZHXjgzHY_V";

const homeMap =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBwudJOv4y79lp3eV8isPDCRqo13FvoviYfd7u6h5MyhZNkIHMFH9gdTPzGFE1xOMX-nPgRVPpRC-2ti6dge9g27-KHqb0yoGDQvdyt6KeEtFAqF4-5vuqozqZxnCTbCx0eLMkBi60NJ58bLAPo4DFHrWe0HvWmHETjo1Siy8Ncl15MFw0xZDJMJZ9Vsq-cAsl8Y3tuw-SfLtG3a6-un4bhXBKB8ZHN9dwnBHRK0aA62yB-KwRmRcEG";

const officeMap =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCr4qt_DwSSV5BQJi_bAJTL6bqiIx9rhHP7ZG9AGHK-xl4hAJCksDIHTPaCdarGRWc70w6kpQ9SThxW_t3eubtjnUWvIiuKmi8JH7jTirXPan0h4ttVv59zX7tGuhIHfFt5rPgy9NXycCBoPN6R0De-kmpCV7i2yn6SfWdMsDA6_SuFAcFu0QibjH1hXnNQ8tTwphB3gGGbiVIazB41gAnvHN25Fh7_J5pa4MKH9Ne44Yn-p1vSQPMZ";

function Toggle({ defaultChecked = false }) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => setChecked((previous) => !previous)}
        className="peer sr-only"
      />

      <div
        className="
          relative h-6 w-11 rounded-full bg-[#e6eeff]
          after:absolute after:left-0.5 after:top-0.5
          after:h-5 after:w-5 after:rounded-full
          after:border after:border-[#c5c5d3] after:bg-white
          after:transition-all after:content-['']
          peer-focus:outline-none
          peer-checked:bg-[#1e3a8a]
          peer-checked:after:translate-x-full
          peer-checked:after:border-white
        "
      />
    </label>
  );
}

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadProfile = useCallback(async () => {
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

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, phone, role")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data || data.role !== "citizen") {
        throw new Error(
          "Citizen profile not found or could not be verified."
        );
      }

      setProfile({
        full_name: data.full_name || "",
        email: user.email || "",
        phone: data.phone || "",
      });
    } catch (error) {
      console.error("Profile loading error:", error);
      setErrorMessage(error.message || "Unable to load your profile.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

 useEffect(() => {
  const timer = setTimeout(() => {
    loadProfile();
  }, 0);

  return () => clearTimeout(timer);
}, [loadProfile]);

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("Please log in again.");

      const { data, error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name.trim(),
          phone: profile.phone.trim() || null,
        })
        .eq("id", user.id)
        .select("full_name, phone")
        .single();

      if (error) throw error;

      setProfile((previous) => ({
        ...previous,
        full_name: data.full_name || "",
        phone: data.phone || "",
      }));

      setEditing(false);
      setMessage("Profile updated successfully.");
    } catch (error) {
      console.error("Profile update error:", error);
      setErrorMessage(error.message || "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = () => {
    setMessage("");
    setErrorMessage("");
    setEditing(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9ff] font-['Inter'] text-[#0d1c2e]">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl grow space-y-8 px-4 py-8 pb-32 md:px-10 md:pb-8">
        {/* Profile header and contribution level */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="relative col-span-1 flex flex-col items-center overflow-hidden rounded-xl border border-[#c5c5d3] bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)] sm:flex-row sm:items-start lg:col-span-8">
            <div className="absolute left-0 top-0 z-0 h-24 w-full bg-[#d5e3fc]" />

            <div className="relative z-10 flex w-full flex-col items-center gap-4 pt-8 sm:flex-row sm:items-end sm:pt-12">
              <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-white bg-[#e6eeff]">
                <img
                  src={profileImage}
                  alt={profile.full_name || "Citizen profile"}
                  className="h-full w-full object-cover"
                />

                <div className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-[#86f2e4] p-1 text-[#006f66]">
                  <span className="material-symbols-outlined text-[16px]">
                    shield_person
                  </span>
                </div>
              </div>

              <div className="flex grow flex-col items-center text-center sm:items-start sm:text-left">
                <h1 className="font-['Plus_Jakarta_Sans'] text-[32px] font-bold leading-10 tracking-tight text-[#0d1c2e]">
                  {loading
                    ? "Loading profile..."
                    : profile.full_name || "Citizen"}
                </h1>

                <p className="mt-1 flex items-center gap-1 text-[16px] leading-6 text-[#444651]">
                  <span className="material-symbols-outlined text-[16px]">
                    location_on
                  </span>
                  Rajpur Road, Dehradun
                </p>
              </div>

              <div className="mt-4 flex w-full flex-col gap-2 sm:mt-0 sm:w-auto">
                {!editing ? (
                  <Button
                    className="gap-2"
                    icon="edit"
                    iconPosition="before"
                    onClick={startEditing}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        loadProfile();
                      }}
                      className="rounded-lg border border-[#c5c5d3] px-4 py-2 text-sm font-semibold"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      form="citizen-profile-form"
                      disabled={saving || loading}
                      className="rounded-lg bg-[#00236f] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-1 flex flex-col items-center justify-center rounded-xl border border-[#c5c5d3] bg-white p-4 text-center shadow-[0_4px_12px_rgba(0,0,0,0.05)] lg:col-span-4">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#ffdbcb]">
              <span className="material-symbols-outlined text-[32px] text-[#773205]">
                local_police
              </span>
            </div>

            <h2 className="font-['Plus_Jakarta_Sans'] text-[24px] font-semibold leading-8 text-[#0d1c2e]">
              Civic Hero
            </h2>

            <p className="mb-4 text-[14px] leading-5 text-[#444651]">
              Level 4 Citizen Contributor
            </p>

            <div className="w-full">
              <div className="mb-1 flex justify-between text-[12px] font-medium leading-4 text-[#444651]">
                <span>1,240 XP</span>
                <span>2,000 XP to Level 5</span>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-[#e6eeff]">
                <div
                  className="h-full rounded-full bg-[#1e3a8a]"
                  style={{ width: "62%" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Profile messages */}
        {(loading || message || errorMessage) && (
          <section aria-live="polite" className="space-y-2">
            {loading && (
              <p className="text-sm text-slate-500">
                Loading your profile information...
              </p>
            )}

            {message && (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                {message}
              </p>
            )}

            {errorMessage && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
              >
                <p>{errorMessage}</p>
                <button
                  type="button"
                  onClick={loadProfile}
                  className="mt-2 font-semibold underline"
                >
                  Try again
                </button>
              </div>
            )}
          </section>
        )}

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Personal information and preferences */}
          <div className="col-span-1 space-y-8 lg:col-span-4">
            <div className="rounded-xl border border-[#c5c5d3] bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
              <h3 className="mb-4 flex items-center gap-2 font-['Plus_Jakarta_Sans'] text-[24px] font-semibold leading-8 text-[#0d1c2e]">
                <span className="material-symbols-outlined text-[#00236f]">
                  person
                </span>
                Personal Info
              </h3>

              <form
                id="citizen-profile-form"
                onSubmit={handleSaveProfile}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="profile-name"
                    className="mb-1 block text-[12px] font-medium text-[#444651]"
                  >
                    Full Name
                  </label>

                  <input
                    id="profile-name"
                    required
                    type="text"
                    value={profile.full_name}
                    readOnly={!editing}
                    onChange={(event) =>
                      setProfile((previous) => ({
                        ...previous,
                        full_name: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-[#c5c5d3] bg-[#f8f9ff] px-3 py-2 text-[16px] leading-6 text-[#0d1c2e] outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="profile-email"
                    className="mb-1 block text-[12px] font-medium text-[#444651]"
                  >
                    Email Address
                  </label>

                  <input
                    id="profile-email"
                    readOnly
                    type="email"
                    value={profile.email}
                    className="w-full rounded-lg border border-[#c5c5d3] bg-[#f8f9ff] px-3 py-2 text-[16px] leading-6 text-[#0d1c2e] outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="profile-phone"
                    className="mb-1 block text-[12px] font-medium text-[#444651]"
                  >
                    Phone Number
                  </label>

                  <input
                    id="profile-phone"
                    type="tel"
                    value={profile.phone}
                    readOnly={!editing}
                    onChange={(event) =>
                      setProfile((previous) => ({
                        ...previous,
                        phone: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-[#c5c5d3] bg-[#f8f9ff] px-3 py-2 text-[16px] leading-6 text-[#0d1c2e] outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="profile-neighborhood"
                    className="mb-1 block text-[12px] font-medium text-[#444651]"
                  >
                    Primary Neighborhood
                  </label>

                  <select
                    id="profile-neighborhood"
                    disabled
                    defaultValue="Rajpur Road Ward"
                    className="w-full rounded-lg border border-[#c5c5d3] bg-[#f8f9ff] px-3 py-2 text-[16px] leading-6 text-[#0d1c2e] outline-none"
                  >
                    <option>Rajpur Road Ward</option>
                    <option>Dalanwala</option>
                    <option>Clement Town</option>
                  </select>
                </div>

                {editing && (
                  <p className="text-xs leading-5 text-slate-500">
                    Email is managed by your sign-in account and cannot be
                    changed here.
                  </p>
                )}
              </form>
            </div>

            <div className="rounded-xl border border-[#c5c5d3] bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
              <h3 className="mb-4 flex items-center gap-2 font-['Plus_Jakarta_Sans'] text-[24px] font-semibold leading-8 text-[#0d1c2e]">
                <span className="material-symbols-outlined text-[#00236f]">
                  notifications_active
                </span>
                Preferences
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-[16px] font-semibold leading-6 text-[#0d1c2e]">
                      SMS Alerts
                    </h4>
                    <p className="text-[12px] leading-4 text-[#444651]">
                      Critical updates on your reports
                    </p>
                  </div>
                  <Toggle defaultChecked />
                </div>

                <div className="h-px w-full bg-[#d5e3fc]" />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-[16px] font-semibold leading-6 text-[#0d1c2e]">
                      Email Summaries
                    </h4>
                    <p className="text-[12px] leading-4 text-[#444651]">
                      Weekly civic engagement digests
                    </p>
                  </div>
                  <Toggle />
                </div>

                <div className="h-px w-full bg-[#d5e3fc]" />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-[16px] font-semibold leading-6 text-[#0d1c2e]">
                      Push Notifications
                    </h4>
                    <p className="text-[12px] leading-4 text-[#444651]">
                      Instant status changes
                    </p>
                  </div>
                  <Toggle defaultChecked />
                </div>
              </div>
            </div>
          </div>

          {/* Achievements and watched areas */}
          <div className="col-span-1 space-y-8 lg:col-span-8">
            <div className="rounded-xl border border-[#c5c5d3] bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-['Plus_Jakarta_Sans'] text-[24px] font-semibold leading-8 text-[#0d1c2e]">
                  <span className="material-symbols-outlined text-[#00236f]">
                    emoji_events
                  </span>
                  Civic Achievements
                </h3>

                <button
                  type="button"
                  onClick={() =>
                    setMessage("Additional achievements are not available yet.")
                  }
                  className="text-[14px] font-semibold tracking-wider text-[#00236f] transition-colors hover:text-[#b6c4ff]"
                >
                  View All
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <AchievementCard
                  icon="construction"
                  iconBg="bg-[#86f2e4]"
                  iconColor="text-[#006f66]"
                  title="Pothole Patrol"
                  description="Reported 15 infrastructure issues."
                  level="Level 2"
                  progress="15/25"
                  width="60%"
                  progressColor="bg-[#006a61]"
                />

                <AchievementCard
                  icon="local_florist"
                  iconBg="bg-[#ffdbcb]"
                  iconColor="text-[#773205]"
                  title="Green Guardian"
                  description="Initiated 5 park cleanups."
                  level="Level 1"
                  progress="5/10"
                  width="50%"
                  progressColor="bg-[#4b1c00]"
                />

                <AchievementCard
                  icon="lock"
                  iconBg="bg-[#dce9ff]"
                  iconColor="text-[#444651]"
                  title="Community Anchor"
                  description="Attend 3 city council virtual meetings."
                  level="Locked"
                  progress="0/3"
                  width="0%"
                  progressColor="bg-[#757682]"
                  muted
                />
              </div>
            </div>

            <div className="rounded-xl border border-[#c5c5d3] bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-['Plus_Jakarta_Sans'] text-[24px] font-semibold leading-8 text-[#0d1c2e]">
                  <span className="material-symbols-outlined text-[#00236f]">
                    map
                  </span>
                  Watched Areas
                </h3>

                <button
                  type="button"
                  onClick={() =>
                    setMessage("Watched-area management is not connected yet.")
                  }
                  className="flex items-center gap-1 rounded px-2 py-1 text-[14px] font-semibold tracking-wider text-[#00236f] transition-colors hover:bg-[#e6eeff]"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    add
                  </span>
                  Add Area
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <WatchedArea
                  image={homeMap}
                  imageAlt="Map of Dehradun Rajpur Road"
                  icon="home"
                  title="Home"
                  address="Rajpur Road"
                />

                <WatchedArea
                  image={officeMap}
                  imageAlt="Map of Dehradun Subhash Road"
                  icon="work"
                  title="Office"
                  address="Subhash Road"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around rounded-t-xl border-t border-[#c5c5d3] bg-white px-4 py-2 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] md:hidden">
        <Link
          to="/"
          className="flex flex-col items-center justify-center rounded-lg p-2 text-[#444651] transition-colors hover:bg-[#dce9ff]"
        >
          <span className="material-symbols-outlined">home</span>
          <span className="mt-1 text-[12px] leading-4">Home</span>
        </Link>

        <Link
          to="/explore-map"
          className="flex flex-col items-center justify-center rounded-lg p-2 text-[#444651] transition-colors hover:bg-[#dce9ff]"
        >
          <span className="material-symbols-outlined">map</span>
          <span className="mt-1 text-[12px] leading-4">Map</span>
        </Link>

        <Link
          to="/my-reports"
          className="flex flex-col items-center justify-center rounded-lg p-2 text-[#444651] transition-colors hover:bg-[#dce9ff]"
        >
          <span className="material-symbols-outlined">assignment</span>
          <span className="mt-1 text-[12px] leading-4">Reports</span>
        </Link>

        <Link
          to="/profile"
          className="flex scale-100 flex-col items-center justify-center rounded-full bg-[#86f2e4] px-4 py-1 text-[#006f66] transition-all"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            person
          </span>
          <span className="mt-1 text-[12px] font-semibold leading-4">
            Profile
          </span>
        </Link>
      </nav>
        <Footer type="citizen" />
    </div>
  );
}

function AchievementCard({
  icon,
  iconBg,
  iconColor,
  title,
  description,
  level,
  progress,
  width,
  progressColor,
  muted = false,
}) {
  return (
    <div
      className={`flex items-start gap-4 rounded-lg border border-[#c5c5d3] bg-[#f8f9ff] p-4 transition-shadow hover:shadow-md ${
        muted ? "opacity-60" : ""
      }`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconBg}`}
      >
        <span className={`material-symbols-outlined ${iconColor}`}>
          {icon}
        </span>
      </div>

      <div className="grow">
        <h4 className="text-[16px] font-semibold leading-6 text-[#0d1c2e]">
          {title}
        </h4>

        <p className="mb-2 text-[14px] leading-5 text-[#444651]">
          {description}
        </p>

        <div className="mb-1 flex justify-between text-[12px] text-[#444651]">
          <span>{level}</span>
          <span>{progress}</span>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e6eeff]">
          <div
            className={`h-full rounded-full ${progressColor}`}
            style={{ width }}
          />
        </div>
      </div>
    </div>
  );
}

function WatchedArea({ image, imageAlt, icon, title, address }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-[#c5c5d3]">
      <div className="relative h-32 bg-[#d5e3fc]">
        <img
          src={image}
          alt={imageAlt}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="flex items-center justify-between bg-[#f8f9ff] p-3">
        <div>
          <h4 className="flex items-center gap-1 text-[16px] font-semibold leading-6 text-[#0d1c2e]">
            <span className="material-symbols-outlined text-[16px] text-[#444651]">
              {icon}
            </span>
            {title}
          </h4>

          <p className="text-[12px] leading-4 text-[#444651]">{address}</p>
        </div>

        <button
          type="button"
          aria-label={`Remove ${title} watched area`}
          onClick={() => {
            // Watched areas are static demo content for now.
          }}
          className="rounded-full p-1 text-[#444651] transition-colors hover:bg-[#ffdad6] hover:text-[#ba1a1a]"
        >
          <span className="material-symbols-outlined text-[20px]">
            delete
          </span>
        </button>
      </div>
    
    </div>
  );
}

export default Profile;
