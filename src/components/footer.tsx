import Link from "next/link";

function PhoenixLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="phoenix-grad-footer" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <path
        d="M12 2C12 2 9.5 6 9.5 9C9.5 10.5 10 11.5 10.5 12.5C9 11 7 10 7 10C7 10 8 13 9.5 15C10.2 15.9 11 16.5 12 17C13 16.5 13.8 15.9 14.5 15C16 13 17 10 17 10C17 10 15 11 13.5 12.5C14 11.5 14.5 10.5 14.5 9C14.5 6 12 2 12 2Z"
        fill="url(#phoenix-grad-footer)"
      />
      <path
        d="M12 17C12 17 10 19 10 20.5C10 21.6 10.9 22.5 12 22.5C13.1 22.5 14 21.6 14 20.5C14 19 12 17 12 17Z"
        fill="url(#phoenix-grad-footer)"
        opacity="0.7"
      />
    </svg>
  );
}

const platformLinks = [
  { href: "/retos", label: "Retos" },
  { href: "/torneos", label: "Torneos" },
  { href: "/ranking", label: "Ranking" },
  { href: "/wallet", label: "Monedero" },
];

const infoLinks = [
  { href: "/como-funciona", label: "Como Funciona" },
  { href: "/ayuda", label: "Centro de Ayuda" },
  { href: "/legal/seguridad", label: "Seguridad" },
  { href: "/socios", label: "Para Socios" },
];

const legalLinks = [
  { href: "/legal/terminos", label: "Terminos y Condiciones" },
  { href: "/legal/pagos", label: "Politica de Pagos" },
  { href: "/legal/privacidad", label: "Privacidad" },
  { href: "/legal/competencia", label: "Competencia de Habilidad" },
];

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-muted text-sm hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <PhoenixLogo />
              <span className="text-gradient text-lg font-bold tracking-tight">
                PHOENIX ARENA
              </span>
            </Link>
            <p className="text-muted text-sm leading-relaxed max-w-xs">
              La plataforma competitiva de referencia para jugadores de LATAM.
            </p>
          </div>

          <FooterColumn title="Plataforma" links={platformLinks} />
          <FooterColumn title="Informacion" links={infoLinks} />
          <FooterColumn title="Legal" links={legalLinks} />
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-muted text-xs">
            2026 Phoenix Arena. Todos los derechos reservados.
          </p>
          <p className="text-muted text-xs text-center sm:text-right">
            Plataforma de competencia de habilidad. No es un servicio de apuestas.
          </p>
        </div>
      </div>
    </footer>
  );
}
