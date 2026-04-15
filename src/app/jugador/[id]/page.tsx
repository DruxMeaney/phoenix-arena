"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface PublicProfile {
  id: string;
  username: string;
  avatar: string | null;
  banner: string | null;
  bio: string | null;
  motto: string | null;
  socialTwitter: string | null;
  socialYoutube: string | null;
  socialTwitch: string | null;
  favoriteGame: string | null;
  favoriteWeapon: string | null;
  profileTheme: string;
  tier: string;
  xp: number;
  seasonXp: number;
  peakScore: number;
  region: string;
  isOnline: boolean;
  level: number;
  createdAt: string;
  profilePosts: { id: string; content: string; postType: string; createdAt: string }[];
}

const themes: Record<string, { accent: string }> = {
  "neon-blue": { accent: "#3b82f6" },
  "neon-red": { accent: "#ef4444" },
  "neon-purple": { accent: "#a855f7" },
  "ember": { accent: "#f97316" },
};

const defaultBanners = [
  "linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #312e81 70%, #0f172a 100%)",
  "linear-gradient(135deg, #0f172a 0%, #450a0a 40%, #7f1d1d 70%, #0f172a 100%)",
  "linear-gradient(135deg, #0f172a 0%, #3b0764 40%, #581c87 70%, #0f172a 100%)",
  "linear-gradient(135deg, #0f172a 0%, #431407 40%, #7c2d12 70%, #0f172a 100%)",
];

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Ahora";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function JugadorPage() {
  const params = useParams();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/community/${params.id}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => setProfile(d))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted animate-pulse">Cargando perfil...</div>;
  if (notFound || !profile) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 text-center">
      <div>
        <h2 className="text-xl font-bold mb-2">Jugador no encontrado</h2>
        <Link href="/comunidad" className="text-blue-400 text-sm hover:underline">Volver a la comunidad</Link>
      </div>
    </div>
  );

  const theme = themes[profile.profileTheme] || themes["neon-blue"];
  const bannerIdx = Math.abs(profile.id.charCodeAt(0)) % defaultBanners.length;
  const bannerStyle = profile.banner || defaultBanners[bannerIdx];

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0" style={{ background: `radial-gradient(ellipse at 50% 0%, ${theme.accent}10 0%, transparent 50%)` }} />

      {/* Banner */}
      <div className="relative h-48 sm:h-64 overflow-hidden" style={{ background: bannerStyle }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.04) 4px)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent 5%, ${theme.accent} 50%, transparent 95%)`, boxShadow: `0 0 25px ${theme.accent}, 0 0 50px ${theme.accent}40` }} />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
        {/* Back button */}
        <Link href="/comunidad" className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-background/60 backdrop-blur-sm text-sm font-medium text-foreground hover:bg-background/80 transition-colors z-10">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          Comunidad
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-16 relative z-10 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 mb-8">
          <div className="relative">
            <div className="absolute -inset-2 rounded-full animate-pulse" style={{ background: `conic-gradient(from 0deg, ${theme.accent}, transparent, ${theme.accent})`, filter: "blur(10px)", opacity: 0.5 }} />
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.username} className="relative w-28 h-28 rounded-full border-[3px]" style={{ borderColor: theme.accent, boxShadow: `0 0 20px ${theme.accent}50` }} />
            ) : (
              <div className="relative w-28 h-28 rounded-full border-[3px] bg-surface flex items-center justify-center text-3xl font-bold" style={{ borderColor: theme.accent, color: theme.accent }}>
                {profile.username.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-2 border-background ${profile.isOnline ? "bg-green-500" : "bg-muted/30"}`} />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ textShadow: `0 0 15px ${theme.accent}30` }}>{profile.username}</h1>
              <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${profile.tier === "PRO" ? "badge-pro" : profile.tier === "AM" ? "badge-am" : "badge-detri"}`}>{profile.tier}</span>
              <span className={`text-xs font-medium ${profile.isOnline ? "text-success" : "text-muted"}`}>{profile.isOnline ? "En linea" : `Visto ${timeAgo(profile.createdAt)}`}</span>
            </div>
            {profile.motto && <p className="text-sm mt-1 italic" style={{ color: theme.accent + "cc" }}>&ldquo;{profile.motto}&rdquo;</p>}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted">
              <span>{profile.region}</span>
              <span>Lvl {profile.level}</span>
              <span>Miembro desde {new Date(profile.createdAt).toLocaleDateString("es-MX", { month: "short", year: "numeric" })}</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="bg-surface/40 backdrop-blur-sm rounded-2xl p-5 mb-6" style={{ border: `1px solid ${theme.accent}20` }}>
            <p className="text-sm text-foreground/90 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "XP Total", value: profile.xp.toLocaleString() },
            { label: "XP Semanal", value: profile.seasonXp.toLocaleString() },
            { label: "Peak Score", value: profile.peakScore > 0 ? profile.peakScore.toFixed(1) : "--" },
            { label: "Nivel", value: String(profile.level) },
          ].map((s) => (
            <div key={s.label} className="bg-surface/40 backdrop-blur-sm rounded-xl p-4 text-center" style={{ border: `1px solid ${theme.accent}20`, boxShadow: `0 0 15px ${theme.accent}08` }}>
              <p className="text-lg font-bold" style={{ color: theme.accent }}>{s.value}</p>
              <p className="text-[10px] text-muted uppercase tracking-wider mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Social + Game info */}
        <div className="flex flex-wrap gap-2 mb-8">
          {profile.favoriteGame && <span className="px-3 py-1.5 rounded-lg bg-surface/40 text-xs text-muted" style={{ border: `1px solid ${theme.accent}15` }}>Juego: <span className="text-foreground">{profile.favoriteGame}</span></span>}
          {profile.favoriteWeapon && <span className="px-3 py-1.5 rounded-lg bg-surface/40 text-xs text-muted" style={{ border: `1px solid ${theme.accent}15` }}>Arma: <span className="text-foreground">{profile.favoriteWeapon}</span></span>}
          {profile.socialTwitter && <a href={`https://x.com/${profile.socialTwitter}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-surface/40 text-xs text-blue-400 hover:bg-blue-500/10 transition-colors" style={{ border: `1px solid ${theme.accent}15` }}>@{profile.socialTwitter}</a>}
          {profile.socialTwitch && <a href={`https://twitch.tv/${profile.socialTwitch}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-surface/40 text-xs text-purple-400 hover:bg-purple-500/10 transition-colors" style={{ border: `1px solid ${theme.accent}15` }}>{profile.socialTwitch}</a>}
        </div>

        {/* Posts */}
        {profile.profilePosts.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">Publicaciones</h3>
            {profile.profilePosts.map((post) => (
              <div key={post.id} className="bg-surface/40 backdrop-blur-sm rounded-2xl p-5" style={{ border: `1px solid ${theme.accent}15` }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: theme.accent }}>{post.postType}</span>
                  <span className="text-xs text-muted">{timeAgo(post.createdAt)}</span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">{post.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
