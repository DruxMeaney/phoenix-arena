import Link from "next/link";

/* ─── Inline SVG Icons ─── */

function IconCrosshair({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    </svg>
  );
}

function IconWallet({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="6" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <path d="M16 14h.01" />
      <path d="M22 6V5a2 2 0 00-2-2H6a2 2 0 00-2 2v1" />
    </svg>
  );
}

function IconTrophy({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2" />
      <path d="M18 9h2a2 2 0 002-2V5a2 2 0 00-2-2h-2" />
      <path d="M6 3h12v7a6 6 0 01-12 0V3z" />
      <path d="M9 21h6" />
      <path d="M12 16v5" />
    </svg>
  );
}

function IconBracket({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 4v4h4" />
      <path d="M4 8h4v8" />
      <path d="M4 20v-4h4" />
      <path d="M8 12h4" />
      <path d="M20 4v4h-4" />
      <path d="M20 8h-4v8" />
      <path d="M20 20v-4h-4" />
      <path d="M16 12h-4" />
    </svg>
  );
}

function IconCheckCircle({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12l3 3 5-5" />
    </svg>
  );
}

function IconShieldLock({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2l8 4v5c0 5.25-3.5 9.74-8 11-4.5-1.26-8-5.75-8-11V6l8-4z" />
      <rect x="10" y="10" width="4" height="5" rx="1" />
      <circle cx="12" cy="9" r="1.5" />
    </svg>
  );
}

function IconLock({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 018 0v4" />
    </svg>
  );
}

function IconScale({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 3v18" />
      <path d="M5 7l7-4 7 4" />
      <path d="M5 7l-2 8h6L5 7z" />
      <path d="M19 7l-2 8h6l-4-8z" />
    </svg>
  );
}

function IconUserCheck({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M16 11l2 2 4-4" />
    </svg>
  );
}

