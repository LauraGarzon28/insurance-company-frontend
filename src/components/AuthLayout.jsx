import Logo from './ui/Logo'
import Icon from './ui/Icon'

/** Marco compartido de inicio de sesión y registro. */
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth">
      <aside className="auth__aside">
        <Logo />
        <div>
          <h2>Tu tranquilidad, a un clic de distancia.</h2>
          <ul>
            {['Cotiza en minutos, sin papeleo', 'Gestiona tus pólizas desde cualquier lugar', 'Reporta y sigue tus siniestros en tiempo real'].map((t) => (
              <li key={t}><Icon name="checkCircle" size={20} />{t}</li>
            ))}
          </ul>
        </div>
        <small>© {new Date().getFullYear()} Aseguradora Digital</small>
      </aside>
      <main className="auth__main">
        <div className="auth__box">
          <div className="stack--sm stack">
            <div className="auth__logo"><Logo /></div>
            <h1>{title}</h1>
            <p className="muted">{subtitle}</p>
          </div>
          {children}
          <p className="muted small">{footer}</p>
        </div>
      </main>
    </div>
  )
}
