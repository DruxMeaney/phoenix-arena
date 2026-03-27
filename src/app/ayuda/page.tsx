import Link from "next/link";

export const metadata = {
  title: "Centro de Ayuda — Phoenix Arena",
  description: "Encuentra respuestas a tus preguntas sobre Phoenix Arena. Preguntas frecuentes, soporte y contacto.",
};

/* ─── SVG Icons ─── */

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
      <circle cx="9" cy="9" r="6" />
      <path d="M13.5 13.5L17 17" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="14" cy="10" r="4" />
      <path d="M6 24c0-4.418 3.582-8 8-8s8 3.582 8 8" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="22" height="16" rx="2" />
      <path d="M3 12h22" />
      <path d="M18 16h3" />
      <path d="M25 7V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v1" />
    </svg>
  );
}

function SwordsIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3l9 9" />
      <path d="M5 3l3 0 0 3" />
      <path d="M23 3l-9 9" />
      <path d="M23 3l-3 0 0 3" />
      <path d="M9 19l-4 4 2 2 4-4" />
      <path d="M19 19l4 4-2 2-4-4" />
      <path d="M14 14l-5 5" />
      <path d="M14 14l5 5" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 4h12v8a6 6 0 0 1-12 0V4Z" />
      <path d="M8 8H5a2 2 0 0 0-2 2v1a4 4 0 0 0 4 4h1" />
      <path d="M20 8h3a2 2 0 0 1 2 2v1a4 4 0 0 1-4 4h-1" />
      <path d="M14 18v3" />
      <path d="M9 25h10" />
      <path d="M10 25v-4" />
      <path d="M18 25v-4" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 24V8" />
      <path d="M10 24V4" />
      <path d="M16 24V14" />
      <path d="M22 24V10" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3L5 7.5V13c0 5.52 3.84 10.74 9 12 5.16-1.26 9-6.48 9-12V7.5L14 3Z" />
      <path d="M10 14l3 3 5-5" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="chevron-icon shrink-0 transition-transform duration-200">
      <path d="M6 7l3 3 3-3" />
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

function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8" />
      <path d="M10 6v4l3 2" />
    </svg>
  );
}

/* ─── Data ─── */

const categories = [
  { title: "Cuenta", desc: "Registro, verificacion, perfil y configuracion.", icon: <UserIcon /> },
  { title: "Monedero", desc: "Depositos, retiros, saldo y transacciones.", icon: <WalletIcon /> },
  { title: "Retos", desc: "Crear, aceptar y resolver retos competitivos.", icon: <SwordsIcon /> },
  { title: "Torneos", desc: "Inscripcion, formato, premios y calendario.", icon: <TrophyIcon /> },
  { title: "Ranking", desc: "Sistema de puntos, niveles y clasificacion.", icon: <ChartIcon /> },
  { title: "Seguridad", desc: "Verificacion, 2FA, reportes y proteccion.", icon: <ShieldIcon /> },
];

const faqs = [
  {
    q: "Como creo mi cuenta en Phoenix Arena?",
    a: "Visita nuestra pagina de registro y completa el formulario con tu correo electronico, nombre de usuario y fecha de nacimiento. Debes ser mayor de 18 anos. Luego, verifica tu correo electronico y ya podras acceder a la Plataforma.",
  },
  {
    q: "Phoenix Arena es una casa de apuestas?",
    a: "No. Phoenix Arena es una plataforma de competencia de habilidad. Los resultados dependen exclusivamente del rendimiento y la destreza de los jugadores, no del azar. Para mas detalles, consulta nuestra pagina de Competencia de Habilidad y Cumplimiento.",
  },
  {
    q: "Como deposito dinero en mi monedero?",
    a: "Ingresa a la seccion Monedero desde tu perfil, selecciona 'Depositar' y elige el metodo de pago disponible en tu region. Los depositos se acreditan de forma inmediata o en un maximo de 24 horas dependiendo del metodo.",
  },
  {
    q: "Cuanto cobra Phoenix Arena de comision?",
    a: "Phoenix Arena cobra una comision del 10% sobre el fondo total de cada reto. Por ejemplo, si dos jugadores apuestan $10 cada uno, el fondo total es $20, la comision es $2, y el ganador recibe $18.",
  },
  {
    q: "Como retiro mis ganancias?",
    a: "Desde la seccion Monedero, selecciona 'Retirar' e ingresa el monto. Los retiros se procesan en 1 a 5 dias habiles. Para tu primer retiro puede requerirse verificacion de identidad.",
  },
  {
    q: "Que pasa si hay una disputa en un reto?",
    a: "Si ambos jugadores reportan resultados diferentes, el reto pasa a mediacion. Nuestro equipo revisa las evidencias (capturas de pantalla, estadisticas del juego) y emite un fallo definitivo. Los fondos permanecen en escrow hasta la resolucion.",
  },
  {
    q: "En que juegos puedo competir?",
    a: "Phoenix Arena soporta multiples titulos populares de consola y PC. Los juegos disponibles se muestran al crear un reto. Continuamente agregamos nuevos titulos basandonos en la demanda de la comunidad.",
  },
  {
    q: "Como funciona el sistema de ranking?",
    a: "Cada competencia otorga o resta puntos de ranking basados en el resultado y la dificultad del oponente. Los jugadores se clasifican en niveles que desbloquean beneficios como acceso a torneos exclusivos y menores comisiones.",
  },
  {
    q: "Puedo establecer limites a mis depositos?",
    a: "Si. Desde la configuracion de tu cuenta puedes establecer limites diarios, semanales o mensuales para depositos. Tambien puedes solicitar auto-exclusion temporal o permanente contactando a soporte.",
  },
  {
    q: "Como contacto al soporte tecnico?",
    a: "Puedes escribirnos a soporte@phoenixarena.com o utilizar el chat de soporte dentro de la Plataforma. Nuestro horario de atencion es de Lunes a Viernes, 9:00 AM a 6:00 PM (CST).",
  },
];

