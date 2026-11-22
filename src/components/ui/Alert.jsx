import Icon from './Icon'

const ICONOS = { success: 'checkCircle', warning: 'alert', danger: 'alert', info: 'info' }

/** Mensaje contextual. Los errores se anuncian a lectores de pantalla (role=alert). */
export default function Alert({ tone = 'info', children, className = '' }) {
  if (!children) return null
  return (
    <div className={`alert tone-${tone} ${className}`} role={tone === 'danger' ? 'alert' : 'status'}>
      <Icon name={ICONOS[tone]} size={18} />
      <div>{children}</div>
    </div>
  )
}

/** Muestra un ApiError, incluyendo los errores por campo que devuelve el backend. */
export function ErrorAlert({ error }) {
  if (!error) return null
  return (
    <Alert tone="danger">
      {error.message}
      {error.errores?.length > 0 && (
        <ul style={{ margin: '.35rem 0 0', paddingLeft: '1.1rem' }}>
          {error.errores.map((e) => <li key={e.campo}>{e.mensaje}</li>)}
        </ul>
      )}
    </Alert>
  )
}
