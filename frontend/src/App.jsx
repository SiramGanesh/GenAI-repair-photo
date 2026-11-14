import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Footer from "./components/Footer.jsx";
import Navigation from "./components/Navigation.jsx";
import GalleryPage from "./pages/GalleryPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import PricingPage from "./pages/PricingPage.jsx";
import { Link } from "react-router-dom";

function ScrollToHash() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    target?.scrollIntoView();
  }, [hash, pathname]);

  return null;
}

function NotFoundPage() {
  return (
    <main className="not-found page-shell">
      <span className="eyebrow">Lost in the album?</span>
      <h1>We couldn't find that page.</h1>
      <Link className="button button-primary" to="/" viewTransition>
        Back to Revive
      </Link>
    </main>
  );
}

export default function App() {
  return (
    <>
      <ScrollToHash />
      <Navigation />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/showcase" element={<GalleryPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </>
  );
}
