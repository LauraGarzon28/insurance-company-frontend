import { ESTADO_META } from '../../contracts/enums'

/** Muestra un estado de dominio (cotización, póliza o siniestro) con su etiqueta y color. */
export default function Badge({ estado, tone, children }) {
  const meta = ESTADO_META[estado] ?? { label: estado, tone: 'neutral' }
  return <span className={`badge tone-${tone ?? meta.tone}`}>{children ?? meta.label}</span>
}
