import Link from "next/link";

export const metadata = {
  title: "Politica de Privacidad — Phoenix Arena",
  description: "Como Phoenix Arena recopila, usa y protege tu informacion personal.",
};

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.5 15L7.5 10L12.5 5" />
    </svg>
  );
}

export default function PrivacidadPage() {
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
            Politica de Privacidad
          </h1>

          <div className="space-y-10 text-muted leading-relaxed">
            {/* 1 */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Informacion que Recopilamos</h2>
              <p className="mb-3">Recopilamos la siguiente informacion cuando utilizas Phoenix Arena:</p>
              <ul className="list-disc list-inside space-y-2 ml-2 mb-3">
                <li><strong className="text-foreground">Informacion de registro:</strong> nombre, correo electronico, fecha de nacimiento, pais de residencia y nombre de usuario.</li>
                <li><strong className="text-foreground">Informacion de verificacion:</strong> documento de identidad, comprobante de domicilio y datos biometricos faciales cuando se requiera verificacion KYC.</li>
                <li><strong className="text-foreground">Informacion de pago:</strong> datos del metodo de pago utilizado, historial de transacciones y saldos.</li>
                <li><strong className="text-foreground">Informacion de uso:</strong> actividad en la Plataforma, historial de retos, resultados, mensajes y estadisticas de juego.</li>
                <li><strong className="text-foreground">Informacion tecnica:</strong> direccion IP, tipo de dispositivo, navegador, sistema operativo y datos de ubicacion general.</li>
              </ul>
              <p>
                Toda la informacion se recopila con tu consentimiento explicito al momento del registro
                y durante el uso de la Plataforma.
              </p>
            </div>

            {/* 2 */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Uso de la Informacion</h2>
              <p className="mb-3">Utilizamos tu informacion personal para los siguientes fines:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Proporcionar, mantener y mejorar los servicios de la Plataforma.</li>
                <li>Verificar tu identidad y edad para cumplir con requisitos legales.</li>
                <li>Procesar transacciones de deposito, retiro y distribucion de premios.</li>
                <li>Prevenir fraude, lavado de dinero y actividades ilicitas.</li>
                <li>Personalizar tu experiencia y ofrecerte contenido relevante.</li>
                <li>Comunicarte actualizaciones, promociones y cambios en nuestros servicios.</li>
                <li>Resolver disputas y brindar soporte al cliente.</li>
                <li>Generar estadisticas anonimas para mejorar la Plataforma.</li>
              </ul>
            </div>

            {/* 3 */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. Proteccion de la Informacion</h2>
              <p className="mb-3">
                Implementamos medidas de seguridad tecnicas, administrativas y fisicas para proteger
                tu informacion personal contra acceso no autorizado, alteracion, divulgacion o
                destruccion. Estas medidas incluyen:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Encriptacion de datos en transito y en reposo mediante protocolos TLS/SSL y AES-256.</li>
                <li>Autenticacion de dos factores (2FA) disponible para todas las cuentas.</li>
                <li>Monitoreo continuo de actividad sospechosa y sistemas de deteccion de intrusos.</li>
                <li>Acceso restringido a informacion personal solo al personal autorizado que lo necesite.</li>
                <li>Auditorias de seguridad periodicas y pruebas de penetracion.</li>
              </ul>
              <p className="mt-3">
                Aunque implementamos medidas robustas, ningun sistema es completamente infalible.
                Te notificaremos sin demora injustificada en caso de cualquier brecha de seguridad
                que pueda afectar tu informacion.
              </p>
            </div>

            {/* 4 */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Compartir Informacion con Terceros</h2>
              <p className="mb-3">
                No vendemos, alquilamos ni comercializamos tu informacion personal a terceros.
                Podemos compartir informacion limitada en los siguientes casos:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong className="text-foreground">Procesadores de pago:</strong> compartimos datos necesarios para procesar transacciones de forma segura.</li>
                <li><strong className="text-foreground">Cumplimiento legal:</strong> cuando la ley lo exija o para responder a procesos legales validos.</li>
                <li><strong className="text-foreground">Prevencion de fraude:</strong> con servicios de verificacion de identidad y prevencion de actividades ilicitas.</li>
                <li><strong className="text-foreground">Proveedores de servicio:</strong> con terceros que nos ayudan a operar la Plataforma, bajo acuerdos de confidencialidad estrictos.</li>
              </ul>
              <p className="mt-3">
                Todos los terceros con acceso a informacion personal estan obligados contractualmente
                a protegerla y utilizarla exclusivamente para los fines autorizados.
              </p>
            </div>

            {/* 5 */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Cookies y Tecnologias de Rastreo</h2>
              <p className="mb-3">
                Utilizamos cookies y tecnologias similares para mejorar tu experiencia en la
                Plataforma. Los tipos de cookies que empleamos incluyen:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong className="text-foreground">Cookies esenciales:</strong> necesarias para el funcionamiento basico de la Plataforma, incluyendo autenticacion y seguridad.</li>
                <li><strong className="text-foreground">Cookies de rendimiento:</strong> nos ayudan a entender como los usuarios interactuan con la Plataforma para mejorar su funcionamiento.</li>
                <li><strong className="text-foreground">Cookies de funcionalidad:</strong> permiten recordar tus preferencias y personalizar tu experiencia.</li>
              </ul>
              <p className="mt-3">
                Puedes gestionar tus preferencias de cookies a traves de la configuracion de tu
                navegador. Ten en cuenta que deshabilitar ciertas cookies puede afectar la
                funcionalidad de la Plataforma.
              </p>
            </div>

            {/* 6 */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Derechos del Usuario</h2>
              <p className="mb-3">Tienes los siguientes derechos respecto a tu informacion personal:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong className="text-foreground">Acceso:</strong> solicitar una copia de la informacion personal que tenemos sobre ti.</li>
                <li><strong className="text-foreground">Rectificacion:</strong> corregir informacion personal inexacta o incompleta.</li>
                <li><strong className="text-foreground">Eliminacion:</strong> solicitar la eliminacion de tu informacion personal, sujeto a obligaciones legales de retencion.</li>
                <li><strong className="text-foreground">Portabilidad:</strong> recibir tu informacion en un formato estructurado y de uso comun.</li>
                <li><strong className="text-foreground">Oposicion:</strong> oponerte al procesamiento de tu informacion para fines especificos.</li>
                <li><strong className="text-foreground">Revocacion:</strong> retirar tu consentimiento en cualquier momento para el tratamiento de datos basado en consentimiento.</li>
              </ul>
              <p className="mt-3">
                Para ejercer cualquiera de estos derechos, contactanos a traves de los canales
                indicados al final de esta politica. Responderemos a tu solicitud en un plazo
                maximo de 30 dias.
              </p>
            </div>

            {/* 7 */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Retencion de Datos</h2>
              <p className="mb-3">
                Conservamos tu informacion personal durante el tiempo que tu cuenta este activa y
                por un periodo adicional necesario para cumplir con nuestras obligaciones legales,
                resolver disputas y hacer cumplir nuestros acuerdos.
              </p>
              <p className="mb-3">
                Los datos de transacciones financieras se conservan por un minimo de 5 anos conforme
                a regulaciones anti-lavado de dinero. Los datos de verificacion de identidad se
                conservan por el mismo periodo.
              </p>
              <p>
                Una vez que tu cuenta sea eliminada y hayan transcurrido los periodos de retencion
                obligatorios, tu informacion personal sera eliminada o anonimizada de forma irreversible.
              </p>
            </div>

            {/* 8 */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. Contacto</h2>
              <p className="mb-3">
                Si tienes preguntas, inquietudes o deseas ejercer tus derechos relacionados con
                tu privacidad, puedes contactarnos a traves de los siguientes medios:
              </p>
              <div className="bg-surface-2 border border-border-light rounded-xl p-6">
                <ul className="space-y-2 text-sm">
                  <li>
                    <strong className="text-foreground">Correo electronico:</strong>{" "}
                    <a href="mailto:privacidad@phoenixarena.com" className="text-red-400 hover:text-red-300 transition-colors">
                      privacidad@phoenixarena.com
                    </a>
                  </li>
                  <li>
                    <strong className="text-foreground">Soporte general:</strong>{" "}
                    <a href="mailto:soporte@phoenixarena.com" className="text-red-400 hover:text-red-300 transition-colors">
                      soporte@phoenixarena.com
                    </a>
                  </li>
                  <li>
                    <strong className="text-foreground">Tiempo de respuesta:</strong> maximo 30 dias habiles.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted">
              Esta politica de privacidad se actualiza periodicamente. Revisa esta pagina
              regularmente para mantenerte informado sobre como protegemos tu informacion.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