export default function AyudaPage() {
  return (
    <section className="min-h-dvh py-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient mb-4">
            Centro de Ayuda
          </h1>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Encuentra respuestas rapidas a tus preguntas o contacta a nuestro equipo de soporte.
          </p>
        </div>

        {/* Decorative Search Bar */}
        <div className="relative max-w-xl mx-auto mb-16">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Buscar en el centro de ayuda..."
            className="w-full bg-surface border border-border rounded-xl py-3.5 pl-12 pr-4 text-foreground placeholder:text-muted/60 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
            aria-label="Buscar ayuda"
          />
        </div>

        {/* Category Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {categories.map((cat) => (
            <div
              key={cat.title}
              className="bg-surface border border-border rounded-xl p-6 card-hover cursor-default"
            >
              <div className="text-red-400 mb-3">{cat.icon}</div>
              <h3 className="text-foreground font-semibold mb-1">{cat.title}</h3>
              <p className="text-sm text-muted">{cat.desc}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">Preguntas Frecuentes</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group bg-surface border border-border rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer p-5 text-foreground font-medium hover:bg-surface-2 transition-colors select-none list-none [&::-webkit-details-marker]:hidden">
                  <span>{faq.q}</span>
                  <span className="group-open:rotate-180 transition-transform duration-200">
                    <ChevronIcon />
                  </span>
                </summary>
                <div className="px-5 pb-5 text-muted leading-relaxed border-t border-border pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-surface border border-border rounded-2xl p-8 sm:p-10">
          <h2 className="text-xl font-bold text-foreground mb-6">Contacta a Soporte</h2>
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start gap-3">
              <span className="text-red-400 mt-0.5"><MailIcon /></span>
              <div>
                <p className="text-foreground font-medium mb-1">Correo electronico</p>
                <a
                  href="mailto:soporte@phoenixarena.com"
                  className="text-red-400 hover:text-red-300 transition-colors text-sm"
                >
                  soporte@phoenixarena.com
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-400 mt-0.5"><ClockIcon /></span>
              <div>
                <p className="text-foreground font-medium mb-1">Horario de atencion</p>
                <p className="text-sm text-muted">Lunes a Viernes, 9:00 AM - 6:00 PM (CST)</p>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="border-t border-border pt-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Enlaces rapidos de seguridad</h3>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/legal/privacidad"
                className="text-sm text-muted hover:text-foreground bg-surface-2 border border-border-light rounded-lg px-4 py-2 transition-colors"
              >
                Politica de Privacidad
              </Link>
              <Link
                href="/legal/terminos"
                className="text-sm text-muted hover:text-foreground bg-surface-2 border border-border-light rounded-lg px-4 py-2 transition-colors"
              >
                Terminos y Condiciones
              </Link>
              <Link
                href="/legal/habilidad"
                className="text-sm text-muted hover:text-foreground bg-surface-2 border border-border-light rounded-lg px-4 py-2 transition-colors"
              >
                Habilidad y Cumplimiento
              </Link>
              <Link
                href="/legal/pagos"
                className="text-sm text-muted hover:text-foreground bg-surface-2 border border-border-light rounded-lg px-4 py-2 transition-colors"
              >
                Pagos y Retiros
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
