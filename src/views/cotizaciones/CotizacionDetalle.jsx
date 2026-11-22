import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useAsync } from '../../hooks/useAsync'
import { useAction } from '../../hooks/useAction'
import { Rol } from '../../contracts/enums'
import { clientesService } from '../../services/clientesService'
import { cotizacionesService } from '../../services/cotizacionesService'
import { reglasService } from '../../services/reglasService'
import { tasaImplicita } from '../../utils/pricing'
import { money, shortId } from '../../utils/format'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { AsyncView } from '../../components/ui/States'
import { Detail, Progress } from '../../components/ui/Display'
import CostBreakdown from '../../components/domain/CostBreakdown'

// Acciones sobre la cotización; cada una se confirma en un diálogo antes de ejecutarse.
const ACCIONES = {
  aceptar: { titulo: '¿Aceptar la cotización?', texto: 'Al aceptarla podrás emitir tu póliza con esta prima. Esta acción no se puede deshacer.', label: 'Aceptar cotización', fn: (id) => cotizacionesService.aceptar(id) },
  aprobar: { titulo: '¿Aprobar el riesgo?', texto: 'La cotización pasará a COTIZADA y el cliente podrá aceptarla.', label: 'Aprobar riesgo', fn: (id) => cotizacionesService.aprobar(id), aviso: 'Riesgo aprobado: la cotización quedó disponible para el cliente.' },
  rechazar: { titulo: '¿Rechazar el riesgo?', texto: 'La cotización quedará rechazada y no se podrá emitir una póliza.', label: 'Rechazar riesgo', variant: 'danger', fn: (id) => cotizacionesService.rechazar(id), aviso: 'Riesgo rechazado.' },
  evaluar: { titulo: '¿Evaluar con las reglas vigentes?', texto: 'Se calculará la prima con la versión de reglas vigente y se marcará para revisión manual si supera el umbral.', label: 'Evaluar', fn: async (id) => cotizacionesService.evaluar(id, await reglasService.vigente()), aviso: 'Cotización evaluada con las reglas vigentes.' },
}

