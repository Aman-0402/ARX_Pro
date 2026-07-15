import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/blog", label: "Blog" },
  { to: "/team", label: "Team" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  if (location.pathname.startsWith("/admin")) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src="/images/logo.png" alt="ARX Infotech" className="h-9 w-auto" />
          <span className="hidden sm:block leading-tight">
            <span className="block font-bold text-navy-900">ARX INFOTECH</span>
            <span className="block text-[10px] text-gray-500 tracking-wide">
              AI Powered Smart Innovation Company
            </span>
          </span>
        </Link>

        <button
          type="button"
          className="md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          {menuOpen ? "Close" : "Menu"}
        </button>

        <ul className="hidden gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={
                  location.pathname === link.to ? "font-semibold text-blue-600" : "text-gray-700"
                }
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          to="/verify"
          className="hidden md:inline-block bg-gold-400 text-navy-900 text-sm font-bold px-4 py-2 rounded hover:bg-gold-500"
        >
          Verify
        </Link>
      </div>

      {menuOpen && (
        <ul className="flex flex-col gap-2 px-4 pb-4 md:hidden">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <Link to={link.to} onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/verify" onClick={() => setMenuOpen(false)}>
              Verify
            </Link>
          </li>
        </ul>
      )}
    </nav>
  );
}
