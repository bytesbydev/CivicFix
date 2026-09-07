import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";


const IssueDetails = () => {
    const navigate = useNavigate();
const routeLocation = useLocation();

const imageFile = routeLocation.state?.imageFile;
const imagePreview = routeLocation.state?.imagePreview;
const issueLocation = routeLocation.state?.issueLocation;
  const [title, setTitle] = useState("");
const [category, setCategory] = useState("Potholes");
  const [severity, setSeverity] = useState("medium");
  const [affected, setAffected] = useState(["pedestrians", "drivers"]);
  const [description, setDescription] = useState("");

  const affectedOptions = [
    {
      value: "pedestrians",
      label: "Pedestrians",
      icon: "directions_walk",
    },
    {
      value: "drivers",
      label: "Drivers",
      icon: "directions_car",
    },
    {
      value: "cyclists",
      label: "Cyclists",
      icon: "pedal_bike",
    },
    {
      value: "businesses",
      label: "Local Businesses",
      icon: "storefront",
    },
  ];

  const toggleAffected = (value) => {
    setAffected((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

 const handleContinue = (e) => {
  e.preventDefault();

  if (!imageFile || !issueLocation) {
    alert("Your image or location is missing. Please go back and complete the previous steps.");
    return;
  }

  if (!title.trim() || !description.trim()) {
    alert("Please enter an issue title and description.");
    return;
  }

  navigate("/review-issue", {
    state: {
      imageFile,
      imagePreview,
      issueLocation,
      issueDetails: {
        title: title.trim(),
        category,
        severity,
        affected,
        description: description.trim(),
        address: issueLocation.address,
latitude: issueLocation.latitude,
longitude: issueLocation.longitude,
      },
    },
  });
};
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 md:px-10">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => window.history.back()}
            className="-ml-2 flex items-center justify-center rounded-full p-2 text-slate-600 transition hover:bg-slate-100"
          >
            <span className="material-symbols-outlined text-[20px]">
              arrow_back
            </span>
          </button>

          <h1 className="text-xl font-semibold text-blue-900">
            Report an Issue
          </h1>

          <button
            type="button"
            aria-label="Close"
            className="ml-auto flex items-center justify-center rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-900"
          >
            <span className="material-symbols-outlined text-[24px]">
              close
            </span>
          </button>
        </div>
      </header>

      
      <main className="mx-auto mt-8 max-w-3xl px-4">
        
        <div className="mb-8">
          <div className="mb-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Step 3 of 5
            </p>

            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Issue Details
            </h2>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-4/5 rounded-full bg-blue-800 transition-all duration-500" />
          </div>
        </div>

        
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-8">
          <form onSubmit={handleContinue} className="space-y-8">
            
            <div>
              <label
                htmlFor="issue-title"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Issue Title
              </label>

              <p className="mb-3 text-sm text-slate-500">
                Provide a short, descriptive title for the problem.
              </p>

              <input
                id="issue-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Deep Pothole on Main Road"
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
              />
            </div>

            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              
              <div>
                <label
                  htmlFor="issue-category"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Category
                </label>

                <div className="relative">
                  <select
                    id="issue-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full cursor-pointer appearance-none rounded-lg border border-slate-300 bg-white px-4 py-3 pr-10 text-base text-slate-900 outline-none transition focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
                  >
                    <option value="Potholes">Potholes</option>
<option value="Garbage">Garbage</option>
<option value="Streetlights">Streetlights</option>
<option value="Drainage">Drainage</option>
<option value="Water">Water</option>
<option value="Other">Other</option>
                  </select>

                  <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                    expand_more
                  </span>
                </div>
              </div>

              
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Severity Level
                </label>

                <div className="flex h-4 gap-1 rounded-lg bg-slate-100 p-6">
                  {["low", "medium", "high"].map((level) => (
                    <label
                      key={level}
                      className="flex flex-1 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="severity"
                        value={level}
                        checked={severity === level}
                        onChange={(e) => setSeverity(e.target.value)}
                        className="sr-only"
                      />

                      <div
                        className={`flex h-full w-full items-center justify-center rounded-md text-sm font-medium capitalize transition ${
                          severity === level
                            ? level === "high"
                              ? "bg-red-100 text-red-700 shadow-sm"
                              : level === "medium"
                              ? "bg-white text-orange-700 shadow-sm"
                              : "bg-white text-blue-800 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {level}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Who is affected?
              </label>

              <p className="mb-4 text-sm text-slate-500">
                Select all groups impacted by this issue to help prioritize
                response.
              </p>

              <div className="flex flex-wrap gap-3">
                {affectedOptions.map((option) => {
                  const isSelected = affected.includes(option.value);

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleAffected(option.value)}
                      className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                        isSelected
                          ? "border-blue-800 bg-blue-800 text-white"
                          : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {option.icon}
                      </span>

                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            
            <div>
              <label
                htmlFor="issue-description"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Detailed Description
              </label>

              <p className="mb-3 text-sm text-slate-500">
                Provide any extra details that might help CivicFix assess and
                resolve the problem.
              </p>

              <textarea
                id="issue-description"
                rows="5"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., The pothole is located in the right lane, just past the intersection. It's roughly 2 feet wide and very deep."
                className="w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
              />
            </div>
          </form>
        </div>

        
        <div className="sticky bottom-6 z-10 mt-8 flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
        <Button variant="outline">Save Draft</Button>

        <Button onClick={handleContinue} icon="arrow_forward" iconPosition="after" className="gap-2">Continue to Final Step</Button>
        </div>
      </main>
    </div>
  );
};

export default IssueDetails;