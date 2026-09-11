
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";

const ReportSubmitted = () => {
  const navigate = useNavigate();
  const routeLocation = useLocation();

  const { issueId, issueNumber } = routeLocation.state || {};

  const reportNumber =
    issueNumber != null ? `#CF-${issueNumber}` : null;

 const handleTrackReport = () => {
  navigate("/my-reports", {
    state: {
      issueId,
      focusIssueId: issueId,
    },
  });
};

  const handleViewMap = () => {
  navigate("/explore-map", {
    state: {
      issueId,
      focusIssueId: issueId,
    },
  });
};

  const handleReportAnother = () => {
    navigate("/report", { replace: true });
  };

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-50 p-4 font-sans text-slate-900 md:p-10">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-40">
        <div className="absolute left-[10%] top-[10%] h-[50%] w-[50%] rounded-full bg-emerald-100 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] h-[40%] w-[40%] rounded-full bg-blue-100 blur-[120px]" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center text-center">
        <div className="relative flex w-full flex-col items-center overflow-hidden rounded-2xl border border-white/60 bg-white/80 p-8 shadow-xl backdrop-blur-xl md:p-12">
          <div className="relative z-10 mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600">
            <span className="material-symbols-outlined text-[48px]">
              check_circle
            </span>
          </div>

          <h1 className="relative z-10 mb-2 text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Report Submitted
          </h1>

          <p className="relative z-10 mb-8 max-w-md text-lg leading-7 text-slate-600">
            Thank you for contributing to your community. Your report has
            been saved. You can track its status from My Reports.
          </p>

          {reportNumber ? (
            <div className="relative z-10 mb-10 flex w-full max-w-sm items-center justify-center gap-3 rounded-xl border border-slate-200 bg-blue-50 p-4 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Report ID
              </span>

              <div className="h-4 w-px bg-slate-300" />

              <span className="break-all text-xl font-bold text-blue-900">
                {reportNumber}
              </span>
            </div>
          ) : (
            <p className="relative z-10 mb-8 text-sm text-amber-700">
              Report number unavailable. Please check My Reports to confirm
              your submission.
            </p>
          )}

          <div className="relative z-10 flex w-full max-w-md flex-col gap-4 sm:flex-row">
            <Button
              onClick={handleTrackReport}
              icon="timeline"
              iconPosition="before"
              className="w-full gap-2"
            >
              Track Report
            </Button>

            <Button
              onClick={handleViewMap}
              icon="map"
              iconPosition="before"
              className="w-full gap-2"
              variant="outline"
            >
              View on Map
            </Button>
          </div>

          <div className="relative z-10 mt-6">
            <button
              type="button"
              onClick={handleReportAnother}
              className="flex items-center gap-2 text-sm font-semibold text-emerald-700 transition-all hover:text-emerald-800 hover:underline"
            >
              <span className="material-symbols-outlined text-[18px]">
                add_circle
              </span>
              Report Another Issue
            </button>

            <div className="mt-4">
              <button
                type="button"
                onClick={handleDashboard}
                className="mx-auto flex items-center gap-2 text-sm font-semibold text-slate-500 transition-all hover:text-blue-900 hover:underline"
              >
                <span className="material-symbols-outlined text-[18px]">
                  dashboard
                </span>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportSubmitted;
