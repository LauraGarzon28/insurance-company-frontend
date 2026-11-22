import Button from './Button'
import Icon from './Icon'
import { ErrorAlert } from './Alert'

export function Loading({ label = 'Cargando…' }) {
  return (
    <div className="empty" role="status">
      <span className="spinner" style={{ width: 28, height: 28 }} />
      <span>{label}</span>
    </div>
  )
}

export function EmptyState({ icon = 'inbox', title, children, action }) {
  return (
    <div className="empty">
      <div className="empty__icon"><Icon name={icon} size={28} /></div>
      <h3>{title}</h3>
      {children && <p style={{ maxWidth: '42ch' }}>{children}</p>}
      {action}
    </div>
  )
}

/** Resuelve los tres estados de una consulta (useAsync): cargando, error con reintento o datos. */
export function AsyncView({ state, children }) {
  const { data, error, loading, reload } = state
  if (error) {
    return (
      <div className="stack">
        <ErrorAlert error={error} />
        <div><Button variant="secondary" onClick={reload}>Reintentar</Button></div>
      </div>
    )
  }
  if (loading && data == null) return <Loading />
  return children(data)
}
