import Link from "next/link";

export const metadata = {
  title: "Para Socios e Inversionistas — Phoenix Arena",
  description: "Descubre oportunidades de patrocinio, alianzas e inversion con Phoenix Arena, la plataforma competitiva de habilidad de referencia en LATAM.",
};

/* ─── SVG Icons ─── */

function ArrowRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9h10M10 5l4 4-4 4" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4h14v9a7 7 0 0 1-14 0V4Z" />
      <path d="M9 9H6a2 2 0 0 0-2 2v1a5 5 0 0 0 5 5" />
      <path d="M23 9h3a2 2 0 0 1 2 2v1a5 5 0 0 1-5 5" />
      <path d="M16 20v4" />
      <path d="M10 28h12" />
      <path d="M12 28v-4" />
      <path d="M20 28v-4" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3L5 18h10l-2 11L25 14H15l2-11Z" />
    </svg>
  );
}

function HandshakeIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15l6-6 5 2 4-4 6 6" />
      <path d="M4 15l8 8 4-4 4 4 8-8" />
      <path d="M12 23l-4 4" />
      <path d="M20 23l4 4" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="7" r="3" />
      <path d="M2 19c0-3.314 2.686-6 6-6s6 2.686 6 6" />
      <circle cx="17" cy="8" r="2.5" />
      <path d="M17 13c2.761 0 5 2.239 5 5" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="9" />
      <circle cx="11" cy="11" r="5" />
      <circle cx="11" cy="11" r="1" />
    </svg>
  );
}

function TrendUpIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l5-5 4 4 7-8" />
      <path d="M15 8h4v4" />
    </svg>
  );
}

function ScaleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 2v18" />
      <path d="M3 6l8-4 8 4" />
      <path d="M3 6v2a4 4 0 0 0 8 0V6" />
      <path d="M11 6v2a4 4 0 0 0 8 0V6" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="16" height="12" rx="2" />
      <path d="M2 6l8 5 8-5" />
    </svg>
  );
}

/* ─── Data ─── */

const stats = [
  { value: "500+", label: "Usuarios activos" },
  { value: "1,000+", label: "Partidas completadas" },
  { value: "$50K+", label: "Volumen transaccionado" },
  { value: "68%", label: "Retencion mensual" },
  { value: "25%", label: "Crecimiento mensual" },
];

const partnerships = [
  {
    icon: <TrophyIcon />,
    title: "Torneos Patrocinados",
    desc: "Crea torneos con tu marca como protagonista. Personaliza premios, branding en vivo, y alcanza a jugadores comprometidos que compiten activamente en tu torneo.",
  },
  {
    icon: <ZapIcon />,
    title: "Activaciones de Marca",
    desc: "Lanza campanas interactivas dentro de la Plataforma. Desde retos tematicos hasta recompensas por participacion, conecta tu marca con la audiencia gamer de forma autentica.",
  },
  {
    icon: <HandshakeIcon />,
    title: "Alianzas Estrategicas",
    desc: "Integraciones tecnologicas, co-desarrollo de funcionalidades y acceso exclusivo a datos de la comunidad. Construyamos juntos el futuro del gaming competitivo en LATAM.",
  },
];

const valueProps = [
  { icon: <UsersIcon />, title: "Audiencia verificada", desc: "Usuarios reales con identidad confirmada, mayores de 18 anos y activos en competencias." },
  { icon: <TargetIcon />, title: "Plataforma medible", desc: "Metricas claras de alcance, participacion, engagement y ROI para cada activacion." },
  { icon: <TrendUpIcon />, title: "Crecimiento organico", desc: "Comunidad en expansion constante impulsada por competencia real y recomendaciones entre jugadores." },
  { icon: <ScaleIcon />, title: "Escalabilidad regional", desc: "Infraestructura preparada para escalar en multiples mercados de America Latina simultaneamente." },
];

