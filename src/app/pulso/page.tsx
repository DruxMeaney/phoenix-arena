"use client";

import { useState, useEffect } from "react";

const typeConfig: Record<string, { icon: string; color: string; bg: string }> = {
  match_win: { icon: "V", color: "text-success", bg: "bg-success/10" },
  match_loss: { icon: "D", color: "text-red-400", bg: "bg-red-500/10" },
  quickmatch: { icon: "Q", color: "text-blue-400", bg: "bg-blue-500/10" },
  tournament_join: { icon: "T", color: "text-purple-400", bg: "bg-purple-500/10" },
  tournament_win: { icon: "C", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  purchase: { icon: "S", color: "text-red-400", bg: "bg-red-500/10" },
  level_up: { icon: "N", color: "text-blue-400", bg: "bg-blue-500/10" },
  deposit: { icon: "$", color: "text-success", bg: "bg-success/10" },
  system: { icon: "i", color: "text-muted", bg: "bg-surface-3" },
};

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

interface FeedItem {
  id: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
  user: { username: string; avatar: string | null; tier: string } | null;
}

export default function PulsoPage() {
  const [events, setEvents] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/feed")
      .then((r) => r.json())
      .then((d) => setEvents(d.events || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient">Pulso</h1>
          <p className="text-muted">Lo que esta pasando en Phoenix Arena ahora mismo</p>
        </div>

        {/* Live indicator */}
        <div className="flex items-center justify-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
          <span className="text-xs text-muted uppercase tracking-wider font-medium">En vivo</span>
        </div>

        {/* Feed */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-surface border border-border rounded-2xl p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-3" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-surface-3 rounded w-1/3" />
                    <div className="h-3 bg-surface-3 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-16 text-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 text-muted/30" strokeLinecap="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <h3 className="text-lg font-semibold mb-1">Sin actividad todavia</h3>
            <p className="text-sm text-muted">Cuando los jugadores compitan, veras la actividad aqui en tiempo real</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const cfg = typeConfig[event.type] || typeConfig.system;
              return (
                <div key={event.id} className="bg-surface border border-border rounded-2xl p-5 card-hover transition-all">
                  <div className="flex items-start gap-4">
                    {/* Avatar or icon */}
                    {event.user?.avatar ? (
                      <img src={event.user.avatar} alt="" className="w-10 h-10 rounded-full shrink-0" />
                    ) : (
                      <div className={`w-10 h-10 rounded-full ${cfg.bg} flex items-center justify-center shrink-0`}>
                        <span className={`text-sm font-bold ${cfg.color}`}>{cfg.icon}</span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold">{event.title}</h3>
                        {event.user && (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            event.user.tier === "PRO" ? "badge-pro" : event.user.tier === "AM" ? "badge-am" : "badge-detri"
                          }`}>
                            {event.user.tier}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted mt-0.5">{event.description}</p>
                    </div>

                    <span className="text-xs text-muted shrink-0">{timeAgo(event.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
