import { ArrowLeftRight } from "lucide-react";
import { useRef, useState } from "react";

export default function ComparisonSlider({
  image,
  imageAlt,
  beforeImage,
  afterImage,
  initialPosition = 50,
  compact = false,
}) {
  const [position, setPosition] = useState(initialPosition);
  const containerRef = useRef(null);

  const updatePosition = (clientX) => {
    const bounds = containerRef.current?.getBoundingClientRect();
    if (!bounds || bounds.width === 0) return;
    const nextPosition = ((clientX - bounds.left) / bounds.width) * 100;
    setPosition(Math.min(100, Math.max(0, nextPosition)));
  };

  const onPointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    updatePosition(event.clientX);
  };

  const onPointerMove = (event) => {
    if (event.buttons !== 1 && event.pointerType !== "touch") return;
    updatePosition(event.clientX);
  };

  const onKeyDown = (event) => {
    const step = event.shiftKey ? 10 : 2;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setPosition((value) => Math.max(0, value - step));
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setPosition((value) => Math.min(100, value + step));
    }
    if (event.key === "Home") setPosition(0);
    if (event.key === "End") setPosition(100);
  };

  return (
    <div
      className={`comparison${compact ? " comparison-compact" : ""}${afterImage ? " comparison-restored" : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      ref={containerRef}
    >
      <img className="comparison-photo comparison-after" src={afterImage || image} alt={imageAlt} />
      <div
        aria-hidden="true"
        className="comparison-before"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <img
          className="comparison-photo"
          src={beforeImage || image}
          alt=""
          style={beforeImage ? undefined : { filter: "grayscale(1) sepia(.34) brightness(.78) contrast(.88)" }}
        />
      </div>
      <span className="comparison-label comparison-label-before">Before</span>
      <span className="comparison-label comparison-label-after">
        {afterImage ? "Restored · 4×" : "Color preview"}
      </span>
      <div
        aria-label="Illustrative photo comparison divider"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={Math.round(position)}
        className="comparison-handle"
        onKeyDown={onKeyDown}
        role="slider"
        style={{ left: `${position}%` }}
        tabIndex={0}
      >
        <span className="comparison-knob">
          <ArrowLeftRight size={compact ? 14 : 18} aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}
