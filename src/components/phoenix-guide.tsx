"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type GuideContent = {
  eyebrow: string;
  title: string;
  body: string;
  steps: string[];
  primaryHref?: string;
  primaryLabel?: string;
};

const DEFAULT_GUIDE: GuideContent = {
  eyebrow: "Asistente Phoenix",
  title: "Te acompaño por la arena",
  body: "Puedo orientarte según la sección: qué mirar, qué acción conviene tomar y qué significa cada bloque importante.",
  steps: [
    "Empieza por ubicar el objetivo de la página.",
    "Revisa los datos principales antes de tomar decisiones.",
    "Usa los botones de acción solo cuando tengas claro el resultado esperado.",
  ],
  primaryHref: "/como-funciona",
  primaryLabel: "Ver guía completa",
};

const ROUTE_GUIDES: { match: (pathname: string) => boolean; guide: GuideContent }[] = [
  {
    match: (pathname) => pathname === "/",
    guide: {
      eyebrow: "Entrada principal",
      title: "Bienvenido a Phoenix Arena",
      body: "Esta pantalla resume la propuesta: competir por habilidad, entrar a retos, entender el ranking y avanzar hacia torneos con premios.",
      steps: [
        "Usa Competir Ahora si quieres crear cuenta y empezar.",
        "Entra a Como Funciona si quieres entender depósitos, retos y disputas.",
        "Revisa las tarjetas inferiores para ubicar ranking, torneos y seguridad.",
      ],
      primaryHref: "/como-funciona",
      primaryLabel: "Aprender el flujo",
    },
  },
  {
    match: (pathname) => pathname.startsWith("/ranking"),
    guide: {
      eyebrow: "Ranking PSR",
      title: "Lee el ranking como auditor",
      body: "La tabla combina rating conservador, evidencia histórica y estado de calibración. No solo importa el puntaje: también importan sigma, percentil y participación.",
      steps: [
        "Busca al jugador por nombre o filtra por tier.",
        "Compara PSR, mu y sigma para distinguir habilidad de incertidumbre.",
        "Abre un jugador para revisar historial y eventos que explican su posición.",
      ],
    },
  },
  {
    match: (pathname) => pathname.startsWith("/retos"),
    guide: {
      eyebrow: "Retos",
      title: "Compite con reglas claras",
      body: "Aquí se crean o aceptan retos. Antes de entrar, revisa modalidad, monto, reglas, estado y evidencia requerida.",
      steps: [
        "Filtra por modalidad, monto o estado.",
        "Revisa el pozo estimado y las reglas antes de aceptar.",
        "Guarda evidencia del resultado para evitar disputas débiles.",
      ],
      primaryHref: "/retos/crear",
      primaryLabel: "Crear reto",
    },
  },
  {
    match: (pathname) => pathname.startsWith("/torneos"),
    guide: {
      eyebrow: "Torneos",
      title: "Evalúa cupos, premio y reglas",
      body: "Los torneos concentran entradas, premios y resultados verificables. Revisa cupos, costo, estado y formato antes de inscribirte.",
      steps: [
        "Confirma si las inscripciones están abiertas.",
        "Revisa entrada, premio y cantidad de jugadores.",
        "Cuando termines, el resultado debe quedar respaldado para el ranking.",
      ],
    },
  },
  {
    match: (pathname) => pathname.startsWith("/wallet"),
    guide: {
      eyebrow: "Wallet",
      title: "Cuida cada movimiento de saldo",
      body: "La wallet debe tratarse como zona crítica: depósitos, retiros, comisiones y movimientos deben ser verificables.",
      steps: [
        "Revisa saldo disponible antes de aceptar retos.",
        "Confirma método, monto y comisión antes de pagar.",
        "Conserva el historial como evidencia operativa.",
      ],
    },
  },
  {
    match: (pathname) => pathname.startsWith("/admin"),
    guide: {
      eyebrow: "Consola admin",
      title: "Opera con trazabilidad",
      body: "Estás en el área administrativa. Cada acción puede afectar usuarios, torneos, pagos o disputas; revisa contexto antes de guardar cambios.",
      steps: [
        "Elige una sección en el menú lateral.",
        "Lee el bloque Para qué sirve antes de intervenir.",
        "Si hay dinero o disputas, confirma evidencia y deja trazabilidad.",
      ],
      primaryHref: "/",
      primaryLabel: "Regresar a Phoenix",
    },
  },
  {
    match: (pathname) => pathname.startsWith("/perfil") || pathname.startsWith("/jugador"),
    guide: {
      eyebrow: "Perfil competitivo",
      title: "Interpreta identidad e historial",
      body: "El perfil combina identidad, actividad y señales competitivas. Sirve para entender consistencia, historial y confianza de un jugador.",
      steps: [
        "Revisa datos de jugador y actividad reciente.",
        "Observa historial PSR cuando esté disponible.",
        "Compara resultados recientes contra trayectoria general.",
      ],
    },
  },
  {
    match: (pathname) => pathname.startsWith("/tienda"),
    guide: {
      eyebrow: "Tienda",
      title: "Compra mejoras sin perder control",
      body: "La tienda agrupa artículos y beneficios. Antes de comprar, revisa costo, disponibilidad y efecto real en tu experiencia.",
      steps: [
        "Confirma que tienes saldo suficiente.",
        "Lee qué desbloquea cada artículo.",
        "Evita compras si no entiendes el beneficio.",
      ],
    },
  },
  {
    match: (pathname) => pathname.startsWith("/como-funciona"),
    guide: {
      eyebrow: "Mapa de uso",
      title: "Aprende el flujo completo",
      body: "Esta sección explica la vida de una partida: cuenta, wallet, reto, escrow, evidencia, disputa y pago.",
      steps: [
        "Lee los pasos en orden antes de competir.",
        "Pon atención especial a escrow y evidencia.",
        "Usa esta página como referencia para resolver dudas frecuentes.",
      ],
    },
  },
];

