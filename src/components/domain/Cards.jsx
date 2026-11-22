import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Icon from '../ui/Icon'
import { date, money, shortId } from '../../utils/format'
import { TIPOS_RIESGO } from '../../contracts/enums'

/** Tarjetas de resumen reutilizables en bandejas, dashboards y detalles. */

export function PolizaCard({ poliza }) {
  const tipo = TIPOS_RIESGO[poliza.tipoRiesgo]?.label
  return (
    <Card to={`/app/polizas/${poliza.id}`}>
      <div className="stack stack--sm">
        <div className="row row--between">
          <span className="strong"><Icon name="shield" size={16} /> {poliza.numero ?? `Póliza ${shortId(poliza.id)}`}</span>
          <Badge estado={poliza.estado} />
        </div>
        <p>{tipo ? `${tipo} · ` : ''}{poliza.descripcion ?? 'Póliza de seguro'}</p>
        <div className="muted small">Vigencia: {date(poliza.fechaInicio)} – {date(poliza.fechaFin)}</div>
        <div className="strong">{money(poliza.valorAsegurado)} <span className="muted small" style={{ fontWeight: 400 }}>asegurados</span></div>
      </div>
    </Card>
  )
}

export function SiniestroCard({ siniestro }) {
  return (
    <Card to={`/app/siniestros/${siniestro.id}`}>
      <div className="stack stack--sm">
        <div className="row row--between">
          <span className="strong"><Icon name="alert" size={16} /> Siniestro {shortId(siniestro.id)}</span>
          <Badge estado={siniestro.estado} />
        </div>
        <p style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{siniestro.descripcion}</p>
        <div className="muted small">
          Ocurrido: {date(siniestro.fechaOcurrencia)}
          {siniestro.montoAprobado != null && <> · Aprobado: <strong>{money(siniestro.montoAprobado)}</strong></>}
        </div>
      </div>
    </Card>
  )
}

export function CotizacionCard({ cotizacion }) {
  return (
    <Card to={`/app/cotizaciones/${cotizacion.id}`}>
      <div className="stack stack--sm">
        <div className="row row--between">
          <span className="strong"><Icon name="file" size={16} /> Cotización {shortId(cotizacion.id)}</span>
          <Badge estado={cotizacion.estado} />
        </div>
        <p>{cotizacion.descripcionRiesgo}</p>
        <div className="muted small">
          Asegurado: {money(cotizacion.valorAsegurado)} · Prima: {cotizacion.prima ? <strong>{money(cotizacion.prima.monto)}</strong> : 'pendiente'}
        </div>
      </div>
    </Card>
  )
}
