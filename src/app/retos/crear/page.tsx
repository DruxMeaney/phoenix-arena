'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

type Modalidad = '1v1' | 'Duo' | 'Trio';
type Region = 'LATAM' | 'NA' | 'EU';

const QUICK_AMOUNTS = [5, 10, 20, 50];

const MODALIDAD_OPTIONS: { value: Modalidad; label: string; players: number; desc: string }[] = [
  { value: '1v1', label: '1v1', players: 2, desc: 'Uno contra uno' },
  { value: 'Duo', label: 'Duo', players: 4, desc: '2 vs 2 jugadores' },
  { value: 'Trio', label: 'Trio', players: 6, desc: '3 vs 3 jugadores' },
];

export default function CrearRetoPage() {
  const [modalidad, setModalidad] = useState<Modalidad>('1v1');
  const [juego, setJuego] = useState('warzone');
  const [monto, setMonto] = useState<number | ''>('');
  const [reglas, setReglas] = useState('');
  const [region, setRegion] = useState<Region>('LATAM');

  const balanceUsuario = 85.5;

  const calcs = useMemo(() => {
    const montoNum = typeof monto === 'number' ? monto : 0;
    const option = MODALIDAD_OPTIONS.find((o) => o.value === modalidad)!;
    const totalPool = montoNum * option.players;
    const comision = totalPool * 0.1;
    const premioEstimado = totalPool - comision;
    return {
      montoPorJugador: montoNum,
      totalJugadores: option.players,
      totalPool,
      comision,
      premioEstimado,
    };
  }, [monto, modalidad]);

  const montoNum = typeof monto === 'number' ? monto : 0;
  const canSubmit = montoNum > 0 && montoNum <= balanceUsuario;

  return (
    <div className="bg-gradient-hero min-h-screen">
      {/* Header */}
      <section className="pt-16 pb-8 px-4 max-w-4xl mx-auto">
        <Link
          href="/retos"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-6"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" strokeWidth={2} stroke="currentColor" fill="none">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Volver a retos
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-gradient mb-2">
          Crear Nuevo Reto
        </h1>
        <p className="text-muted">
          Configura tu reto y encontra un rival digno
        </p>
      </section>

      {/* Form + Sidebar */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Card */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-8">
            {/* Modalidad */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">Modalidad</label>
              <div className="grid grid-cols-3 gap-3">
                {MODALIDAD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setModalidad(opt.value)}
                    className={`relative rounded-xl border-2 p-4 text-center transition-all cursor-pointer ${
                      modalidad === opt.value
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-border bg-surface-2 hover:border-border-light'
                    }`}
                  >
                    <span className="block text-lg font-bold text-foreground">{opt.label}</span>
                    <span className="block text-xs text-muted mt-1">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Juego */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">Juego</label>
              <div className="relative">
                <select
                  value={juego}
                  onChange={(e) => setJuego(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-border bg-surface-2 px-4 py-3 text-foreground text-sm focus:outline-none focus:border-red-500 transition-colors"
                >
                  <option value="warzone">Warzone</option>
                </select>
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-muted absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2} stroke="currentColor" fill="none">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>

            {/* Monto */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">Monto por jugador</label>
              <div className="flex gap-2 mb-3">
                {QUICK_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setMonto(amt)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      monto === amt
                        ? 'bg-gradient-main text-white'
                        : 'bg-surface-2 text-muted hover:text-foreground border border-border'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm">$</span>
                <input
                  type="number"
                  min={1}
                  max={500}
                  placeholder="Otro monto"
                  value={monto === '' ? '' : monto}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMonto(val === '' ? '' : Number(val));
                  }}
                  className="w-full rounded-xl border border-border bg-surface-2 pl-8 pr-4 py-3 text-foreground text-sm focus:outline-none focus:border-red-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              {montoNum > balanceUsuario && (
                <p className="text-xs text-red-400 mt-2 flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" strokeWidth={2} stroke="currentColor" fill="none">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                  Saldo insuficiente. Tu saldo es ${balanceUsuario.toFixed(2)}.
                </p>
              )}
            </div>

            {/* Reglas */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">Reglas del reto</label>
              <textarea
                rows={3}
                placeholder="Ejemplo: Kills totales, sin vehiculos, Rebirth Island, mejor de 3..."
                value={reglas}
                onChange={(e) => setReglas(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:border-red-500 transition-colors resize-none"
              />
            </div>

            {/* Region */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">Region</label>
              <div className="flex gap-3">
                {(['LATAM', 'NA', 'EU'] as Region[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRegion(r)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      region === r
                        ? 'bg-gradient-main text-white'
                        : 'bg-surface-2 text-muted border border-border hover:border-border-light'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit - mobile only */}
            <div className="lg:hidden">
              <button
                disabled={!canSubmit}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-opacity ${
                  canSubmit
                    ? 'bg-gradient-main text-white hover:opacity-90 cursor-pointer'
                    : 'bg-surface-3 text-muted cursor-not-allowed'
                }`}
              >
                Publicar Reto
              </button>
            </div>
          </div>

          {/* Sidebar - Cost Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Balance */}
            <div className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-center gap-2 mb-1">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-muted" strokeWidth={1.75} stroke="currentColor" fill="none">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
                </svg>
                <span className="text-sm text-muted">Tu saldo</span>
              </div>
              <p className="text-2xl font-bold text-foreground">${balanceUsuario.toFixed(2)}</p>
            </div>

            {/* Summary Card */}
            <div className="rounded-2xl border border-border bg-surface p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Resumen del Reto</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Monto por jugador</span>
                  <span className="text-foreground font-medium">
                    ${calcs.montoPorJugador.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Jugadores totales</span>
                  <span className="text-foreground font-medium">{calcs.totalJugadores}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="text-muted">Pozo total</span>
                  <span className="text-foreground font-medium">
                    ${calcs.totalPool.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Comision (10%)</span>
                  <span className="text-red-400 font-medium">
                    -${calcs.comision.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="text-foreground font-semibold">Premio estimado</span>
                  <span className="text-success font-bold text-lg">
                    ${calcs.premioEstimado.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit - desktop */}
            <div className="hidden lg:block">
              <button
                disabled={!canSubmit}
                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                  canSubmit
                    ? 'bg-gradient-main text-white hover:opacity-90 glow cursor-pointer'
                    : 'bg-surface-3 text-muted cursor-not-allowed'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" strokeWidth={2} stroke="currentColor" fill="none">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                  </svg>
                  Publicar Reto
                </span>
              </button>
            </div>

            {/* Info note */}
            <div className="rounded-xl bg-surface-2 border border-border p-4">
              <div className="flex gap-3">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" strokeWidth={1.75} stroke="currentColor" fill="none">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                </svg>
                <p className="text-xs text-muted leading-relaxed">
                  Al publicar, tu monto se bloqueara en escrow hasta que se confirme el resultado. Si nadie acepta el reto en 24 horas, el dinero vuelve a tu wallet automaticamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