function guideForPath(pathname: string): GuideContent {
  return ROUTE_GUIDES.find((item) => item.match(pathname))?.guide ?? DEFAULT_GUIDE;
}

export function PhoenixGuide() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(true);
  const [override, setOverride] = useState<GuideContent | null>(null);

  useEffect(() => {
    setOverride(null);
  }, [pathname]);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<GuideContent>;
      if (customEvent.detail) {
        setOverride(customEvent.detail);
        setOpen(true);
      }
    };

    window.addEventListener("phoenix:guide", handler);
    return () => window.removeEventListener("phoenix:guide", handler);
  }, []);

  const guide = useMemo(() => override ?? guideForPath(pathname), [override, pathname]);

  return (
    <div className="fixed bottom-4 right-4 z-[70] flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3 sm:bottom-auto sm:right-6 sm:top-24">
      {open && (
        <section className="neon-panel-red max-h-[calc(100dvh-7rem)] w-[min(330px,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-border bg-surface/95 p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div className="phoenix-guide-face shrink-0" aria-hidden="true">
              <span className="phoenix-guide-eye phoenix-guide-eye-left" />
              <span className="phoenix-guide-eye phoenix-guide-eye-right" />
              <span className="phoenix-guide-smile" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-300">{guide.eyebrow}</p>
                  <h2 className="mt-1 text-sm font-bold text-foreground">{guide.title}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-border px-2 py-1 text-xs text-muted transition-colors hover:border-red-400/50 hover:text-foreground"
                  aria-label="Ocultar asistente"
                >
                  Cerrar
                </button>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted">{guide.body}</p>
              <ul className="mt-3 space-y-2">
                {guide.steps.map((step) => (
                  <li key={step} className="flex gap-2 text-xs leading-relaxed text-muted">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400 shadow-[0_0_12px_rgba(255,45,85,0.75)]" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
              {guide.primaryHref && guide.primaryLabel && (
                <Link
                  href={guide.primaryHref}
                  className="mt-4 inline-flex rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-100 transition-colors hover:border-red-300/70 hover:bg-red-500/20"
                >
                  {guide.primaryLabel}
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex items-center gap-2 rounded-full border border-red-400/40 bg-surface/95 px-3 py-2 text-xs font-semibold text-red-100 shadow-[0_0_24px_rgba(255,45,85,0.30)] backdrop-blur-xl transition-all hover:border-red-300/70 hover:shadow-[0_0_34px_rgba(255,45,85,0.48)]"
          aria-label="Abrir asistente Phoenix"
        >
          <span className="phoenix-guide-face phoenix-guide-face-small" aria-hidden="true">
            <span className="phoenix-guide-eye phoenix-guide-eye-left" />
            <span className="phoenix-guide-eye phoenix-guide-eye-right" />
            <span className="phoenix-guide-smile" />
          </span>
          Ayuda
        </button>
      )}
    </div>
  );
}
