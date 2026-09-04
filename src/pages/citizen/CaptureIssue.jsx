import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";

function CaptureIssue() {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file) => {
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/heic",
      "image/heif",
    ];

    const maxSize = 10 * 1024 * 1024;

    if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith(".heic")) {
      alert("Please select a JPG, PNG, or HEIC image.");
      return;
    }

    if (file.size > maxSize) {
      alert("Image size must be less than 10MB.");
      return;
    }

    setSelectedFile(file);

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setDragActive(false);
  };

  const removeImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setSelectedFile(null);
    setPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  const handleNext = () => {
  if (!selectedFile) return;

  navigate("/issue-location", {
    state: {
      imageFile: selectedFile,
      imagePreview: preview,
    },
  });
};

  return (
    <div className="bg-[#f8f9ff] text-[#0d1c2e] antialiased min-h-screen flex flex-col items-center py-10 px-6 md:px-10">

      
      <main className="w-full max-w-150 flex flex-col gap-8">

        
        <header className="flex justify-between items-center w-full">

          
          <Link
            to="/"
            className="text-[#444651] hover:text-[#00236f] transition-colors flex items-center gap-2 group"
          >
            <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">
              close
            </span>

            <span className="font-semibold text-[14px] leading-5 tracking-wider">
              Cancel Report
            </span>
          </Link>

          
          <div className="flex items-center gap-2">

            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-[#1e3a8a]" />

              <div className="w-12 h-1 bg-[#c5c5d3] rounded-full" />
            </div>

            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-[#c5c5d3]" />

              <div className="w-12 h-1 bg-[#c5c5d3] rounded-full" />
            </div>

            <div className="w-2.5 h-2.5 rounded-full bg-[#c5c5d3]" />

          </div>
        </header>

        
        <section className="bg-white rounded-xl shadow-sm border border-[#c5c5d3] p-8 flex flex-col gap-8 w-full">

          
          <div className="text-center md:text-left flex flex-col gap-2">

            <p className="font-medium text-[12px] leading-4 text-[#00236f] uppercase tracking-wider">
              Step 1 of 3: Capture
            </p>

            <h1 className="text-[24px] leading-8 md:text-[32px] md:leading-10 font-['Plus_Jakarta_Sans'] font-bold text-[#0d1c2e]">
              What's the issue?
            </h1>

            <p className="text-[16px] leading-6 text-[#444651]">
              Provide a clear photo to help our teams identify and resolve
              the problem quickly.
            </p>

          </div>

          
          <div
            onDragEnter={handleDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => {
              if (!selectedFile) {
                fileInputRef.current?.click();
              }
            }}
            className={`
              border-2 border-dashed rounded-xl p-8
              flex flex-col items-center justify-center gap-4
              transition-all duration-200
              min-h-70
              ${
                dragActive
                  ? "border-[#1e3a8a] bg-[#eff4ff]"
                  : "border-[#c5c5d3] hover:border-[#1e3a8a] hover:bg-[#eff4ff]"
              }
              ${!selectedFile ? "cursor-pointer" : ""}
            `}
          >

            {!selectedFile ? (
              <>
                
                <div className="w-16 h-16 rounded-full bg-[#d5e3fc] flex items-center justify-center text-[#1e3a8a] mb-2">
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: "32px",
                      fontVariationSettings: "'FILL' 1",
                    }}
                  >
                    add_a_photo
                  </span>
                </div>

                
                <div className="text-center">
                  <p className="font-semibold text-[14px] leading-5 text-[#0d1c2e] mb-1">
                    Drag and drop an image here
                  </p>

                  <p className="text-[14px] leading-5 text-[#444651]">
                    or click to browse your files
                  </p>
                </div>

                
                <div
                  className="flex flex-col sm:flex-row gap-2 mt-4 w-full sm:w-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button onClick={() => cameraInputRef.current?.click()} iconPosition="before" icon="photo_camera" className="gap-2">Take Photo</Button>

                  <Button  onClick={() => fileInputRef.current?.click()} icon="upload" variant="outline" iconPosition="before" className="gap-2">
                    Upload Image
                  </Button>

                </div>
              </>
            ) : (
              <>
                
                <div className="relative w-full max-w-90">

                  {preview && (
                    <img
                      src={preview}
                      alt="Selected issue"
                      className="w-full h-48 object-cover rounded-xl border border-[#c5c5d3]"
                    />
                  )}

                  
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage();
                    }}
                    className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white shadow-md text-[#ba1a1a] flex items-center justify-center hover:bg-[#ffdad6]"
                  >
                    <span className="material-symbols-outlined">
                      close
                    </span>
                  </button>

                </div>

                
                <div className="text-center">

                  <p className="font-semibold text-[14px] leading-5 text-[#0d1c2e]">
                    {selectedFile.name}
                  </p>

                  <p className="text-[12px] leading-4 text-[#444651] mt-1">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>

                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="text-[#00236f] font-semibold text-[14px] hover:underline"
                >
                  Choose another image
                </button>
              </>
            )}

          </div>

          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/heic,image/heif"
            className="hidden"
            onChange={handleInputChange}
          />

          
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleInputChange}
          />

          
          <div className="bg-[#e6eeff] rounded-lg p-4 flex gap-3 items-start mt-2">

            <span
              className="material-symbols-outlined text-[#006a61] mt-0.5"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              info
            </span>

            <div>

              <h3 className="font-semibold text-[14px] leading-5 tracking-wider text-[#0d1c2e]">
                Photo Guidelines
              </h3>

              <p className="text-[14px] leading-5 text-[#444651] mt-1">
                Supported formats: JPG, PNG, HEIC.
                <br />
                Maximum file size: 10MB.
                <br />
                Ensure the issue is clearly visible in well-lit conditions.
              </p>

            </div>
          </div>

        </section>

        
        <footer className="flex justify-end w-full">

          <button
            type="button"
            disabled={!selectedFile}
            onClick={handleNext}
            className={`
              font-semibold text-[14px] leading-5 tracking-wider
              py-3 px-8 rounded-lg flex items-center gap-2
              transition-all
              ${
                selectedFile
                  ? "bg-[#1e3a8a] text-white hover:bg-[#00236f] shadow-sm"
                  : "bg-[#1e3a8a] text-white opacity-50 cursor-not-allowed"
              }
            `}
          >
            Next Step

            <span className="material-symbols-outlined">
              arrow_forward
            </span>
          </button>

        </footer>

      </main>
    </div>
  );
}

export default CaptureIssue;