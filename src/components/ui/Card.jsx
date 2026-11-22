import { Link } from 'react-router-dom'

/** Tarjeta base. Con `to` es clicable (enlace completo). */
export default function Card({ title, action, to, accent, flat, className = '', children }) {
  const cls = `card ${accent ? 'card--accent' : ''} ${flat ? 'card--flat' : ''} ${to ? 'card--link' : ''} ${className}`
  const body = (
    <>
      {(title || action) && (
        <div className="card__head">
          {title && <h2>{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </>
  )
  return to ? <Link to={to} className={cls}>{body}</Link> : <section className={cls}>{body}</section>
}