function Contenido({ c, reload, esStaff }) {
  const navigate = useNavigate()
  const [dialogo, setDialogo] = useState(null)
  const [aviso, setAviso] = useState(null)
  const cliente = useAsync(() => (esStaff ? clientesService.obtener(c.clienteId) : null), [c.clienteId, esStaff])
  const ejecutar = useAction(() => ACCIONES[dialogo].fn(c.id))
  const accion = ACCIONES[dialogo]

  const confirmar = async () => {
    const r = await ejecutar.run()
    if (!r) return
    setDialogo(null)
    if (dialogo === 'aceptar') {
      navigate('/app/confirmacion', {
        state: {
          title: '¡Cotización aceptada!', message: 'Ya puedes emitir tu póliza para quedar formalmente asegurado.', contexto: 'aceptacion',
          details: [['Cotización', shortId(c.id)], ['Prima anual', money(c.prima.monto)]],
          actions: [{ label: 'Emitir mi póliza', to: `/app/cotizaciones/${c.id}/emitir` }],
        },
      })
    } else {
      setAviso(ACCIONES[dialogo].aviso)
      reload()
    }
  }

  return (
    <>
      <PageHeader title={`Cotización ${shortId(c.id)}`} back={esStaff ? { to: '/app/revision', label: 'Revisión de riesgos' } : { to: '/app/cotizaciones', label: 'Mis cotizaciones' }}
        actions={<Badge estado={c.estado} />} />
      <div className="stack stack--lg">
        <Alert tone="success">{aviso}</Alert>
        <div className="split">
          <div className="stack">
            <Card title="Riesgo asegurado">
              <div className="stack">
                <Detail items={[
                  ['Descripción', c.descripcionRiesgo], ['Valor asegurado', money(c.valorAsegurado)],
                  ...(esStaff ? [['Cliente', cliente.data ? `${cliente.data.nombreCompleto} (${cliente.data.tipoDocumento} ${cliente.data.numeroDocumento})` : '…']] : []),
                ]} />
                <div>
                  <div className="row row--between small"><span className="muted">Nivel de riesgo</span><strong>{c.puntajeRiesgo}/100</strong></div>
                  <Progress value={c.puntajeRiesgo} label="Nivel de riesgo" />
                </div>
              </div>
            </Card>
            <Card title="¿Cómo se calcula el costo?">
              {c.prima ? (
                <CostBreakdown valorAsegurado={c.valorAsegurado} puntaje={c.puntajeRiesgo}
                  tasaBase={tasaImplicita(c.valorAsegurado, c.puntajeRiesgo, c.prima.monto)} total={c.prima.monto} versionReglas={c.prima.versionReglas} />
              ) : <Alert tone="info">La prima aún no se ha calculado. Aparecerá aquí cuando se evalúe tu cotización.</Alert>}
            </Card>
          </div>

          <Card title="Siguientes pasos" accent>
            <div className="stack">
              {c.estado === 'SOLICITADA' && (esStaff
                ? <><p className="muted">Esta cotización aún no tiene prima. Evalúala con las reglas vigentes.</p><Button onClick={() => setDialogo('evaluar')}>Evaluar con reglas vigentes</Button></>
                : <><Alert tone="info">Tu cotización está en evaluación. Vuelve en unos minutos.</Alert><Button variant="secondary" onClick={reload}>Actualizar estado</Button></>)}

              {c.estado === 'EN_REVISION_MANUAL' && (esStaff
                ? <>
                  <Alert tone="warning">El puntaje de riesgo ({c.puntajeRiesgo}) supera el umbral de las reglas {c.prima?.versionReglas}. Decide si el riesgo es asegurable.</Alert>
                  <Button onClick={() => setDialogo('aprobar')}>Aprobar riesgo</Button>
                  <Button variant="danger" onClick={() => setDialogo('rechazar')}>Rechazar riesgo</Button>
                </>
                : <Alert tone="warning">Un suscriptor está revisando tu riesgo. Te avisaremos aquí con la decisión.</Alert>)}

              {c.estado === 'COTIZADA' && (esStaff
                ? <Alert tone="success">Riesgo aprobado. Esperando que el cliente acepte la cotización.</Alert>
                : <><p className="muted">Si estás de acuerdo con la prima, acepta la cotización para emitir tu póliza.</p><Button onClick={() => setDialogo('aceptar')}>Aceptar cotización</Button></>)}

              {c.estado === 'ACEPTADA' && (esStaff
                ? <Alert tone="success">Cotización aceptada por el cliente.</Alert>
                : <><Alert tone="success">Cotización aceptada. El último paso es emitir tu póliza.</Alert><Button to={`/app/cotizaciones/${c.id}/emitir`}>Emitir póliza</Button></>)}

              {c.estado === 'RECHAZADA' && (
                <><Alert tone="danger">El riesgo no fue aprobado, por lo que no se puede emitir una póliza.</Alert>
                  {!esStaff && <Button to="/app/cotizar" variant="secondary">Cotizar de nuevo</Button>}</>)}

              {esStaff && <Button variant="ghost" to={`/app/historico?clienteId=${c.clienteId}`}>Ver histórico de siniestros del cliente</Button>}
            </div>
          </Card>
        </div>
      </div>

      <ConfirmDialog open={!!dialogo} title={accion?.titulo} confirmLabel={accion?.label} variant={accion?.variant}
        loading={ejecutar.loading} error={ejecutar.error} onConfirm={confirmar} onCancel={() => { setDialogo(null); ejecutar.clearError() }}>
        {accion?.texto}
      </ConfirmDialog>
    </>
  )
}

export default function CotizacionDetalle() {
  const { id } = useParams()
  const { puede } = useAuth()
  const state = useAsync(() => cotizacionesService.obtener(id), [id])
  return <AsyncView state={state}>{(c) => <Contenido c={c} reload={state.reload} esStaff={puede([Rol.SUSCRIPTOR, Rol.ADMIN])} />}</AsyncView>
}
