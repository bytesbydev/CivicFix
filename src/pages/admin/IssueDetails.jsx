
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import { supabase } from "../../services/supabase";

const STATUS_OPTIONS = [
  "Pending Review",
  "In Progress",
  "Resolved",
  "Rejected",
];

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getIssueNumber = (issue) => {
  if (!issue) return "—";
  return `CF-${issue.issue_number ?? issue.id?.slice(0, 8) ?? "—"}`;
};

const IssueDetails = () => {
  const { id } = useParams();

const [feedbackMessage, setFeedbackMessage] = useState("");
const [sendingUpdate, setSendingUpdate] = useState(false);
const [updateMessage, setUpdateMessage] = useState("");
  const [issue, setIssue] = useState(null);
  const [citizen, setCitizen] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    const fetchIssueDetails = async () => {
      setLoading(true);
      setError("");
      setMessage("");

      try {
        if (!id) {
          throw new Error("Issue ID is missing from the URL.");
        }

        const { data: issueData, error: issueError } = await supabase
          .from("issues")
          .select("*")
          .eq("id", id)
          .single();

        if (issueError) throw issueError;
        if (!active) return;

        setIssue(issueData);
        setSelectedStatus(issueData.status ?? "Pending Review");
        setSelectedDepartment(
          issueData.department_id != null
            ? String(issueData.department_id)
            : ""
        );

        const [profileResult, departmentResult] = await Promise.all([
          supabase
            .from("profiles")
            .select("full_name, phone")
            .eq("id", issueData.citizen_id)
            .maybeSingle(),

          supabase.from("departments").select("*"),
        ]);

        if (!active) return;

        if (profileResult.error) {
          console.error("Could not load citizen profile:", profileResult.error);
        } else {
          setCitizen(profileResult.data);
        }

        if (departmentResult.error) {
          console.error("Could not load departments:", departmentResult.error);
        } else {
          setDepartments(departmentResult.data ?? []);
        }
      } catch (err) {
        console.error("Failed to load issue:", err);
        if (active) {
          setError(
            "Unable to load this issue. Check the issue URL and your Supabase permissions."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchIssueDetails();

    return () => {
      active = false;
    };
  }, [id]);

  const handleSendUpdate = async () => {
  const message = feedbackMessage.trim();

  if (!message) {
    setUpdateMessage("Please enter a message.");
    return;
  }

  if (!issue?.id || !issue?.citizen_id) {
    setUpdateMessage("Issue or citizen information is missing.");
    return;
  }

  setSendingUpdate(true);
  setUpdateMessage("");

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Please log in again.");
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      throw new Error("Only admins can send updates.");
    }

    const { error } = await supabase.from("issue_updates").insert({
      issue_id: issue.id,
      citizen_id: issue.citizen_id,
      admin_id: user.id,
      message,
    });

    if (error) throw error;

    setFeedbackMessage("");
    setUpdateMessage("Update sent successfully!");
  } catch (error) {
    setUpdateMessage(error.message || "Failed to send update.");
  } finally {
    setSendingUpdate(false);
  }
};

  const saveChanges = async () => {
    if (!issue) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const departmentId = selectedDepartment
        ? Number(selectedDepartment)
        : null;

      const changes = {
        status: selectedStatus,
        department_id: departmentId,
        updated_at: new Date().toISOString(),
      };

      if (selectedStatus === "Resolved") {
        changes.resolved_at = issue.resolved_at ?? new Date().toISOString();
      } else {
        changes.resolved_at = null;
      }

      const { data, error: updateError } = await supabase
        .from("issues")
        .update(changes)
        .eq("id", issue.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setIssue(data);
      setSelectedStatus(data.status);
      setSelectedDepartment(
        data.department_id != null ? String(data.department_id) : ""
      );
      setMessage("Issue changes saved successfully.");
    } catch (err) {
      console.error("Failed to save issue changes:", err);
      setError(
        "Unable to save changes. Check your Supabase update policy and department configuration."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9ff]">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-10 md:px-10">
          <p className="text-sm text-[#444651]">Loading issue details...</p>
        </main>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-[#f8f9ff]">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-10 md:px-10">
          <h1 className="text-2xl font-bold text-[#0d1c2e]">
            Issue not available
          </h1>
          <p role="alert" className="mt-3 text-sm text-[#ba1a1a]">
            {error || "The requested issue could not be found."}
          </p>
        </main>
      </div>
    );
  }

  const departmentName =
    departments.find(
      (department) => String(department.id) === String(issue.department_id)
    )?.name ??
    departments.find(
      (department) => String(department.id) === String(issue.department_id)
    )?.department_name ??
    "Not assigned";

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9ff] font-['Inter'] text-[#0d1c2e] antialiased selection:bg-[#1e3a8a] selection:text-[#90a8ff]">
      <Navbar />

      <main className="flex-1 bg-[#f8f9ff]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-10">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-[#444651]">
                  ISSUE #{getIssueNumber(issue)}
                </span>

                <span className="rounded-full border border-[#00236f]/20 bg-[#dce1ff] px-3 py-1 text-xs font-medium text-[#00164e]">
                  {issue.status}
                </span>

                <span className="rounded-full border border-[#ba1a1a]/20 bg-[#ffdad6] px-3 py-1 text-xs font-medium text-[#93000a]">
                  {issue.priority ?? "Medium"} Priority
                </span>
              </div>

              <h1 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold leading-10 text-[#0d1c2e] md:text-[32px]">
                {issue.title}
              </h1>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg border border-[#757682] bg-white px-4 py-2 text-sm font-semibold text-[#00236f] transition-colors hover:bg-[#d5e3fc]"
            >
              <span className="material-symbols-outlined text-[18px]">
                print
              </span>
              Print Report
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-[#ba1a1a]/20 bg-[#ffdad6]/40 p-4 text-sm text-[#ba1a1a]"
            >
              {error}
            </div>
          )}

          {message && (
            <div
              role="status"
              className="rounded-lg border border-[#006a61]/20 bg-emerald-50 p-4 text-sm text-[#006a61]"
            >
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
            <div className="flex flex-col gap-8 xl:col-span-8">
              <article className="rounded-xl border border-[#c5c5d3] bg-white p-4 shadow-sm md:p-6">
               <div className="mb-6 flex h-64 w-full items-center justify-center overflow-hidden rounded-lg bg-[#d5e3fc] md:h-80">
  {issue.image_url ? (
    <img
      src={
        issue.image_url.startsWith("http")
          ? issue.image_url
          : supabase.storage
              .from("issue-images")
              .getPublicUrl(issue.image_url).data.publicUrl
      }
      alt={issue.title || "Reported civic issue"}
      className="h-full w-full object-contain"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  ) : (
    <div className="text-center text-[#444651]">
      <span className="material-symbols-outlined text-4xl">
        image
      </span>
      <p className="mt-2 text-sm">No image attached</p>
    </div>
  )}
</div>

                <div className="mb-6 grid grid-cols-2 gap-4 border-b border-[#c5c5d3]/50 pb-6 md:grid-cols-4">
                  <div>
                    <p className="mb-1 text-xs font-medium text-[#444651]">
                      Reported By
                    </p>
                    <p className="flex items-center gap-2 text-sm">
                      <span className="material-symbols-outlined text-[16px] text-[#00236f]">
                        person
                      </span>
                      {citizen?.full_name ?? "Citizen"}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-medium text-[#444651]">
                      Date Submitted
                    </p>
                    <p className="flex items-center gap-2 text-sm">
                      <span className="material-symbols-outlined text-[16px] text-[#00236f]">
                        calendar_today
                      </span>
                      {formatDate(issue.created_at)}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-medium text-[#444651]">
                      Category
                    </p>
                    <p className="flex items-center gap-2 text-sm">
                      <span className="material-symbols-outlined text-[16px] text-[#00236f]">
                        category
                      </span>
                      {issue.category}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-medium text-[#444651]">
                      Assigned Dept
                    </p>
                    <p className="flex items-center gap-2 text-sm">
                      <span className="material-symbols-outlined text-[16px] text-[#00236f]">
                        engineering
                      </span>
                      {departmentName}
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="mb-3 font-['Plus_Jakarta_Sans'] text-xl font-semibold leading-8 text-[#0d1c2e] md:text-2xl">
                    Citizen Description
                  </h2>
                  <p className="whitespace-pre-wrap text-base leading-relaxed text-[#444651]">
                    {issue.description}
                  </p>

                  {issue.address && (
                    <p className="mt-4 flex items-start gap-2 text-sm text-[#444651]">
                      <span className="material-symbols-outlined text-[#00236f]">
                        location_on
                      </span>
                      {issue.address}
                    </p>
                  )}
                </div>
              </article>

              <section className="rounded-xl border border-[#c5c5d3] bg-white p-4 shadow-sm md:p-6">
                <h2 className="mb-6 flex items-center gap-2 font-['Plus_Jakarta_Sans'] text-xl font-semibold leading-8 text-[#0d1c2e] md:text-2xl">
                  <span className="material-symbols-outlined text-[#00236f]">
                    history
                  </span>
                  Activity Timeline
                </h2>

                <div className="space-y-6 border-l-2 border-[#d5e3fc] pl-5">
                  <div>
                    <p className="text-sm font-semibold text-[#0d1c2e]">
                      Current status: {issue.status}
                    </p>
                    <p className="mt-1 text-xs text-[#444651]">
                      Last updated: {formatDate(issue.updated_at)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#0d1c2e]">
                      Issue reported
                    </p>
                    <p className="mt-1 text-xs text-[#444651]">
                      {formatDate(issue.created_at)}
                    </p>
                  </div>

                  {issue.resolved_at && (
                    <div>
                      <p className="text-sm font-semibold text-[#0d1c2e]">
                        Issue resolved
                      </p>
                      <p className="mt-1 text-xs text-[#444651]">
                        {formatDate(issue.resolved_at)}
                      </p>
                    </div>
                  )}
                </div>

                <p className="mt-5 text-xs text-[#757682]">
                  Detailed status history will require a separate activity log
                  table.
                </p>
              </section>
            </div>

            <div className="flex flex-col gap-8 xl:col-span-4">
              <section className="rounded-xl border border-[#c5c5d3] bg-white p-4 shadow-sm md:p-6">
                <h2 className="mb-6 flex items-center gap-2 border-b border-[#c5c5d3]/50 pb-3 font-['Plus_Jakarta_Sans'] text-xl font-semibold leading-8 text-[#0d1c2e] md:text-2xl">
                  <span className="material-symbols-outlined text-[#00236f]">
                    tune
                  </span>
                  Management Actions
                </h2>

                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="status-select"
                      className="mb-1 block text-xs font-medium text-[#444651]"
                    >
                      Update Status
                    </label>

                    <select
                      id="status-select"
                      value={selectedStatus}
                      onChange={(event) => setSelectedStatus(event.target.value)}
                      className="w-full rounded-lg border border-[#757682] bg-[#f8f9ff] px-4 py-3 text-base text-[#0d1c2e] focus:border-[#00236f] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status === "Rejected" ? "Rejected / Invalid" : status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="dept-select"
                      className="mb-1 block text-xs font-medium text-[#444651]"
                    >
                      Assign Department
                    </label>

                    <select
                      id="dept-select"
                      value={selectedDepartment}
                      onChange={(event) =>
                        setSelectedDepartment(event.target.value)
                      }
                      className="w-full rounded-lg border border-[#757682] bg-[#f8f9ff] px-4 py-3 text-base text-[#0d1c2e] focus:border-[#00236f] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                    >
                      <option value="">Not assigned</option>
                      {departments.map((department) => (
                        <option key={department.id} value={department.id}>
                          {department.name ??
                            department.department_name ??
                            `Department ${department.id}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={saveChanges}
                    disabled={saving}
                    className="mt-2 w-full rounded-lg border border-[#c5c5d3] bg-[#d5e3fc] py-3 text-sm font-semibold text-[#00236f] transition-colors hover:bg-[#dce9ff] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Internal Changes"}
                  </button>
                </div>
              </section>

              
<section className="relative overflow-hidden rounded-xl border border-[#c5c5d3] bg-white p-4 shadow-sm md:p-6">
  <div className="absolute left-0 top-0 h-1 w-full " />

  <h2 className="mb-2 mt-2 flex items-center gap-2 font-['Plus_Jakarta_Sans'] text-xl font-semibold leading-8 text-[#0d1c2e] md:text-2xl">
    <span className="material-symbols-outlined text-[#00236f]">
      forum
    </span>
    Citizen Feedback
  </h2>

  <p className="mb-5 text-sm text-[#444651]">
    Send an update about this issue directly to the citizen.
  </p>

  <textarea
    value={feedbackMessage}
    onChange={(e) => {
      setFeedbackMessage(e.target.value);
      setUpdateMessage("");
    }}
    placeholder="Write an update for the citizen..."
    rows={4}
    className="w-full resize-y rounded-lg border border-[#757682] bg-[#f8f9ff] px-4 py-3 text-sm text-[#0d1c2e] placeholder:text-[#757682] focus:border-[#00236f] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
  />

  {updateMessage && (
    <p
      role="status"
      className={`mt-3 text-sm ${
        updateMessage === "Update sent successfully!"
          ? "text-[#006a61]"
          : "text-[#ba1a1a]"
      }`}
    >
      {updateMessage}
    </p>
  )}

  <button
    type="button"
    onClick={handleSendUpdate}
    disabled={sendingUpdate}
    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#00236f] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#001952] disabled:cursor-not-allowed disabled:opacity-60"
  >
    <span className="material-symbols-outlined text-[20px]">
      send
    </span>
    {sendingUpdate ? "Sending..." : "Send Update to User"}
  </button>
</section>

            </div>
          </div>
        </div>

        <footer className="border-t border-slate-200 bg-white py-6">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-xs text-slate-500 md:flex-row">
            <span className="text-center font-medium text-slate-700 md:text-left">
              CivicFix Operations Portal • Dehradun Municipal Corporation
            </span>
            <span>CivicFix Admin • Authorized Personnel Only</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default IssueDetails;
