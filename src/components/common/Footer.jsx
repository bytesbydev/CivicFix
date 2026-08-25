
import { Link } from "react-router-dom";

const footerConfig = {
  public: {
    title: "CivicFix",
    description:
      "Report civic issues and help make Dehradun a cleaner, safer, and better city.",
    links: [
      { label: "Home", to: "/" },
      { label: "How It Works", to: "/how-it-works" },
      { label: "Explore Map", to: "/explore-publicmap" },
      { label: "Contact Us", to: "/contact" },
    ],
    bottom: "Making Dehradun better, one report at a time.",
  },

  citizen: {
    title: "CivicFix Citizen",
    description:
      "Your voice matters. Report problems, track progress, and contribute to your community.",
    links: [
      { label: "Dashboard", to: "/dashboard" },
      { label: "My Reports", to: "/my-reports" },
      { label: "Explore map", to: "/explore-map" },
      { label: "Profile", to: "/profile" },
    ],
    bottom: "Thank you for helping improve our city.",
  },

  admin: {
    title: "CivicFix Administration",
    description:
      "Manage civic reports, monitor issue resolution, and help deliver better public services.",
    links: [
      { label: "Dashboard", to: "/admin/dashboard" },
      { label: "Manage Issues", to: "/admin/issues" },
      { label: "Maps", to: "/admin/map" },
      { label: "Analytics", to: "/admin/analytics" },
    ],
    bottom: "CivicFix Administration Portal",
  },
};

const Footer = ({ type = "public" }) => {
  const config = footerConfig[type] || footerConfig.public;

  return (
    <footer className="mt-auto border-t border-slate-200 bg-[#dbe5f5] text-[#00236f]">
      <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Link to="/" className="mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-3xl">
                location_city
              </span>
              <span className="font-['Plus_Jakarta_Sans'] text-xl font-bold">
                {config.title}
              </span>
            </Link>

            <p className="max-w-sm text-sm leading-6 text-slate-700">
              {config.description}
            </p>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              {config.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="transition-colors hover:text-[#006a61]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">Our Location</h3>
            <div className="flex items-start gap-2 text-sm text-slate-700">
              <span className="material-symbols-outlined">
                location_on
              </span>
              <p>Dehradun, Uttarakhand, India</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Together, we can build a better city for everyone.
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-col items-center justify-between gap-3 border-t border-[#c5d3eb] pt-5 text-center text-xs text-slate-600 sm:flex-row">
          <p>© {new Date().getFullYear()} CivicFix. All rights reserved.</p>
          <p>{config.bottom}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
