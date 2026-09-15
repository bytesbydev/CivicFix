
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      icon: "photo_camera",
      title: "1. Report an Issue",
      description:
        "Take a photo and select the type of civic issue, such as a pothole, garbage, or a broken streetlight.",
    },
    {
      number: "02",
      icon: "location_on",
      title: "2. Add Location",
      description:
        "Mark the issue's location on the map so the concerned authorities can find it.",
    },
    {
      number: "03",
      icon: "send",
      title: "3. Submit Report",
      description:
        "Review the issue details, photo, and location before submitting your report to CivicFix.",
    },
    {
      number: "04",
      icon: "fact_check",
      title: "4. Authority Review",
      description:
        "The admin reviews the report, verifies the details, and updates its status as work progresses.",
      wide: true,
    },
    {
      number: "05",
      icon: "check_circle",
      title: "5. Issue Resolved",
      description:
        "Track your report's progress until the issue is marked as resolved.",
      highlight: true,
    },
  ];

  const faqs = [
    {
      question: "How can I report a civic issue?",
      answer:
        "Sign in to CivicFix, add a photo, select the issue type, mark its location, and submit your report.",
    },
    {
      question: "Can I track my reported issue?",
      answer:
        "Yes. Open your dashboard or My Reports page to check the current status of your submitted issues.",
    },
    {
      question: "What happens after I submit a report?",
      answer:
        "The admin reviews the report and updates its status as it moves through the resolution process.",
    },
    {
      question: "What if my issue is marked as rejected?",
      answer:
        "Check the status and feedback provided by the admin. If needed, correct the details and submit a new report.",
    },
  ];

  return (
    <div className="bg-[#f8f9ff] text-[#0d1c2e] antialiased min-h-screen flex flex-col font-['Inter']">
      <Navbar />

      <main className="grow w-full max-w-7xl mx-auto px-6 md:px-10 py-15">
        {/* Introduction */}
        <section className="mb-16 text-center max-w-3xl mx-auto">
          <h1 className="font-['Plus_Jakarta_Sans'] text-4xl md:text-[48px] leading-tight tracking-[-0.02em] font-bold text-[#0d1c2e] mb-6">
            Transforming Dehradun, Together.
          </h1>

          <p className="text-[18px] leading-7 text-[#444651]">
            CivicFix helps citizens report civic issues in Dehradun, track
            their progress, and stay informed as local authorities work
            toward resolving them.
          </p>
        </section>

        {/* Resolution Journey */}
        <section className="mb-24">
          <h2 className="font-['Plus_Jakarta_Sans'] text-3xl md:text-4xl leading-10 tracking-[-0.01em] font-bold text-[#0d1c2e] mb-10 text-center">
            The Resolution Journey
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`${
                  step.highlight
                    ? "bg-[#1e3a8a]/5 border-[#dce1ff]"
                    : "bg-linear-to-br from-white to-[#f8fafc] border-[#e2e8f0]"
                } ${
                  step.wide ? "md:col-span-1 lg:col-span-2" : ""
                } shadow-[0_4px_12px_rgba(0,0,0,0.03)] border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] rounded-xl p-8 flex flex-col relative overflow-hidden group`}
              >
                <div className="flex items-start gap-6">
                  <div
                    className={`w-12 h-12 ${
                      step.highlight
                        ? "bg-[#00236f] text-white"
                        : "bg-[#eff4ff] text-[#00236f]"
                    } rounded-full flex items-center justify-center mb-6 shrink-0`}
                  >
                    <span className="material-symbols-outlined text-2xl">
                      {step.icon}
                    </span>
                  </div>

                  <div className="absolute top-8 right-8 font-['Plus_Jakarta_Sans'] text-3xl font-bold text-[#757682] opacity-20 group-hover:opacity-40 transition-opacity">
                    {step.number}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-['Plus_Jakarta_Sans'] text-xl leading-8 font-semibold text-[#0d1c2e] mb-3 pr-8">
                      {step.title}
                    </h3>

                    <p className="text-base leading-6 text-[#444651]">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Impact */}
        <section className="mb-24 bg-[#eff4ff] rounded-2xl p-8 md:p-12 border border-[#c5c5d3]/30 flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1">
            <h2 className="font-['Plus_Jakarta_Sans'] text-3xl md:text-4xl leading-10 tracking-[-0.01em] font-bold text-[#0d1c2e] mb-6">
              Your Impact on Dehradun
            </h2>

            <p className="text-[18px] leading-7 text-[#444651]">
              Every report helps bring attention to civic problems in
              Dehradun. By reporting issues and tracking their progress,
              citizens can contribute to cleaner, safer, and better-maintained
              neighbourhoods.
            </p>
          </div>

          <div className="flex-1 w-full h-64 md:h-80 rounded-xl overflow-hidden relative shadow-sm border border-[#c5c5d3]/50">
  <img
    src="https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=85"
    alt="Urban streets and city infrastructure"
    className="w-full h-full object-cover"
    loading="lazy"
  />
</div>
        </section>

        {/* FAQs */}
        <section className="max-w-3xl mx-auto mb-16">
          <h2 className="font-['Plus_Jakarta_Sans'] text-3xl md:text-4xl leading-10 tracking-[-0.01em] font-bold text-[#0d1c2e] mb-10 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="border border-[#c5c5d3] rounded-xl p-6 bg-white shadow-sm"
              >
                <h3 className="font-['Plus_Jakarta_Sans'] text-lg md:text-xl leading-8 font-semibold text-[#0d1c2e] mb-2 flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#00236f]">
                    help_outline
                  </span>
                  {faq.question}
                </h3>

                <p className="text-base leading-6 text-[#444651] pl-9">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

   <Footer type="public" />
    </div>
  );
};

export default HowItWorks;
