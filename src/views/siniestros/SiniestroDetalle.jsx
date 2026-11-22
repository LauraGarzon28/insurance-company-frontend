import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useAsync } from '../../hooks/useAsync'
import { useAction } from '../../hooks/useAction'
import { Rol } from '../../contracts/enums'
import { polizasService } from '../../services/polizasService'
import { siniestrosService } from '../../services/siniestrosService'
import { date, money, shortId } from '../../utils/format'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Alert, { ErrorAlert } from '../../components/ui/Alert'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Timeline from '../../components/ui/Timeline'
import { SelectField } from '../../components/ui/Fields'
import { AsyncView } from '../../components/ui/States'
import { Detail } from '../../components/ui/Display'
import EvaluacionForm from '../../components/domain/EvaluacionForm'

function Asignar({ s, ajustadores, onDone }) {
  const [ajustadorId, setAjustadorId] = useState('')
  const asignar = useAction(async () => { await siniestrosService.asignar(s.id, ajustadorId); onDone() })
  return (
    <form className="stack" onSubmit={(e) => { e.preventDefault(); if (ajustadorId) asignar.run() }}>
      <p className="muted">Este siniestro aún no tiene ajustador. Asígnalo para iniciar la evaluación.</p>
      <SelectField label="Ajustador" placeholder="Selecciona un ajustador" value={ajustadorId} onChange={(e) => setAjustadorId(e.target.value)}
        options={(ajustadores ?? []).map((a) => ({ value: a.id, label: a.nombre }))} />
      <ErrorAlert error={asignar.error} />
      <Button type="submit" loading={asignar.loading} disabled={!ajustadorId}>Asignar ajustador</Button>
    </form>
  )
}

function Decision({ s, nombreAjustador, ajustadores, reload }) {
  const { usuario, puede } = useAuth()
  const [cerrando, setCerrando] = useState(false)
  const cerrar = useAction(async () => { await siniestrosService.cerrar(s.id); setCerrando(false); reload() })
  const esCliente = puede([Rol.CLIENTE])
  const puedeEvaluar = s.estado === 'EN_EVALUACION' && (puede([Rol.ADMIN]) || (puede([Rol.AJUSTADOR]) && s.ajustadorId === usuario.id))
  const puedeCerrar = ['APROBADO', 'RECHAZADO'].includes(s.estado) && (puede([Rol.ADMIN]) || (puede([Rol.AJUSTADOR]) && s.ajustadorId === usuario.id))

  if (s.estado === 'REPORTADO' && puede([Rol.ASESOR, Rol.ADMIN])) return <Asignar s={s} ajustadores={ajustadores} onDone={reload} />
  if (puedeEvaluar) return <EvaluacionForm siniestro={s} />

  const mensajes = {
    REPORTADO: 'Recibimos el reporte. Un asesor asignará un ajustador a la brevedad.',
    EN_EVALUACION: `El caso está siendo evaluado${nombreAjustador ? ` por ${nombreAjustador}` : ''}.`,
    APROBADO: `Reclamación aprobada por ${money(s.montoAprobado)}.`,
    RECHAZADO: 'La reclamación fue rechazada.',
    CERRADO: 'El caso está cerrado.',
  }
  return (
    <div className="stack">
      <Alert tone={{ APROBADO: 'success', RECHAZADO: 'danger' }[s.estado] ?? 'info'}>{mensajes[s.estado]}</Alert>
      {s.comentarioDecision && <Detail items={[['Comentario del ajustador', s.comentarioDecision]]} />}
      {s.montoAprobado != null && s.estado === 'CERRADO' && <Detail items={[['Monto aprobado', money(s.montoAprobado)]]} />}
      {puedeCerrar && <Button variant="secondary" onClick={() => setCerrando(true)}>Cerrar caso</Button>}
      {esCliente && s.estado === 'EN_EVALUACION' && <p className="muted small">Te notificaremos aquí cuando haya una decisión.</p>}
      <ConfirmDialog open={cerrando} title="¿Cerrar el caso?" confirmLabel="Cerrar caso" loading={cerrar.loading} error={cerrar.error}
        onConfirm={cerrar.run} onCancel={() => setCerrando(false)}>
        Una vez cerrado, el siniestro no admitirá más cambios.
      </ConfirmDialog>
    </div>
  )
}

function Contenido({ s, reload }) {
  const { puede } = useAuth()
  const poliza = useAsync(() => polizasService.obtener(s.polizaId), [s.polizaId])
  const ajustadores = useAsync(() => siniestrosService.listarAjustadores(), [])
  const nombreAjustador = ajustadores.data?.find((a) => a.id === s.ajustadorId)?.nombre
  const esCliente = puede([Rol.CLIENTE])
  const esStaffSuscripcion = puede([Rol.SUSCRIPTOR, Rol.ADMIN])
  const volver = esCliente ? { to: '/app/siniestros', label: 'Mis siniestros' } : { to: '/app/siniestros', label: 'Siniestros' }

  return (
    <>
      <PageHeader title={`Siniestro ${shortId(s.id)}`} back={volver} actions={<Badge estado={s.estado} />} />
      <div className="split">
        <div className="stack">
          <Card title="Descripción del siniestro">
            <div className="stack">
              <p>{s.descripcion}</p>
              <Detail items={[['Fecha de ocurrencia', date(s.fechaOcurrencia)], ['Ajustador', nombreAjustador ?? 'Sin asignar'], ['Valor asegurado', money(s.valorAseguradoPoliza)]]} />
            </div>
          </Card>
          <Card title="Seguimiento">
            {s.historial?.length ? <Timeline events={s.historial} /> : <p className="muted">Aún no hay movimientos registrados.</p>}
          </Card>
        </div>

        <div className="stack">
          <Card title="Póliza asociada">
            <AsyncView state={poliza}>
              {(p) => (
                <div className="stack">
                  <div className="row row--between"><strong>{p.numero ?? shortId(p.id)}</strong><Badge estado={p.estado} /></div>
                  <Detail items={[['Vigencia', `${date(p.fechaInicio)} – ${date(p.fechaFin)}`], ['Valor asegurado', money(p.valorAsegurado)]]} />
                  {esCliente && <Button to={`/app/polizas/${p.id}`} variant="secondary" size="sm">Ver póliza</Button>}
                  {esStaffSuscripcion && <Button to={`/app/historico?polizaId=${p.id}`} variant="secondary" size="sm">Histórico de la póliza</Button>}
                </div>
              )}
            </AsyncView>
          </Card>
          <Card title="Decisión" accent>
            <Decision s={s} nombreAjustador={nombreAjustador} ajustadores={ajustadores.data} reload={reload} />
          </Card>
        </div>
      </div>
    </>
  )
}

export default function SiniestroDetalle() {
  const { id } = useParams()
  const state = useAsync(() => siniestrosService.obtener(id), [id])
  return <AsyncView state={state}>{(s) => <Contenido s={s} reload={state.reload} />}</AsyncView>
}
