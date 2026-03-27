export default function ComoFuncionaPage() {
  const steps = [
    {
      num: 1,
      title: "Crea tu Cuenta",
      desc: "Registrate en segundos con tu correo o redes sociales. Completa tu perfil de jugador y elige tu gamertag para que la comunidad te conozca.",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" strokeWidth={1.75} stroke="currentColor" fill="none">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      ),
    },
    {
      num: 2,
      title: "Deposita Fondos",
      desc: "Agrega saldo a tu wallet de forma segura con los metodos de pago disponibles en tu region. Tu dinero queda protegido en tu cuenta.",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" strokeWidth={1.75} stroke="currentColor" fill="none">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
        </svg>
      ),
    },
    {
      num: 3,
      title: "Crea o Acepta un Reto",
      desc: "Publica un reto con el monto y las reglas que prefieras, o acepta uno de los retos disponibles creados por otros jugadores. Tu decides como competir.",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" strokeWidth={1.75} stroke="currentColor" fill="none">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
        </svg>
      ),
    },
    {
      num: 4,
      title: "Fondos en Garantia",
      desc: "Al aceptar un reto, el monto de ambos jugadores se bloquea en escrow. Nadie puede tocar el dinero hasta que el resultado se confirme. Asi competis tranquilo.",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" strokeWidth={1.75} stroke="currentColor" fill="none">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
      ),
    },
    {
      num: 5,
      title: "Juega tu Partida",
      desc: "Conecta con tu rival, jueguen la partida segun las reglas acordadas y den lo mejor de si. Recorda capturar evidencia del resultado.",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" strokeWidth={1.75} stroke="currentColor" fill="none">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875S10.5 3.09 10.5 4.125c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.491 48.491 0 0 1-4.163-.3c.186 1.613.476 3.194.867 4.73a.633.633 0 0 1-.39.765c-1.52.576-2.844 1.405-3.907 2.408v0c1.063 1.003 2.387 1.832 3.907 2.408a.633.633 0 0 1 .39.765 48.04 48.04 0 0 1-.867 4.73 48.491 48.491 0 0 0 4.163-.3.64.64 0 0 1 .657.643v0c0 .355-.186.676-.401.959a1.647 1.647 0 0 0-.349 1.003c0 1.035 1.007 1.875 2.25 1.875s2.25-.84 2.25-1.875c0-.369-.128-.713-.349-1.003-.215-.283-.401-.604-.401-.959v0c0-.368.312-.654.657-.643a48.491 48.491 0 0 1 4.163.3 48.04 48.04 0 0 1-.867-4.73.633.633 0 0 1 .39-.765c1.52-.576 2.844-1.405 3.907-2.408v0c-1.063-1.003-2.387-1.832-3.907-2.408a.633.633 0 0 1-.39-.765 48.04 48.04 0 0 1 .867-4.73 48.491 48.491 0 0 0-4.163.3.64.64 0 0 1-.657-.643v0Z" />
        </svg>
      ),
    },
    {
      num: 6,
      title: "Reporta el Resultado",
      desc: "Al terminar la partida, ambos jugadores reportan quien gano. Subi tu captura de pantalla o clip como evidencia para que todo sea transparente.",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" strokeWidth={1.75} stroke="currentColor" fill="none">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      ),
    },
    {
      num: 7,
      title: "Confirmacion o Disputa",
      desc: "Si ambos coinciden en el resultado, se confirma automaticamente. Si hay desacuerdo, nuestro equipo revisa la evidencia y resuelve la disputa de forma justa.",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" strokeWidth={1.75} stroke="currentColor" fill="none">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
      ),
    },
    {
      num: 8,
      title: "Recibe tu Premio",
      desc: "El ganador recibe el pozo completo menos una pequena comision. El dinero se acredita al instante en tu wallet y podes retirarlo cuando quieras.",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" strokeWidth={1.75} stroke="currentColor" fill="none">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0 1 16.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 0 1-2.52.857m-4.5 0a6.023 6.023 0 0 1-2.52-.857" />
        </svg>
      ),
    },
  ];

  const matchStates = [
    { label: "Pendiente", color: "bg-warning/20 text-warning border-warning/30" },
    { label: "Confirmado", color: "bg-success/20 text-success border-success/30" },
    { label: "Disputado", color: "bg-red-500/20 text-red-400 border-red-500/30" },
    { label: "Resuelto", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { label: "Pagado", color: "bg-blue-600/20 text-blue-300 border-blue-600/30" },
  ];

  const commissions = [
    { tipo: "1v1", apuesta: "$5", pozo: "$10", comision: "$1 (10%)", ganador: "$9" },
    { tipo: "1v1", apuesta: "$20", pozo: "$40", comision: "$4 (10%)", ganador: "$36" },
    { tipo: "Duo", apuesta: "$10/jugador", pozo: "$40", comision: "$4 (10%)", ganador: "$36 (equipo)" },
  ];

  const rules = [
    {
      title: "Evidencia Obligatoria",
      desc: "Siempre captura pantalla o graba un clip del resultado final. Sin evidencia, no podemos resolver disputas a tu favor.",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" strokeWidth={1.75} stroke="currentColor" fill="none">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
        </svg>
      ),
    },
    {
      title: "Tiempos de Respuesta",
      desc: "Tenes 15 minutos para reportar el resultado despues de la partida. Si no reportas, el resultado se determina con la evidencia disponible.",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" strokeWidth={1.75} stroke="currentColor" fill="none">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
    },
    {
      title: "No-Shows",
      desc: "Si un jugador no se presenta dentro de los 10 minutos de iniciado el reto, se considera abandono y el rival gana automaticamente.",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" strokeWidth={1.75} stroke="currentColor" fill="none">
          <path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
        </svg>
      ),
    },
    {
      title: "Conducta",
      desc: "Jugamos limpio. Cualquier trampa, uso de exploits o comportamiento toxico puede resultar en la perdida del reto y suspension de tu cuenta.",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" strokeWidth={1.75} stroke="currentColor" fill="none">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-gradient-hero min-h-screen">
      {/* Header */}
      <section className="pt-16 pb-12 px-4 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-4">
          Como Funciona Phoenix Arena
        </h1>
        <p className="text-lg text-muted max-w-2xl mx-auto">
          Todo lo que necesitas saber para competir, ganar y cobrar
        </p>
      </section>

      {/* 8-Step Flow */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="relative rounded-2xl border border-border bg-surface p-6 card-hover"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-main text-white text-sm font-bold shrink-0">
                  {step.num}
                </span>
                <span className="text-muted">{step.icon}</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Match States */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 text-center">
          Estados de una Partida
        </h2>
        <p className="text-muted text-center mb-10">
          Cada reto pasa por diferentes etapas hasta que se completa el pago
        </p>

        {/* Flow: Happy path */}
        <div className="mb-8">
          <p className="text-sm font-medium text-muted mb-4 uppercase tracking-wider">Flujo normal</p>
          <div className="flex flex-wrap items-center gap-3">
            {["Pendiente", "Confirmado", "Pagado"].map((label, i) => {
              const state = matchStates.find((s) => s.label === label)!;
              return (
                <div key={label} className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full border text-sm font-medium ${state.color}`}>
                    {state.label}
                  </span>
                  {i < 2 && (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-muted shrink-0" strokeWidth={2} stroke="currentColor" fill="none">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Flow: Dispute path */}
        <div>
          <p className="text-sm font-medium text-muted mb-4 uppercase tracking-wider">Si hay disputa</p>
          <div className="flex flex-wrap items-center gap-3">
            {["Pendiente", "Disputado", "Resuelto", "Pagado"].map((label, i) => {
              const state = matchStates.find((s) => s.label === label)!;
              return (
                <div key={label} className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full border text-sm font-medium ${state.color}`}>
                    {state.label}
                  </span>
                  {i < 3 && (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-muted shrink-0" strokeWidth={2} stroke="currentColor" fill="none">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Escrow Explanation */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="rounded-2xl border border-border bg-surface p-8 sm:p-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Como se protege tu dinero?
          </h2>
          <p className="text-muted mb-8">
            Usamos un sistema de escrow (garantia) para que ambos jugadores compitan con total confianza.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-main flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" strokeWidth={1.75} stroke="currentColor" fill="none">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-1">Deposito Bloqueado</h3>
              <p className="text-sm text-muted">Ambos jugadores depositan su apuesta. El dinero queda retenido de forma segura.</p>
            </div>

            {/* Arrow */}
            <div className="hidden sm:flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-border-light" strokeWidth={1.5} stroke="currentColor" fill="none">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </div>

            {/* Step 2 - middle is the arrow on desktop */}
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-main flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" strokeWidth={1.75} stroke="currentColor" fill="none">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0 1 16.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 0 1-2.52.857m-4.5 0a6.023 6.023 0 0 1-2.52-.857" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-1">Premio al Ganador</h3>
              <p className="text-sm text-muted">Cuando se confirma el resultado, el ganador recibe el pozo menos la comision.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Commission Table */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 text-center">
          Ejemplos de Comisiones
        </h2>
        <p className="text-muted text-center mb-8">
          Solo cobramos un 10% del pozo total. Transparente y simple.
        </p>

        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2">
                  <th className="text-left px-6 py-4 font-medium text-muted">Modalidad</th>
                  <th className="text-left px-6 py-4 font-medium text-muted">Apuesta</th>
                  <th className="text-left px-6 py-4 font-medium text-muted">Pozo Total</th>
                  <th className="text-left px-6 py-4 font-medium text-muted">Comision</th>
                  <th className="text-left px-6 py-4 font-medium text-foreground">Ganador Recibe</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((row, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="px-6 py-4 font-medium text-foreground">{row.tipo}</td>
                    <td className="px-6 py-4 text-muted">{row.apuesta}</td>
                    <td className="px-6 py-4 text-muted">{row.pozo}</td>
                    <td className="px-6 py-4 text-muted">{row.comision}</td>
                    <td className="px-6 py-4 font-semibold text-success">{row.ganador}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Rules */}
      <section className="max-w-4xl mx-auto px-4 pb-24">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 text-center">
          Reglas Importantes
        </h2>
        <p className="text-muted text-center mb-8">
          Para que todos compitan en igualdad de condiciones
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {rules.map((rule) => (
            <div
              key={rule.title}
              className="rounded-2xl border border-border bg-surface p-6 card-hover"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-red-400">{rule.icon}</span>
                <h3 className="font-semibold text-foreground">{rule.title}</h3>
              </div>
              <p className="text-sm text-muted leading-relaxed">{rule.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
