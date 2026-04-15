"use client";

import { useState, useEffect } from "react";

interface StoreItem {
  id: string;
  type: string;
  name: string;
  price: number;
  credits: number;
  description: string;
}

const typeLabels: Record<string, string> = {
  credit_pack: "Creditos",
  name_change: "Identidad",
  record_reset: "Historial",
  badge: "Insignia",
  title: "Titulo",
};

const typeColors: Record<string, { border: string; glow: string; icon: string }> = {
  credit_pack: { border: "border-blue-500/30 hover:border-blue-500/60", glow: "shadow-blue-500/5 hover:shadow-blue-500/15", icon: "text-blue-400" },
  name_change: { border: "border-purple-500/30 hover:border-purple-500/60", glow: "shadow-purple-500/5 hover:shadow-purple-500/15", icon: "text-purple-400" },
  record_reset: { border: "border-red-500/30 hover:border-red-500/60", glow: "shadow-red-500/5 hover:shadow-red-500/15", icon: "text-red-400" },
  badge: { border: "border-yellow-500/30 hover:border-yellow-500/60", glow: "shadow-yellow-500/5 hover:shadow-yellow-500/15", icon: "text-yellow-400" },
  title: { border: "border-green-500/30 hover:border-green-500/60", glow: "shadow-green-500/5 hover:shadow-green-500/15", icon: "text-green-400" },
};

export default function TiendaPage() {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [buying, setBuying] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/store")
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => {});
  }, []);

  const handleBuy = async (itemId: string) => {
    setBuying(itemId);
    setMessage(null);
    try {
      const res = await fetch("/api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: data.message });
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexion" });
    }
    setBuying(null);
  };

  const creditPacks = items.filter((i) => i.type === "credit_pack");
  const utilities = items.filter((i) => i.type !== "credit_pack");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient">Tienda Phoenix</h1>
          <p className="text-muted max-w-lg mx-auto">Potencia tu experiencia competitiva con creditos, items y personalizacion</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-xl text-sm font-medium text-center ${
            message.type === "success" ? "bg-success/10 text-success border border-success/30" : "bg-red-500/10 text-red-400 border border-red-500/30"
          }`}>
            {message.text}
          </div>
        )}

        {/* Credit Packs */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v12"/><path d="M15 9.5a3 3 0 0 0-3-2.5H9"/><path d="M9 14.5a3 3 0 0 0 3 2.5h3"/></svg>
            Creditos Phoenix
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {creditPacks.map((item) => {
              const colors = typeColors[item.type];
              const pricePerCredit = (item.price / item.credits).toFixed(3);
              const isBest = item.id === "credits-1200";
              return (
                <div key={item.id} className={`relative bg-surface border ${colors.border} rounded-2xl p-6 shadow-lg ${colors.glow} transition-all flex flex-col`}>
                  {isBest && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gradient-main text-white tracking-wider">
                      Mejor valor
                    </span>
                  )}
                  <div className={`text-3xl font-bold ${colors.icon} mb-1`}>{item.credits.toLocaleString()}</div>
                  <p className="text-xs text-muted mb-4">${pricePerCredit} por credito</p>
                  <p className="text-sm text-muted leading-relaxed mb-5 flex-1">{item.description}</p>
                  <button
                    onClick={() => handleBuy(item.id)}
                    disabled={buying === item.id}
                    className="w-full py-3 rounded-xl bg-gradient-main text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
                  >
                    {buying === item.id ? "Procesando..." : `$${item.price} USD`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Utilities & Cosmetics */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
            Utilidades y Cosmeticos
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {utilities.map((item) => {
              const colors = typeColors[item.type] || typeColors.badge;
              return (
                <div key={item.id} className={`bg-surface border ${colors.border} rounded-2xl p-6 shadow-lg ${colors.glow} transition-all flex flex-col`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${colors.icon} mb-2`}>
                    {typeLabels[item.type] || item.type}
                  </span>
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className="text-xs text-muted leading-relaxed mb-5 flex-1">{item.description}</p>
                  <button
                    onClick={() => handleBuy(item.id)}
                    disabled={buying === item.id}
                    className="w-full py-2.5 rounded-xl border border-border-light text-foreground font-medium text-sm hover:bg-surface-2 transition-colors disabled:opacity-40"
                  >
                    {buying === item.id ? "..." : `$${item.price} USD`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted/60">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
          Todas las compras van a tu Boveda y quedan disponibles hasta que decidas usarlas
        </div>
      </div>
    </div>
  );
}
