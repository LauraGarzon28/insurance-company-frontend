import Icon from './Icon'

/** Lista de pares etiqueta/valor. items: [[etiqueta, valor], ...] */
export function Detail({ items }) {
  return (
    <dl className="dl">
      {items.map(([k, v]) => (
        <div key={k}><dt>{k}</dt><dd>{v ?? '—'}</dd></div>
      ))}
    </dl>
  )
}

export function StatCard({ icon, label, value, hint }) {
  return (
    <div className="card stat">
      <div className="stat__icon"><Icon name={icon} size={24} /></div>
      <div>
        <div className="stat__value">{value}</div>
        <div className="muted small">{label}</div>
        {hint && <div className="small muted">{hint}</div>}
      </div>
    </div>
  )
}

/** Barra de progreso accesible (0-100). */
export function Progress({ value, label }) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div className="progress" role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <span style={{ width: `${v}%` }} />
    </div>
  )
}

export function CheckList({ items }) {
  return (
    <ul className="pill-list">
      {items.map((i) => <li key={i}><Icon name="check" size={16} />{i}</li>)}
    </ul>
  )
}

/** Filtros tipo "chip". options: [{ value, label }]; value '' = todos. */
export function FilterChips({ options, value, onChange, label }) {
  return (
    <div className="chips" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" className={`chip ${o.value === value ? 'is-active' : ''}`}
          aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}
