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
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="phoenix-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <path d="M12 2C12 2 9.5 6 9.5 9C9.5 10.5 10 11.5 10.5 12.5C9 11 7 10 7 10C7 10 8 13 9.5 15C10.2 15.9 11 16.5 12 17C13 16.5 13.8 15.9 14.5 15C16 13 17 10 17 10C17 10 15 11 13.5 12.5C14 11.5 14.5 10.5 14.5 9C14.5 6 12 2 12 2Z" fill="url(#phoenix-grad)" />
      <path d="M12 17C12 17 10 19 10 20.5C10 21.6 10.9 22.5 12 22.5C13.1 22.5 14 21.6 14 20.5C14 19 12 17 12 17Z" fill="url(#phoenix-grad)" opacity="0.7" />
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

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

interface UserInfo {
  username: string;
  avatar: string;
  provider: string;
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  /* Read user cookie on mount */
  useEffect(() => {
    try {
      const cookie = document.cookie.split("; ").find(c => c.startsWith("phoenix_user="));
      if (cookie) {
        const data = JSON.parse(decodeURIComponent(cookie.split("=").slice(1).join("=")));
        setUser(data);
      }
    } catch { /* no session */ }
  }, []);

  /* close mobile nav on route change */
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  /* lock body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  /* close dropdown on click outside */
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = () => setDropdownOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [dropdownOpen]);

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
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive ? "text-red-400" : "text-muted hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            /* ── Logged in state ── */
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen); }}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-border hover:border-border-light transition-colors"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} className="w-7 h-7 rounded-full" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-main flex items-center justify-center text-white text-xs font-bold">
                    {user.username.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium max-w-[120px] truncate">{user.username}</span>
                <ChevronDown />
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-50">
                  <Link href="/perfil" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-surface-2 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    Mi Perfil
                  </Link>
                  <Link href="/wallet" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-surface-2 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                    Monedero
                  </Link>
                  <Link href="/resultados" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-surface-2 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                    Resultados
                  </Link>
                  <div className="border-t border-border">
                    <a href="/api/auth/logout" className="flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                      Cerrar sesion
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── Logged out state ── */
            <>
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
            </>
          )}
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
          {/* User info (mobile) */}
          {user && (
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-9 h-9 rounded-full" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-main flex items-center justify-center text-white text-xs font-bold">
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{user.username}</p>
                <p className="text-xs text-muted capitalize">{user.provider}</p>
              </div>
            </div>
          )}

          {navLinks.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive ? "text-red-400 bg-surface-2" : "text-muted hover:text-foreground hover:bg-surface-2"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="mt-6 pt-6 border-t border-border flex flex-col gap-3">
            {user ? (
              <>
                <Link href="/perfil" className="px-4 py-3 text-sm font-medium rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-colors">
                  Mi Perfil
                </Link>
                <Link href="/wallet" className="px-4 py-3 text-sm font-medium rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-colors">
                  Monedero
                </Link>
                <a
                  href="/api/auth/logout"
                  className="border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg px-4 py-3 text-sm font-medium text-center transition-colors"
                >
                  Cerrar sesion
                </a>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
