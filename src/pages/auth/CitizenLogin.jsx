import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { loginCitizen } from "../../services/authService";
const CitizenLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);
try {
  await loginCitizen(email, password);
  navigate("/dashboard", { replace: true });
} catch (error) {
  setErrorMessage(error.message || "Login failed. Please try again.");
} finally {
  setLoading(false);
}
  };

  return (
    <div className="h-screen w-full overflow-hidden flex bg-[#f8f9ff] text-[#0d1c2e] font-sans">
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#d5e3fc] flex-col justify-between overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBOl47W8GeO_PQ6AmA71cyPd1TqvStjgxvJiSf0m9X_U89EI3WBn7seGApYM7lZQ2qj3fv_WQh5oHqOo82Efd_WC9nERHfFDGKb75_rpL-OFwC9jJAiRKY1evj07aXStx6OHgPQuq9QiQefrpfMWiCIVgNO7idNlFjzBbBHSwHC5lMoecckm7aBYX24Ul9Pb70axozQe8nECp8rDb_jF1lt3K8qZdZeSkmr-1p8o7QqsvPF0LU9ukmF')",
          }}
        >
          <div className="absolute inset-0 bg-linear-to-t from-[#00236f]/80 via-[#00236f]/20 to-transparent" />
        </div>

        <div className="relative z-10 p-10 h-full flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-white text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              location_city
            </span>

            <span
              className="text-2xl leading-8 text-white font-bold tracking-tight"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              CivicFix
            </span>
          </div>

          <div className="max-w-md">
            <h2
              className=" text-[48px] leading-14 tracking-[-0.02em] text-white font-bold mb-4 drop-shadow-md"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Building a better Dehradun, together.
            </h2>

            <p className="text-[18px] leading-7 text-white/90 drop-shadow-sm">
              Your direct line to local government. Report issues, track
              progress, and see the impact of your community in real-time.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 h-full flex items-center justify-center px-4 md:px-10 bg-[#f8f9ff] overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="flex lg:hidden items-center justify-center gap-2 mb-8">
            <span
              className="material-symbols-outlined text-[#00236f] text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              location_city
            </span>

            <span className="font-['Plus_Jakarta_Sans'] text-2xl leading-8 text-[#00236f] font-bold tracking-tight">
              CivicFix
            </span>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h1
              className="text-2xl md:text-[32px] leading-8 md:leading-10 text-[#0d1c2e] font-bold mb-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Welcome back, Citizen
            </h1>

            <p
              className="text-base leading-6 text-[#444651]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Join thousands of neighbors making Dehradun better every day.
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

            {successMessage && (
              <p
                className="rounded-lg bg-green-50 p-3 text-sm text-green-700"
                role="status"
              >
                {successMessage}
              </p>
            )}
            <div>
              <label
                htmlFor="email"
                className="block text-sm leading-5 tracking-wider text-[#0d1c2e] font-semibold mb-1"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Email Address
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-[#c5c5d3] text-xl">
                    mail
                  </span>
                </div>

                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="block w-full pl-10 pr-3 py-3 border border-[#c5c5d3] rounded-lg text-base leading-6 text-[#0d1c2e] bg-white placeholder:text-[#c5c5d3] focus:outline-none focus:ring-2 focus:ring-[#00236f] focus:border-[#00236f] transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label
                  htmlFor="password"
                  className="block text-sm leading-5 tracking-wider text-[#0d1c2e] font-semibold"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Password
                </label>

                <a
                  href="#"
                  className="text-xs leading-4 font-medium text-[#00236f] hover:text-[#1e3a8a] transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-[#c5c5d3] text-xl">
                    lock
                  </span>
                </div>

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-3 border border-[#c5c5d3] rounded-lg text-base leading-6 text-[#0d1c2e] bg-white placeholder:text-[#c5c5d3] focus:outline-none focus:ring-2 focus:ring-[#00236f] focus:border-[#00236f] transition-all duration-200"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#c5c5d3] hover:text-[#0d1c2e] focus:outline-none"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
            <div className="text-center mt-4 pt-2">
              <p className="text-base leading-6 text-[#444651]">
                New to CivicFix?
                <a
                  href="/signup"
                  className="text-sm leading-5 tracking-wider font-semibold text-[#00236f] hover:text-[#1e3a8a] transition-colors ml-1"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Create an account
                </a>
              </p>
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
          </form>
        </div>
      </div>
    </div>
  );
};

export default CitizenLogin;
