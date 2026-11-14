import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <Link className="brand footer-brand" to="/restore" viewTransition>
          <span className="brand-mark">
            <Sparkles size={18} aria-hidden="true" />
          </span>
          <span>Revive</span>
        </Link>
        <p>Made for the memories worth keeping.</p>
        <div className="footer-links">
          <Link to="/pricing" viewTransition>Pricing</Link>
          <Link to="/showcase" viewTransition>Showcase</Link>
          <span>Contact coming soon</span>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Revive</span>
        <span>Powered by Real-ESRGAN x4</span>
      </div>
    </footer>
  );
}
