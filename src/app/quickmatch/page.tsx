"use client";

import { useState } from "react";

const amounts = [5, 10, 20, 50];

export default function QuickMatchPage() {
  const [selectedAmount, setSelectedAmount] = useState(10);
  const [game] = useState("Warzone");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<{ matched: boolean; opponent?: string; amount?: number; message: string } | null>(null);

  const handleSearch = async () => {
    setSearching(true);
    setResult(null);

    try {
      const res = await fetch("/api/quickmatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: selectedAmount, game }),
      });
      const data = await res.json();

      if (res.ok) {
        setResult(data);
      } else {
        setResult({ matched: false, message: data.error || "Error al buscar partida" });
      }
    } catch {
      setResult({ matched: false, message: "Error de conexion" });
    }
    setSearching(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-gradient-main mx-auto flex items-center justify-center shadow-lg glow">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gradient">QuickMatch</h1>
          <p className="text-muted text-sm">Emparejamiento instantaneo contra un rival de tu nivel</p>
        </div>

        {/* Amount selection */}
        <div className="bg-surface border border-border rounded-2xl p-6 space-y-5">
          <div>
            <label className="text-xs font-medium text-muted uppercase tracking-wider">Monto de la partida</label>
            <div className="grid grid-cols-4 gap-3 mt-3">
              {amounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setSelectedAmount(amt)}
                  className={`py-4 rounded-xl text-center font-bold text-lg transition-all ${
                    selectedAmount === amt
                      ? "bg-gradient-main text-white shadow-lg glow"
                      : "bg-surface-2 border border-border text-foreground hover:border-red-500/50"
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="bg-surface-2 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Juego</span>
              <span className="font-medium">{game}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Modalidad</span>
              <span className="font-medium">1v1</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Premio estimado</span>
              <span className="font-medium text-success">${(selectedAmount * 2 * 0.9).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Comision</span>
              <span className="font-medium">10%</span>
            </div>
          </div>

          {/* How it works */}
          <div className="flex items-start gap-3 text-xs text-muted">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p>El sistema busca un oponente de tu mismo tier con un monto similar (+-20%). Si no hay nadie disponible, tu reto queda abierto para el proximo jugador.</p>
          </div>

          {/* Search button */}
          <button
            onClick={handleSearch}
            disabled={searching}
            className="w-full py-4 rounded-xl bg-gradient-main text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg"
          >
            {searching ? (
              <span className="flex items-center justify-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" className="animate-spin" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                Buscando rival...
              </span>
            ) : (
              "Buscar Partida"
            )}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className={`rounded-2xl p-6 text-center ${
            result.matched
              ? "bg-success/10 border border-success/30"
              : "bg-blue-500/10 border border-blue-500/30"
          }`}>
            {result.matched ? (
              <>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" className="mx-auto mb-3"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                <h3 className="text-lg font-bold text-success mb-1">Rival encontrado</h3>
                <p className="text-sm text-muted">vs <span className="text-foreground font-semibold">{result.opponent}</span> por <span className="text-success font-semibold">${result.amount}</span></p>
              </>
            ) : (
              <>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" className="mx-auto mb-3"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <h3 className="text-lg font-bold text-blue-400 mb-1">En cola</h3>
                <p className="text-sm text-muted">{result.message}</p>
              </>
            )}
          </div>
        )}

        {/* XP note */}
        <p className="text-center text-xs text-muted/60">
          +5 XP por cada QuickMatch, ganes o pierdas. Sube en el Arena Ladder.
        </p>
      </div>
    </div>
  );
}
