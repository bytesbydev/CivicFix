import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const handleCitizenLogin = () => {
    navigate("/citizen/login");
  };

  const handleAdminLogin = () => {
    navigate("/admin/login");
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f8f9ff] font-sans text-[#0d1c2e] antialiased md:flex-row">
      {/* Left Background Panel */}
      <div
        className="relative hidden overflow-hidden bg-[#e6eeff] shadow-[inset_-10px_0_30px_rgba(0,0,0,0.05)] md:flex md:min-h-screen md:w-1/2"
        style={{
          backgroundImage:
            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAiAw4g4SPL2hYM_r4itNRN3bBmQcifzRwq0a0NQj2wSgVyWqrf9tBPChN048SWJzOSl42RW4ccFlwzENmTuan2DkdLRL1bv7IgB5OJ_hancycZvJUpSCFy0T5IeItT69Ki-TYBQsc8Bx-wd6KC7c4_CaAb3tunrvHjfte3P7tOtHq7tmDWzF1tlI-_lnkOjuEFuWqPE6FwwhhQAXnVML_Ryc-nARM-eCsP0D2icPeuDjL1Hjbg1KhG')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-linear-to-br from-[#1e3a8a]/80 to-[#00236f]/40 mix-blend-multiply" />

        <div className="absolute inset-0 bg-linear-to-t from-[#f8f9ff]/90 via-[#f8f9ff]/20 to-transparent" />

        <div className="absolute bottom-8 left-8 right-8 text-white lg:bottom-10 lg:left-10 lg:right-10">
          <div className="mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[32px]">
              public
            </span>

            <span className="font-['Plus_Jakarta_Sans'] text-2xl font-bold leading-10 lg:text-[32px]">
              CivicFix
            </span>
          </div>

          <p className="max-w-md font-sans text-base leading-7 text-white/90 lg:text-lg">
            Empowering citizens to build smarter, cleaner, and more
            responsive communities together.
          </p>
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="z-10 flex w-full flex-1 items-center justify-center bg-[#f8f9ff] p-4 sm:p-6 md:min-h-screen md:w-1/2 md:flex-none md:p-8 md:shadow-none lg:p-10">
        <div className="w-full max-w-150 space-y-6 sm:space-y-8">
          {/* Mobile Logo */}
          <div className="mb-6 flex items-center justify-center gap-2 text-[#00236f] md:hidden">
            <span className="material-symbols-outlined text-[32px]">
              public
            </span>

            <span className="font-['Plus_Jakarta_Sans'] text-2xl font-bold leading-8">
              CivicFix
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-2 text-center md:text-left">
            <h1
              className="text-2xl font-bold leading-tight tracking-[-0.01em] text-[#0d1c2e] sm:text-3xl sm:leading-10"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Welcome to CivicFix
            </h1>

            <p className="font-sans text-base leading-7 text-[#444651] sm:text-lg">
              Select your role to continue logging in.
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Citizen Login */}
            <button
              type="button"
              onClick={handleCitizenLogin}
              className="group flex h-full w-full flex-col items-center justify-center rounded-xl border-2 border-[#c5c5d3] bg-[#f8f9ff] p-5 text-left transition-all hover:border-[#1e3a8a] hover:bg-[#eff4ff] hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[#1e3a8a]/30 sm:p-6 lg:p-8"
              style={{
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#1e3a8a]/10 transition-transform group-hover:scale-110 sm:mb-6 sm:h-16 sm:w-16">
                <span className="material-symbols-outlined text-[32px] text-[#00236f]">
                  groups
                </span>
              </div>

              <h3 className="mb-2 text-xl font-semibold leading-7 text-[#0d1c2e] sm:text-2xl sm:leading-8">
                Citizens
              </h3>

              <p className="text-center font-sans text-sm leading-5 text-[#444651]">
                Report issues and track progress in your community.
              </p>
            </button>

            {/* Municipal Authority Login */}
            <button
              type="button"
              onClick={handleAdminLogin}
              className="group flex h-full w-full flex-col items-center justify-center rounded-xl border-2 border-[#c5c5d3] bg-[#f8f9ff] p-5 text-left transition-all hover:border-[#1e3a8a] hover:bg-[#eff4ff] hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[#1e3a8a]/30 sm:p-6 lg:p-8"
              style={{
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#1e3a8a]/10 transition-transform group-hover:scale-110 sm:mb-6 sm:h-16 sm:w-16">
                <span className="material-symbols-outlined text-[32px] text-[#00236f]">
                  admin_panel_settings
                </span>
              </div>

              <h3 className="mb-2 text-center text-xl font-semibold leading-7 text-[#0d1c2e] sm:text-2xl sm:leading-8">
                Municipal Authorities
              </h3>

              <p className="text-center font-sans text-sm leading-5 text-[#444651]">
                Manage reports and coordinate city maintenance.
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;