function IconCheck({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

function ChevronIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function IconCalendar({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function IconUsers({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

/* ─── Data ─── */

const steps = [
  { n: 1, title: "Registrate", desc: "Crea tu cuenta gratuita en menos de un minuto. Solo necesitas un correo y tu gamertag." },
  { n: 2, title: "Deposita fondos", desc: "Agrega saldo a tu monedero de forma segura con los metodos de pago disponibles para tu region." },
  { n: 3, title: "Crea o acepta un reto", desc: "Define el juego, el monto y las reglas, o explora los retos disponibles y acepta el que prefieras." },
  { n: 4, title: "Juega tu partida", desc: "Conecta con tu rival y compite. El resultado depende unicamente de tu habilidad." },
  { n: 5, title: "Reporta resultado", desc: "Sube evidencia de tu partida (captura o clip). Ambos jugadores confirman el desenlace." },
  { n: 6, title: "Confirma o disputa", desc: "Si ambos acuerdan, el premio se libera al instante. Si no, un admin revisa la evidencia." },
  { n: 7, title: "Recibe tu premio", desc: "El ganador recibe los fondos directamente en su monedero, listos para retirar." },
  { n: 8, title: "Sube en el ranking", desc: "Cada victoria suma puntos a tu perfil. Escala de Detri a AM y de AM a PRO." },
];

const features = [
  {
    icon: <IconCrosshair className="h-7 w-7 text-red-400" />,
    title: "Retos 1v1, Duo y Trio",
    desc: "Elige tu modalidad, define el monto y las reglas. Encuentra oponentes al instante.",
  },
  {
    icon: <IconWallet className="h-7 w-7 text-blue-400" />,
    title: "Monedero Seguro",
    desc: "Depositos rapidos, retiros confiables. Tu dinero protegido con trazabilidad completa.",
  },
  {
    icon: <IconTrophy className="h-7 w-7 text-red-400" />,
    title: "Ranking Competitivo",
    desc: "Sistema de puntuacion profesional. Tiers PRO, AM y Detri basados en desempeno real.",
  },
  {
    icon: <IconBracket className="h-7 w-7 text-blue-400" />,
    title: "Torneos Organizados",
    desc: "Brackets, inscripciones y bolsas de premios automaticas.",
  },
  {
    icon: <IconCheckCircle className="h-7 w-7 text-red-400" />,
    title: "Resultados Transparentes",
    desc: "Evidencia, confirmacion y resolucion de disputas justo y verificable.",
  },
  {
    icon: <IconShieldLock className="h-7 w-7 text-blue-400" />,
    title: "Seguridad Integral",
    desc: "Verificacion de usuarios, deteccion de multi-cuentas y registro de actividad.",
  },
];

const trustCards = [
  {
    icon: <IconLock className="h-8 w-8 text-red-400" />,
    title: "Fondos Seguros",
    bullets: [
      "Sistema de escrow: el dinero se resguarda hasta que hay un ganador confirmado",
      "Comisiones transparentes mostradas antes de cada reto",
      "Historial completo de transacciones disponible en tu monedero",
    ],
  },
  {
    icon: <IconScale className="h-8 w-8 text-blue-400" />,
    title: "Fair Play Garantizado",
    bullets: [
      "Evidencia obligatoria (capturas o clips) para cada resultado",
      "Revision administrativa imparcial en caso de disputa",
      "Proceso completamente documentado y auditable",
    ],
  },
  {
    icon: <IconUserCheck className="h-8 w-8 text-red-400" />,
    title: "Identidad Verificada",
    bullets: [
      "Verificacion de identidad para retiros y actividad competitiva",
      "Restriccion por IP y dispositivo para evitar multi-cuentas",
      "Logs de actividad para proteger la integridad de cada partida",
    ],
  },
];

const rankingData = [
  { pos: 1, name: "GeroBeta", tier: "PRO", score: 87.4, wins: 142, matches: 163 },
  { pos: 2, name: "ArrobaJota", tier: "PRO", score: 82.1, wins: 128, matches: 156 },
  { pos: 3, name: "Juancho", tier: "AM", score: 65.2, wins: 89, matches: 137 },
  { pos: 4, name: "NexusFire", tier: "AM", score: 58.7, wins: 74, matches: 126 },
  { pos: 5, name: "ZetaKill", tier: "Detri", score: 34.5, wins: 41, matches: 119 },
];

const tiers = [
  { name: "PRO", badge: "badge-pro", range: "75 — 100", desc: "Jugadores de elite con rendimiento excepcional y consistencia demostrada." },
  { name: "AM", badge: "badge-am", range: "40 — 74.9", desc: "Competidores solidos en camino a la cima. Gran potencial de crecimiento." },
  { name: "Detri", badge: "badge-detri", range: "0 — 39.9", desc: "Nuevos jugadores o en racha negativa. Cada victoria cuenta para escalar." },
];

const tournaments = [
  {
    name: "Copa Phoenix Semanal",
    game: "FIFA 25",
    prize: "$500",
    entry: "$10",
    spots: "32 / 64",
    status: "Inscripciones abiertas",
    statusColor: "text-success",
  },
  {
    name: "Duelo de Leyendas",
    game: "Call of Duty: Warzone",
    prize: "$1,000",
    entry: "$25",
    spots: "12 / 16",
    status: "Casi lleno",
    statusColor: "text-warning",
  },
  {
    name: "Arena Nocturna",
    game: "Fortnite",
    prize: "$250",
    entry: "$5",
    spots: "64 / 128",
    status: "Inscripciones abiertas",
    statusColor: "text-success",
  },
];

const faqs = [
  {
    q: "Phoenix Arena es un sitio de apuestas?",
    a: "No. Phoenix Arena es una plataforma de competencia de habilidad. Los resultados dependen exclusivamente de tu desempeno en el juego, no del azar. Operamos bajo el modelo de skill-based competition, legal en la mayoria de jurisdicciones de LATAM.",
  },
  {
    q: "Como deposito y retiro fondos?",
    a: "Aceptamos transferencias bancarias, billeteras digitales y otros metodos regionales. Los depositos se acreditan en minutos y los retiros se procesan en 24-48 horas habiles. Todo queda registrado en tu historial de monedero.",
  },
  {
    q: "Que pasa si hay una disputa en el resultado?",
    a: "Si ambos jugadores no coinciden en el resultado, se abre un proceso de disputa. Un administrador revisa la evidencia (capturas o clips) que ambas partes subieron y emite una resolucion justa y documentada.",
  },
  {
    q: "Que juegos estan disponibles?",
    a: "Actualmente soportamos FIFA, Call of Duty, Fortnite y otros titulos populares. Estamos agregando nuevos juegos constantemente basandonos en la demanda de nuestra comunidad.",
  },
  {
    q: "Como funciona el sistema de ranking?",
    a: "Tu score se calcula en base a victorias, derrotas y el nivel de tus oponentes. Hay tres tiers: PRO (75-100), AM (40-74.9) y Detri (0-39.9). Gana partidas contra rivales fuertes para subir mas rapido.",
  },
  {
    q: "Que comision cobra Phoenix Arena?",
    a: "Cobramos una comision fija y transparente sobre cada reto, visible antes de que confirmes tu participacion. No hay cargos ocultos. La comision cubre el escrow, la infraestructura y el soporte de la plataforma.",
  },
];

/* ─── Helpers ─── */

function tierBadge(tier: string) {
  const cls = tier === "PRO" ? "badge-pro" : tier === "AM" ? "badge-am" : "badge-detri";
  return (
    <span className={`${cls} inline-block text-xs font-bold px-2.5 py-0.5 rounded-full`}>
      {tier}
    </span>
  );
}

/* ─── Page ─── */

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* ════════ HERO ════════ */}
      <section className="bg-gradient-hero relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
        {/* Decorative blurred circles */}
        <div className="pointer-events-none absolute -left-32 top-20 h-[420px] w-[420px] rounded-full bg-red-500/[.08] blur-[120px]" />
        <div className="pointer-events-none absolute -right-32 top-40 h-[380px] w-[380px] rounded-full bg-blue-500/[.06] blur-[120px]" />

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-tight animate-fade-up">
            Compite. Demuestra tu <span className="text-gradient">Habilidad</span>. Gana.
          </h1>
          <p className="mt-6 mx-auto max-w-2xl text-lg text-muted leading-relaxed animate-fade-up" style={{ animationDelay: ".1s" }}>
            La plataforma donde tu nivel de juego se traduce en premios reales. Retos 1v1, torneos y ranking profesional para jugadores de LATAM.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: ".2s" }}>
            <Link
              href="/registro"
              className="bg-gradient-main text-white rounded-xl px-8 py-3.5 font-semibold text-base glow hover:opacity-90 transition-opacity"
            >
              Empieza a Competir
            </Link>
            <Link
              href="/como-funciona"
              className="border border-border-light rounded-xl px-8 py-3.5 font-semibold text-base text-foreground hover:bg-surface-2 transition-colors"
            >
              Como Funciona
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 animate-fade-up" style={{ animationDelay: ".3s" }}>
            {[
              { value: "500+", label: "Jugadores Activos" },
              { value: "$50,000+", label: "En Premios" },
              { value: "1,000+", label: "Partidas" },
              { value: "99.5%", label: "Pagos Exitosos" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-gradient text-2xl sm:text-3xl font-bold">{stat.value}</div>
                <div className="text-muted text-xs sm:text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ FLOW ════════ */}
      <section className="bg-surface py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Tu camino a la victoria</h2>
            <p className="mt-3 text-muted max-w-xl mx-auto">De registro a campeon en 8 pasos simples. Sin complicaciones, sin letra chica.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s) => (
              <div key={s.n} className="bg-surface-2 border border-border rounded-xl p-6 card-hover">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-main text-white text-sm font-bold mb-4">
                  {s.n}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ MODULES ════════ */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Todo lo que necesitas para competir</h2>
            <p className="mt-3 text-muted max-w-xl mx-auto">Herramientas disenadas para que solo te preocupes por ganar.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="bg-surface border border-border rounded-xl p-6 card-hover">
                <div className="mb-4">{f.icon}</div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ TRUST ════════ */}
      <section className="bg-surface py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Tu competencia, protegida</h2>
            <p className="mt-3 text-muted max-w-xl mx-auto">Transparencia, seguridad y fair play son la base de todo lo que hacemos.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {trustCards.map((card) => (
              <div key={card.title} className="bg-surface-2 border border-border rounded-xl p-6 card-hover">
                <div className="mb-4">{card.icon}</div>
                <h3 className="font-semibold text-foreground text-lg mb-4">{card.title}</h3>
                <ul className="space-y-3">
                  {card.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-0.5 text-success shrink-0">
                        <IconCheck className="h-4 w-4" />
                      </span>
                      <span className="text-muted text-sm leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ RANKING PREVIEW ════════ */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ranking Phoenix Arena</h2>
            <p className="mt-3 text-muted max-w-xl mx-auto">Los mejores jugadores de la plataforma. Compite para ver tu nombre aqui.</p>
          </div>

          {/* Table */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden mb-10">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted text-xs uppercase tracking-wider">
                    <th className="text-left px-5 py-3.5 font-medium">#</th>
                    <th className="text-left px-5 py-3.5 font-medium">Jugador</th>
                    <th className="text-left px-5 py-3.5 font-medium">Tier</th>
                    <th className="text-left px-5 py-3.5 font-medium">Score</th>
                    <th className="text-left px-5 py-3.5 font-medium hidden sm:table-cell">Victorias</th>
                    <th className="text-left px-5 py-3.5 font-medium hidden sm:table-cell">Partidas</th>
                  </tr>
                </thead>
                <tbody>
                  {rankingData.map((p) => (
                    <tr key={p.pos} className="border-b border-border/50 hover:bg-surface-2/50 transition-colors">
                      <td className="px-5 py-4 font-medium text-muted">{p.pos}</td>
                      <td className="px-5 py-4 font-semibold text-foreground">{p.name}</td>
                      <td className="px-5 py-4">{tierBadge(p.tier)}</td>
                      <td className="px-5 py-4 text-red-400 font-semibold">{p.score}</td>
                      <td className="px-5 py-4 text-muted hidden sm:table-cell">{p.wins}</td>
                      <td className="px-5 py-4 text-muted hidden sm:table-cell">{p.matches}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tier explanation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
            {tiers.map((t) => (
              <div key={t.name} className="bg-surface border border-border rounded-xl p-5 text-center card-hover">
                <div className="mb-2">{tierBadge(t.name)}</div>
                <div className="text-xs text-muted mb-2">Score {t.range}</div>
                <p className="text-muted text-sm leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/ranking"
              className="border border-border-light rounded-xl px-8 py-3 font-semibold text-sm text-foreground hover:bg-surface-2 transition-colors inline-block"
            >
              Ver Ranking Completo
            </Link>
          </div>
        </div>
      </section>

      {/* ════════ TOURNAMENTS PREVIEW ════════ */}
      <section className="bg-surface py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Torneos Activos</h2>
            <p className="mt-3 text-muted max-w-xl mx-auto">Inscribete, compite y llevate la bolsa de premios.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tournaments.map((t) => (
              <div key={t.name} className="bg-surface-2 border border-border rounded-xl p-6 card-hover flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-semibold ${t.statusColor}`}>{t.status}</span>
                  <IconCalendar className="h-4 w-4 text-muted" />
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-1">{t.name}</h3>
                <p className="text-muted text-sm mb-4">{t.game}</p>

                <div className="mt-auto space-y-2.5 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Premio</span>
                    <span className="text-blue-400 font-semibold">{t.prize}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Entrada</span>
                    <span className="text-foreground">{t.entry}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Cupos</span>
                    <span className="text-foreground flex items-center gap-1.5">
                      <IconUsers className="h-3.5 w-3.5" />
                      {t.spots}
                    </span>
                  </div>
                </div>

                <Link
                  href="/torneos"
                  className="mt-5 block text-center border border-border-light rounded-lg px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-3 transition-colors"
                >
                  Ver Torneo
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ FAQ ════════ */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Preguntas Frecuentes</h2>
            <p className="mt-3 text-muted">Todo lo que necesitas saber antes de empezar.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="group bg-surface border border-border rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-foreground font-medium text-sm hover:bg-surface-2 transition-colors">
                  {faq.q}
                  <span className="ml-4 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180">
                    <ChevronIcon />
                  </span>
                </summary>
                <div className="px-6 pb-5 text-muted text-sm leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ CTA FINAL ════════ */}
      <section className="bg-gradient-cta py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Listo para demostrar de que estas hecho?
          </h2>
          <p className="text-muted mb-10 max-w-lg mx-auto">
            Unete a la comunidad competitiva mas grande de LATAM. Tu primer reto te esta esperando.
          </p>
          <Link
            href="/registro"
            className="bg-gradient-main text-white rounded-xl px-10 py-4 font-semibold text-lg animate-pulse-glow inline-block hover:opacity-90 transition-opacity"
          >
            Crear Cuenta Gratis
          </Link>
        </div>
      </section>
    </div>
  );
}
