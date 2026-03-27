import Link from "next/link";

export const metadata = {
  title: "Politica de Pagos y Retiros — Phoenix Arena",
  description: "Informacion sobre depositos, retiros, comisiones y monedero interno de Phoenix Arena.",
};

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.5 15L7.5 10L12.5 5" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <path d="M16 14h2" />
      <path d="M22 6V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v1" />
    </svg>
  );
}

export default function PagosPage() {
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
            Politica de Pagos y Retiros
          </h1>

          <div className="space-y-10 text-muted leading-relaxed">
            {/* 1 */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Monedero Interno</h2>
              <p className="mb-3">
                Phoenix Arena utiliza un sistema de monedero interno que funciona como intermediario
                para todas las transacciones dentro de la Plataforma. Tu monedero refleja tu saldo
                disponible para participar en retos, torneos y recibir premios.
              </p>
              <p className="mb-3">
                El saldo de tu monedero no genera intereses ni constituye un deposito bancario.
                Phoenix Arena no es una institucion financiera y los fondos almacenados en tu monedero
                se mantienen en cuentas segregadas exclusivamente para garantizar su disponibilidad.
              </p>
              <p>
                Puedes consultar tu saldo, historial de transacciones y movimientos en cualquier
                momento desde la seccion "Monedero" de tu perfil.
              </p>
            </div>

            {/* 2 */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Depositos</h2>
              <p className="mb-3">
                Los depositos se pueden realizar a traves de los metodos de pago habilitados en tu
                region, que pueden incluir tarjetas de debito/credito, transferencias bancarias,
                monederos electronicos y otros medios disponibles.
              </p>
              <p className="mb-3">
                Los depositos se acreditan en tu monedero de forma inmediata una vez confirmada la
                transaccion por el procesador de pago. En algunos casos, la verificacion puede
                demorar hasta 24 horas dependiendo del metodo utilizado.
              </p>
              <p>
                Phoenix Arena puede establecer montos minimos y maximos de deposito, los cuales
                se comunicaran claramente en la seccion de depositos de tu monedero. Estos limites
                pueden variar segun el metodo de pago y la jurisdiccion del usuario.
              </p>
            </div>

            {/* 3 */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. Retiros</h2>
              <p className="mb-3">
                Puedes solicitar el retiro de tu saldo disponible en cualquier momento. Los retiros
                se procesan en un plazo de 1 a 5 dias habiles, dependiendo del metodo de retiro
                seleccionado y de los procesos de verificacion aplicables.
              </p>
              <p className="mb-3">
                Para tu primer retiro, o cuando el monto acumulado supere ciertos umbrales, la
                Plataforma puede requerir verificacion de identidad adicional (KYC). Este proceso
                es necesario para cumplir con regulaciones anti-lavado de dinero y proteger tu cuenta.
              </p>
              <p>
                Los retiros se realizaran al mismo metodo utilizado para el deposito original siempre
                que sea posible. En caso contrario, se te ofrecera una alternativa verificada. Los
                montos minimos de retiro se indicaran en la seccion correspondiente de tu monedero.
              </p>
            </div>

            {/* 4 */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Comisiones</h2>
              <div className="bg-surface-2 border border-border-light rounded-xl p-6 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-red-400"><WalletIcon /></span>
                  <span className="text-foreground font-medium">Comision estandar: 10% por reto</span>
                </div>
                <p className="text-sm">
                  Phoenix Arena cobra una comision del 10% sobre el fondo total de cada reto o
                  competencia. Esta comision se descuenta automaticamente del premio antes de
                  acreditarse al ganador.
                </p>
              </div>
              <p className="mb-3">
                Por ejemplo, en un reto de $10 USD por jugador entre dos participantes, el fondo
                total es de $20 USD. La comision de la Plataforma sera de $2 USD y el ganador
                recibira $18 USD.
              </p>
              <p>
                Las comisiones de deposito y retiro varian segun el metodo de pago utilizado y se
                muestran de manera transparente antes de confirmar cualquier transaccion. Phoenix
                Arena no cobra comisiones ocultas.
              </p>
            </div>

            {/* 5 */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Fondos de Garantia</h2>
              <p className="mb-3">
                Cuando un reto se encuentra en progreso, los fondos de ambos participantes se
                retienen en un fondo de garantia (escrow) hasta que se determine el resultado
                de la competencia.
              </p>
              <p className="mb-3">
                Los fondos en garantia no pueden ser retirados ni utilizados para otros retos hasta
                que la competencia haya finalizado y el resultado sea verificado. En caso de disputas,
                los fondos permanecen retenidos hasta la resolucion por parte del equipo de moderacion.
              </p>
              <p>
                Si una competencia se cancela por razones tecnicas o por acuerdo mutuo, los fondos
                se devuelven integramente a los participantes sin comision alguna.
              </p>
            </div>

            {/* 6 */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Reembolsos</h2>
              <p className="mb-3">
                Los depositos realizados a tu monedero son reembolsables siempre que los fondos no
                hayan sido utilizados en competencias. Para solicitar un reembolso de fondos no
                utilizados, contacta a nuestro equipo de soporte.
              </p>
              <p className="mb-3">
                Las entradas a retos y torneos no son reembolsables una vez que la competencia ha
                iniciado. Si un reto se cancela antes de comenzar por cualquier razon, la entrada
                se devuelve al monedero del usuario automaticamente.
              </p>
              <p>
                Los reembolsos por deposito se procesan al metodo de pago original y pueden demorar
                entre 5 y 15 dias habiles dependiendo de la institucion financiera.
              </p>
            </div>

            {/* 7 */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Responsabilidad Fiscal</h2>
              <p className="mb-3">
                Los premios obtenidos en Phoenix Arena pueden estar sujetos a impuestos segun las
                leyes fiscales de tu jurisdiccion. Es tu responsabilidad exclusiva declarar y pagar
                los impuestos correspondientes a los ingresos obtenidos a traves de la Plataforma.
              </p>
              <p>
                Phoenix Arena no actua como agente de retencion fiscal y no proporciona asesoria
                tributaria. Te recomendamos consultar con un profesional fiscal calificado para
                entender tus obligaciones impositivas. A solicitud, podemos proporcionarte un
                resumen de tus ganancias anuales para facilitar tu declaracion.
              </p>
            </div>

            {/* 8 */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. Monedas y Conversion</h2>
              <p className="mb-3">
                La Plataforma opera principalmente en dolares estadounidenses (USD). Los depositos
                realizados en monedas locales se convierten a USD utilizando el tipo de cambio vigente
                al momento de la transaccion proporcionado por nuestro procesador de pagos.
              </p>
              <p className="mb-3">
                Los retiros se realizan en la moneda local del usuario cuando el metodo de pago lo
                permite, utilizando el tipo de cambio vigente al momento del procesamiento.
              </p>
              <p>
                Las fluctuaciones en los tipos de cambio son riesgo del usuario. Phoenix Arena no es
                responsable de diferencias en el monto recibido debido a variaciones cambiarias entre
                el momento del deposito y el retiro. Se recomienda estar atento a las condiciones
                cambiarias de tu region.
              </p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted">
              Para consultas sobre pagos y transacciones, contactanos en{" "}
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
