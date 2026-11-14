import { Menu, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <nav className="nav-wrap" aria-label="Main navigation">
        <Link className="brand" to="/" onClick={closeMenu} aria-label="Revive home" viewTransition>
          <span className="brand-mark">
            <Sparkles size={20} aria-hidden="true" />
          </span>
          <span>Revive</span>
        </Link>

        <button
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className={`nav-content${menuOpen ? " is-open" : ""}`}>
          <div className="nav-links">
            <a href="/#how-it-works" onClick={closeMenu}>
              How it works
            </a>
            <NavLink
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={closeMenu}
              to="/pricing"
              viewTransition
            >
              Pricing
            </NavLink>
            <NavLink
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={closeMenu}
              to="/showcase"
              viewTransition
            >
              Showcase
            </NavLink>
          </div>
          <div className="nav-actions">
            <button
              className="login-button"
              disabled
              title="Sign-in is not connected yet"
              type="button"
            >
              Log in
            </button>
            <a className="button button-primary nav-cta" href="/#restore" onClick={closeMenu}>
              Start restoring
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}
