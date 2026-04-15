"use client";

import { useState, useEffect, useCallback } from "react";

/* ── Profile data interface ──────────────────────────────────── */
interface ProfileData {
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
  region: string;
  activisionId: string | null;
  tier: string;
  xp: number;
  seasonXp: number;
  peakScore: number;
  createdAt: string;
  balance: number;
  posts: Post[];
}

interface Post {
  id: string;
  content: string;
  imageUrl: string | null;
  postType: string;
  likes: number;
  createdAt: string;
}

const themes: Record<string, { accent: string; glow: string; border: string; bg: string; text: string }> = {
  "neon-blue": { accent: "#3b82f6", glow: "shadow-blue-500/30", border: "border-blue-500/40", bg: "bg-blue-500/10", text: "text-blue-400" },
  "neon-red": { accent: "#ef4444", glow: "shadow-red-500/30", border: "border-red-500/40", bg: "bg-red-500/10", text: "text-red-400" },
  "neon-purple": { accent: "#a855f7", glow: "shadow-purple-500/30", border: "border-purple-500/40", bg: "bg-purple-500/10", text: "text-purple-400" },
  "ember": { accent: "#f97316", glow: "shadow-orange-500/30", border: "border-orange-500/40", bg: "bg-orange-500/10", text: "text-orange-400" },
};

const defaultBanners = [
  "linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #312e81 70%, #0f172a 100%)",
  "linear-gradient(135deg, #0f172a 0%, #450a0a 40%, #7f1d1d 70%, #0f172a 100%)",
  "linear-gradient(135deg, #0f172a 0%, #3b0764 40%, #581c87 70%, #0f172a 100%)",
  "linear-gradient(135deg, #0f172a 0%, #431407 40%, #7c2d12 70%, #0f172a 100%)",
];

