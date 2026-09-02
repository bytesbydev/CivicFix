import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { signUpCitizen } from "../../services/authService";
const CitizenSignup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const score = [
    password.length >= 8,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
  const strength = score <= 2 ? 1 : score <= 4 ? 2 : 3;
  console.log(strength);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = formData.get("fullName").trim();
    const email = formData.get("email").trim();
    const phone = null
    const password = formData.get("password");


    setErrorMessage("");
    setSuccessMessage("");

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const data = await signUpCitizen(name, email, password,phone, null);

      if (data.session) {
        setSuccessMessage("Account created successfully! You can now log in.");
      } else {
        setSuccessMessage(
          "Account created! Please check your email to verify your account before logging in.",
        );
      }

      form.reset();
      setPassword("");
    } catch (error) {
      setErrorMessage(error.message || "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8f9ff] text-[#0d1c2e] antialiased">
      <div className="hidden md:flex md:w-1/2 relative flex-col justify-between overflow-hidden bg-[#00236f]">
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center opacity-40 mix-blend-overlay"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAu00vJPybw3J1JqtHx1dkBVWza5TF-lj1rjFCuTw-l5XxD0AhOFkXNvJRLgokNmIMdr161mj-AwQR8Ot6_UnboBIIoLmL8iMdcRWPCcM2gws1mf8QBB6A5h1xv5mZBtuJonyIjV2fWyaREtplMxMy8wyfxDm97UAuRcMylyxpWnWzhSv42TQekLHQUwvRxhmvOC2CnHvrh2CWuOgvv0ooMVfZ0wtzzCET63FUMxOReALNK0BqWYiln')",
            }}
          />

          <div className="absolute inset-0 bg-linear-to-b from-[#00236f]/80 to-[#00236f]/95" />
        </div>

        <div className="relative z-10 p-10">
          <div className="flex items-center gap-2 text-white">
            <span className="material-symbols-outlined text-3xl">
              location_city
            </span>

            <span
              className="text-2xl font-semibold tracking-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              CivicFix
            </span>
          </div>
        </div>

        <div className="relative z-10 p-10 mb-24">
          <h1
            className="text-5xl leading-[1.15] tracking-[-0.02em] font-bold text-white mb-4 max-w-lg"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Join the Movement for a Better City.
          </h1>

          <p
            className="text-lg leading-7 text-[#b6c4ff] max-w-md"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Report issues, track progress, and collaborate with your local
            government to improve your community infrastructure.
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/2 min-h-screen flex flex-col justify-center items-center p-4 md:p-10 bg-white">
        <div className="md:hidden flex items-center justify-center w-full mb-8 pt-8">
          <div className="flex items-center gap-2 text-[#00236f]">
            <span className="material-symbols-outlined text-3xl">
              location_city
            </span>

            <span
              className="text-2xl font-semibold tracking-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              CivicFix
            </span>
          </div>
        </div>

        <div className="w-full max-w-md">
          <div className="text-center md:text-left mb-8">
            <h2
              className="text-2xl md:text-[32px] md:leading-10 font-bold tracking-[-0.01em] text-[#0d1c2e] mb-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Create an Account
            </h2>

            <p
              className="text-base leading-6 text-[#444651]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Sign up to start reporting and tracking civic issues.
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
                htmlFor="fullName"
                className="block text-sm leading-5 font-semibold text-[#0d1c2e] mb-1"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Full Name
              </label>

              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Enter your full name"
                required
                className="w-full rounded-lg border border-[#c5c5d3] bg-[#f8f9ff] px-4 py-2 text-base leading-6 text-[#0d1c2e] placeholder:text-[#444651]/50 outline-none transition-all focus:border-[#00236f] focus:ring-2 focus:ring-[#00236f]/20"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm leading-5 font-semibold text-[#0d1c2e] mb-1"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                className="w-full rounded-lg border border-[#c5c5d3] bg-[#f8f9ff] px-4 py-2 text-base leading-6 text-[#0d1c2e] placeholder:text-[#444651]/50 outline-none transition-all focus:border-[#00236f] focus:ring-2 focus:ring-[#00236f]/20"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm leading-5 font-semibold text-[#0d1c2e] mb-1"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Password
              </label>

              <div className="relative">
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  required
                  className="w-full rounded-lg border border-[#c5c5d3] bg-[#f8f9ff] px-4 py-2 pr-10 text-base leading-6 text-[#0d1c2e] placeholder:text-[#444651]/50 outline-none transition-all focus:border-[#00236f] focus:ring-2 focus:ring-[#00236f]/20"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444651] hover:text-[#00236f] transition-colors"
                  aria-label="Toggle password visibility"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
              <div className="mt-2 flex gap-1 h-2 w-full">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className={`w-1/3 ${n <= strength ? (n === 1 ? "bg-red-500" : n == 2 ? "bg-yellow-500" : "bg-green-500") : "bg-gray-400"} rounded-full`}
                  />
                ))}
              </div>
              <p
                className="mt-1 text-xs leading-4 font- text-[#444651]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {strength === 1
                  ? "Weak password"
                  : strength === 2
                    ? "Good password"
                    : "Strong password"}
              </p>
            </div>

           


            <div className="flex items-start gap-2 pt-2">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="mt-1 rounded border-[#c5c5d3] text-[#00236f] focus:ring-[#00236f]/20"
              />

              <label
                htmlFor="terms"
                className="text-sm leading-5 text-[#444651]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                I agree to the{" "}
                <a
                  href="#"
                  className="font-medium text-[#00236f] hover:underline"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="font-medium text-[#00236f] hover:underline"
                >
                  Privacy Policy
                </a>
                .
              </label>
            </div>

            <div className="pt-2 space-y-2">
              <Button
                type="submit"
                disabled={loading}
                iconPosition="after"
                icon="arrow_forward"
                className="w-full gap-2"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>

              <div className="text-center mt-4">
                <span
                  className="text-sm leading-5 text-[#444651]"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Already have an account?{" "}
                </span>

                <a
                  href="/citizen/login"
                  className="text-sm leading-5 font-semibold text-[#00236f] hover:underline"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Log In
                </a>
              </div>
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
export default CitizenSignup;
