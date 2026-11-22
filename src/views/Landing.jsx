import { useAuth } from '../hooks/useAuth'
import Logo from '../components/ui/Logo'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import Card from '../components/ui/Card'

const FEATURES = [
  { icon: 'zap', title: 'Cotiza en minutos', text: 'Cuéntanos qué quieres asegurar y conoce el costo estimado al instante, con el detalle de cómo se calcula.' },
  { icon: 'shield', title: 'Emite 100% digital', text: 'Acepta tu cotización y emite tu póliza sin papeleo. Renueva o cancela cuando lo necesites.' },
  { icon: 'clipboard', title: 'Siniestros con seguimiento', text: 'Repórtalos en línea y consulta su estado paso a paso, hasta la decisión del ajustador.' },
]

const STEPS = [
  ['Cotiza', 'Completa un formulario corto con tus datos y el riesgo a asegurar.'],
  ['Acepta', 'Revisa el costo, entiende su cálculo y acepta tu cotización.'],
  ['Asegúrate', 'Emite tu póliza y consúltala cuando quieras.'],
  ['Reclama', 'Reporta un siniestro y sigue su estado en tiempo real.'],
]

export default function Landing() {
  const { autenticado } = useAuth()
  return (
    <>
      <div className="hero">
        <nav className="public-nav" aria-label="Principal">
          <Logo />
          <div className="row">
            {autenticado ? (
              <Button to="/app" variant="light">Ir a mi panel</Button>
            ) : (
              <>
                <Button to="/login" variant="outline-light" className="btn--outline-light">Iniciar sesión</Button>
                <Button to="/registro" variant="light">Crear cuenta</Button>
              </>
            )}
          </div>
        </nav>
        <div className="hero__body">
          <div>
            <h1>Seguros simples, claros y 100% digitales</h1>
            <p className="lead">Cotiza, emite tu póliza y gestiona tus siniestros desde un solo lugar, con reglas transparentes y respuestas rápidas.</p>
            <div className="row">
              <Button to={autenticado ? '/app/cotizar' : '/registro'} variant="light">Cotizar ahora <Icon name="arrowRight" size={18} /></Button>
              {!autenticado && <Button to="/login" variant="outline-light" className="btn--outline-light">Ya tengo cuenta</Button>}
            </div>
          </div>
          <div className="hero__art" aria-hidden="true">
            <div className="card" style={{ maxWidth: 380, marginLeft: 'auto', transform: 'rotate(2deg)' }}>
              <div className="stack">
                <div className="row row--between"><strong>Tu cotización</strong><span className="badge tone-success">Cotizada</span></div>
                <div className="breakdown">
                  <div><span>Valor asegurado</span><span>$180.000.000</span></div>
                  <div><span>Prima base</span><span>$6.300.000</span></div>
                  <div><span>Recargo por riesgo</span><span>+ $2.520.000</span></div>
                  <div className="total"><span>Prima anual</span><span>$8.820.000</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="section" aria-labelledby="beneficios">
        <h2 id="beneficios">Todo lo que necesitas para estar cubierto</h2>
        <p className="muted">Pensado para que cada trámite sea fácil de entender.</p>
        <div className="grid" style={{ marginTop: '1.5rem' }}>
          {FEATURES.map((f) => (
            <Card key={f.title}>
              <div className="feature">
                <div className="feature__icon"><Icon name={f.icon} size={24} /></div>
                <h3>{f.title}</h3>
                <p className="muted">{f.text}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="como">
        <h2 id="como">Así de fácil</h2>
        <ol className="steps">
          {STEPS.map(([t, d]) => <li key={t}><h3>{t}</h3><p className="muted">{d}</p></li>)}
        </ol>
      </section>

      <footer className="footer">© {new Date().getFullYear()} Aseguradora Digital · Tus datos personales y financieros se tratan de forma confidencial.</footer>
    </>
  )
}
