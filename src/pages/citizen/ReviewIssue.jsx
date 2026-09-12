
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { supabase } from "../../services/supabase";

const ReviewIssue = () => {
  const navigate = useNavigate();
  const routeLocation = useLocation();

  const { imageFile, imagePreview, issueLocation, issueDetails } =
    routeLocation.state || {};

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [localImagePreview, setLocalImagePreview] = useState("");
  const [previewFailed, setPreviewFailed] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Create a fresh preview directly from the selected image file.
  // This also works if the original imagePreview URL has expired.
  useEffect(() => {
    if (!imageFile) {
      setLocalImagePreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);

    setLocalImagePreview(objectUrl);
    setPreviewFailed(false);
    setImageLoadError(false);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageFile]);

  const displayedImage =
    imagePreview && !previewFailed
      ? imagePreview
      : localImagePreview;

  const handleImageError = () => {
    if (
      imagePreview &&
      !previewFailed &&
      localImagePreview
    ) {
      // Retry using the original selected file.
      setPreviewFailed(true);
    } else {
      setImageLoadError(true);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;

    if (!imageFile || !issueLocation || !issueDetails) {
      setError(
        "Report information is missing. Please return to the first step and complete the form."
      );
      return;
    }

    setSubmitting(true);
    setError("");

    let uploadedPath = null;

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        navigate("/citizen/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      if (profile.role !== "citizen") {
        throw new Error("Only citizen accounts can submit reports.");
      }

      const extension =
        imageFile.name.split(".").pop()?.toLowerCase() || "jpg";

      const imagePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("issue-images")
        .upload(imagePath, imageFile, {
          contentType: imageFile.type || "image/jpeg",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      uploadedPath = imagePath;

      const { data: issue, error: insertError } = await supabase
        .from("issues")
        .insert({
          citizen_id: user.id,
          title: issueDetails.title,
          description: issueDetails.description,
          category: issueDetails.category,
          priority:
            issueDetails.severity.charAt(0).toUpperCase() +
            issueDetails.severity.slice(1),
          address: issueLocation.address,
          latitude: issueLocation.latitude ?? null,
          longitude: issueLocation.longitude ?? null,
          image_url: imagePath,
          status: "Pending Review",
        })
        .select("id, issue_number")
        .single();

      if (insertError) throw insertError;

      navigate("/report-submitted", {
        replace: true,
        state: {
          issueId: issue.id,
          issueNumber: issue.issue_number,
        },
      });
    } catch (err) {
      console.error("Report submission failed:", err);

      if (uploadedPath) {
        const { error: cleanupError } = await supabase.storage
          .from("issue-images")
          .remove([uploadedPath]);

        if (cleanupError) {
          console.error("Image cleanup failed:", cleanupError);
        }
      }

      setError(
        err.message || "Unable to submit your report. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!imageFile || !issueLocation || !issueDetails) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Report information missing
        </h1>
        <p className="mt-3 text-slate-600">
          Please start the report again to ensure all details are included.
        </p>
        <Button
          onClick={() => navigate("/report", { replace: true })}
          className="mt-6"
        >
          Start Report
        </Button>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 shadow-sm md:px-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              navigate("/issue-details", {
                state: { imageFile, imagePreview, issueLocation },
              })
            }
            className="rounded-full p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Back to issue details"
          >
            <span className="material-symbols-outlined">
              arrow_back
            </span>
          </button>
          <span className="text-xl font-bold text-blue-900">
            CivicFix
          </span>
        </div>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="text-sm font-semibold text-slate-600 hover:text-blue-900"
        >
          Cancel Report
        </button>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 md:px-10">
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Final Step · Review &amp; Submit
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-full rounded-full bg-blue-900" />
          </div>
          <h1 className="text-3xl font-bold">Review Your Report</h1>
          <p className="text-slate-600">
            Check your details before submitting your report.
          </p>
        </section>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
          <div>
            <h2 className="mb-3 font-semibold">Issue Photo</h2>

            {displayedImage && !imageLoadError ? (
              <img
                key={displayedImage}
                src={displayedImage}
                alt="Photo selected for this report"
                onError={handleImageError}
                className="max-h-96 w-full rounded-lg bg-slate-100 object-contain"
              />
            ) : (
              <div
                role="alert"
                className="flex min-h-48 items-center justify-center rounded-lg bg-slate-100 p-6 text-center text-sm text-slate-600"
              >
                Image preview is unavailable. Please go back and
                select the photo again.
              </div>
            )}

            <p className="mt-2 break-all text-sm text-slate-500">
              {imageFile.name}
            </p>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h2 className="mb-2 font-semibold">Issue Details</h2>
            <h3 className="text-xl font-bold">
              {issueDetails.title}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Category: {issueDetails.category}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Priority: {issueDetails.severity}
            </p>
            <p className="mt-3 whitespace-pre-wrap leading-6 text-slate-700">
              {issueDetails.description}
            </p>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h2 className="mb-2 font-semibold">Location</h2>
            <p className="font-medium">
              {issueLocation.address || "Selected map location"}
            </p>

            {issueLocation.latitude != null &&
              issueLocation.longitude != null && (
                <p className="mt-1 text-xs text-slate-500">
                  Coordinates: {issueLocation.latitude},{" "}
                  {issueLocation.longitude}
                </p>
              )}
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h2 className="mb-2 font-semibold">People Affected</h2>
            <p className="text-sm text-slate-600">
              {issueDetails.affected?.length
                ? issueDetails.affected.join(", ")
                : "Not specified"}
            </p>
          </div>
        </section>

        <section className="flex flex-col-reverse justify-end gap-3 border-t border-slate-200 py-4 sm:flex-row">
          <Button
            variant="outline"
            onClick={() =>
              navigate("/issue-details", {
                state: { imageFile, imagePreview, issueLocation },
              })
            }
            disabled={submitting}
          >
            Edit Details
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            icon="send"
            iconPosition="after"
            className="gap-2"
          >
            {submitting ? "Submitting..." : "Submit Report"}
          </Button>
        </section>
      </main>
    </div>
  );
};

export default ReviewIssue;
