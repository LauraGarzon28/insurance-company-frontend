import { Link } from 'react-router-dom'

/** variant: primary | secondary | ghost | danger. Con `to` se renderiza como enlace. */
export default function Button({ variant = 'primary', size, block, loading, disabled, to, className = '', children, ...rest }) {
  const cls = `btn btn--${variant} ${size === 'sm' ? 'btn--sm' : ''} ${block ? 'btn--block' : ''} ${className}`
  if (to && !disabled) return <Link to={to} className={cls} {...rest}>{children}</Link>
  return (
    <button type="button" className={cls} disabled={loading || disabled} aria-busy={loading || undefined} {...rest}>
      {loading && <span className="spinner" aria-hidden="true" />}
      {children}
    </button>
  )
}
