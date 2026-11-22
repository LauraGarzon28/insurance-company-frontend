import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAsync } from '../../hooks/useAsync'
import { useAction } from '../../hooks/useAction'
import { polizasService } from '../../services/polizasService'
import { siniestrosService } from '../../services/siniestrosService'
import { TIPOS_RIESGO } from '../../contracts/enums'
import { date, daysBetween, money, toISODate } from '../../utils/format'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { AsyncView, EmptyState } from '../../components/ui/States'
import { CheckList, Detail, Progress } from '../../components/ui/Display'
import { SiniestroCard } from '../../components/domain/Cards'

const ACCIONES = {
  renovar: {
    titulo: '¿Renovar la póliza?', texto: 'La vigencia se extiende por el mismo período, comenzando el día siguiente al fin de la vigencia actual.',
    label: 'Renovar póliza', fn: (id) => polizasService.renovar(id), titulo2: '¡Póliza renovada!', mensaje: 'La vigencia de tu póliza fue extendida.',
  },
  cancelar: {
    titulo: '¿Cancelar la póliza?', variant: 'danger', label: 'Sí, cancelar póliza', fn: (id) => polizasService.cancelar(id),
    texto: 'Una póliza cancelada no puede renovarse ni respaldar nuevos siniestros: tendrías que cotizar de nuevo. Esta acción no se puede deshacer.',
    titulo2: 'Póliza cancelada', mensaje: 'Tu póliza fue cancelada. Si cambias de opinión, puedes cotizar un nuevo seguro.', tone: 'info',
  },
}

function Contenido({ p }) {
  const navigate = useNavigate()
  const [dialogo, setDialogo] = useState(null)
  const siniestros = useAsync(() => siniestrosService.listar({ polizaId: p.id }), [p.id])
  const ejecutar = useAction(() => ACCIONES[dialogo].fn(p.id))
  const accion = ACCIONES[dialogo]

  const hoy = toISODate(new Date())
  const total = daysBetween(p.fechaInicio, p.fechaFin)
  const restantes = daysBetween(hoy, p.fechaFin)
  const vigente = p.estado === 'VIGENTE'
  const tipo = TIPOS_RIESGO[p.tipoRiesgo]

  const confirmar = async () => {
    const nueva = await ejecutar.run()
    if (!nueva) return
    setDialogo(null)
    navigate('/app/confirmacion', {
      state: {
        tone: accion.tone, title: accion.titulo2, message: accion.mensaje, contexto: dialogo,
        details: [['Póliza', p.numero ?? p.id.slice(0, 8).toUpperCase()], ['Estado', nueva.estado], ['Vigencia', `${date(nueva.fechaInicio)} – ${date(nueva.fechaFin)}`]],
        actions: [{ label: 'Ver mi póliza', to: `/app/polizas/${p.id}` }],
      },
    })
  }

  return (
    <>
      <PageHeader title={p.numero ?? 'Póliza'} subtitle={`${tipo?.label ?? ''} · ${p.descripcion ?? ''}`} back={{ to: '/app/polizas', label: 'Mis pólizas' }}
        actions={<>
          <Badge estado={p.estado} />
          <Button to={`/app/siniestros/nuevo?polizaId=${p.id}`} disabled={!vigente}>Reportar siniestro</Button>
        </>} />
      <div className="stack stack--lg">
        {p.estado === 'CANCELADA' && <Alert tone="danger">Esta póliza fue cancelada: no puede renovarse ni reportar siniestros. Para asegurarte de nuevo debes <Link to="/app/cotizar">cotizar otra vez</Link>.</Alert>}
        {p.estado === 'VENCIDA' && <Alert tone="warning">Esta póliza está vencida y no cubre nuevos siniestros. Puedes renovarla para recuperar la cobertura.</Alert>}
        {vigente && restantes <= 30 && <Alert tone="warning">Tu póliza vence en {restantes} {restantes === 1 ? 'día' : 'días'}. Renuévala para no perder cobertura.</Alert>}

        <div className="split">
          <div className="stack">
            <Card title="Vigencia">
              <div className="stack">
                <Detail items={[['Inicio', date(p.fechaInicio)], ['Fin', date(p.fechaFin)], ['Duración', `${total} días`]]} />
                <div>
                  <Progress value={(daysBetween(p.fechaInicio, hoy) / total) * 100} label="Avance de la vigencia" />
                  <p className="muted small" style={{ marginTop: '.4rem' }}>{vigente ? `Quedan ${restantes} días de cobertura.` : 'La vigencia terminó o fue interrumpida.'}</p>
                </div>
              </div>
            </Card>
            <Card title="Coberturas"><CheckList items={p.coberturas ?? tipo?.coberturas ?? []} /></Card>
            <section className="stack">
              <h2>Siniestros de esta póliza</h2>
              <AsyncView state={siniestros}>
                {(lista) => lista.length ? <div className="grid">{lista.map((s) => <SiniestroCard key={s.id} siniestro={s} />)}</div>
                  : <Card><EmptyState icon="checkCircle" title="Sin siniestros reportados" /></Card>}
              </AsyncView>
            </section>
          </div>

          <div className="stack">
            <Card title="Datos de la póliza">
              <Detail items={[['Valor asegurado', money(p.valorAsegurado)], ['Prima anual', p.prima ? money(p.prima) : null], ['Cotización de origen', p.cotizacionId?.slice(0, 8).toUpperCase()]]} />
            </Card>
            <Card title="Acciones" accent>
              <div className="stack">
                <Button variant="secondary" onClick={() => setDialogo('renovar')} disabled={p.estado === 'CANCELADA'}>Renovar póliza</Button>
                {p.estado === 'CANCELADA' && <p className="muted small">Una póliza cancelada no puede renovarse; debe cotizarse de nuevo.</p>}
                <Button variant="ghost" onClick={() => setDialogo('cancelar')} disabled={p.estado === 'CANCELADA'} style={{ color: 'var(--danger)' }}>Cancelar póliza</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <ConfirmDialog open={!!dialogo} title={accion?.titulo} confirmLabel={accion?.label} variant={accion?.variant}
        loading={ejecutar.loading} error={ejecutar.error} onConfirm={confirmar} onCancel={() => { setDialogo(null); ejecutar.clearError() }}>
        {accion?.texto}
      </ConfirmDialog>
    </>
  )
}

export default function PolizaDetalle() {
  const { id } = useParams()
  const state = useAsync(() => polizasService.obtener(id), [id])
  return <AsyncView state={state}>{(p) => <Contenido p={p} />}</AsyncView>
}
