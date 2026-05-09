"use client";

import { useState, useEffect, useCallback } from "react";
import PlayerPsrHistoryView from "@/components/player-psr-history";
import type { PlayerPsrHistory } from "@/lib/ranking/player-history";

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

type FilterMode = "todos" | "activos" | "flagged";

interface AdminTransaction {
  id?: string;
  type?: string;
  amount: number;
  description?: string;
  createdAt?: string;
}

interface AdminWallet {
  balance?: number;
  heldBalance?: number;
  transactions?: AdminTransaction[];
}

interface AdminMatchRecord {
  id?: string;
  sourceType?: string;
  tournamentType?: string;
  date?: string;
  position?: number;
  kills?: number;
  teamPoints?: number;
  skillPoints?: number;
}

interface AdminTournamentResult {
  id?: string;
  tournament?: { id: string; name: string };
  name?: string;
  tournamentName?: string;
  placement?: number;
  kills?: number;
  skillPoints?: number;
  prize?: number;
  winnings?: number;
}

interface AdminDispute {
  id?: string;
  reason?: string;
  status?: string;
}

interface AdminUser {
  _id?: string;
  id: string;
  username: string;
  email?: string | null;
  avatar?: string | null;
  discordId?: string | null;
  role?: string;
  status?: string;
  tier?: string;
  peakScore?: number;
  psrScore?: number;
  psrMu?: number;
  psrSigma?: number;
  psrMatches?: number;
  peakPsr?: number;
  psrModelVersion?: string;
  trustScore?: number;
  trustLevel?: string;
  isFlagged?: boolean;
  flagged?: boolean;
  xp?: number;
  region?: string;
  platform?: string;
  activisionId?: string | null;
  createdAt?: string;
  lastSeen?: string;
  balance?: number;
  heldBalance?: number;
  matchCount?: number;
  totalMatches?: number;
  tournamentCount?: number;
  totalTournaments?: number;
  disputeCount?: number;
  wallet?: AdminWallet | null;
  transactions?: AdminTransaction[];
  matchRecords?: AdminMatchRecord[];
  matches?: AdminMatchRecord[];
  tournamentResults?: AdminTournamentResult[];
  tournamentHistory?: AdminTournamentResult[];
  tournaments?: AdminTournamentResult[];
  disputesAsReporter?: AdminDispute[];
  disputes?: AdminDispute[];
  psrHistory?: PlayerPsrHistory | null;
}

function tierBadgeClass(tier: string) {
  const t = (tier || "").toLowerCase();
  if (t === "pro") return "badge-pro";
  if (t === "amateur" || t === "am") return "badge-am";
  return "badge-detri";
}

