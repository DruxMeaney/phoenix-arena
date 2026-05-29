"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Tab = "retos" | "rapida" | "crear";
type Modalidad = "Todos" | "1v1" | "Duo" | "Trio";
type MontoRange = "Todos" | "$1-$10" | "$11-$25" | "$26-$50" | "$50+";

interface Challenge {
  id: string;
  creator: { username: string; tier: string };
  game: string;
  modalidad: string;
  amount: number;
  status: string;
  rules: string;
  createdAt: string;
}

function timeAgo(d: string): string {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Ahora";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function matchesMonto(amount: number, range: MontoRange) {
  if (range === "Todos") return true;
  if (range === "$1-$10") return amount >= 1 && amount <= 10;
  if (range === "$11-$25") return amount >= 11 && amount <= 25;
  if (range === "$26-$50") return amount >= 26 && amount <= 50;
  return amount > 50;
}

export default function CompetirPage() {
  const [tab, setTab] = useState<Tab>("retos");
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [modalidad, setModalidad] = useState<Modalidad>("Todos");
  const [montoRange, setMontoRange] = useState<MontoRange>("Todos");
  const [accepting, setAccepting] = useState<string | null>(null);
  const [qmAmount, setQmAmount] = useState(10);
  const [qmSearching, setQmSearching] = useState(false);
  const [qmResult, setQmResult] = useState<{ matched: boolean; opponent?: string; amount?: number; message: string } | null>(null);
  // Create challenge
  const [createGame] = useState("Warzone");
  const [createMod, setCreateMod] = useState("1v1");
  const [createAmount, setCreateAmount] = useState("");
  const [createRules, setCreateRules] = useState("");
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<string | null>(null);

  const fetchChallenges = useCallback(async () => {
    try {
      const res = await fetch("/api/matches");
      if (res.ok) {
        const data = await res.json();
        setChallenges(data.matches || []);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchChallenges(); }, [fetchChallenges]);

  const filtered = challenges.filter((c) => {
    if (modalidad !== "Todos" && c.modalidad !== modalidad) return false;
    if (!matchesMonto(c.amount, montoRange)) return false;
    return true;
  });

  const handleAccept = async (id: string) => {
    setAccepting(id);
    try {
      const res = await fetch(`/api/matches/${id}/accept`, { method: "POST" });
      if (res.ok) fetchChallenges();
      else { const err = await res.json(); alert(err.error || "Error"); }
    } catch { alert("Error de conexion"); }
    setAccepting(null);
  };

  const handleQuickMatch = async () => {
    setQmSearching(true);
    setQmResult(null);
    try {
      const res = await fetch("/api/quickmatch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: qmAmount, game: "Warzone" }) });
      const data = await res.json();
      setQmResult(res.ok ? data : { matched: false, message: data.error || "Error" });
    } catch { setQmResult({ matched: false, message: "Error de conexion" }); }
    setQmSearching(false);
  };

  const handleCreate = async () => {
    const amt = parseFloat(createAmount);
    if (!amt || amt < 1 || !createRules.trim()) { setCreateMsg("Completa todos los campos"); return; }
    setCreating(true);
    setCreateMsg(null);
    try {
      const res = await fetch("/api/matches", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ game: createGame, modalidad: createMod, amount: amt, rules: createRules }) });
      if (res.ok) { setCreateMsg("Reto creado"); setCreateAmount(""); setCreateRules(""); setTab("retos"); fetchChallenges(); }
      else { const err = await res.json(); setCreateMsg(err.error || "Error"); }
    } catch { setCreateMsg("Error de conexion"); }
    setCreating(false);
  };

  const openCount = challenges.filter((c) => c.status === "open").length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gradient">Competir</h1>
            <p className="text-sm text-muted mt-1">Encuentra un rival, acepta un reto o busca partida rapida</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success" />{openCount} retos abiertos</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface/30 backdrop-blur-sm p-1 rounded-xl border border-border w-fit">
          {([
            { key: "retos" as Tab, label: "Retos Abiertos" },
            { key: "rapida" as Tab, label: "Partida Rapida" },
            { key: "crear" as Tab, label: "Crear Reto" },
          ]).map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 sm:px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t.key ? "bg-gradient-main text-white shadow" : "text-muted hover:text-foreground"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ═══ RETOS TAB ═══ */}
        {tab === "retos" && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="flex gap-1">
                {(["Todos", "1v1", "Duo", "Trio"] as Modalidad[]).map((m) => (
                  <button key={m} onClick={() => setModalidad(m)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${modalidad === m ? "bg-gradient-main text-white" : "bg-surface-2 text-muted hover:text-foreground"}`}>{m}</button>
                ))}
              </div>
              <div className="flex gap-1">
                {(["Todos", "$1-$10", "$11-$25", "$26-$50", "$50+"] as MontoRange[]).map((r) => (
                  <button key={r} onClick={() => setMontoRange(r)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${montoRange === r ? "bg-gradient-main text-white" : "bg-surface-2 text-muted hover:text-foreground"}`}>{r}</button>
                ))}
              </div>
            </div>

            {/* Challenge list */}
            {filtered.length === 0 ? (
              <div className="bg-surface/50 border border-border rounded-2xl p-12 text-center">
                <h3 className="font-semibold mb-1">Sin retos disponibles</h3>
                <p className="text-sm text-muted mb-4">Se el primero en crear un reto</p>
                <button onClick={() => setTab("crear")} className="px-6 py-2.5 rounded-xl bg-gradient-main text-white text-sm font-medium">Crear Reto</button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((c) => (
                  <div key={c.id} className="bg-surface/50 backdrop-blur-sm border border-border rounded-2xl p-5 flex flex-col card-hover">
                    {/* Status + time */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${c.status === "open" ? "bg-success/15 text-success border border-success/30" : "bg-warning/15 text-warning border border-warning/30"}`}>
                        {c.status === "open" ? "Abierto" : "En curso"}
                      </span>
                      <span className="text-xs text-muted">{timeAgo(c.createdAt)}</span>
                    </div>
                    {/* Title: CK-style */}
                    <h3 className="font-semibold text-sm mb-2">
                      ${c.amount} {c.modalidad} {c.game}
                    </h3>
                    {/* Creator */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-muted">por</span>
                      <span className="text-xs font-medium">{c.creator.username}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${c.creator.tier === "PRO" ? "badge-pro" : c.creator.tier === "AM" ? "badge-am" : "badge-detri"}`}>{c.creator.tier}</span>
                    </div>
                    {/* Prize */}
                    <div className="bg-surface-2 rounded-lg px-3 py-2 mb-3 flex justify-between text-sm">
                      <span className="text-muted">Premio estimado</span>
                      <span className="text-success font-semibold">${(c.amount * 2 * 0.9).toFixed(2)}</span>
                    </div>
                    {/* Rules */}
                    <p className="text-xs text-muted mb-4 flex-1">{c.rules}</p>
                    {/* CTA */}
                    {c.status === "open" ? (
                      <button onClick={() => handleAccept(c.id)} disabled={accepting === c.id} className="w-full py-2.5 rounded-xl bg-gradient-main text-white font-medium text-sm hover:opacity-90 disabled:opacity-40">
                        {accepting === c.id ? "Aceptando..." : "Aceptar Reto"}
                      </button>
                    ) : (
                      <button disabled className="w-full py-2.5 rounded-xl bg-surface-3 text-muted text-sm cursor-not-allowed">En curso</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ PARTIDA RAPIDA TAB ═══ */}
        {tab === "rapida" && (
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-main mx-auto flex items-center justify-center shadow-lg mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
              </div>
              <h2 className="text-xl font-bold">Partida Rapida</h2>
              <p className="text-sm text-muted mt-1">1v1 instantaneo contra un rival de tu nivel</p>
            </div>
            <div className="bg-surface/50 backdrop-blur-sm border border-border rounded-2xl p-6 space-y-5">
              <div>
                <label className="text-xs font-medium text-muted uppercase tracking-wider">Monto</label>
                <div className="grid grid-cols-4 gap-3 mt-2">
                  {[5, 10, 20, 50].map((amt) => (
                    <button key={amt} onClick={() => setQmAmount(amt)} className={`py-3 rounded-xl font-bold text-lg transition-all ${qmAmount === amt ? "bg-gradient-main text-white" : "bg-surface-2 border border-border text-foreground hover:border-red-500/50"}`}>${amt}</button>
                  ))}
                </div>
              </div>
              <div className="bg-surface-2 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted">Juego</span><span className="font-medium">Warzone</span></div>
                <div className="flex justify-between"><span className="text-muted">Premio</span><span className="text-success font-medium">${(qmAmount * 2 * 0.9).toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted">Comision</span><span>10%</span></div>
              </div>
              <button onClick={handleQuickMatch} disabled={qmSearching} className="w-full py-4 rounded-xl bg-gradient-main text-white font-bold text-lg hover:opacity-90 disabled:opacity-50 shadow-lg">
                {qmSearching ? "Buscando rival..." : "Buscar Partida"}
              </button>
            </div>
            {qmResult && (
              <div className={`rounded-2xl p-5 text-center ${qmResult.matched ? "bg-success/10 border border-success/30" : "bg-blue-500/10 border border-blue-500/30"}`}>
                <h3 className={`font-bold mb-1 ${qmResult.matched ? "text-success" : "text-blue-400"}`}>{qmResult.matched ? "Rival encontrado" : "En cola"}</h3>
                <p className="text-sm text-muted">{qmResult.matched ? `vs ${qmResult.opponent} por $${qmResult.amount}` : qmResult.message}</p>
              </div>
            )}
          </div>
        )}

        {/* ═══ CREAR RETO TAB ═══ */}
        {tab === "crear" && (
          <div className="max-w-lg mx-auto">
            <div className="bg-surface/50 backdrop-blur-sm border border-border rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-semibold">Crear nuevo reto</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider">Juego</label>
                  <div className="mt-1.5 bg-surface-2 border border-border rounded-xl py-3 px-4 text-sm text-foreground">Warzone</div>
                </div>
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider">Modalidad</label>
                  <div className="flex gap-2 mt-1.5">
                    {["1v1", "Duo", "Trio"].map((m) => (
                      <button key={m} onClick={() => setCreateMod(m)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${createMod === m ? "bg-gradient-main text-white" : "bg-surface-2 border border-border text-muted"}`}>{m}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted uppercase tracking-wider">Monto por jugador (USD)</label>
                <input type="number" value={createAmount} onChange={(e) => setCreateAmount(e.target.value)} placeholder="10" min="1" className="w-full mt-1.5 bg-surface-2 border border-border rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs text-muted uppercase tracking-wider">Reglas</label>
                <textarea value={createRules} onChange={(e) => setCreateRules(e.target.value)} placeholder="Kills cuenta, sin vehiculos, Rebirth Island..." className="w-full mt-1.5 bg-surface-2 border border-border rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-blue-500 min-h-[80px] resize-none" />
              </div>
              {createAmount && (
                <div className="bg-surface-2 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted">Monto por jugador</span><span>${parseFloat(createAmount || "0").toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted">Comision plataforma</span><span>10%</span></div>
                  <div className="flex justify-between font-semibold"><span>Premio estimado</span><span className="text-success">${(parseFloat(createAmount || "0") * (createMod === "1v1" ? 2 : createMod === "Duo" ? 4 : 6) * 0.9).toFixed(2)}</span></div>
                </div>
              )}
              {createMsg && <p className={`text-sm font-medium ${createMsg.includes("creado") ? "text-success" : "text-red-400"}`}>{createMsg}</p>}
              <button onClick={handleCreate} disabled={creating} className="w-full py-3.5 rounded-xl bg-gradient-main text-white font-semibold hover:opacity-90 disabled:opacity-40">
                {creating ? "Creando..." : "Publicar Reto"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