export default function SociosPage() {
  return (
    <section className="min-h-dvh">
      {/* Hero */}
      <div className="bg-gradient-hero py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm font-medium text-red-400 tracking-wide uppercase mb-4">
            Para Socios e Inversionistas
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Lleva tu marca al{" "}
            <span className="text-gradient">siguiente nivel competitivo</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-10">
            Phoenix Arena conecta marcas con la comunidad gamer mas comprometida de America Latina
            a traves de competencias reales, medibles y de alto engagement.
          </p>
          <a
            href="mailto:partners@phoenixarena.com"
            className="inline-flex items-center gap-2 bg-gradient-main text-white font-semibold px-8 py-3.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            Contactar equipo comercial
            <ArrowRightIcon />
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="py-16 px-4 sm:px-6 border-b border-border">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-gradient mb-1">{stat.value}</p>
                <p className="text-sm text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Partnership Cards */}
      <div className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-4">
            Modelos de Colaboracion
          </h2>
          <p className="text-muted text-center max-w-2xl mx-auto mb-12">
            Ofrecemos multiples formas de integrar tu marca en el ecosistema competitivo de
            Phoenix Arena, adaptadas a tus objetivos.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {partnerships.map((p) => (
              <div
                key={p.title}
                className="bg-surface border border-border rounded-2xl p-8 card-hover"
              >
                <div className="text-red-400 mb-4">{p.icon}</div>
                <h3 className="text-lg font-semibold text-foreground mb-3">{p.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Value Props */}
      <div className="py-20 px-4 sm:px-6 bg-surface">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-4">
            Por que Phoenix Arena
          </h2>
          <p className="text-muted text-center max-w-2xl mx-auto mb-12">
            No somos una plataforma de apuestas ni un canal publicitario generico.
            Somos el punto de encuentro entre marcas ambiciosas y competidores reales.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {valueProps.map((vp) => (
              <div
                key={vp.title}
                className="flex items-start gap-4 bg-surface-2 border border-border rounded-xl p-6"
              >
                <span className="text-red-400 shrink-0 mt-0.5">{vp.icon}</span>
                <div>
                  <h3 className="text-foreground font-semibold mb-1">{vp.title}</h3>
                  <p className="text-sm text-muted">{vp.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Business Model Overview */}
      <div className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-4">
            Modelo de Negocio
          </h2>
          <p className="text-muted text-center max-w-2xl mx-auto mb-10">
            Un modelo sostenible basado en competencia real y valor genuino para todas las partes.
          </p>
          <div className="bg-surface border border-border rounded-2xl p-8 sm:p-10">
            <div className="space-y-6 text-muted leading-relaxed">
              <div>
                <h3 className="text-foreground font-semibold mb-2">Fuentes de ingreso</h3>
                <ul className="list-disc list-inside space-y-1.5 ml-2 text-sm">
                  <li><strong className="text-foreground">Comision por reto (10%):</strong> ingreso recurrente por cada competencia completada en la Plataforma.</li>
                  <li><strong className="text-foreground">Torneos patrocinados:</strong> paquetes personalizados para marcas que buscan visibilidad ante audiencias verificadas.</li>
                  <li><strong className="text-foreground">Activaciones premium:</strong> integraciones de marca dentro del flujo competitivo con metricas de rendimiento.</li>
                  <li><strong className="text-foreground">Membresías y beneficios:</strong> acceso a funcionalidades exclusivas, menores comisiones y torneos VIP.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-foreground font-semibold mb-2">Metricas clave</h3>
                <ul className="list-disc list-inside space-y-1.5 ml-2 text-sm">
                  <li>Costo de adquisicion de usuario bajo gracias a viralizacion organica entre jugadores.</li>
                  <li>Alto lifetime value por la naturaleza recurrente de la competencia.</li>
                  <li>Retencion superior al promedio de la industria gracias al componente competitivo.</li>
                  <li>Escalabilidad horizontal al agregar nuevos juegos y mercados sin reconstruir la infraestructura.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-foreground font-semibold mb-2">Diferenciacion</h3>
                <p className="text-sm">
                  A diferencia de las plataformas de apuestas, Phoenix Arena opera en un marco legal
                  favorable como competencia de habilidad, lo que permite operar en mercados donde
                  las apuestas estan restringidas. Nuestro enfoque en la participacion activa del
                  jugador genera mayor engagement, retencion y oportunidades de monetizacion autenticas
                  para marcas y socios.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA / Contact */}
      <div className="bg-gradient-cta py-20 px-4 sm:px-6 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Construyamos algo grande juntos
          </h2>
          <p className="text-muted mb-8 max-w-xl mx-auto">
            Ya sea que busques patrocinar torneos, activar tu marca o explorar una alianza
            estrategica, nuestro equipo esta listo para conversar.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:partners@phoenixarena.com"
              className="inline-flex items-center gap-2 bg-gradient-main text-white font-semibold px-8 py-3.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              <MailIcon />
              partners@phoenixarena.com
            </a>
          </div>
          <p className="text-sm text-muted mt-6">
            Tiempo de respuesta promedio: 24-48 horas habiles.
          </p>
        </div>
      </div>
    </section>
  );
}