function statusColor(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "active" || s === "activo") return "bg-green-500/15 text-green-400";
  if (s === "suspended" || s === "suspendido") return "bg-yellow-500/15 text-yellow-400";
  if (s === "banned") return "bg-red-500/15 text-red-400";
  return "bg-surface-3 text-muted";
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterMode>("todos");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ role: "player", status: "active", tier: "", isFlagged: false });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminFetch("/api/admin/users");
      if (!res.ok) throw new Error("Error al cargar usuarios");
      const data = await res.json();
      setUsers(data.users || data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((u) => {
    const matchSearch = !search || (u.username || "").toLowerCase().includes(search.toLowerCase());
    if (filter === "activos") return matchSearch && ((u.status || "").toLowerCase() === "active" || (u.status || "").toLowerCase() === "activo");
    if (filter === "flagged") return matchSearch && (u.isFlagged || u.flagged);
    return matchSearch;
  });

  const openDetail = async (user: AdminUser) => {
    try {
      setDetailLoading(true);
      setSelectedUser(user);
      setEditing(false);
      setMessage({ type: "", text: "" });
      const userId = user._id || user.id;
      const res = await adminFetch(`/api/admin/users/${userId}`);
      if (res.ok) {
        const detail = await res.json();
        setSelectedUser(detail.user || detail);
      }
    } catch {
      // Use the basic user data we already have
    } finally {
      setDetailLoading(false);
    }
  };

  const startEdit = () => {
    if (!selectedUser) return;
    setEditForm({
      role: selectedUser.role || "player",
      status: selectedUser.status || "active",
      tier: selectedUser.tier || "",
      isFlagged: selectedUser.isFlagged || selectedUser.flagged || false,
    });
    setEditing(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });
      const res = await adminFetch("/api/admin/users", {
        method: "PUT",
        body: JSON.stringify({
          id: selectedUser._id || selectedUser.id,
          ...editForm,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error al actualizar usuario");
      }
      setMessage({ type: "success", text: "Usuario actualizado" });
      setEditing(false);
      fetchUsers();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Error al actualizar usuario" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-surface-2 rounded-xl animate-pulse" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 bg-surface border border-border rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface border border-red-500/30 rounded-xl p-6 text-center">
        <p className="text-red-400 text-sm mb-3">{error}</p>
        <button onClick={fetchUsers} className="px-4 py-2 bg-surface-2 border border-border text-muted rounded-lg text-sm hover:text-foreground transition-colors">
          Reintentar
        </button>
      </div>
    );
  }

  // Detail view
  if (selectedUser) {
    const u = selectedUser;
    const wallet = u.wallet || {};
    const transactions = wallet.transactions || u.transactions || [];
    const matchRecords = u.matchRecords || u.matches || [];
    const tournamentHistory = u.tournamentResults || u.tournamentHistory || u.tournaments || [];
    const disputes = u.disputesAsReporter || u.disputes || [];

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => { setSelectedUser(null); setEditing(false); }} className="px-3 py-1.5 bg-surface-2 border border-border text-muted rounded-lg text-xs hover:text-foreground transition-colors">
            &larr; Volver
          </button>
          <h2 className="text-lg font-bold text-foreground">{u.username}</h2>
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${tierBadgeClass(u.tier || "Detri")}`}>{u.tier || "Detri"}</span>
        </div>

        {message.text && (
          <div className={`rounded-xl px-4 py-3 text-sm ${message.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
            {message.text}
          </div>
        )}

        {detailLoading ? (
          <div className="bg-surface border border-border rounded-xl p-10 text-center">
            <p className="text-muted text-sm">Cargando detalles...</p>
          </div>
        ) : (
          <>
            {/* Profile info */}
            <div className="bg-surface border border-border rounded-xl p-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div><span className="text-xs text-muted uppercase">Email</span><p className="text-sm text-foreground">{u.email || "-"}</p></div>
                <div><span className="text-xs text-muted uppercase">Rol</span><p className="text-sm text-foreground">{u.role || "player"}</p></div>
                <div><span className="text-xs text-muted uppercase">Estado</span><p className="text-sm"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor(u.status || "active")}`}>{u.status || "active"}</span></p></div>
                <div><span className="text-xs text-muted uppercase">Region</span><p className="text-sm text-foreground">{u.region || "-"}</p></div>
                <div><span className="text-xs text-muted uppercase">PSR</span><p className="text-sm font-bold text-foreground">{(u.psrScore ?? 0).toFixed(1)}</p></div>
                <div><span className="text-xs text-muted uppercase">Mu / Sigma</span><p className="text-sm font-bold text-foreground">{(u.psrMu ?? 0).toFixed(1)} / {(u.psrSigma ?? 0).toFixed(1)}</p></div>
                <div><span className="text-xs text-muted uppercase">XP</span><p className="text-sm font-bold text-foreground">{u.xp ?? 0}</p></div>
                <div><span className="text-xs text-muted uppercase">Balance</span><p className="text-sm font-bold text-green-400">${wallet.balance ?? u.balance ?? 0}</p></div>
                <div><span className="text-xs text-muted uppercase">Flagged</span><p className="text-sm text-foreground">{u.isFlagged || u.flagged ? "Si" : "No"}</p></div>
              </div>
            </div>

            {/* Edit form */}
            {editing && (
              <form onSubmit={handleUpdate} className="bg-surface border border-border rounded-xl p-5 space-y-4">
                <h3 className="font-bold text-foreground text-sm">Editar Usuario</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="block text-xs text-muted mb-1.5">Rol</label>
                    <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-red-500">
                      <option value="player">Player</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1.5">Estado</label>
                    <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-red-500">
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="banned">Banned</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1.5">Tier Override</label>
                    <input type="text" value={editForm.tier} onChange={(e) => setEditForm({ ...editForm, tier: e.target.value })} placeholder="Pro / Amateur / Detri" className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-red-500 transition-colors" />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editForm.isFlagged} onChange={(e) => setEditForm({ ...editForm, isFlagged: e.target.checked })} className="w-4 h-4 rounded border-border bg-surface-2 accent-red-500" />
                      <span className="text-sm text-foreground">Flagged</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 transition-all disabled:opacity-50">
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                  <button type="button" onClick={() => setEditing(false)} className="px-4 py-2.5 bg-surface-2 border border-border text-muted rounded-lg text-sm hover:text-foreground transition-colors">
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {!editing && (
              <button onClick={startEdit} className="px-4 py-2 bg-surface-2 border border-border text-muted rounded-lg text-sm font-medium hover:text-foreground transition-colors">
                Editar Usuario
              </button>
            )}

            <PlayerPsrHistoryView history={u.psrHistory} compact={false} />

            {/* Recent Transactions */}
            {transactions.length > 0 && (
              <div className="bg-surface border border-border rounded-xl p-5">
                <h3 className="font-bold text-foreground mb-3 text-sm">Transacciones Recientes</h3>
                <div className="space-y-2">
                  {transactions.slice(0, 10).map((tx, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div>
                        <p className="text-sm text-foreground">{tx.description || tx.type}</p>
                        <p className="text-xs text-muted">{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : ""}</p>
                      </div>
                    <span className={`text-sm font-semibold ${tx.amount >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {tx.amount >= 0 ? "+" : ""}${Math.abs(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Match Records */}
            {Array.isArray(matchRecords) && matchRecords.length > 0 && (
              <div className="bg-surface border border-border rounded-xl p-5">
                <h3 className="font-bold text-foreground mb-3 text-sm">Historial de Partidas ({matchRecords.length})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-muted uppercase border-b border-border">
                        <th className="pb-2 pr-4 font-semibold">Fuente</th>
                        <th className="pb-2 pr-4 font-semibold">Placement</th>
                        <th className="pb-2 pr-4 font-semibold">Kills</th>
                        <th className="pb-2 pr-4 font-semibold">Skill</th>
                        <th className="pb-2 font-semibold">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matchRecords.slice(0, 10).map((m, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-2 pr-4 text-foreground">{m.sourceType || m.tournamentType || "-"}</td>
                          <td className="py-2 pr-4 text-foreground">#{m.position || "-"}</td>
                          <td className="py-2 pr-4 text-foreground">{m.kills ?? 0}</td>
                          <td className="py-2 pr-4 text-foreground">{(m.skillPoints ?? m.teamPoints ?? 0).toFixed(1)}</td>
                          <td className="py-2 text-xs text-muted">{m.date ? new Date(m.date).toLocaleDateString() : "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tournament History */}
            {Array.isArray(tournamentHistory) && tournamentHistory.length > 0 && (
              <div className="bg-surface border border-border rounded-xl p-5">
                <h3 className="font-bold text-foreground mb-3 text-sm">Historial de Torneos ({tournamentHistory.length})</h3>
                <div className="space-y-2">
                  {tournamentHistory.slice(0, 10).map((t, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div>
                        <p className="text-sm text-foreground">{t.tournament?.name || t.name || t.tournamentName || "Torneo"}</p>
                        <p className="text-xs text-muted">Placement: #{t.placement || "-"}</p>
                      </div>
                      <span className="text-sm font-semibold text-foreground">${t.prize || t.winnings || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disputes */}
            {Array.isArray(disputes) && disputes.length > 0 && (
              <div className="bg-surface border border-border rounded-xl p-5">
                <h3 className="font-bold text-foreground mb-3 text-sm">Disputas ({disputes.length})</h3>
                <div className="space-y-2">
                  {disputes.map((d, i) => (
                    <div key={i} className="py-2 border-b border-border/50 last:border-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-foreground">{d.reason || "Disputa"}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${d.status === "resolved" ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400"}`}>{d.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-foreground">Usuarios</h2>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por username..."
            className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {(["todos", "activos", "flagged"] as FilterMode[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${filter === f ? "bg-surface-3 text-foreground" : "bg-surface-2 border border-border text-muted hover:text-foreground"}`}
            >
              {f === "todos" ? "Todos" : f === "activos" ? "Activos" : "Flagged"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filteredUsers.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-10 text-center">
          <p className="text-muted text-sm">No se encontraron usuarios.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-2/50 text-left text-xs text-muted uppercase tracking-wide">
                <th className="px-4 py-3 font-semibold rounded-tl-lg">Usuario</th>
                <th className="px-4 py-3 font-semibold">Tier</th>
                <th className="px-4 py-3 font-semibold">Score</th>
                <th className="px-4 py-3 font-semibold">XP</th>
                <th className="px-4 py-3 font-semibold">Balance</th>
                <th className="px-4 py-3 font-semibold">Region</th>
                <th className="px-4 py-3 font-semibold">Partidas</th>
                <th className="px-4 py-3 font-semibold">Torneos</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold rounded-tr-lg">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, i) => (
                <tr key={u._id || u.id || i} className="border-b border-border/50 hover:bg-surface-2/60 transition-colors cursor-pointer" onClick={() => openDetail(u)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-xs font-bold text-muted shrink-0">
                        {(u.username || "?")[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{u.username}</p>
                        <p className="text-[10px] text-muted truncate">{u.email || ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${tierBadgeClass(u.tier || "Detri")}`}>{u.tier || "Detri"}</span>
                  </td>
                  <td className="px-4 py-3 text-foreground font-medium">{(u.psrScore ?? u.peakScore ?? 0).toFixed(1)}</td>
                  <td className="px-4 py-3 text-muted">{u.xp ?? 0}</td>
                  <td className="px-4 py-3 text-foreground font-medium">${u.balance ?? 0}</td>
                  <td className="px-4 py-3 text-muted text-xs">{u.region || "-"}</td>
                  <td className="px-4 py-3 text-muted">{u.matchCount ?? u.totalMatches ?? 0}</td>
                  <td className="px-4 py-3 text-muted">{u.tournamentCount ?? u.totalTournaments ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor(u.status || "active")}`}>{u.status || "active"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); openDetail(u); }}
                      className="p-1.5 rounded-md bg-surface-2 border border-border text-muted hover:text-foreground transition-colors"
                      title="Ver detalle"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
