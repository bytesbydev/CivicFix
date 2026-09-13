
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/common/Footer";
import Navbar from "../../components/common/Navbar";
import { supabase } from "../../services/supabase";

const inputClass =
  "w-full rounded-lg border border-[#c5c5d3] bg-white px-3 py-3 font-['Inter'] text-[14px] leading-5 text-[#0d1c2e] shadow-sm outline-none transition placeholder:text-[#757682] focus:border-[#00236f] focus:ring-2 focus:ring-[#dce1ff]";

const labelClass =
  "mb-1.5 block font-['Inter'] text-[13px] font-medium text-[#0d1c2e]";

const Contact = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({
    type: "",
    message: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (feedback.message) {
      setFeedback({ type: "", message: "" });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim();
    const subject = form.subject;
    const message = form.message.trim();

    if (!name || !email || !subject || !message) {
      setFeedback({
        type: "error",
        message: "Please fill in all the fields.",
      });
      return;
    }

    if (name.length < 2 || name.length > 100) {
      setFeedback({
        type: "error",
        message: "Name must contain between 2 and 100 characters.",
      });
      return;
    }

    if (message.length < 10 || message.length > 3000) {
      setFeedback({
        type: "error",
        message: "Message must contain between 10 and 3000 characters.",
      });
      return;
    }

    setSubmitting(true);
    setFeedback({ type: "", message: "" });

    try {
      const { error } = await supabase
        .from("contact_messages")
        .insert([
          {
            name,
            email,
            subject,
            message,
          },
        ]);

      if (error) throw error;

      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      setFeedback({
        type: "success",
        message:
          "Your message has been submitted successfully. Thank you for contacting CivicFix!",
      });
    } catch (error) {
      console.error("Contact form submission failed:", error);

      setFeedback({
        type: "error",
        message:
          "We couldn't submit your message. Please try again in a moment.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9ff] font-['Inter'] text-[#0d1c2e]">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl grow px-4 py-10 md:px-10 md:py-14">
        {/* Page Header */}
        <section className="mx-auto mb-10 max-w-2xl text-center">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#e8edff] px-4 py-2 text-xs font-semibold text-[#00236f]">
            <span className="material-symbols-outlined text-base">
              support_agent
            </span>
            CivicFix Support
          </span>

          <h1 className="mb-3 font-['Plus_Jakarta_Sans'] text-3xl font-bold tracking-tight text-[#0d1c2e] md:text-4xl">
            Get in Touch
          </h1>

          <p className="text-base leading-7 text-[#444651] md:text-lg">
            Have a question, feedback, or a technical issue? Send us a
            message and help us improve CivicFix for Dehradun.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {/* Contact Form */}
          <section className="rounded-2xl border border-[#c5c5d3] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-7 md:col-span-7">
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e8edff] text-[#00236f]">
                <span className="material-symbols-outlined text-2xl">
                  mail
                </span>
              </div>

              <div>
                <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#0d1c2e] sm:text-2xl">
                  Send us a Message
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#444651]">
                  Fill out the form and share your query with our team.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className={labelClass}>
                    Full Name <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    minLength={2}
                    maxLength={100}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email Address <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    maxLength={254}
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className={labelClass}>
                  Subject <span className="text-red-500">*</span>
                </label>

                <select
                  id="subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="">Select a topic...</option>
                  <option value="report_update">
                    Update on Existing Report
                  </option>
                  <option value="technical_issue">
                    Technical Issue with App
                  </option>
                  <option value="feedback">General Feedback</option>
                  <option value="other">Other Inquiry</option>
                </select>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <label htmlFor="message" className="text-[13px] font-medium">
                    Message <span className="text-red-500">*</span>
                  </label>

                  <span className="text-xs text-[#757682]">
                    {form.message.length}/3000
                  </span>
                </div>

                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Describe your question or feedback..."
                  minLength={10}
                  maxLength={3000}
                  required
                  className={`${inputClass} resize-y`}
                />
              </div>

              {feedback.message && (
                <div
                  role="status"
                  aria-live="polite"
                  className={`flex items-start gap-2 rounded-xl border p-4 text-sm leading-6 ${
                    feedback.type === "success"
                      ? "border-green-200 bg-green-50 text-green-800"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  <span className="material-symbols-outlined mt-0.5 text-lg">
                    {feedback.type === "success" ? "check_circle" : "error"}
                  </span>

                  <p>{feedback.message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00236f] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4059aa] focus:outline-none focus:ring-2 focus:ring-[#00236f] focus:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>
                  {submitting ? "Submitting..." : "Submit Message"}
                </span>

                <span className="material-symbols-outlined text-lg">
                  {submitting ? "hourglass_top" : "send"}
                </span>
              </button>

              <p className="text-center text-xs leading-5 text-[#757682]">
                Your message will be stored securely in CivicFix.
              </p>
            </form>
          </section>

          {/* Support Details */}
          <div className="flex flex-col gap-6 md:col-span-5">
            <section className="rounded-2xl border border-[#c5c5d3] bg-[#eff4ff] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-6">
              <h2 className="mb-6 flex items-center gap-2 font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#0d1c2e]">
                <span className="material-symbols-outlined text-2xl text-[#00236f]">
                  support_agent
                </span>
                Support Details
              </h2>

              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d5e3fc] text-[#00236f]">
                    <span className="material-symbols-outlined">call</span>
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#444651]">
                      Helpline
                    </p>

                    <a
                      href="tel:18001802525"
                      className="mt-1 block font-medium text-[#0d1c2e] hover:text-[#00236f]"
                    >
                      1800-180-2525
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d5e3fc] text-[#00236f]">
                    <span className="material-symbols-outlined">
                      alternate_email
                    </span>
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#444651]">
                      Email Support
                    </p>

                    <a
                      href="mailto:support@civicfix.dehradun.gov.in"
                      className="mt-1 block wrap-break-word font-medium text-[#0d1c2e] hover:text-[#00236f]"
                    >
                      support@civicfix.dehradun.gov.in
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d5e3fc] text-[#00236f]">
                    <span className="material-symbols-outlined">
                      schedule
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#444651]">
                      Contact Form
                    </p>

                    <p className="mt-1 text-sm leading-6 text-[#0d1c2e]">
                      Send us your query anytime using the form on this page.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-[#c5c5d3] pt-4">
                <p className="text-sm leading-6 text-[#444651]">
                  Please verify the listed helpline and email before
                  publishing CivicFix.
                </p>
              </div>
            </section>

            {/* Report an Issue Card */}
            <section className="relative flex grow flex-col overflow-hidden rounded-2xl bg-[#00236f] p-6 text-white shadow-[0_8px_24px_rgba(0,35,111,0.16)] sm:p-7">
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full border-24 border-white/5" />
              <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/5" />

              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                <span className="material-symbols-outlined text-3xl">
                  location_on
                </span>
              </div>

              <h2 className="relative z-10 mt-5 font-['Plus_Jakarta_Sans'] text-2xl font-bold">
                Need to Report an Issue?
              </h2>

              <p className="relative z-10 mt-3 text-sm leading-7 text-blue-100">
                Help improve Dehradun by reporting potholes, garbage, damaged
                streetlights, and other civic problems. Your report can help
                make your neighbourhood better.
              </p>

              <div className="relative z-10 mt-6">
                <button
                  type="button"
                  onClick={() => navigate("/citizen/login")}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-[#00236f] transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#00236f]"
                >
                  <span className="material-symbols-outlined">
                    campaign
                  </span>

                  Report an Issue

                  <span className="material-symbols-outlined ml-auto">
                    arrow_forward
                  </span>
                </button>

                <p className="mt-3 text-center text-xs text-blue-100">
                  Sign in as a citizen to continue.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

    <Footer type="public" />
    </div>
  );
};

export default Contact;
