import { Check, Minus, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    description: "For occasional restorations",
    monthly: 0,
    features: [
      "4× image upscaling",
      "JPEG, PNG, or WebP input",
      "WebP image download",
    ],
  },
  {
    name: "Pro Heritage",
    description: "For families and enthusiasts",
    monthly: 19,
    popular: true,
    features: [
      "Everything in Starter",
      "Up to 8 MB per image",
      "Up to 3 megapixels per image",
      "One image per request",
    ],
  },
  {
    name: "Studio",
    description: "For museums and professionals",
    monthly: 89,
    features: [
      "Everything in Pro",
      "Real-ESRGAN x4 model",
      "Single-image processing",
      "No batch processing",
    ],
  },
];

const comparison = [
  ["Upscaling model", "Real-ESRGAN x4", "Real-ESRGAN x4", "Real-ESRGAN x4"],
  ["Maximum upscale", "4×", "4×", "4×"],
  ["Input formats", "JPEG, PNG, WebP", "JPEG, PNG, WebP", "JPEG, PNG, WebP"],
  ["Maximum image size", "8 MB / 3 MP", "8 MB / 3 MP", "8 MB / 3 MP"],
  ["Dedicated scratch repair", false, false, false],
  ["Black-and-white colorization", false, false, false],
  ["Batch processing", false, false, false],
  ["Persistent cloud storage", false, false, false],
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);

  return (
    <main className="pricing-page">
      <header className="page-heading page-shell">
        <span className="eyebrow">Plans for the photographs you treasure</span>
        <h1>Simple, thoughtful <em>pricing.</em></h1>
        <p>
          A plan for a few family heirlooms, or for the whole archive. These
          draft tiers are illustrative and are not available to purchase.
        </p>
        <div className="billing-switch">
          <span className={!yearly ? "billing-active" : ""}>Monthly</span>
          <button
            aria-checked={yearly}
            aria-label="Toggle annual billing"
            className={`switch${yearly ? " switch-on" : ""}`}
            onClick={() => setYearly((value) => !value)}
            role="switch"
            type="button"
          >
            <span />
          </button>
          <span className={yearly ? "billing-active" : ""}>
            Yearly <small>Save 20%</small>
          </span>
        </div>
      </header>

      <section className="page-shell pricing-content" aria-label="Illustrative pricing plans">
        <p className="preview-notice">
          <Sparkles size={16} aria-hidden="true" />
          Preview only — prices, features, checkout, and restoration credits are not live.
        </p>
        <div className="plans-grid">
          {plans.map((plan) => {
            const price = yearly ? Math.round(plan.monthly * 0.8) : plan.monthly;
            return (
              <article
                className={`plan-card${plan.popular ? " plan-featured" : ""}`}
                key={plan.name}
              >
                {plan.popular && <span className="popular-tag">Most popular</span>}
                <h2>{plan.name}</h2>
                <p className="plan-description">{plan.description}</p>
                <p className="plan-price">
                  <strong>${price}</strong>
                  <span>{plan.monthly === 0 ? "/ forever" : `/ month${yearly ? ", billed yearly" : ""}`}</span>
                </p>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}><Check size={16} aria-hidden="true" />{feature}</li>
                  ))}
                  {plan.name === "Starter" && (
                    <li className="plan-muted"><Minus size={16} aria-hidden="true" />Batch processing</li>
                  )}
                </ul>
                <Link
                  className={`button ${plan.popular ? "button-primary" : "button-secondary"}`}
                  to="/#restore"
                  viewTransition
                >
                  {plan.name === "Studio" ? "Contact sales" : "Get started"}
                </Link>
              </article>
            );
          })}
        </div>

        <div className="comparison-table-wrap">
          <h2>Compare the details</h2>
          <table className="comparison-table">
            <thead>
              <tr>
                <th scope="col">Included</th>
                {plans.map((plan) => <th scope="col" key={plan.name}>{plan.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {comparison.map(([label, ...values]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  {values.map((value, index) => (
                    <td key={`${label}-${plans[index].name}`}>
                      {typeof value === "boolean"
                        ? value
                          ? <Check className="table-check" size={17} aria-label="Included" />
                          : <Minus className="table-minus" size={17} aria-label="Not included" />
                        : value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="pricing-cta page-shell">
        <span className="eyebrow eyebrow-light">Not sure where to start?</span>
        <h2>Start with a story, not a subscription.</h2>
        <p>Pricing is only a preview. Try the 4× photo upscaler without a subscription.</p>
        <Link className="button button-light" to="/#restore" viewTransition>Try photo upscaling</Link>
      </section>
    </main>
  );
}
