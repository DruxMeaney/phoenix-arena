"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/retos", label: "Retos" },
  { href: "/torneos", label: "Torneos" },
  { href: "/ranking", label: "Ranking" },
  { href: "/como-funciona", label: "Como Funciona" },
];

function PhoenixLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="phoenix-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <path
        d="M12 2C12 2 9.5 6 9.5 9C9.5 10.5 10 11.5 10.5 12.5C9 11 7 10 7 10C7 10 8 13 9.5 15C10.2 15.9 11 16.5 12 17C13 16.5 13.8 15.9 14.5 15C16 13 17 10 17 10C17 10 15 11 13.5 12.5C14 11.5 14.5 10.5 14.5 9C14.5 6 12 2 12 2Z"
        fill="url(#phoenix-grad)"
      />
      <path
        d="M12 17C12 17 10 19 10 20.5C10 21.6 10.9 22.5 12 22.5C13.1 22.5 14 21.6 14 20.5C14 19 12 17 12 17Z"
        fill="url(#phoenix-grad)"
        opacity="0.7"
      />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="h-6 w-6">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="h-6 w-6">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  /* close mobile nav on route change */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  /* lock body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-lg border-b border-border">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <PhoenixLogo />
          <span className="text-gradient text-lg font-bold tracking-tight">PHOENIX ARENA</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "text-red-400"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="border border-border-light text-foreground hover:bg-surface-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            Iniciar Sesion
          </Link>
          <Link
            href="/registro"
            className="bg-gradient-main text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Registrarse
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-muted hover:text-foreground transition-colors"
          aria-label="Menu"
        >
          {mobileOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>
      </nav>

      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 top-16 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile slide-over */}
      <div
        className={`fixed top-16 right-0 bottom-0 w-72 bg-surface border-l border-border z-50 md:hidden transition-transform duration-300 ease-out ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col p-6 gap-1">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "text-red-400 bg-surface-2"
                    : "text-muted hover:text-foreground hover:bg-surface-2"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="mt-6 pt-6 border-t border-border flex flex-col gap-3">
            <Link
              href="/login"
              className="border border-border-light text-foreground hover:bg-surface-2 rounded-lg px-4 py-3 text-sm font-medium text-center transition-colors"
            >
              Iniciar Sesion
            </Link>
            <Link
              href="/registro"
              className="bg-gradient-main text-white rounded-lg px-4 py-3 text-sm font-medium text-center hover:opacity-90 transition-opacity"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
