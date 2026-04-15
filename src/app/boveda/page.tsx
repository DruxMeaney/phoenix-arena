"use client";

import { useState, useEffect } from "react";

interface VaultItemData {
  id: string;
  itemType: string;
  itemName: string;
  quantity: number;
  used: boolean;
  usedAt: string | null;
  acquiredAt: string;
}

const typeIcons: Record<string, { color: string; label: string }> = {
  credit_pack: { color: "text-blue-400", label: "Creditos" },
  name_change: { color: "text-purple-400", label: "Identidad" },
  record_reset: { color: "text-red-400", label: "Historial" },
  badge: { color: "text-yellow-400", label: "Insignia" },
  title: { color: "text-green-400", label: "Titulo" },
};

export default function BovedaPage() {
  const [items, setItems] = useState<VaultItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [using, setUsing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [showNameModal, setShowNameModal] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/vault")
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUse = async (itemId: string, itemType: string) => {
    if (itemType === "name_change") {
      setShowNameModal(itemId);
      return;
    }

    setUsing(itemId);
    setMessage(null);
    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: data.message });
        setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, used: true } : i)));
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexion" });
    }
    setUsing(null);
  };

  const handleNameChange = async () => {
    if (!showNameModal || !nameInput.trim()) return;
    setUsing(showNameModal);
    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: showNameModal, newUsername: nameInput.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: data.message });
        setItems((prev) => prev.map((i) => (i.id === showNameModal ? { ...i, used: true } : i)));
        setShowNameModal(null);
        setNameInput("");
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexion" });
    }
    setUsing(null);
  };

  const unused = items.filter((i) => !i.used);
  const used = items.filter((i) => i.used);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient">Mi Boveda</h1>
          <p className="text-muted">Tu inventario personal. Todos los items que has adquirido en la Tienda Phoenix.</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-xl text-sm font-medium text-center ${
            message.type === "success" ? "bg-success/10 text-success border border-success/30" : "bg-red-500/10 text-red-400 border border-red-500/30"
          }`}>{message.text}</div>
        )}

        {/* Name change modal */}
        {showNameModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-sm space-y-4">
              <h3 className="font-semibold">Cambio de Identidad</h3>
              <p className="text-sm text-muted">Ingresa tu nuevo nombre de usuario:</p>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Nuevo nombre"
                className="w-full bg-surface-2 border border-border rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-blue-500"
                maxLength={20}
                minLength={3}
              />
              <div className="flex gap-3">
                <button onClick={() => setShowNameModal(null)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-surface-2 transition-colors">
                  Cancelar
                </button>
                <button onClick={handleNameChange} disabled={!nameInput.trim() || using === showNameModal} className="flex-1 py-2.5 rounded-xl bg-gradient-main text-white text-sm font-semibold disabled:opacity-40">
                  {using === showNameModal ? "Aplicando..." : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-muted">Cargando boveda...</div>
        ) : items.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-16 text-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 text-muted/30" strokeLinecap="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 0 0-8 0v2"/><circle cx="12" cy="15" r="1"/>
            </svg>
            <h3 className="text-lg font-semibold mb-1">Boveda vacia</h3>
            <p className="text-sm text-muted">Visita la Tienda Phoenix para adquirir items y personalizacion</p>
          </div>
        ) : (
          <>
            {/* Available items */}
            {unused.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">Disponibles ({unused.length})</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {unused.map((item) => {
                    const cfg = typeIcons[item.itemType] || { color: "text-muted", label: item.itemType };
                    return (
                      <div key={item.id} className="bg-surface border border-border rounded-2xl p-5 card-hover flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center shrink-0 ${cfg.color}`}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 0 0-8 0v2"/></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{item.itemName}</p>
                          <p className="text-xs text-muted">{cfg.label} — {new Date(item.acquiredAt).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}</p>
                        </div>
                        {item.itemType !== "credit_pack" && (
                          <button
                            onClick={() => handleUse(item.id, item.itemType)}
                            disabled={using === item.id}
                            className="px-4 py-2 rounded-lg bg-gradient-main text-white text-xs font-semibold hover:opacity-90 disabled:opacity-40 shrink-0"
                          >
                            {using === item.id ? "..." : "Usar"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Used items */}
            {used.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">Usados ({used.length})</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {used.map((item) => (
                    <div key={item.id} className="bg-surface border border-border/50 rounded-2xl p-4 flex items-center gap-3 opacity-50">
                      <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-muted shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{item.itemName}</p>
                        <p className="text-xs text-muted">Usado {item.usedAt ? new Date(item.usedAt).toLocaleDateString("es-MX", { day: "numeric", month: "short" }) : ""}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
