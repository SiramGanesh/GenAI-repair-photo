import { Download, ImagePlus, ScanLine, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  {
    icon: ImagePlus,
    title: "Choose a photo",
    description:
      "Select a JPEG, PNG, or WebP image up to 8 MB. Your original stays on your device until you choose to upload it.",
  },
  {
    icon: ScanLine,
    title: "Let Revive enhance it",
    description:
      "The photo is sent to our server, where Real-ESRGAN upscales it by 4× and can reduce common image artifacts.",
  },
  {
    icon: Download,
    title: "Preview and download",
    description:
      "Compare the result with your original, then download the enhanced image as a WebP file.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="how-it-works-page">
      <header className="page-heading page-shell">
        <span className="eyebrow">A thoughtful process for treasured photos</span>
        <h1>How <em>Revive</em> works.</h1>
        <p>
          A few simple steps turn a photo into a higher-resolution image you can
          preview and download.
        </p>
      </header>

      <section className="page-shell how-process" aria-label="How photo enhancement works">
        <div className="feature-grid">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <article className="feature-card process-card" key={title}>
              <span className={`feature-icon feature-icon-${index + 1}`}>
                <Icon size={23} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span className="feature-index">0{index + 1}</span>
              <h2>{title}</h2>
              <p>{description}</p>
            </article>
          ))}
        </div>
        <p className="how-note">
          <Sparkles size={16} aria-hidden="true" />
          Revive uses Real-ESRGAN for upscaling and enhancement. It does not
          specifically repair scratches or colorize black-and-white photos.
          Uploaded images are processed for the request and are not saved by
          this app.
        </p>
      </section>

      <section className="pricing-cta page-shell how-cta">
        <span className="eyebrow eyebrow-light">Ready when you are</span>
        <h2>Give a favorite photo a little more room to shine.</h2>
        <p>Choose an image and see the enhanced result for yourself.</p>
        <Link className="button button-light" to="/restore#restore" viewTransition>
          Start restoring
        </Link>
      </section>
    </main>
  );
}
