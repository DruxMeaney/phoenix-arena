"use client";

import { useState, useEffect, useCallback } from "react";

interface Stats {
  matchesToday: number;
  matchesWeek: number;
  weeklyVolume: number;
  pendingDisputes: number;
  activeUsers: number;
  disputeRate: number;
}

const metricConfig = [
  {
    key: "matchesToday" as const,
    label: "Partidas Hoy",
    color: "text-blue-400",
    accent: "bg-blue-500",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <line x1="6" y1="11" x2="10" y2="11" /><line x1="8" y1="9" x2="8" y2="13" />
        <line x1="15" y1="12" x2="15.01" y2="12" /><line x1="18" y1="10" x2="18.01" y2="10" />
        <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5Z" />
      </svg>
    ),
    format: (v: number) => String(v),
  },
  {
    key: "matchesWeek" as const,
    label: "Partidas Semana",
    color: "text-foreground",
    accent: "bg-foreground/80",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" />
      </svg>
    ),
    format: (v: number) => String(v),
  },
  {
    key: "weeklyVolume" as const,
    label: "Volumen Semanal",
    color: "text-green-400",
    accent: "bg-green-500",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    format: (v: number) => `$${v.toLocaleString()}`,
  },
  {
    key: "pendingDisputes" as const,
    label: "Disputas Pendientes",
    color: "text-red-400",
    accent: "bg-red-500",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    format: (v: number) => String(v),
  },
  {
    key: "activeUsers" as const,
    label: "Usuarios Activos",
    color: "text-blue-400",
    accent: "bg-blue-500",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    format: (v: number) => String(v),
  },
  {
    key: "disputeRate" as const,
    label: "Tasa de Disputas",
    color: "text-muted",
    accent: "bg-muted",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    format: (v: number) => `${v}%`,
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Error al cargar estadisticas");
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-5 animate-pulse">
              <div className="h-3 w-20 bg-surface-2 rounded mb-3" />
              <div className="h-7 w-16 bg-surface-2 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface border border-red-500/30 rounded-xl p-6 text-center">
        <p className="text-red-400 text-sm mb-3">{error}</p>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-surface-2 border border-border text-muted rounded-lg text-sm hover:text-foreground transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        {metricConfig.map((m) => (
          <div key={m.key} className="bg-surface border border-border rounded-xl p-5 relative overflow-hidden">
            {/* Colored accent strip at top */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 ${m.accent}`} />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted uppercase tracking-wider font-medium">{m.label}</span>
              <span className={m.color}>{m.icon}</span>
            </div>
            <p className={`text-2xl font-bold ${m.color}`}>{m.format(stats[m.key])}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
