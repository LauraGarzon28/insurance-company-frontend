import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { NAV } from '../config/navigation'
import { ROL_LABEL } from '../contracts/enums'
import Icon from './ui/Icon'
import Logo from './ui/Logo'
import Button from './ui/Button'

/** Estructura de la zona privada: barra lateral en escritorio, cajón deslizable en móvil. */
export default function AppShell() {
  const { usuario, logout, puede, rolPrincipal } = useAuth()
  const [abierto, setAbierto] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()

  useEffect(() => setAbierto(false), [pathname])

  const items = NAV.filter((i) => puede(i.roles))

  return (
    <div className="shell">
      <header className="topbar">
        <button className="icon-btn" aria-label="Abrir menú" aria-expanded={abierto} onClick={() => setAbierto(true)}>
          <Icon name="menu" />
        </button>
        <Logo to="/app" />
      </header>
      {abierto && <div className="scrim" onClick={() => setAbierto(false)} />}

      <aside className={`sidebar ${abierto ? 'is-open' : ''}`} aria-label="Navegación">
        <div className="row row--between">
          <Logo to="/app" />
          <button className="icon-btn sidebar__close" aria-label="Cerrar menú" onClick={() => setAbierto(false)}>
            <Icon name="x" />
          </button>
        </div>
        <nav className="nav" aria-label="Principal">
          {items.map((i) => (
            <NavLink key={i.label} to={i.to} end={i.end}>
              <Icon name={i.icon} />{i.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__user">
          <div>
            <strong>{usuario.username}</strong>
            <div>{ROL_LABEL[rolPrincipal]}</div>
          </div>
          <Button variant="outline-light" size="sm" className="btn--outline-light" onClick={() => { logout(); navigate('/') }}>
            <Icon name="logout" size={16} />Cerrar sesión
          </Button>
        </div>
      </aside>

      <main className="content" id="contenido"><Outlet /></main>
    </div>
  )
}
