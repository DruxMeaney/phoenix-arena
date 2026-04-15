"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface LadderPlayer {
  rank: number;
  id: string;
  username: string;
  avatar: string | null;
  tier: string;
  seasonXp: number;
  xp: number;
}

interface Reward {
  rank: number;
  prize: string;
  xpBonus: number;
}

export default function LadderPage() {
  const [ladder, setLadder] = useState<LadderPlayer[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ladder")
      .then((r) => r.json())
      .then((d) => {
        setLadder(d.ladder || []);
        setRewards(d.rewards || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient">Arena Ladder</h1>
          <p className="text-muted max-w-lg mx-auto">Escalera semanal de XP. Compite, acumula puntos y gana premios por estar en el Top 8.</p>
        </div>

        {/* Rewards preview */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">Premios semanales — Top 8</h2>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {rewards.map((r) => (
              <div key={r.rank} className={`text-center p-3 rounded-xl border transition-colors ${
                r.rank <= 3 ? "border-yellow-500/30 bg-yellow-500/5" : "border-border bg-surface-2"
              }`}>
                <p className={`text-lg font-bold ${
                  r.rank === 1 ? "text-yellow-400" : r.rank === 2 ? "text-gray-400" : r.rank === 3 ? "text-orange-400" : "text-foreground"
                }`}>#{r.rank}</p>
                <p className="text-xs font-semibold text-success">{r.prize}</p>
                <p className="text-[10px] text-muted">+{r.xpBonus} XP</p>
              </div>
            ))}
          </div>
        </div>

        {/* How XP works */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-surface border border-border rounded-2xl p-5 card-hover">
            <div className="text-blue-400 mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <h3 className="font-semibold text-sm mb-1">QuickMatch</h3>
            <p className="text-xs text-muted">+5 XP por partida, +15 XP si ganas</p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-5 card-hover">
            <div className="text-purple-400 mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2"/><path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2"/><path d="M6 3h12v7a6 6 0 0 1-12 0V3z"/></svg>
            </div>
            <h3 className="font-semibold text-sm mb-1">Torneos</h3>
            <p className="text-xs text-muted">+25 XP por participar, +100 XP si ganas</p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-5 card-hover">
            <div className="text-red-400 mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            </div>
            <h3 className="font-semibold text-sm mb-1">Retos 1v1</h3>
            <p className="text-xs text-muted">+10 XP por reto, +20 XP si ganas</p>
          </div>
        </div>

        {/* Ladder table */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Clasificacion Semanal</h2>
              <p className="text-sm text-muted">Se reinicia cada lunes a las 00:00 UTC</p>
            </div>
            <Link href="/quickmatch" className="px-4 py-2 rounded-xl bg-gradient-main text-white text-sm font-medium hover:opacity-90 transition-opacity">
              Jugar QuickMatch
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center text-muted">Cargando ladder...</div>
          ) : ladder.length === 0 ? (
            <div className="p-16 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 text-muted/30" strokeLinecap="round"><rect x="2" y="14" width="6" height="8"/><rect x="9" y="8" width="6" height="14"/><rect x="16" y="11" width="6" height="11"/></svg>
              <h3 className="text-lg font-semibold mb-1">Ladder vacio</h3>
              <p className="text-sm text-muted mb-4">Se el primero en jugar esta semana y reclamar el trono</p>
              <Link href="/quickmatch" className="inline-flex px-6 py-2.5 rounded-xl bg-gradient-main text-white text-sm font-medium">
                Iniciar QuickMatch
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted text-left">
                    <th className="px-6 py-3 font-medium w-16">#</th>
                    <th className="px-6 py-3 font-medium">Jugador</th>
                    <th className="px-6 py-3 font-medium">Tier</th>
                    <th className="px-6 py-3 font-medium text-right">XP Semanal</th>
                    <th className="px-6 py-3 font-medium text-right">XP Total</th>
                  </tr>
                </thead>
                <tbody>
                  {ladder.map((p) => (
                    <tr key={p.id} className={`border-b border-border/50 hover:bg-surface-2/50 transition-colors ${
                      p.rank <= 3 ? "bg-yellow-500/[0.03]" : ""
                    }`}>
                      <td className="px-6 py-3.5">
                        <span className={`font-bold ${
                          p.rank === 1 ? "text-yellow-400" : p.rank === 2 ? "text-gray-400" : p.rank === 3 ? "text-orange-400" : "text-muted"
                        }`}>
                          {p.rank}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          {p.avatar ? (
                            <img src={p.avatar} alt="" className="w-8 h-8 rounded-full" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-xs font-bold text-muted">
                              {p.username.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium">{p.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.tier === "PRO" ? "badge-pro" : p.tier === "AM" ? "badge-am" : "badge-detri"
                        }`}>{p.tier}</span>
                      </td>
                      <td className="px-6 py-3.5 text-right font-mono font-semibold text-blue-400">{p.seasonXp.toLocaleString()}</td>
                      <td className="px-6 py-3.5 text-right font-mono text-muted">{p.xp.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
