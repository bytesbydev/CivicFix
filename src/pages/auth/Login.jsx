import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate=useNavigate();
  const handleCitizenLogin = () => {
    console.log("Citizen selected");
    navigate("/citizen/login")
  };

  const handleAdminLogin = () => {
    navigate("/admin/login")
    console.log("Municipal Authority selected");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full bg-[#f8f9ff] font-sans text-[#0d1c2e] antialiased">
      <div
        className="hidden md:flex md:w-1/2 relative overflow-hidden bg-[#e6eeff] shadow-[inset_-10px_0_30px_rgba(0,0,0,0.05)]"
        style={{
          backgroundImage:
            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAiAw4g4SPL2hYM_r4itNRN3bBmQcifzRwq0a0NQj2wSgVyWqrf9tBPChN048SWJzOSl42RW4ccFlwzENmTuan2DkdLRL1bv7IgB5OJ_hancycZvJUpSCFy0T5IeItT69Ki-TYBQsc8Bx-wd6KC7c4_CaAb3tunrvHjfte3P7tOtHq7tmDWzF1tlI-_lnkOjuEFuWqPE6FwwhhQAXnVML_Ryc-nARM-eCsP0D2icPeuDjL1Hjbg1KhG')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-linear-to-br from-[#1e3a8a]/80 to-[#00236f]/40 mix-blend-multiply" />

        <div className="absolute inset-0 bg-linear-to-t from-[#f8f9ff]/90 via-[#f8f9ff]/20 to-transparent" />

        <div className="absolute bottom-10 left-10 right-10 text-white">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[32px]">
              public
            </span>

            <span className="font-['Plus_Jakarta_Sans'] text-[32px] leading-10 font-bold">
              CivicFix
            </span>
          </div>

          <p className="font-sans text-[18px] leading-7 text-white/90 max-w-md">
            Empowering citizens to build smarter, cleaner, and more responsive
            communities together.
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-10 bg-[#f8f9ff] z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.03)] md:shadow-none">
        <div className="w-full max-w-150 space-y-8">
          <div className="md:hidden flex items-center justify-center gap-2 mb-8 text-[#00236f]">
            <span className="material-symbols-outlined text-[32px]">
              public
            </span>

            <span className="font-['Plus_Jakarta_Sans'] text-2xl leading-8 font-bold">
              CivicFix
            </span>
          </div>

          <div className="space-y-2 text-center md:text-left">
            <h1
              className=" text-[32px] leading-10 tracking-[-0.01em] font-bold text-[#0d1c2e]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Welcome to CivicFix
            </h1>

            <p className="font-sans text-[18px] leading-7 text-[#444651]">
              Select your role to continue logging in.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={handleCitizenLogin}
              className="
                flex flex-col items-center justify-center
                p-8
                border-2 border-[#c5c5d3]
                rounded-xl
                bg-[#f8f9ff]
                hover:bg-[#eff4ff]
                hover:border-[#1e3a8a]
                hover:shadow-md
                transition-all
                group
                text-left
                w-full
                h-full
                focus:outline-none
                focus:ring-4
                focus:ring-[#1e3a8a]/30
              "
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <div
                className="
                  w-16 h-16
                  rounded-full
                  bg-[#1e3a8a]/10
                  flex items-center justify-center
                  mb-6
                  group-hover:scale-110
                  transition-transform
                "
              >
                <span className="material-symbols-outlined text-[32px] text-[#00236f]">
                  groups
                </span>
              </div>

              <h3 className="text-2xl leading-8 font-semibold text-[#0d1c2e] mb-2">
                Citizens
              </h3>

              <p
                className="font-sans text-sm leading-5 text-[#444651] text-center"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Report issues and track progress in your community.
              </p>
            </button>

            <button
              type="button"
              onClick={handleAdminLogin}
              className="
                flex flex-col items-center justify-center
                p-8
                border-2 border-[#c5c5d3]
                rounded-xl
                bg-[#f8f9ff]
                hover:bg-[#eff4ff]
                hover:border-[#1e3a8a]
                hover:shadow-md
                transition-all
                group
                text-left
                w-full
                h-full
                focus:outline-none
                focus:ring-4
                focus:ring-[#1e3a8a]/30
              "
            >
              <div
                className="
                  w-16 h-16
                  rounded-full
                  bg-[#1e3a8a]/10
                  flex items-center justify-center
                  mb-6
                  group-hover:scale-110
                  transition-transform
                "
              >
                <span className="material-symbols-outlined text-[32px] text-[#00236f]">
                  admin_panel_settings
                </span>
              </div>

              <h3
                className="text-2xl leading-8 font-semibold text-[#0d1c2e] mb-2 text-center"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Municipal Authorities
              </h3>

              <p
                className="font-sans text-sm leading-5 text-[#444651] text-center"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
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
