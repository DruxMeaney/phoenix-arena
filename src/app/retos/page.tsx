'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  return `Hace ${Math.floor(hrs / 24)}d`;
}

type Modalidad = 'Todos' | '1v1' | 'Duo' | 'Trio';
type Estado = 'Todos' | 'Abierto' | 'En Progreso';
type MontoRange = 'Todos' | '$1-$10' | '$11-$25' | '$26-$50' | '$50+';

interface Challenge {
  id: string;
  creador: string;
  creadorTier: 'pro' | 'am' | 'detri';
  modalidad: '1v1' | 'Duo' | 'Trio';
  juego: string;
  monto: number;
  estado: 'Abierto' | 'En Progreso';
  reglas: string;
  tiempoPublicado: string;
}

const initialChallenges: Challenge[] = [];

function tierBadgeClass(tier: Challenge['creadorTier']) {
  if (tier === 'pro') return 'badge-pro';
  if (tier === 'am') return 'badge-am';
  return 'badge-detri';
}

function tierLabel(tier: Challenge['creadorTier']) {
  if (tier === 'pro') return 'PRO';
  if (tier === 'am') return 'Amateur';
  return 'Debutante';
}

function matchesMontoRange(monto: number, range: MontoRange) {
  if (range === 'Todos') return true;
  if (range === '$1-$10') return monto >= 1 && monto <= 10;
  if (range === '$11-$25') return monto >= 11 && monto <= 25;
  if (range === '$26-$50') return monto >= 26 && monto <= 50;
  return monto > 50;
}

function estimatedPrize(monto: number, modalidad: Challenge['modalidad']) {
  const players = modalidad === '1v1' ? 2 : modalidad === 'Duo' ? 4 : 6;
  const pool = monto * players;
  return pool - pool * 0.1;
}

