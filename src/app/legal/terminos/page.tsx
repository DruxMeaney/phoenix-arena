import Link from "next/link";

export const metadata = {
  title: "Terminos y Condiciones — Phoenix Arena",
  description: "Terminos y condiciones de uso de la plataforma Phoenix Arena.",
};

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.5 15L7.5 10L12.5 5" />
    </svg>
  );
}

export default function TerminosPage() {
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
          <p className="text-sm text-muted mb-4">Ultima actualizacion: Marzo 2026</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient mb-8">
            Terminos y Condiciones
          </h1>

          <div className="space-y-10 text-muted leading-relaxed">
            {/* 1 */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Aceptacion de los Terminos</h2>
              <p>
                Al acceder, registrarte o utilizar la plataforma Phoenix Arena (en adelante, "la Plataforma"),
                aceptas de manera integra y sin reservas los presentes Terminos y Condiciones. Si no estas
                de acuerdo con alguna disposicion, te solicitamos que no utilices nuestros servicios. El uso
                continuado de la Plataforma constituye la aceptacion tacita de cualquier modificacion futura
                a estos terminos.
              </p>
            </div>

            {/* 2 */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Descripcion del Servicio</h2>
              <p className="mb-3">
                Phoenix Arena es una plataforma de competencia de habilidad en linea que permite a los
                usuarios participar en retos y torneos de videojuegos donde el resultado depende
                predominantemente de la destreza, conocimiento y habilidad del participante.
              </p>
              <p className="mb-3">
                <strong className="text-foreground">Phoenix Arena NO es una casa de apuestas.</strong> No
                ofrecemos juegos de azar, loterias, ni actividades donde el resultado dependa principalmente
                de la suerte. Todos los resultados en la Plataforma se determinan por el rendimiento
                individual de los participantes en competencias verificables.
              </p>
              <p>
                La Plataforma actua como intermediaria tecnologica que facilita la organizacion de
                competencias, la verificacion de resultados y la distribucion de premios entre los
                participantes.
              </p>
            </div>

            {/* 3 */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. Requisitos de Edad y Elegibilidad</h2>
              <p className="mb-3">
                Para utilizar Phoenix Arena debes ser mayor de 18 anos de edad. Al registrarte,
                declaras bajo protesta de decir verdad que cumples con este requisito. La Plataforma se
                reserva el derecho de solicitar verificacion de identidad y edad en cualquier momento.
              </p>
              <p>
                Adicionalmente, debes residir en una jurisdiccion donde las competencias de habilidad
                con premios sean legales. Es tu responsabilidad asegurarte de que tu participacion
                cumple con las leyes aplicables en tu ubicacion.
              </p>
            </div>

            {/* 4 */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Registro y Cuenta de Usuario</h2>
              <p className="mb-3">
                Para acceder a las funcionalidades de la Plataforma, debes crear una cuenta proporcionando
                informacion veraz, completa y actualizada. Eres responsable de mantener la confidencialidad
                de tus credenciales de acceso y de todas las actividades que ocurran bajo tu cuenta.
              </p>
              <p>
                Cada usuario puede tener unicamente una cuenta activa. La creacion de multiples cuentas,
                el uso de cuentas de terceros o la suplantacion de identidad resultara en la suspension
                inmediata y permanente de todas las cuentas involucradas, asi como la retencion de
                cualquier saldo pendiente.
              </p>
            </div>

            {/* 5 */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Conducta del Usuario</h2>
              <p className="mb-3">Al utilizar la Plataforma, te comprometes a:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>No utilizar trampas, hacks, exploits o software de terceros que altere el resultado de las competencias.</li>
                <li>No participar en colusion, manipulacion de resultados o cualquier forma de juego deshonesto.</li>
                <li>Mantener un comportamiento respetuoso hacia otros usuarios y el personal de la Plataforma.</li>
                <li>No difundir contenido ofensivo, discriminatorio, amenazante o ilegal a traves de la Plataforma.</li>
                <li>Reportar inmediatamente cualquier vulnerabilidad, error o conducta sospechosa que detectes.</li>
              </ul>
              <p className="mt-3">
                La violacion de estas normas puede resultar en advertencias, suspensiones temporales,
                bans permanentes y/o la perdida de saldos y premios pendientes, segun la gravedad de
                la infraccion.
              </p>
            </div>

            {/* 6 */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Sistema de Retos y Resultados</h2>
              <p className="mb-3">
                Los retos en Phoenix Arena funcionan bajo un sistema de desafio directo donde dos o mas
                jugadores compiten en una partida verificable. Cada jugador deposita una entrada que se
                acumula en un fondo comun, del cual el ganador recibe el premio correspondiente menos
                la comision de la Plataforma.
              </p>
              <p className="mb-3">
                Los resultados se verifican a traves de capturas de pantalla, APIs oficiales de los
                juegos cuando estan disponibles, y un sistema de reporte mutuo. En caso de disputas,
                el equipo de moderacion revisara las evidencias y emitira un fallo definitivo.
              </p>
              <p>
                Las decisiones del equipo de moderacion son finales e inapelables en lo que respecta a
                los resultados de las competencias. Phoenix Arena se reserva el derecho de anular
                resultados si se detecta conducta irregular.
              </p>
            </div>

            {/* 7 */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Propiedad Intelectual</h2>
              <p className="mb-3">
                Todo el contenido de la Plataforma, incluyendo pero no limitado a disenos, logotipos,
                textos, graficos, codigo fuente, interfaces y funcionalidades, es propiedad exclusiva
                de Phoenix Arena o de sus licenciantes y esta protegido por las leyes de propiedad
                intelectual aplicables.
              </p>
              <p>
                Se te otorga una licencia limitada, no exclusiva, no transferible y revocable para
                utilizar la Plataforma con fines personales y no comerciales. Queda estrictamente
                prohibido copiar, modificar, distribuir, vender o crear obras derivadas sin
                autorizacion escrita previa de Phoenix Arena.
              </p>
            </div>

            {/* 8 */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. Limitacion de Responsabilidad</h2>
              <p className="mb-3">
                Phoenix Arena proporciona la Plataforma "tal como esta" y "segun disponibilidad". No
                garantizamos que el servicio sea ininterrumpido, libre de errores o completamente seguro.
              </p>
              <p className="mb-3">
                En la maxima medida permitida por la ley, Phoenix Arena no sera responsable por danos
                indirectos, incidentales, especiales, consecuentes o punitivos, incluyendo perdida de
                ganancias, datos o uso, que surjan de o en conexion con el uso de la Plataforma.
              </p>
              <p>
                Nuestra responsabilidad total en cualquier caso no excedera el monto que hayas depositado
                en tu monedero en los ultimos 30 dias.
              </p>
            </div>

            {/* 9 */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">9. Modificaciones</h2>
              <p>
                Phoenix Arena se reserva el derecho de modificar estos Terminos y Condiciones en cualquier
                momento. Las modificaciones entraran en vigor al momento de su publicacion en la Plataforma.
                Te notificaremos de cambios significativos a traves de la Plataforma o por correo
                electronico. El uso continuado de los servicios despues de la notificacion constituye
                la aceptacion de los terminos modificados.
              </p>
            </div>

            {/* 10 */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">10. Jurisdiccion y Ley Aplicable</h2>
              <p className="mb-3">
                Estos Terminos se rigen por las leyes aplicables de la jurisdiccion en la que opera
                Phoenix Arena. Cualquier controversia derivada de estos terminos o del uso de la
                Plataforma sera resuelta mediante arbitraje vinculante, salvo que las leyes locales
                del usuario requieran un foro diferente.
              </p>
              <p>
                Si alguna disposicion de estos Terminos resulta invalida o inaplicable, las disposiciones
                restantes continuaran en pleno vigor y efecto. La renuncia al cumplimiento de cualquier
                disposicion en una ocasion no constituira renuncia al cumplimiento futuro.
              </p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted">
              Si tienes preguntas sobre estos terminos, contactanos en{" "}
              <a href="mailto:soporte@phoenixarena.com" className="text-red-400 hover:text-red-300 transition-colors">
                soporte@phoenixarena.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
