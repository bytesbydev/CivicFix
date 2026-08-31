import Button from "../../components/common/Button";
import {useNavigate } from "react-router-dom";
import {useState} from "react";
import { loginAdmin } from "../../services/authService";
const AdminLogin = () => {
  const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData(e.currentTarget);
  const email = formData.get("email");
  const password = formData.get("password");

setErrorMessage("");
  setLoading(true);

  try {
    await loginAdmin(email, password);
    navigate("/admin/dashboard", { replace: true });
  } catch (error) {
  setErrorMessage(error.message || "Admin login failed.");
}
   finally {
    setLoading(false);
  }
};
  return (
    <div className="min-h-screen flex text-[#0d1c2e] font-sans overflow-hidden bg-[#f8f9ff]">
      <div className="flex flex-1 w-full flex-col md:flex-row">
        <div
          className="
            hidden md:flex
            flex-col flex-1
            bg-[#1e3a8a]
            text-white
            relative overflow-hidden
            p-10
            justify-between
            items-start
          "
        >
          <div
            className="
              absolute inset-0
              opacity-50
              z-0
              bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)]
              [bg-size:32px_32px]
            "
          />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
              <span className="material-symbols-outlined text-4xl">logo</span>

              <h1
                className=" text-[32px] leading-10 font-bold"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                CivicFix
              </h1>
            </div>
          </div>
          <div className="relative z-10 max-w-md">
            <h2
              className="text-[48px] leading-14 tracking-[-0.02em] font-bold mb-4"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Admin Portal
            </h2>
            <p
              className="text-[18px] leading-7 text-white/80"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Managing municipal infrastructure with data-driven efficiency.
            </p>
          </div>
          <div className="relative z-10 text-white/60 text-sm leading-5">
            © 2024 CivicFix. Secure Municipal Network.
          </div>
        </div>
        <div
          className="
            flex flex-col flex-1
            bg-[#f8f9ff]
            justify-center
            items-center
            p-4 md:p-10
            overflow-y-auto
          "
        >
          <div
            className="
              md:hidden
              flex items-center gap-2
              mb-8
              text-[#00236f]
              w-full max-w-sm
            "
          >
            <span className="material-symbols-outlined text-3xl">
              location_city
            </span>

            <h1 className="font-jakarta text-2xl leading-8 font-semibold">
              CivicFix
            </h1>
          </div>
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h2
                className="
               
                  text-2xl md:text-[32px]
                  leading-8 md:leading-10
                  font-bold
                  text-[#0d1c2e]
                  mb-2
                "
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Admin Portal Login
              </h2>

              <p
                className="text-base leading-6 text-[#444651]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Enter your credentials to access the municipal management
                dashboard.
              </p>
            </div>
           <form className="space-y-4" onSubmit={handleSubmit}>
            {errorMessage && (
  <p
    className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
    role="alert"
  >
    {errorMessage}
  </p>
)}
              <div>
                <label
                  htmlFor="email"
                  className="
                    block
                    text-sm leading-5
                    tracking-wider
                    font-semibold
                    text-[#0d1c2e]
                    mb-2
                  "
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Professional Email
                </label>
                <div className="relative">
                  <div
                    className="
                      absolute inset-y-0 left-0
                      pl-3
                      flex items-center
                      pointer-events-none
                    "
                  >
                    <span className="material-symbols-outlined text-[#757682]">
                      mail
                    </span>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="department@municipality.gov"
                    className="
                      block w-full
                      pl-10 pr-3 py-3
                      border border-[#c5c5d3]
                      rounded-lg
                      text-base leading-6
                      bg-[#f8f9ff]
                      text-[#0d1c2e]
                      placeholder:text-gray-400
                      focus:outline-none
                      focus:ring-2
                      focus:ring-[#00236f]
                      focus:border-[#00236f]
                      transition-shadow
                    "
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="
                    block
                    text-sm leading-5
                    tracking-wider
                    font-semibold
                    text-[#0d1c2e]
                    mb-2
                  "
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Password
                </label>

                <div className="relative">
                  <div
                    className="
                      absolute inset-y-0 left-0
                      pl-3
                      flex items-center
                      pointer-events-none
                    "
                  >
                    <span className="material-symbols-outlined text-[#757682]">
                      lock
                    </span>
                  </div>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="
                      block w-full
                      pl-10 pr-3 py-3
                      border border-[#c5c5d3]
                      rounded-lg
                      text-base leading-6
                      bg-[#f8f9ff]
                      text-[#0d1c2e]
                      focus:outline-none
                      focus:ring-2
                      focus:ring-[#00236f]
                      focus:border-[#00236f]
                      transition-shadow
                    "
                  />
                </div>
              </div>

              
              <div className="pt-2">
                  <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login to Portal"}
            </Button>
              </div>
            </form>
            <div className="mt-8 flex flex-col gap-2 text-center">
              <a
                href="#"
                className="
                  text-xs leading-4
                  font-medium
                  text-[#00236f]
                  hover:text-[#1e3a8a]
                  transition-colors
                "
              >
                Forgot password?
              </a>

              <a
                href="#"
                className="
                  text-xs leading-4
                  font-medium
                  text-[#444651]
                  hover:text-[#0d1c2e]
                  transition-colors
                "
              >
                Contact IT Support
              </a>
            </div>
            <div className="mt-4 text-center">
  <button
    type="button"
    onClick={() => navigate("/")}
  className="text-sm font-['Inter'] text-[#00236f] hover:underline"
  >
    Go to Dashboard
  </button>
</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
