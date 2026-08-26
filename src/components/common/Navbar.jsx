
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);

  // Citizen pages
  const isCitizen =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/my-reports") ||
    location.pathname.startsWith("/explore-map") ||
    location.pathname.startsWith("/capture-issue") ||
    location.pathname.startsWith("/issue-location") ||
    location.pathname.startsWith("/issue-details") ||
    location.pathname.startsWith("/review-issue") ||
    location.pathname.startsWith("/report-submitted") ||
    location.pathname.startsWith("/profile");

  // Admin pages
  const isAdmin = location.pathname.startsWith("/admin");
const displayedUnreadCount = isCitizen ? unreadCount : 0;
  const publicLinks = [
    { name: "Home", path: "/" },
    { name: "How It Works", path: "/how-it-works" },
    { name: "Explore Map", path: "/explore-publicmap" },
    { name: "Contact", path: "/contact" },
  ];

  const citizenLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "My Reports", path: "/my-reports" },
    { name: "Explore Map", path: "/explore-map" },
    { name: "Profile", path: "/profile" },
  ];

  const adminLinks = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Issues", path: "/admin/issues" },
    { name: "Map", path: "/admin/map" },
    { name: "Analytics", path: "/admin/analytics" },
  ];

  // Fetch unread admin messages for the logged-in citizen
 useEffect(() => {
  if (!isCitizen) return;

  let active = true;

  const loadUnreadCount = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        if (active) setUnreadCount(0);
        return;
      }

      const { count, error } = await supabase
        .from("issue_updates")
        .select("id", { count: "exact", head: true })
        .eq("citizen_id", user.id)
        .eq("is_read", false);

      if (error) throw error;

      if (active) setUnreadCount(count || 0);
    } catch (error) {
      console.error("Unread message count error:", error);
    }
  };

  loadUnreadCount();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(() => {
    loadUnreadCount();
  });

  return () => {
    active = false;
    subscription.unsubscribe();
  };
}, [isCitizen, location.pathname]);

  // Logout from Supabase and redirect according to the current section
  const logout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setUnreadCount(0);

      if (isAdmin) {
        navigate("/admin/login", { replace: true });
      } else {
        navigate("/citizen/login", { replace: true });
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert(error.message || "Unable to log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  const links = isAdmin
    ? adminLinks
    : isCitizen
      ? citizenLinks
      : publicLinks;

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  // Admin Navbar
  if (isAdmin) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-[#c5c5d3] bg-[#f8f9ff] shadow-sm">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 md:px-10">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-3xl text-[#00236f]">
              location_city
            </span>

            <span className="font-['Plus_Jakarta_Sans'] text-2xl font-bold leading-8 text-[#00236f]">
              CivicFix
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {adminLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`border-b-2 pb-1 text-[14px] font-bold leading-5 tracking-wider transition-colors duration-200 ${
                  isActive(link.path)
                    ? "border-[#00236f] text-[#00236f]"
                    : "border-transparent text-[#444651] hover:text-[#00236f]"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/admin-profile"
              title="Admin Profile"
              aria-label="Admin Profile"
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#c5c5d3] bg-[#1e3a8a] font-bold text-white shadow-sm"
            >
              <span className="material-symbols-outlined">person</span>
            </Link>

            <button
              type="button"
              onClick={logout}
              disabled={loggingOut}
              className="flex items-center gap-2 rounded-lg bg-[#00236f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1e3a8a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-lg">
                logout
              </span>
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </header>
    );
  }

  // Citizen and public Navbar
  return (
    <header className="sticky top-0 z-50 w-full bg-[#f8f9ff] font-['Inter'] shadow-sm">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 md:px-10">
        <Link
          to={isCitizen ? "/dashboard" : "/"}
          className="flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-3xl text-[#00236f]">
            location_city
          </span>

          <span className="font-['Plus_Jakarta_Sans'] text-2xl font-bold leading-8 text-[#00236f]">
            CivicFix
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative border-b-2 pb-1 text-[14px] font-bold leading-5 tracking-wider transition-colors duration-200 ${
                isActive(link.path)
                  ? "border-[#00236f] text-[#00236f]"
                  : "border-transparent text-[#444651] hover:text-[#00236f]"
              }`}
            >
              {link.name}

              {isCitizen &&
                link.path === "/my-reports" &&
                displayedUnreadCount > 0 && (
                  <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-xs font-bold text-white">
                 {displayedUnreadCount > 99 ? "99+" : displayedUnreadCount}
                  </span>
                )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {isCitizen ? (
            <>

               <button
              type="button"
              onClick={logout}
              disabled={loggingOut}
              className="flex items-center gap-2 rounded-lg bg-[#00236f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1e3a8a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-lg">
                logout
              </span>
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden text-[14px] font-semibold text-[#00236f] transition hover:opacity-80 md:block"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="rounded-lg bg-[#1e3a8a] px-6 py-2.5 text-[14px] font-semibold text-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition hover:opacity-80"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
