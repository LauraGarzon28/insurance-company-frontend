import { money } from '../../utils/format'

/**
 * Explica de dónde sale la prima: valor asegurado × tasa base, más un recargo proporcional al puntaje de riesgo.
 * `total` es la prima (estimada u oficial); el recargo se obtiene por diferencia.
 */
export default function CostBreakdown({ valorAsegurado, puntaje, tasaBase, total, versionReglas, estimado }) {
  const base = valorAsegurado * tasaBase
  return (
    <div className="stack">
      <div className="breakdown">
        <div><span>Valor asegurado</span><span className="mono">{money(valorAsegurado)}</span></div>
        <div><span>Prima base <span className="muted small">(tasa {(tasaBase * 100).toFixed(2)}%)</span></span><span className="mono">{money(base)}</span></div>
        <div><span>Recargo por riesgo <span className="muted small">(puntaje {puntaje}/100 → +{puntaje}%)</span></span><span className="mono">+ {money(total - base)}</span></div>
        <div className="total"><span>{estimado ? 'Prima anual estimada' : 'Prima anual'}</span><span className="mono">{money(total)}</span></div>
      </div>
      <p className="muted small">
        {versionReglas ? `Calculada con la versión ${versionReglas} de las reglas de suscripción. ` : 'Usa las reglas de suscripción vigentes. '}
        {estimado && 'Es un valor estimado: el suscriptor confirma la prima definitiva.'}
      </p>
    </div>
  )
}
