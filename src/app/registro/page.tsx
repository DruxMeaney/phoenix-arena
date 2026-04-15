"use client";

import Link from "next/link";
import { useState } from "react";

/* ── Icons ──────────────────────────────────────────────────── */
const IconDiscord = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

const IconUser = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconMail = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 7L2 7" />
  </svg>
);
const IconLock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconGamepad = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="12" x2="10" y2="12" /><line x1="8" y1="10" x2="8" y2="14" /><line x1="15" y1="13" x2="15.01" y2="13" /><line x1="18" y1="11" x2="18.01" y2="11" /><rect x="2" y="6" width="20" height="12" rx="5" />
  </svg>
);
const IconGlobe = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const IconShield = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" />
  </svg>
);
const IconEye = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const IconEyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const regions = [
  { value: "latam-norte", label: "LATAM Norte" },
  { value: "latam-sur", label: "LATAM Sur" },
  { value: "brasil", label: "Brasil" },
  { value: "na", label: "Norteamerica" },
  { value: "eu", label: "Europa" },
];

export default function RegistroPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    activisionId: "",
    platform: "uno",
    region: "latam-norte",
  });
  const [codLookup, setCodLookup] = useState<"idle" | "loading" | "found" | "notfound">("idle");
  const [codStats, setCodStats] = useState<{ kdRatio: number; wins: number; gamesPlayed: number } | null>(null);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const lookupCodStats = async () => {
    if (!form.activisionId) return;
    setCodLookup("loading");
    try {
      const res = await fetch(
        `/api/cod?username=${encodeURIComponent(form.activisionId)}&platform=${form.platform}`
      );
      if (res.ok) {
        const data = await res.json();
        setCodStats({
          kdRatio: data.data.lifetime.kdRatio,
          wins: data.data.lifetime.wins,
          gamesPlayed: data.data.lifetime.gamesPlayed,
        });
        setCodLookup("found");
      } else {
        setCodLookup("notfound");
        setCodStats(null);
      }
    } catch {
      setCodLookup("notfound");
      setCodStats(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">Crea tu cuenta</h1>
          <p className="text-muted mt-2">Unete a la comunidad competitiva de Phoenix Arena</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3">
          <div className={`flex-1 h-1 rounded-full transition-colors ${step >= 1 ? "bg-gradient-main" : "bg-border"}`} />
          <div className={`flex-1 h-1 rounded-full transition-colors ${step >= 2 ? "bg-gradient-main" : "bg-border"}`} />
        </div>
        <p className="text-xs text-muted text-center">
          {step === 1 ? "Paso 1 de 2 — Datos de cuenta" : "Paso 2 de 2 — Perfil de jugador"}
        </p>

        {step === 1 ? (
          <>
            {/* Discord OAuth */}
            <a
              href="/api/auth/discord"
              className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold transition-colors shadow-lg shadow-[#5865F2]/20"
            >
              <IconDiscord />
              Registrarse con Discord
            </a>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted uppercase tracking-wider">o con correo</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); setStep(2); }}
              className="space-y-4"
            >
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-muted mb-1.5">
                  Nombre de usuario
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"><IconUser /></div>
                  <input
                    id="username"
                    type="text"
                    value={form.username}
                    onChange={(e) => updateField("username", e.target.value)}
                    placeholder="Tu nombre en la plataforma"
                    className="w-full bg-surface-2 border border-border rounded-xl py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                    required
                    minLength={3}
                    maxLength={20}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-muted mb-1.5">
                  Correo electronico
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"><IconMail /></div>
                  <input
                    id="reg-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full bg-surface-2 border border-border rounded-xl py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="reg-pass" className="block text-sm font-medium text-muted mb-1.5">
                  Contrasena
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"><IconLock /></div>
                  <input
                    id="reg-pass"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    placeholder="Minimo 8 caracteres"
                    className="w-full bg-surface-2 border border-border rounded-xl py-3 pl-11 pr-11 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                  >
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-main text-white font-semibold hover:opacity-90 transition-opacity"
              >
                Continuar
              </button>
            </form>
          </>
        ) : (
          /* ── Step 2: Game profile ──────────────────────────── */
          <form
            onSubmit={(e) => {
              e.preventDefault();
              /* TODO: submit registration to backend */
            }}
            className="space-y-5"
          >
            {/* Activision ID */}
            <div>
              <label htmlFor="activision-id" className="block text-sm font-medium text-muted mb-1.5">
                Activision ID
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"><IconGamepad /></div>
                  <input
                    id="activision-id"
                    type="text"
                    value={form.activisionId}
                    onChange={(e) => { updateField("activisionId", e.target.value); setCodLookup("idle"); }}
                    placeholder="NombreDeUsuario#1234567"
                    className="w-full bg-surface-2 border border-border rounded-xl py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                  />
                </div>
                <button
                  type="button"
                  onClick={lookupCodStats}
                  disabled={codLookup === "loading" || !form.activisionId}
                  className="px-4 py-3 rounded-xl bg-surface-3 border border-border text-sm font-medium text-foreground hover:bg-border/50 disabled:opacity-40 transition-colors shrink-0"
                >
                  {codLookup === "loading" ? "Buscando..." : "Verificar"}
                </button>
              </div>
              <p className="text-xs text-muted mt-1.5">
                Ingresa tu Activision ID para vincular tus estadisticas de Warzone.
              </p>

              {/* COD stats result */}
              {codLookup === "found" && codStats && (
                <div className="mt-3 bg-success/10 border border-success/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-success text-sm font-medium mb-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5" /></svg>
                    Jugador encontrado
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-lg font-bold text-foreground">{codStats.kdRatio.toFixed(2)}</p>
                      <p className="text-xs text-muted">K/D Ratio</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground">{codStats.wins.toLocaleString()}</p>
                      <p className="text-xs text-muted">Victorias</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground">{codStats.gamesPlayed.toLocaleString()}</p>
                      <p className="text-xs text-muted">Partidas</p>
                    </div>
                  </div>
                </div>
              )}
              {codLookup === "notfound" && (
                <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-400 shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="text-xs text-red-300">
                    No se encontraron estadisticas. Verifica tu Activision ID y la plataforma seleccionada.
                  </p>
                </div>
              )}
            </div>

            {/* Platform */}
            <div>
              <label htmlFor="platform" className="block text-sm font-medium text-muted mb-1.5">
                Plataforma de juego
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: "uno", label: "Activision" },
                  { value: "battle", label: "Battle.net" },
                  { value: "psn", label: "PSN" },
                  { value: "xbl", label: "Xbox" },
                ].map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => updateField("platform", p.value)}
                    className={`py-2.5 rounded-xl border text-xs font-medium transition-colors ${
                      form.platform === p.value
                        ? "border-blue-500 bg-blue-500/10 text-blue-400"
                        : "border-border bg-surface-2 text-muted hover:text-foreground"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Region */}
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-muted mb-1.5">
                Region
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"><IconGlobe /></div>
                <select
                  id="region"
                  value={form.region}
                  onChange={(e) => updateField("region", e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-xl py-3 pl-11 pr-4 text-sm text-foreground appearance-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                >
                  {regions.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3.5 rounded-xl border border-border text-foreground font-medium hover:bg-surface-2 transition-colors"
              >
                Atras
              </button>
              <button
                type="submit"
                className="flex-1 py-3.5 rounded-xl bg-gradient-main text-white font-semibold hover:opacity-90 transition-opacity"
              >
                Crear cuenta
              </button>
            </div>
          </form>
        )}

        {/* Security note */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted/70">
          <IconShield />
          <span>Tus datos estan protegidos y cifrados</span>
        </div>

        {/* Login link */}
        {step === 1 && (
          <p className="text-center text-sm text-muted">
            Ya tienes cuenta?{" "}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Inicia sesion
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
