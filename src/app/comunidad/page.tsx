"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface CommunityUser {
  id: string;
  username: string;
  avatar: string | null;
  tier: string;
  xp: number;
  peakScore: number;
  region: string;
  bio: string | null;
  motto: string | null;
  profileTheme: string;
  isOnline: boolean;
  level: number;
  lastSeen: string;
}

const tierColors: Record<string, string> = { PRO: "badge-pro", AM: "badge-am", Detri: "badge-detri" };

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 5) return "Ahora";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function ComunidadPage() {
  const [users, setUsers] = useState<CommunityUser[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "online">("all");
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("filter", filter);
      const res = await fetch(`/api/community?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setOnlineCount(data.onlineCount);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [search, filter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, [fetchUsers]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient">Comunidad</h1>
          <p className="text-muted">Conoce a los jugadores de Phoenix Arena</p>
        </div>

        {/* Online indicator + search */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
              </span>
              <span className="text-sm font-medium text-success">{onlineCount} en linea</span>
            </div>
            <div className="flex gap-1 bg-surface/30 p-1 rounded-lg">
              <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === "all" ? "bg-gradient-main text-white" : "text-muted hover:text-foreground"}`}>
                Todos
              </button>
              <button onClick={() => setFilter("online")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === "online" ? "bg-gradient-main text-white" : "text-muted hover:text-foreground"}`}>
                En linea
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar jugador..."
              className="w-full bg-surface/50 backdrop-blur-sm border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Users grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-surface/50 border border-border rounded-2xl p-5 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-surface-3" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-surface-3 rounded w-24" />
                    <div className="h-3 bg-surface-3 rounded w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="bg-surface/50 border border-border rounded-2xl p-16 text-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 text-muted/30" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <h3 className="text-lg font-semibold mb-1">{search ? "Sin resultados" : "Comunidad vacia"}</h3>
            <p className="text-sm text-muted">{search ? `No se encontraron jugadores con "${search}"` : "Se el primero en unirte a Phoenix Arena"}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <Link
                key={user.id}
                href={`/jugador/${user.id}`}
                className="group bg-surface/40 backdrop-blur-sm border border-border rounded-2xl p-5 transition-all hover:scale-[1.02] hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar with online indicator */}
                  <div className="relative shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} className="w-14 h-14 rounded-full border-2 border-border group-hover:border-blue-500/40 transition-colors" />
                    ) : (
                      <div className="w-14 h-14 rounded-full border-2 border-border bg-surface-3 flex items-center justify-center text-lg font-bold text-muted group-hover:border-blue-500/40 transition-colors">
                        {user.username.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    {/* Online dot */}
                    <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background ${user.isOnline ? "bg-green-500" : "bg-muted/30"}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate group-hover:text-blue-400 transition-colors">{user.username}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${tierColors[user.tier] || "badge-detri"}`}>{user.tier}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted">Lvl {user.level}</span>
                      {user.peakScore > 0 && <span className="text-xs text-muted">Score {user.peakScore.toFixed(1)}</span>}
                    </div>
                    {user.motto && <p className="text-xs text-muted/60 mt-1 truncate italic">{user.motto}</p>}
                  </div>
                </div>

                {/* Bottom info */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50 text-xs text-muted">
                  <span>{user.region}</span>
                  <span className={user.isOnline ? "text-success font-medium" : ""}>
                    {user.isOnline ? "En linea" : `Visto ${timeAgo(user.lastSeen)}`}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
