import Link from "next/link";

export const metadata = {
  title: "Competencia de Habilidad y Cumplimiento — Phoenix Arena",
  description: "Como Phoenix Arena opera como plataforma de competencia de habilidad, no de apuestas. Marco legal y cumplimiento normativo.",
};

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.5 15L7.5 10L12.5 5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success shrink-0 mt-0.5">
      <path d="M4 9.5L7.5 13L14 5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 shrink-0 mt-0.5">
      <path d="M5 5L13 13M13 5L5 13" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2L3 5.5V10c0 4.14 2.99 7.5 7 8.5 4.01-1 7-4.36 7-8.5V5.5L10 2Z" />
      <path d="M7 10l2 2 4-4" />
    </svg>
  );
}

export default function HabilidadPage() {
  return (
    <section className="min-h-dvh py-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-8"
        >
          <BackIcon />
          Volver al inicio
        </Link>

        <div className="bg-surface border border-border rounded-2xl p-8 sm:p-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-success"><ShieldIcon /></span>
            <p className="text-sm text-muted">Ultima actualizacion: Marzo 2026</p>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient mb-4">
            Competencia de Habilidad y Cumplimiento
          </h1>
          <p className="text-muted mb-10 text-lg">
            En Phoenix Arena, la transparencia y el cumplimiento legal son fundamentales.
            Esta pagina explica en detalle por que somos una plataforma de habilidad y no
            una casa de apuestas.
          </p>

          <div className="space-y-10 text-muted leading-relaxed">
            {/* 1 */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Definicion: Habilidad vs. Apuestas</h2>
              <p className="mb-3">
                Una competencia de habilidad es aquella donde el resultado depende predominantemente
                de la capacidad, destreza, conocimiento, entrenamiento y toma de decisiones del
                participante. A diferencia de las apuestas o juegos de azar, donde el resultado
                depende de factores aleatorios fuera del control del participante.
              </p>
              <p className="mb-3">
                En Phoenix Arena, cada competencia se decide por el rendimiento real de los jugadores
                en partidas de videojuegos. Los jugadores mas habilidosos y mejor preparados tienen
                una ventaja sistematica y consistente sobre los demas, lo cual es la marca distintiva
                de una competencia basada en habilidad.
              </p>
              <p>
                Este principio se conoce internacionalmente como el "predominant purpose test" o
                "predominant factor test", y es el estandar legal utilizado en multiples jurisdicciones
                para distinguir competencias de habilidad de juegos de azar.
              </p>
            </div>

            {/* 2 - Comparison Card */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">2. Diferencias Fundamentales</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Phoenix Arena Column */}
                <div className="bg-surface-2 border border-success/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-success mb-4">Phoenix Arena</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2.5">
                      <CheckIcon />
                      <span><strong className="text-foreground">Habilidad predominante:</strong> el resultado depende de la destreza del jugador.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckIcon />
                      <span><strong className="text-foreground">Participacion activa:</strong> el jugador compite directamente y su desempeno determina el resultado.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckIcon />
                      <span><strong className="text-foreground">Resultados medibles:</strong> puntajes, eliminaciones, tiempos y estadisticas verificables.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckIcon />
                      <span><strong className="text-foreground">Mejora con practica:</strong> la experiencia y el entrenamiento mejoran consistentemente los resultados.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckIcon />
                      <span><strong className="text-foreground">Competencia directa:</strong> jugador contra jugador en igualdad de condiciones.</span>
                    </li>
                  </ul>
                </div>

                {/* Apuestas Column */}
                <div className="bg-surface-2 border border-red-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-red-400 mb-4">Apuestas Tradicionales</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2.5">
                      <XIcon />
                      <span><strong className="text-foreground">Azar predominante:</strong> el resultado depende de factores aleatorios o incontrolables.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <XIcon />
                      <span><strong className="text-foreground">Participacion pasiva:</strong> el apostador no influye directamente en el resultado del evento.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <XIcon />
                      <span><strong className="text-foreground">Resultados aleatorios:</strong> basados en probabilidad, sorteos o eventos externos.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <XIcon />
                      <span><strong className="text-foreground">Sin mejora garantizada:</strong> la practica no asegura mejores resultados a largo plazo.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <XIcon />
                      <span><strong className="text-foreground">Contra la casa:</strong> el apostador compite contra el operador, no contra otros jugadores.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 3 */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. Marco Legal en America Latina</h2>
              <p className="mb-3">
                En la mayoria de las jurisdicciones de America Latina, las competencias de habilidad
                con premios son legales y se distinguen claramente de los juegos de azar regulados.
                La legislacion generalmente establece que cuando la habilidad es el factor
                predominante en determinar el resultado, la actividad no se clasifica como juego
                de azar.
              </p>
              <p className="mb-3">
                Paises como Mexico, Colombia, Brasil, Chile y Argentina cuentan con marcos legales
                que permiten las competencias de habilidad. En cada jurisdiccion, el analisis legal
                se centra en determinar si la habilidad o el azar es el factor predominante en el
                resultado.
              </p>
              <p>
                Phoenix Arena opera bajo el principio de que nuestras competencias son
                fundamentalmente diferentes a los juegos de azar, ya que el rendimiento del jugador
                es el factor determinante y medible en cada resultado. Nos mantenemos informados
                sobre cambios regulatorios en cada mercado donde operamos.
              </p>
            </div>

            {/* 4 */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Responsabilidad de la Plataforma</h2>
              <p className="mb-3">
                Phoenix Arena actua exclusivamente como intermediario tecnologico que facilita la
                organizacion de competencias entre jugadores. No determinamos los resultados ni
                participamos como competidores. Nuestro rol incluye:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Proporcionar la infraestructura tecnologica para organizar competencias justas.</li>
                <li>Verificar resultados a traves de multiples fuentes de evidencia.</li>
                <li>Administrar fondos de forma segura mediante un sistema de escrow.</li>
                <li>Mediar disputas de forma imparcial cuando sea necesario.</li>
                <li>Mantener un ambiente competitivo libre de trampas y conducta antideportiva.</li>
              </ul>
            </div>

            {/* 5 */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Restricciones por Jurisdiccion</h2>
              <p className="mb-3">
                Phoenix Arena no esta disponible en jurisdicciones donde las competencias de habilidad
                con premios estan prohibidas o donde no podamos operar de forma legal y responsable.
                Nos reservamos el derecho de restringir el acceso desde regiones especificas.
              </p>
              <p className="mb-3">
                Es responsabilidad de cada usuario verificar que su participacion en competencias
                de habilidad con premios es legal en su jurisdiccion. Phoenix Arena no sera
                responsable por el uso de la Plataforma en jurisdicciones donde esto no sea
                permitido.
              </p>
              <p>
                Implementamos tecnologias de geolocalizacion para detectar y limitar el acceso
                desde jurisdicciones restringidas, aunque reconocemos que ninguna tecnologia es
                infalible.
              </p>
            </div>

            {/* 6 */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Juego Responsable</h2>
              <p className="mb-3">
                Aunque Phoenix Arena es una plataforma de habilidad y no de azar, estamos
                comprometidos con promover habitos de competencia saludables. Ofrecemos las
                siguientes herramientas y recursos:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2 mb-3">
                <li><strong className="text-foreground">Limites de deposito:</strong> puedes establecer limites diarios, semanales o mensuales para tus depositos.</li>
                <li><strong className="text-foreground">Auto-exclusion:</strong> puedes solicitar la suspension temporal o permanente de tu cuenta en cualquier momento.</li>
                <li><strong className="text-foreground">Historial transparente:</strong> acceso completo a tu historial de competencias, resultados y transacciones.</li>
                <li><strong className="text-foreground">Alertas de actividad:</strong> notificaciones cuando tus patrones de uso sugieran que podrias necesitar un descanso.</li>
                <li><strong className="text-foreground">Recursos de ayuda:</strong> enlaces a organizaciones de apoyo para juego problematico.</li>
              </ul>
              <p>
                Si sientes que tu participacion en competencias esta afectando negativamente tu
                bienestar personal, financiero o emocional, te animamos a utilizar nuestras
                herramientas de auto-exclusion o contactar a nuestro equipo de soporte.
              </p>
            </div>

            {/* 7 */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Cumplimiento Normativo</h2>
              <p className="mb-3">
                Phoenix Arena mantiene un programa activo de cumplimiento que incluye:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Revision periodica de la legislacion aplicable en cada mercado donde operamos.</li>
                <li>Procedimientos de Conoce a Tu Cliente (KYC) para verificacion de identidad y edad.</li>
                <li>Sistemas de prevencion de lavado de dinero (AML) y financiamiento del terrorismo.</li>
                <li>Auditorias internas y externas de nuestros procesos y sistemas.</li>
                <li>Capacitacion continua de nuestro equipo en materia de cumplimiento regulatorio.</li>
                <li>Cooperacion con autoridades regulatorias cuando sea requerido.</li>
              </ul>
            </div>

            {/* 8 */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. Contacto con Reguladores</h2>
              <p className="mb-3">
                Si eres un regulador, autoridad gubernamental o representante legal que necesita
                informacion sobre nuestras operaciones, cumplimiento o estructura legal, puedes
                contactarnos directamente:
              </p>
              <div className="bg-surface-2 border border-border-light rounded-xl p-6">
                <ul className="space-y-2 text-sm">
                  <li>
                    <strong className="text-foreground">Departamento de Cumplimiento:</strong>{" "}
                    <a href="mailto:cumplimiento@phoenixarena.com" className="text-red-400 hover:text-red-300 transition-colors">
                      cumplimiento@phoenixarena.com
                    </a>
                  </li>
                  <li>
                    <strong className="text-foreground">Departamento Legal:</strong>{" "}
                    <a href="mailto:legal@phoenixarena.com" className="text-red-400 hover:text-red-300 transition-colors">
                      legal@phoenixarena.com
                    </a>
                  </li>
                  <li>
                    <strong className="text-foreground">Tiempo de respuesta para reguladores:</strong> maximo 5 dias habiles.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted">
              Phoenix Arena esta comprometida con la transparencia y el cumplimiento legal en
              todas las jurisdicciones donde opera. Para cualquier consulta, escribenos a{" "}
              <a href="mailto:cumplimiento@phoenixarena.com" className="text-red-400 hover:text-red-300 transition-colors">
                cumplimiento@phoenixarena.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
