"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/retos", label: "Retos" },
  { href: "/torneos", label: "Torneos" },
  { href: "/ladder", label: "Ladder" },
  { href: "/ranking", label: "Ranking" },
  { href: "/comunidad", label: "Comunidad" },
  { href: "/tienda", label: "Tienda" },
  { href: "/pulso", label: "Pulso" },
];

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

  useEffect(() => {
    try {
      const cookie = document.cookie.split("; ").find(c => c.startsWith("phoenix_user="));
      if (cookie) {
        const data = JSON.parse(decodeURIComponent(cookie.split("=").slice(1).join("=")));
        setUser(data);
      }
    } catch { /* no session */ }
  }, []);

  useEffect(() => { setMobileOpen(false); setDropdownOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = () => setDropdownOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [dropdownOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border" style={{ background: "rgba(8,8,15,0.92)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
      <nav className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img src="/logo-emblem.png" alt="Phoenix Arena" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full" />
          <span className="text-gradient text-base sm:text-lg font-bold tracking-tight hidden sm:inline">PHOENIX ARENA</span>
          <span className="text-gradient text-base font-bold tracking-tight sm:hidden">PHOENIX</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-0.5">
          {navLinks.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive ? "text-red-400 bg-red-500/10" : "text-muted hover:text-foreground hover:bg-surface-2"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop actions */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 border border-border rounded-xl shadow-2xl overflow-hidden z-50" style={{ background: "rgba(13,13,24,0.97)", backdropFilter: "blur(20px)" }}>
                  <Link href="/perfil" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-surface-2 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    Mi Perfil
                  </Link>
                  <Link href="/wallet" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-surface-2 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                    Monedero
                  </Link>
                  <Link href="/boveda" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-surface-2 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 0 0-8 0v2"/></svg>
                    Mi Boveda
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
            <>
              <Link href="/login" className="border border-border-light text-foreground hover:bg-surface-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors">
                Iniciar Sesion
              </Link>
              <Link href="/registro" className="bg-gradient-main text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity">
                Registrarse
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 text-foreground"
          aria-label="Menu"
        >
          {mobileOpen ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-6 w-6"><path d="M6 6l12 12M18 6L6 18" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-6 w-6"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </nav>

      {/* ── Mobile fullscreen menu ───────────────────────────── */}
      <div
        className={`fixed inset-0 top-14 sm:top-16 z-50 lg:hidden transition-all duration-300 ${
          mobileOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        {/* Solid dark background — NOT transparent */}
        <div className="absolute inset-0" style={{ background: "rgba(8,8,15,0.98)" }} onClick={() => setMobileOpen(false)} />

        {/* Menu content */}
        <div className={`relative h-full overflow-y-auto transition-transform duration-300 ${mobileOpen ? "translate-y-0" : "-translate-y-4"}`}>
          <div className="flex flex-col p-6 pb-24">
            {/* User card (mobile) */}
            {user && (
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} className="w-12 h-12 rounded-full border-2 border-border" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-main flex items-center justify-center text-white text-sm font-bold">
                    {user.username.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-base font-semibold truncate">{user.username}</p>
                  <p className="text-sm text-muted capitalize">{user.provider}</p>
                </div>
              </div>
            )}

            {/* Nav links — big and easy to tap */}
            <div className="space-y-1">
              {navLinks.map((link) => {
                const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-4 py-4 text-base font-medium rounded-xl transition-colors ${
                      isActive ? "text-red-400 bg-red-500/10 border border-red-500/20" : "text-foreground hover:bg-surface-2"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* User actions or auth buttons */}
            <div className="mt-8 pt-6 border-t border-border space-y-2">
              {user ? (
                <>
                  {[
                    { href: "/perfil", label: "Mi Perfil" },
                    { href: "/wallet", label: "Monedero" },
                    { href: "/boveda", label: "Mi Boveda" },
                    { href: "/resultados", label: "Resultados" },
                  ].map((link) => (
                    <Link key={link.href} href={link.href} className="block px-4 py-3.5 text-base font-medium rounded-xl text-muted hover:text-foreground hover:bg-surface-2 transition-colors">
                      {link.label}
                    </Link>
                  ))}
                  <a href="/api/auth/logout" className="block px-4 py-3.5 text-base font-medium rounded-xl text-red-400 hover:bg-red-500/10 transition-colors mt-4 border border-red-500/20 text-center">
                    Cerrar sesion
                  </a>
                </>
              ) : (
                <>
                  <Link href="/login" className="block py-4 rounded-xl border border-border text-base font-semibold text-foreground text-center hover:bg-surface-2 transition-colors">
                    Iniciar Sesion
                  </Link>
                  <Link href="/registro" className="block py-4 rounded-xl bg-gradient-main text-white text-base font-semibold text-center hover:opacity-90 transition-opacity">
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