const postTypes = [
  { value: "update", label: "Actualizacion", icon: "M" },
  { value: "achievement", label: "Logro", icon: "L" },
  { value: "highlight", label: "Highlight", icon: "H" },
  { value: "setup", label: "Mi Setup", icon: "S" },
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

export default function PerfilPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ bio: "", motto: "", socialTwitter: "", socialYoutube: "", socialTwitch: "", favoriteGame: "", favoriteWeapon: "", profileTheme: "neon-blue", banner: "" });
  const [saving, setSaving] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [postType, setPostType] = useState("update");
  const [posting, setPosting] = useState(false);
  const [activeTab, setActiveTab] = useState<"feed" | "stats" | "edit">("feed");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setEditData({
          bio: data.bio || "", motto: data.motto || "",
          socialTwitter: data.socialTwitter || "", socialYoutube: data.socialYoutube || "", socialTwitch: data.socialTwitch || "",
          favoriteGame: data.favoriteGame || "", favoriteWeapon: data.favoriteWeapon || "",
          profileTheme: data.profileTheme || "neon-blue", banner: data.banner || "",
        });
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const theme = themes[profile?.profileTheme || "neon-blue"] || themes["neon-blue"];
  const bannerIdx = profile ? Math.abs(profile.id.charCodeAt(0)) % defaultBanners.length : 0;
  const bannerStyle = profile?.banner || defaultBanners[bannerIdx];

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Perfil actualizado" });
        setEditing(false);
        fetchProfile();
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error });
      }
    } catch { setMessage({ type: "error", text: "Error de conexion" }); }
    setSaving(false);
  };

  const handlePost = async () => {
    if (!newPost.trim()) return;
    setPosting(true);
    try {
      const res = await fetch("/api/profile/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newPost, postType }),
      });
      if (res.ok) {
        setNewPost("");
        fetchProfile();
      }
    } catch { /* ignore */ }
    setPosting(false);
  };

  const handleDeletePost = async (postId: string) => {
    await fetch(`/api/profile/posts?id=${postId}`, { method: "DELETE" });
    fetchProfile();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted animate-pulse">Cargando perfil...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold">Inicia sesion para ver tu perfil</h2>
          <a href="/login" className="inline-block bg-gradient-main text-white rounded-xl px-8 py-3 font-semibold">Iniciar Sesion</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Ambient neon glow (full page) ───────────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-0" style={{ background: `radial-gradient(ellipse at 50% 0%, ${theme.accent}12 0%, transparent 50%)` }} />

      {/* ── Neon Banner ─────────────────────────────────────────── */}
      <div className="relative h-56 sm:h-72 overflow-hidden" style={{ background: bannerStyle }}>
        {/* Neon scan lines */}
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)" }} />
        {/* Neon glow from top */}
        <div className="absolute top-0 left-0 right-0 h-32" style={{ background: `radial-gradient(ellipse at 50% 0%, ${theme.accent}25 0%, transparent 70%)` }} />
        {/* Side neon strips */}
        <div className="absolute top-0 left-0 w-px h-full" style={{ background: `linear-gradient(180deg, ${theme.accent}60 0%, transparent 100%)`, boxShadow: `0 0 15px ${theme.accent}60` }} />
        <div className="absolute top-0 right-0 w-px h-full" style={{ background: `linear-gradient(180deg, ${theme.accent}60 0%, transparent 100%)`, boxShadow: `0 0 15px ${theme.accent}60` }} />
        {/* Bottom neon edge — thicker and brighter */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent 5%, ${theme.accent} 50%, transparent 95%)`, boxShadow: `0 0 30px ${theme.accent}, 0 0 60px ${theme.accent}60, 0 0 100px ${theme.accent}30` }} />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-20 relative z-10 pb-16">
        {/* ── Profile Header ──────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 mb-8">
          {/* Avatar with intense neon ring */}
          <div className="relative">
            <div className="absolute -inset-2 rounded-full animate-pulse" style={{ background: `conic-gradient(from 0deg, ${theme.accent}, transparent, ${theme.accent})`, filter: `blur(12px)`, opacity: 0.7 }} />
            <div className="absolute -inset-1 rounded-full" style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}40, ${theme.accent})`, filter: `blur(6px)`, opacity: 0.8 }} />
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.username} className="relative w-32 h-32 rounded-full border-[3px]" style={{ borderColor: theme.accent, boxShadow: `0 0 20px ${theme.accent}60, inset 0 0 20px ${theme.accent}20` }} />
            ) : (
              <div className="relative w-32 h-32 rounded-full border-[3px] bg-surface flex items-center justify-center text-3xl font-bold" style={{ borderColor: theme.accent, boxShadow: `0 0 20px ${theme.accent}60, inset 0 0 20px ${theme.accent}20`, color: theme.accent }}>
                {profile.username.slice(0, 2).toUpperCase()}
              </div>
            )}
            {/* XP level badge — neon glow */}
            <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-bold bg-background" style={{ border: `2px solid ${theme.accent}`, boxShadow: `0 0 12px ${theme.accent}50`, color: theme.accent }}>
              {Math.floor(profile.xp / 100)} LVL
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ textShadow: `0 0 20px ${theme.accent}40` }}>{profile.username}</h1>
              <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                profile.tier === "PRO" ? "badge-pro" : profile.tier === "AM" ? "badge-am" : "badge-detri"
              }`}>{profile.tier}</span>
            </div>
            {profile.motto && <p className={`text-sm mt-1 ${theme.text} italic`}>&ldquo;{profile.motto}&rdquo;</p>}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted">
              <span>{profile.region}</span>
              <span>Miembro desde {new Date(profile.createdAt).toLocaleDateString("es-MX", { month: "short", year: "numeric" })}</span>
              {profile.activisionId && <span className="font-mono">{profile.activisionId}</span>}
            </div>
          </div>

          <button onClick={() => { setEditing(!editing); setActiveTab(editing ? "feed" : "edit"); }} className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${editing ? "border-red-500/40 text-red-400 hover:bg-red-500/10" : `${theme.border} ${theme.text} hover:${theme.bg}`}`}>
            {editing ? "Cancelar" : "Editar Perfil"}
          </button>
        </div>

        {/* ── Bio ─────────────────────────────────────────────── */}
        {profile.bio && (
          <div className={`bg-surface/50 backdrop-blur-sm border ${theme.border} rounded-2xl p-5 mb-6`}>
            <p className="text-sm text-foreground/90 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* ── Quick Stats Row ─────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {[
            { label: "XP Total", value: profile.xp.toLocaleString(), color: theme.text },
            { label: "XP Semanal", value: profile.seasonXp.toLocaleString(), color: "text-blue-400" },
            { label: "Peak Score", value: profile.peakScore.toFixed(1), color: "text-red-400" },
            { label: "Saldo", value: `$${profile.balance.toFixed(2)}`, color: "text-success" },
            { label: "Nivel", value: `${Math.floor(profile.xp / 100)}`, color: "text-purple-400" },
          ].map((s) => (
            <div key={s.label} className="bg-surface/40 backdrop-blur-sm rounded-xl p-4 text-center transition-all hover:scale-105" style={{ border: `1px solid ${theme.accent}30`, boxShadow: `0 0 20px ${theme.accent}15, inset 0 0 30px ${theme.accent}05` }}>
              <p className={`text-xl font-bold ${s.color}`} style={{ textShadow: `0 0 15px currentColor` }}>{s.value}</p>
              <p className="text-[10px] text-muted uppercase tracking-wider mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Social Links ────────────────────────────────────── */}
        {(profile.socialTwitter || profile.socialYoutube || profile.socialTwitch) && (
          <div className="flex gap-3 mb-8">
            {profile.socialTwitter && (
              <a href={`https://x.com/${profile.socialTwitter}`} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 border ${theme.border} text-xs font-medium ${theme.text} hover:${theme.bg} transition-colors`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                @{profile.socialTwitter}
              </a>
            )}
            {profile.socialYoutube && (
              <a href={`https://youtube.com/@${profile.socialYoutube}`} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 border ${theme.border} text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                {profile.socialYoutube}
              </a>
            )}
            {profile.socialTwitch && (
              <a href={`https://twitch.tv/${profile.socialTwitch}`} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 border ${theme.border} text-xs font-medium text-purple-400 hover:bg-purple-500/10 transition-colors`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>
                {profile.socialTwitch}
              </a>
            )}
          </div>
        )}

        {/* ── Game Info ───────────────────────────────────────── */}
        {(profile.favoriteGame || profile.favoriteWeapon) && (
          <div className="flex gap-3 mb-8">
            {profile.favoriteGame && (
              <span className={`px-4 py-2 rounded-xl bg-surface/50 border ${theme.border} text-xs ${theme.text}`}>
                Juego: <span className="text-foreground font-medium">{profile.favoriteGame}</span>
              </span>
            )}
            {profile.favoriteWeapon && (
              <span className={`px-4 py-2 rounded-xl bg-surface/50 border ${theme.border} text-xs ${theme.text}`}>
                Arma: <span className="text-foreground font-medium">{profile.favoriteWeapon}</span>
              </span>
            )}
          </div>
        )}

        {/* ── Tabs ────────────────────────────────────────────── */}
        <div className="flex gap-1 bg-surface/30 backdrop-blur-sm p-1.5 rounded-xl mb-8 w-fit" style={{ border: `1px solid ${theme.accent}25`, boxShadow: `0 0 15px ${theme.accent}10` }}>
          {(["feed", "stats", "edit"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); if (tab === "edit") setEditing(true); else setEditing(false); }}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab ? "bg-gradient-main text-white" : "text-muted hover:text-foreground"
              }`}
              style={activeTab === tab ? { boxShadow: `0 0 20px ${theme.accent}40, 0 0 40px ${theme.accent}15` } : {}}
            >
              {tab === "feed" ? "Mi Muro" : tab === "stats" ? "Estadisticas" : "Editar Perfil"}
            </button>
          ))}
        </div>

        {/* ── Message ─────────────────────────────────────────── */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-success/10 text-success border border-success/30" : "bg-red-500/10 text-red-400 border border-red-500/30"}`}>
            {message.text}
          </div>
        )}

        {/* ═══ FEED TAB ═══ */}
        {activeTab === "feed" && (
          <div className="space-y-6">
            {/* New post composer */}
            <div className={`bg-surface/50 backdrop-blur-sm border ${theme.border} rounded-2xl p-5`} style={{ boxShadow: `0 0 20px ${theme.accent}08` }}>
              <div className="flex gap-2 mb-3">
                {postTypes.map((pt) => (
                  <button
                    key={pt.value}
                    onClick={() => setPostType(pt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      postType === pt.value ? `${theme.bg} ${theme.text} border ${theme.border}` : "text-muted hover:text-foreground"
                    }`}
                  >
                    {pt.label}
                  </button>
                ))}
              </div>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Comparte algo con la comunidad..."
                className="w-full bg-transparent border-none text-sm text-foreground placeholder:text-muted/40 resize-none focus:outline-none min-h-[80px]"
                maxLength={500}
              />
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                <span className="text-xs text-muted">{newPost.length}/500</span>
                <button
                  onClick={handlePost}
                  disabled={posting || !newPost.trim()}
                  className="px-5 py-2 rounded-lg bg-gradient-main text-white text-xs font-semibold hover:opacity-90 disabled:opacity-30 transition-opacity"
                >
                  {posting ? "Publicando..." : "Publicar"}
                </button>
              </div>
            </div>

            {/* Posts feed */}
            {profile.posts.length === 0 ? (
              <div className={`bg-surface/30 border ${theme.border} rounded-2xl p-12 text-center`}>
                <p className="text-muted text-sm">Tu muro esta vacio. Publica algo para que la comunidad te conozca.</p>
              </div>
            ) : (
              profile.posts.map((post) => {
                const pt = postTypes.find((p) => p.value === post.postType);
                return (
                  <div key={post.id} className="bg-surface/40 backdrop-blur-sm rounded-2xl p-5 transition-all hover:scale-[1.01]" style={{ border: `1px solid ${theme.accent}25`, boxShadow: `0 0 10px ${theme.accent}08, inset 0 1px 0 ${theme.accent}15` }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {profile.avatar ? (
                          <img src={profile.avatar} alt="" className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className={`w-8 h-8 rounded-full ${theme.bg} flex items-center justify-center text-xs font-bold ${theme.text}`}>
                            {profile.username.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span className="text-sm font-semibold">{profile.username}</span>
                          {pt && <span className={`ml-2 text-[10px] font-medium uppercase tracking-wider ${theme.text}`}>{pt.label}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted">{timeAgo(post.createdAt)}</span>
                        <button onClick={() => handleDeletePost(post.id)} className="text-muted hover:text-red-400 transition-colors">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed">{post.content}</p>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ═══ STATS TAB ═══ */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            <div className={`bg-surface/50 backdrop-blur-sm border ${theme.border} rounded-2xl p-6`} style={{ boxShadow: `0 0 20px ${theme.accent}08` }}>
              <h3 className="font-semibold mb-4">Phoenix Score</h3>
              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gradient">{profile.peakScore > 0 ? profile.peakScore.toFixed(1) : "--"}</p>
                  <p className="text-xs text-muted mt-1">Score Final</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{profile.xp > 0 ? Math.floor(profile.xp / 100) : "--"}</p>
                  <p className="text-xs text-muted mt-1">Nivel</p>
                </div>
                <div className="text-center">
                  <p className={`text-3xl font-bold ${theme.text}`}>{profile.seasonXp > 0 ? profile.seasonXp : "--"}</p>
                  <p className="text-xs text-muted mt-1">XP esta semana</p>
                </div>
              </div>
              <div className={`p-4 rounded-xl ${theme.bg} border ${theme.border}`}>
                <p className="text-xs text-muted">
                  Tu score se calcula en base a impacto (50%), placement (25%), consistencia (15%) y exito en equipo (10%). Compite mas para mejorar tu clasificacion.
                </p>
              </div>
            </div>

            <div className={`bg-surface/50 backdrop-blur-sm border ${theme.border} rounded-2xl p-6`}>
              <h3 className="font-semibold mb-2">Periodo de calibracion</h3>
              <p className="text-sm text-muted">Necesitas un minimo de 4 partidas competitivas para que tu clasificacion se estabilice.</p>
            </div>
          </div>
        )}

        {/* ═══ EDIT TAB ═══ */}
        {activeTab === "edit" && (
          <div className="space-y-6">
            {/* Theme selector */}
            <div className={`bg-surface/50 backdrop-blur-sm border ${theme.border} rounded-2xl p-6`}>
              <h3 className="font-semibold mb-4">Tema del Perfil</h3>
              <div className="grid grid-cols-4 gap-3">
                {Object.entries(themes).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => setEditData({ ...editData, profileTheme: key })}
                    className={`h-16 rounded-xl border-2 transition-all ${
                      editData.profileTheme === key ? `border-white/60 scale-105 shadow-lg` : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                    style={{ background: `linear-gradient(135deg, ${t.accent}30, ${t.accent}10)`, boxShadow: editData.profileTheme === key ? `0 0 20px ${t.accent}40` : "none" }}
                  >
                    <span className="text-xs font-medium" style={{ color: t.accent }}>
                      {key === "neon-blue" ? "Azul" : key === "neon-red" ? "Rojo" : key === "neon-purple" ? "Morado" : "Fuego"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Personal info */}
            <div className={`bg-surface/50 backdrop-blur-sm border ${theme.border} rounded-2xl p-6 space-y-4`}>
              <h3 className="font-semibold">Informacion Personal</h3>
              <div>
                <label className="text-xs text-muted uppercase tracking-wider">Bio</label>
                <textarea value={editData.bio} onChange={(e) => setEditData({ ...editData, bio: e.target.value })} placeholder="Cuentale al mundo quien eres..." className={`w-full mt-1.5 bg-surface/50 border ${theme.border} rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted/40 focus:outline-none resize-none min-h-[80px]`} maxLength={200} />
              </div>
              <div>
                <label className="text-xs text-muted uppercase tracking-wider">Lema personal</label>
                <input type="text" value={editData.motto} onChange={(e) => setEditData({ ...editData, motto: e.target.value })} placeholder="Tu frase de guerra" className={`w-full mt-1.5 bg-surface/50 border ${theme.border} rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted/40 focus:outline-none`} maxLength={60} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider">Juego favorito</label>
                  <input type="text" value={editData.favoriteGame} onChange={(e) => setEditData({ ...editData, favoriteGame: e.target.value })} placeholder="Warzone, Fortnite..." className={`w-full mt-1.5 bg-surface/50 border ${theme.border} rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted/40 focus:outline-none`} />
                </div>
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider">Arma favorita</label>
                  <input type="text" value={editData.favoriteWeapon} onChange={(e) => setEditData({ ...editData, favoriteWeapon: e.target.value })} placeholder="M4, AK-47..." className={`w-full mt-1.5 bg-surface/50 border ${theme.border} rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted/40 focus:outline-none`} />
                </div>
              </div>
            </div>

            {/* Social links */}
            <div className={`bg-surface/50 backdrop-blur-sm border ${theme.border} rounded-2xl p-6 space-y-4`}>
              <h3 className="font-semibold">Redes Sociales</h3>
              {[
                { key: "socialTwitter", label: "X / Twitter", placeholder: "@tunombre", prefix: "x.com/" },
                { key: "socialYoutube", label: "YouTube", placeholder: "tu canal", prefix: "youtube.com/@" },
                { key: "socialTwitch", label: "Twitch", placeholder: "tu canal", prefix: "twitch.tv/" },
              ].map((s) => (
                <div key={s.key}>
                  <label className="text-xs text-muted uppercase tracking-wider">{s.label}</label>
                  <div className="flex items-center mt-1.5">
                    <span className="text-xs text-muted/50 px-3">{s.prefix}</span>
                    <input
                      type="text"
                      value={editData[s.key as keyof typeof editData]}
                      onChange={(e) => setEditData({ ...editData, [s.key]: e.target.value })}
                      placeholder={s.placeholder}
                      className={`flex-1 bg-surface/50 border ${theme.border} rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted/40 focus:outline-none`}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Banner URL */}
            <div className={`bg-surface/50 backdrop-blur-sm border ${theme.border} rounded-2xl p-6`}>
              <h3 className="font-semibold mb-3">Fondo del Perfil</h3>
              <p className="text-xs text-muted mb-3">Pega la URL de una imagen para usar como fondo de tu perfil, o dejalo vacio para usar el fondo por defecto.</p>
              <input type="url" value={editData.banner} onChange={(e) => setEditData({ ...editData, banner: e.target.value })} placeholder="https://ejemplo.com/mi-fondo.jpg" className={`w-full bg-surface/50 border ${theme.border} rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted/40 focus:outline-none`} />
            </div>

            {/* Save */}
            <button onClick={handleSave} disabled={saving} className="w-full py-4 rounded-xl bg-gradient-main text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-40 shadow-lg">
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
