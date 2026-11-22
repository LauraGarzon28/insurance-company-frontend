import { ESTADO_META } from '../../contracts/enums'
import { dateTime } from '../../utils/format'
import Badge from './Badge'

/** events: [{ estado, fecha, detalle, actor }] en orden cronológico. */
export default function Timeline({ events }) {
  return (
    <ol className="timeline">
      {events.map((e, i) => (
        <li key={`${e.estado}-${i}`} style={{ color: `var(--${ESTADO_META[e.estado]?.tone ?? 'info'})` }}>
          <span className="timeline__dot" />
          <div style={{ color: 'var(--ink)' }}>
            <div className="row" style={{ gap: '.5rem' }}>
              <Badge estado={e.estado} />
              <span className="small muted">{dateTime(e.fecha)} · {e.actor}</span>
            </div>
            <p style={{ marginTop: '.25rem' }}>{e.detalle}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
