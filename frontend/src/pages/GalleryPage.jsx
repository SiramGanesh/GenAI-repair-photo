import { ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import ComparisonSlider from "../components/ComparisonSlider.jsx";

const categories = [
  ["all", "All photos"],
  ["portrait", "Portraits"],
  ["family", "Family"],
  ["landscape", "Landscapes"],
  ["vintage", "Vintage"],
];

const examples = [
  { image: "portrait-01.jpg", category: "portrait", title: "A familiar face", tag: "Portrait study" },
  { image: "family-01.jpg", category: "family", title: "Together, always", tag: "Family study" },
  { image: "landscape-01.jpg", category: "landscape", title: "A quiet horizon", tag: "Landscape study" },
  { image: "portrait-02.jpg", category: "portrait", title: "The Sunday best", tag: "Portrait study" },
  { image: "vintage-01.jpg", category: "vintage", title: "A road remembered", tag: "Vintage study" },
  { image: "family-02.jpg", category: "family", title: "A day together", tag: "Family study" },
  { image: "portrait-03.jpg", category: "portrait", title: "A moment in time", tag: "Portrait study" },
  { image: "landscape-02.jpg", category: "landscape", title: "Into the woods", tag: "Landscape study" },
];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const visibleExamples = examples.filter(
    (example) => activeCategory === "all" || example.category === activeCategory,
  );

  return (
    <main className="gallery-page">
      <header className="gallery-heading">
        <div className="page-shell">
          <span className="eyebrow">A little inspiration</span>
          <h1>See the <em>transformation.</em></h1>
          <p>
            Explore sample photographs with an illustrative color treatment.
              These are design previews, not photos restored by Real-ESRGAN.
          </p>
          <div className="filter-list" aria-label="Filter examples">
            {categories.map(([value, label]) => (
              <button
                aria-pressed={activeCategory === value}
                className={`filter-button${activeCategory === value ? " is-active" : ""}`}
                key={value}
                onClick={() => setActiveCategory(value)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="page-shell gallery-content" aria-label="Illustrative photo comparisons">
        <p className="preview-notice">
          <Sparkles size={16} aria-hidden="true" />
          Slide any divider to compare a color photo with a gentle vintage tint. This is a visual mockup only.
        </p>
        <div className="gallery-grid">
          {visibleExamples.map((example) => (
            <article className="gallery-card" key={example.image}>
              <ComparisonSlider
                compact
                image={`/images/${example.image}`}
                imageAlt={`${example.title}, shown as an illustrative color-treatment preview`}
                initialPosition={54}
              />
              <div className="gallery-card-caption">
                <div>
                  <span>{example.tag}</span>
                  <h2>{example.title}</h2>
                </div>
                <Sparkles size={17} aria-hidden="true" />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="gallery-cta page-shell">
        <span className="eyebrow eyebrow-light">Your memories, next</span>
        <h2>Ready to make a little more room for the past?</h2>
        <p>Photo upload will be available when the restoration service is connected.</p>
        <Link className="button button-light" to="/restore#restore" viewTransition>
          Explore Revive <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}
