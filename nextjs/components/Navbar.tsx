"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/blog", label: "Blog" },
  { href: "/team", label: "Team" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-navy-900/70 backdrop-blur-xl border-b border-white/10 shadow-lg py-2 md:py-3"
          : "bg-transparent py-3 md:py-5"
      )}
    >
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/images/logo.png"
            alt="ARX Infotech"
            width={445}
            height={102}
            className="h-8 md:h-12 w-auto"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <ul className="hidden lg:flex items-center gap-3 ml-auto">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded text-sm font-semibold font-poppins transition-colors duration-200",
                  pathname === link.href
                    ? "text-gold-400"
                    : "text-white hover:text-gold-400"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/verify"
              className="ml-2 px-4 py-2 bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold font-poppins text-sm rounded transition-colors duration-200"
            >
              Verify
            </Link>
          </li>
        </ul>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="lg:hidden text-white p-1 ml-auto"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-navy-900 border-t border-white/10 px-4 py-3">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "block px-3 py-2 rounded text-sm font-semibold font-poppins transition-colors duration-200",
                    pathname === link.href
                      ? "text-gold-400"
                      : "text-white hover:text-gold-400"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/verify"
                className="block mt-2 px-4 py-2 bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold font-poppins text-sm rounded text-center transition-colors duration-200"
              >
                Verify
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}

