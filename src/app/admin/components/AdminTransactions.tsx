"use client";

import { useState, useEffect, useCallback } from "react";

function adminFetch(url: string, options: RequestInit = {}) {
  const pass = typeof window !== "undefined" ? sessionStorage.getItem("phoenix_admin_pass") || "" : "";
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-password": pass,
      ...(options.headers || {}),
    },
  });
}

const typeFilters = [
  "Todos",
  "deposit",
  "withdrawal",
  "purchase",
  "challenge_entry",
  "challenge_win",
  "tournament_entry",
  "tournament_win",
  "commission",
];

function typeLabel(type: string) {
  switch (type) {
    case "deposit": return "Deposito";
    case "withdrawal": return "Retiro";
    case "purchase": return "Compra";
    case "challenge_entry": return "Entrada Desafio";
    case "challenge_win": return "Victoria Desafio";
    case "tournament_entry": return "Entrada Torneo";
    case "tournament_win": return "Victoria Torneo";
    case "commission": return "Comision";
    default: return type;
  }
}

function typeBadge(type: string) {
  switch (type) {
    case "deposit": return "bg-green-500/15 text-green-400";
    case "withdrawal": return "bg-red-500/15 text-red-400";
    case "purchase": return "bg-blue-500/15 text-blue-400";
    case "challenge_entry": return "bg-orange-500/15 text-orange-400";
    case "challenge_win": return "bg-green-500/15 text-green-400";
    case "tournament_entry": return "bg-purple-500/15 text-purple-400";
    case "tournament_win": return "bg-green-500/15 text-green-400";
    case "commission": return "bg-yellow-500/15 text-yellow-400";
    default: return "bg-surface-3 text-muted";
  }
}

function statusBadge(status: string) {
  switch (status) {
    case "completed": return "bg-green-500/15 text-green-400";
    case "pending": return "bg-yellow-500/15 text-yellow-400";
    case "failed": return "bg-red-500/15 text-red-400";
    default: return "bg-surface-3 text-muted";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "completed": return "Completada";
    case "pending": return "Pendiente";
    case "failed": return "Fallida";
    default: return status;
  }
}

function isPositiveType(type: string) {
  return ["deposit", "challenge_win", "tournament_win"].includes(type);
}

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [summary, setSummary] = useState({ totalVolume: 0, depositsToday: 0, withdrawalsPending: 0 });

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminFetch("/api/admin/transactions");
      if (!res.ok) throw new Error("Error al cargar transacciones");
      const data = await res.json();
      const txList = data.transactions || data;
      setTransactions(txList);

      // Compute summary
      let totalVolume = 0;
      let depositsToday = 0;
      let withdrawalsPending = 0;
      const today = new Date().toDateString();

      for (const tx of txList) {
        totalVolume += Math.abs(tx.amount || 0);
        if (tx.type === "deposit" && tx.createdAt && new Date(tx.createdAt).toDateString() === today) {
          depositsToday += Math.abs(tx.amount || 0);
        }
        if (tx.type === "withdrawal" && tx.status === "pending") {
          withdrawalsPending += Math.abs(tx.amount || 0);
        }
      }
      setSummary({ totalVolume, depositsToday, withdrawalsPending });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filtered = activeFilter === "Todos"
    ? transactions
    : transactions.filter((t) => t.type === activeFilter);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-4 animate-pulse">
              <div className="h-3 w-20 bg-surface-2 rounded mb-2" />
              <div className="h-6 w-16 bg-surface-2 rounded" />
            </div>
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-surface border border-border rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface border border-red-500/30 rounded-xl p-6 text-center">
        <p className="text-red-400 text-sm mb-3">{error}</p>
        <button onClick={fetchTransactions} className="px-4 py-2 bg-surface-2 border border-border text-muted rounded-lg text-sm hover:text-foreground transition-colors">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-foreground">Transacciones</h2>

      {/* Summary cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <div className="bg-surface border border-border rounded-xl p-4">
          <span className="text-xs text-muted uppercase tracking-wider">Volumen Total</span>
          <p className="text-xl font-bold text-foreground mt-1">${summary.totalVolume.toLocaleString()}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <span className="text-xs text-muted uppercase tracking-wider">Depositos Hoy</span>
          <p className="text-xl font-bold text-green-400 mt-1">${summary.depositsToday.toLocaleString()}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <span className="text-xs text-muted uppercase tracking-wider">Retiros Pendientes</span>
          <p className="text-xl font-bold text-yellow-400 mt-1">${summary.withdrawalsPending.toLocaleString()}</p>
        </div>
      </div>

      {/* Type filters */}
      <div className="bg-surface-2 rounded-xl p-1 flex gap-0.5 overflow-x-auto">
        {typeFilters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${activeFilter === f ? "bg-surface-3 text-foreground" : "text-muted hover:text-foreground"}`}
          >
            {f === "Todos" ? "Todos" : typeLabel(f)}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-10 text-center">
          <p className="text-muted text-sm">No hay transacciones {activeFilter !== "Todos" ? `de tipo "${typeLabel(activeFilter)}"` : ""}.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-2/50 text-left text-xs text-muted uppercase tracking-wide">
                <th className="px-4 py-3 font-semibold rounded-tl-lg">Usuario</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Monto</th>
                <th className="px-4 py-3 font-semibold">Descripcion</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold rounded-tr-lg">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx: any, i: number) => {
                const amount = tx.amount || 0;
                const positive = isPositiveType(tx.type) || amount > 0;
                return (
                  <tr key={tx._id || tx.id || i} className="border-b border-border/50 hover:bg-surface-2/60 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{tx.username || tx.userId || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeBadge(tx.type)}`}>
                        {typeLabel(tx.type)}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-semibold ${positive ? "text-green-400" : "text-red-400"}`}>
                      {positive ? "+" : "-"}${Math.abs(amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-muted text-xs max-w-[200px] truncate">{tx.description || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusBadge(tx.status)}`}>
                        {statusLabel(tx.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