export default function RetosPage() {
  const [modalidad, setModalidad] = useState<Modalidad>('Todos');
  const [montoRange, setMontoRange] = useState<MontoRange>('Todos');
  const [estado, setEstado] = useState<Estado>('Todos');
  const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges);
  const [accepting, setAccepting] = useState<string | null>(null);

  const fetchChallenges = useCallback(async () => {
    try {
      const res = await fetch('/api/matches');
      if (res.ok) {
        const data = await res.json();
        const mapped: Challenge[] = (data.matches || []).map((m: { id: string; creator: { username: string; tier: string }; modalidad: string; game: string; amount: number; status: string; rules: string; createdAt: string }) => ({
          id: m.id,
          creador: m.creator.username,
          creadorTier: (m.creator.tier || 'detri').toLowerCase() as Challenge['creadorTier'],
          modalidad: m.modalidad as Challenge['modalidad'],
          juego: m.game,
          monto: m.amount,
          estado: m.status === 'open' ? 'Abierto' as const : 'En Progreso' as const,
          reglas: m.rules,
          tiempoPublicado: formatTimeAgo(m.createdAt),
        }));
        setChallenges(mapped);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchChallenges(); }, [fetchChallenges]);

  const handleAccept = async (id: string) => {
    setAccepting(id);
    try {
      const res = await fetch(`/api/matches/${id}/accept`, { method: 'POST' });
      if (res.ok) { fetchChallenges(); }
      else { const err = await res.json(); alert(err.error || 'Error al aceptar'); }
    } catch { alert('Error de conexion'); }
    setAccepting(null);
  };

  const filtered = challenges.filter((c) => {
    if (modalidad !== 'Todos' && c.modalidad !== modalidad) return false;
    if (estado !== 'Todos' && c.estado !== estado) return false;
    if (!matchesMontoRange(c.monto, montoRange)) return false;
    return true;
  });

  const abiertos = challenges.filter((c) => c.estado === 'Abierto').length;
  const enProgreso = challenges.filter((c) => c.estado === 'En Progreso').length;
  const totalEnJuego = challenges.reduce((sum, c) => {
    const players = c.modalidad === '1v1' ? 2 : c.modalidad === 'Duo' ? 4 : 6;
    return sum + c.monto * players;
  }, 0);

  return (
    <div className="bg-gradient-hero min-h-screen">
      {/* Header */}
      <section className="pt-16 pb-6 px-4 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-3">
          Retos Disponibles
        </h1>
        <p className="text-lg text-muted">
          Busca un reto que se ajuste a tu estilo y demuestrale al mundo de que estas hecho
        </p>
      </section>

      {/* Stats Bar */}
      <section className="max-w-6xl mx-auto px-4 pb-6">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span className="text-muted">{abiertos} retos abiertos</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-warning" />
            <span className="text-muted">{enProgreso} en progreso</span>
          </span>
          <span className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-muted" strokeWidth={2} stroke="currentColor" fill="none">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span className="text-muted">${totalEnJuego} en juego</span>
          </span>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="max-w-6xl mx-auto px-4 pb-8">
        <div className="rounded-2xl border border-border bg-surface p-4 flex flex-wrap gap-4 items-end">
          {/* Modalidad */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted uppercase tracking-wider">Modalidad</label>
            <div className="flex gap-1.5">
              {(['Todos', '1v1', 'Duo', 'Trio'] as Modalidad[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setModalidad(m)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    modalidad === m
                      ? 'bg-gradient-main text-white'
                      : 'bg-surface-2 text-muted hover:text-foreground'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Monto */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted uppercase tracking-wider">Monto</label>
            <div className="flex gap-1.5">
              {(['Todos', '$1-$10', '$11-$25', '$26-$50', '$50+'] as MontoRange[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setMontoRange(r)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    montoRange === r
                      ? 'bg-gradient-main text-white'
                      : 'bg-surface-2 text-muted hover:text-foreground'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Estado */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted uppercase tracking-wider">Estado</label>
            <div className="flex gap-1.5">
              {(['Todos', 'Abierto', 'En Progreso'] as Estado[]).map((e) => (
                <button
                  key={e}
                  onClick={() => setEstado(e)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    estado === e
                      ? 'bg-gradient-main text-white'
                      : 'bg-surface-2 text-muted hover:text-foreground'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Challenge Cards */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-16 text-center">
            <svg viewBox="0 0 24 24" className="w-12 h-12 text-muted mx-auto mb-4" strokeWidth={1.5} stroke="currentColor" fill="none">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <h3 className="text-lg font-semibold text-foreground mb-2">No se encontraron retos</h3>
            <p className="text-muted text-sm mb-6">Intenta ajustar los filtros o crea un nuevo reto</p>
            <Link
              href="/retos/crear"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-main text-white font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" strokeWidth={2} stroke="currentColor" fill="none">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Crear Reto
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c) => (
              <div key={c.id} className="rounded-2xl border border-border bg-surface p-6 card-hover flex flex-col">
                {/* Top row: status + time */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                      c.estado === 'Abierto'
                        ? 'bg-success/15 text-success border-success/30'
                        : 'bg-warning/15 text-warning border-warning/30'
                    }`}
                  >
                    {c.estado}
                  </span>
                  <span className="text-xs text-muted">{c.tiempoPublicado}</span>
                </div>

                {/* Game + Modalidad */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-foreground">{c.juego}</span>
                  <span className="text-muted">|</span>
                  <span className="text-sm text-muted">{c.modalidad}</span>
                </div>

                {/* Monto + Prize */}
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-2xl font-bold text-foreground">${c.monto}</span>
                  <span className="text-xs text-muted">por jugador</span>
                </div>

                <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-surface-2">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-success shrink-0" strokeWidth={2} stroke="currentColor" fill="none">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0 1 16.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 0 1-2.52.857m-4.5 0a6.023 6.023 0 0 1-2.52-.857" />
                  </svg>
                  <span className="text-sm text-success font-medium">
                    Premio estimado: ${estimatedPrize(c.monto, c.modalidad)}
                  </span>
                </div>

                {/* Rules */}
                <p className="text-xs text-muted mb-4 leading-relaxed">{c.reglas}</p>

                {/* Creator */}
                <div className="flex items-center gap-2 mb-5 mt-auto">
                  <div className="w-7 h-7 rounded-full bg-surface-3 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-muted" strokeWidth={2} stroke="currentColor" fill="none">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                  </div>
                  <span className="text-sm text-foreground font-medium">{c.creador}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${tierBadgeClass(c.creadorTier)}`}>
                    {tierLabel(c.creadorTier)}
                  </span>
                </div>

                {/* Action Button */}
                {c.estado === 'Abierto' ? (
                  <button
                    onClick={() => handleAccept(c.id)}
                    disabled={accepting === c.id}
                    className="w-full py-2.5 rounded-xl bg-gradient-main text-white font-medium text-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40"
                  >
                    {accepting === c.id ? 'Aceptando...' : 'Aceptar Reto'}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl bg-surface-3 text-muted font-medium text-sm cursor-not-allowed"
                  >
                    En Progreso
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Floating Create Button */}
      <Link
        href="/retos/crear"
        className="fixed bottom-8 right-8 flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-main text-white font-semibold shadow-lg glow animate-pulse-glow hover:scale-105 transition-transform z-50"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" strokeWidth={2} stroke="currentColor" fill="none">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Crear Nuevo Reto
      </Link>
    </div>
  );
}
