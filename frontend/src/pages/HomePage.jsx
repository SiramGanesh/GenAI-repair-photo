import {
  ArrowDown,
  ArrowRight,
  ImagePlus,
  Maximize2,
  ScanLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ComparisonSlider from "../components/ComparisonSlider.jsx";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const features = [
  {
    icon: Maximize2,
    title: "4× image upscaling",
    description:
      "Increase image resolution up to four times with the Real-ESRGAN x4 model.",
  },
  {
    icon: ScanLine,
    title: "Reduce common artifacts",
    description:
      "The model is designed to reduce common image artifacts. It is not a dedicated scratch-repair tool.",
  },
  {
    icon: Sparkles,
    title: "Thoughtful enhancement",
    description:
      "The model enhances detail while upscaling. Output depends on the quality and content of your photo.",
  },
];

export default function HomePage() {
  const fileInputRef = useRef(null);
  const [beforeUrl, setBeforeUrl] = useState(null);
  const [afterUrl, setAfterUrl] = useState(null);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [serviceDevice, setServiceDevice] = useState(null);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    let active = true;

    fetch("/api/health")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Health check failed (HTTP ${response.status}).`);
        }
        return response.json();
      })
      .then((payload) => {
        if (active && (payload.device === "cpu" || payload.device === "cuda")) {
          setServiceDevice(payload.device);
        }
      })
      .catch((error) => {
        console.warn("Could not check restoration service health.", error);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (beforeUrl) URL.revokeObjectURL(beforeUrl);
    };
  }, [beforeUrl]);

  useEffect(() => {
    return () => {
      if (afterUrl) URL.revokeObjectURL(afterUrl);
    };
  }, [afterUrl]);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setBeforeUrl(null);
    setAfterUrl(null);
    setProgress(null);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrorMessage("Choose a JPEG, PNG, or WebP image.");
      setStatus("error");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setErrorMessage("Choose an image that is 8 MB or smaller.");
      setStatus("error");
      return;
    }
    setBeforeUrl(URL.createObjectURL(file));
    setErrorMessage("");
    setProgress(0);
    setStatus("uploading");

    const requestId = crypto.randomUUID();
    const progressController = new AbortController();
    const pollProgress = async () => {
      while (!progressController.signal.aborted) {
        try {
          const progressResponse = await fetch(
            `/api/restore/progress/${requestId}`,
            { signal: progressController.signal },
          );
          if (progressResponse.ok) {
            const payload = await progressResponse.json();
            if (Number.isInteger(payload.progress)) {
              setProgress(Math.max(0, Math.min(99, payload.progress)));
            }
          } else if (progressResponse.status !== 404) {
            throw new Error(`Progress check failed (HTTP ${progressResponse.status}).`);
          }
        } catch (error) {
          if (!progressController.signal.aborted) {
            console.warn("Could not retrieve restoration progress.", error);
          }
          return;
        }
        await new Promise((resolve) => window.setTimeout(resolve, 500));
      }
    };
    const progressPolling = pollProgress();

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/restore", {
        method: "POST",
        headers: { "X-Request-ID": requestId },
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const detail = typeof payload?.detail === "string" ? payload.detail : "";
        throw new Error(detail || `Restoration failed (HTTP ${response.status}).`);
      }

      if (!response.headers.get("content-type")?.includes("image/webp")) {
        throw new Error("The restoration service returned an unexpected response.");
      }

      const result = await response.blob();
      if (result.size === 0) {
        throw new Error("The restoration service returned an empty image.");
      }
      setAfterUrl(URL.createObjectURL(result));
      setProgress(100);
      setStatus("success");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Restoration failed. Please try again.",
      );
      setStatus("error");
    } finally {
      progressController.abort();
      await progressPolling;
    }
  };

  const startAnother = () => {
    setStatus("idle");
    setErrorMessage("");
    setProgress(null);
    fileInputRef.current?.click();
  };

  return (
    <main>
      <section className="hero page-shell">
        <div className="hero-copy">
          <span className="eyebrow">
            <Sparkles size={14} aria-hidden="true" />
            A new chapter for old photographs
          </span>
          <h1>
            Bring back the <em>magic</em> of your memories.
          </h1>
          <p className="hero-lede">
            Give an old photograph a little more clarity. Real-ESRGAN can upscale
            your image by 4×, with an enhanced result ready to download.
          </p>
          <div className="hero-actions">
            <a className="button button-primary button-large" href="#restore">
              <ImagePlus size={18} aria-hidden="true" />
              Explore restoration
            </a>
            <Link className="button button-secondary button-large" to="/showcase" viewTransition>
              See the showcase <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <p className="hero-note">
            <ShieldCheck size={16} aria-hidden="true" />
            Photos are sent to the Revive server for processing and are not saved by this app.
          </p>
        </div>
        <div className="hero-visual">
          <div className="hero-photo-frame">
            <ComparisonSlider
              image="/images/portrait-01.jpg"
              imageAlt="Portrait used for an illustrative color-treatment comparison"
            />
            <div className="photo-caption">
              <span className="caption-mark"><Sparkles size={15} /></span>
              <span>
                <strong>A glimpse of what’s possible</strong>
                <small>Illustrative color preview · not an AI result</small>
              </span>
            </div>
          </div>
          <span className="hero-scribble" aria-hidden="true">A little more life</span>
        </div>
        <a className="scroll-cue" href="#how-it-works" aria-label="Scroll to how it works">
          <ArrowDown size={16} aria-hidden="true" />
        </a>
      </section>

      <section className="intro-section" id="how-it-works">
        <div className="page-shell intro-grid">
          <div>
            <span className="eyebrow">Small details. Big feelings.</span>
            <h2>Bring your photographs into clearer focus.</h2>
          </div>
          <p>
            Real-ESRGAN increases image resolution by 4× and is designed to
            enhance detail and reduce common artifacts. It does not colorize
            black-and-white photographs or specifically repair scratches.
          </p>
        </div>
        <div className="page-shell feature-grid">
          {features.map(({ icon: Icon, title, description }, index) => (
            <article className="feature-card" key={title}>
              <span className={`feature-icon feature-icon-${index + 1}`}>
                <Icon size={23} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <h3>{title}</h3>
              <p>{description}</p>
              <span className="feature-index">0{index + 1}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="restore-section page-shell" id="restore">
        <div className="restore-card">
          <div className="restore-decoration" aria-hidden="true" />
          <div className="restore-content">
            <span className="eyebrow eyebrow-light">
              <Sparkles size={14} aria-hidden="true" /> Powered by Real-ESRGAN
            </span>
            <h2>Give your photo a little more room to shine.</h2>
            <p>
              Upload a JPEG, PNG, or WebP up to 8 MB. Photos are processed by
              the Revive server and are not kept after the request.
            </p>
            {serviceDevice === "cpu" && (
              <p className="restore-status" role="note">
                This server is using CPU. Full-resolution restoration can take several
                minutes; keep this page open. A CUDA-enabled server is faster.
              </p>
            )}
            <input
              accept={ACCEPTED_TYPES.join(",")}
              className="visually-hidden"
              onChange={handleFileChange}
              ref={fileInputRef}
              type="file"
            />
            {beforeUrl && (
              <div className="restore-result">
                {afterUrl ? (
                  <>
                    <ComparisonSlider
                      afterImage={afterUrl}
                      beforeImage={beforeUrl}
                      imageAlt="Your photo restored at four times the original resolution"
                    />
                    <a
                      className="button button-light button-large"
                      download="revived.webp"
                      href={afterUrl}
                    >
                      Download restored image
                    </a>
                  </>
                ) : (
                  <img className="restore-input-preview" src={beforeUrl} alt="Selected photo" />
                )}
              </div>
            )}
            {status === "success" ? (
              <button className="button button-light button-large" onClick={startAnother} type="button">
                <ImagePlus size={18} aria-hidden="true" /> Restore another
              </button>
            ) : (
              <button
                className="button button-light button-large"
                disabled={status === "uploading"}
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                <ImagePlus size={18} aria-hidden="true" />
                {status === "uploading" ? "Restoring photo…" : "Choose a photo"}
              </button>
            )}
            {status === "uploading" && (
              <div aria-live="polite" className="restore-progress">
                <div className="restore-progress-label">
                  <span>Restoring photo</span>
                  <span>{progress ?? 0}%</span>
                </div>
                <div
                  aria-label="Photo restoration progress"
                  aria-valuemax={100}
                  aria-valuemin={0}
                  aria-valuenow={progress ?? 0}
                  className="restore-progress-track"
                  role="progressbar"
                >
                  <span style={{ width: `${progress ?? 0}%` }} />
                </div>
                <p className="restore-status">
                  {serviceDevice === "cpu"
                    ? "Full-resolution CPU processing can take several minutes. Keep this page open."
                    : "Processing your photo…"}
                </p>
              </div>
            )}
            {status === "error" && (
              <p aria-live="assertive" className="restore-error" role="alert">{errorMessage}</p>
            )}
          </div>
          <span className="restore-watermark" aria-hidden="true">R</span>
        </div>
      </section>
    </main>
  );
}
