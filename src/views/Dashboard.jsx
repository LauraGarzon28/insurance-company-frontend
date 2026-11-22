import { useAuth } from '../hooks/useAuth'
import { useAsync } from '../hooks/useAsync'
import { Rol, ROL_LABEL } from '../contracts/enums'
import { polizasService } from '../services/polizasService'
import { cotizacionesService, hayBandejaPendientes } from '../services/cotizacionesService'
import { siniestrosService } from '../services/siniestrosService'
import { reglasService } from '../services/reglasService'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Alert, { ErrorAlert } from '../components/ui/Alert'
import { StatCard } from '../components/ui/Display'
import { EmptyState } from '../components/ui/States'
import { PolizaCard, SiniestroCard } from '../components/domain/Cards'

const { CLIENTE, SUSCRIPTOR, ASESOR, AJUSTADOR, ADMIN } = Rol

// Cuenta elementos de una consulta que cumplen `filtro`; '…' mientras carga.
const contar = (s, filtro = () => true) => (s.data == null ? (s.error ? '—' : '…') : s.data.filter(filtro).length)

function PanelCliente() {
  const { usuario } = useAuth()
  const cid = usuario.clienteId
  const polizas = useAsync(() => (cid ? polizasService.listarPorCliente(cid) : []), [cid])
  const cotizaciones = useAsync(() => (cid ? cotizacionesService.listarPorCliente(cid) : []), [cid])
  const siniestros = useAsync(() => (cid ? siniestrosService.listar({ clienteId: cid }) : []), [cid])
  const vigentes = (polizas.data ?? []).filter((p) => p.estado === 'VIGENTE')

  return (
    <div className="stack stack--lg">
      {!cid && (
        <Alert tone="info">
          Aún no tienes un perfil de cliente. Se crea al <strong>cotizar tu primer seguro</strong>: te pediremos tus datos personales una sola vez.
        </Alert>
      )}
      <ErrorAlert error={polizas.error ?? cotizaciones.error ?? siniestros.error} />
      <div className="grid">
        <StatCard icon="shield" label="Pólizas vigentes" value={contar(polizas, (p) => p.estado === 'VIGENTE')} />
        <StatCard icon="file" label="Cotizaciones abiertas" value={contar(cotizaciones, (c) => ['SOLICITADA', 'EN_REVISION_MANUAL', 'COTIZADA'].includes(c.estado))} />
        <StatCard icon="alert" label="Siniestros en curso" value={contar(siniestros, (s) => ['REPORTADO', 'EN_EVALUACION'].includes(s.estado))} />
      </div>
      <div className="row">
        <Button to="/app/cotizar">Cotizar un seguro</Button>
        <Button to="/app/siniestros/nuevo" variant="secondary" disabled={!vigentes.length}>Reportar siniestro</Button>
      </div>

      <section className="stack">
        <div className="row row--between"><h2>Tus pólizas activas</h2><Button to="/app/polizas" variant="ghost" size="sm">Ver todas</Button></div>
        {vigentes.length ? <div className="grid">{vigentes.slice(0, 3).map((p) => <PolizaCard key={p.id} poliza={p} />)}</div>
          : <Card><EmptyState icon="shield" title="Aún no tienes pólizas activas" action={<Button to="/app/cotizar">Cotizar ahora</Button>}>Cotiza y emite tu primera póliza en minutos.</EmptyState></Card>}
      </section>

      {!!siniestros.data?.length && (
        <section className="stack">
          <div className="row row--between"><h2>Siniestros recientes</h2><Button to="/app/siniestros" variant="ghost" size="sm">Ver todos</Button></div>
          <div className="grid">{siniestros.data.slice(0, 3).map((s) => <SiniestroCard key={s.id} siniestro={s} />)}</div>
        </section>
      )}
    </div>
  )
}

function PanelSuscriptor() {
  const pendientes = useAsync(() => cotizacionesService.listarPendientes(), [])
  const reglas = useAsync(() => reglasService.vigente(), [])
  return (
    <section className="stack">
      <h2>Suscripción</h2>
      <div className="grid">
        <StatCard icon="clipboard" label="Cotizaciones por revisar" value={hayBandejaPendientes ? contar(pendientes, (c) => c.estado === 'EN_REVISION_MANUAL') : '—'}
          hint={hayBandejaPendientes ? null : 'Búscalas por ID en Revisión'} />
        <StatCard icon="book" label="Reglas vigentes" value={reglas.data?.version ?? '…'}
          hint={reglas.data && `Umbral de revisión: ${reglas.data.umbralRevisionManual}`} />
      </div>
      <div className="row">
        <Button to="/app/revision">Revisar riesgos</Button>
        <Button to="/app/reglas" variant="secondary">Ver reglas</Button>
        <Button to="/app/historico" variant="secondary">Histórico de siniestros</Button>
      </div>
    </section>
  )
}

function PanelAsesor() {
  const s = useAsync(() => siniestrosService.listar({ estado: 'REPORTADO' }), [])
  return (
    <section className="stack">
      <h2>Siniestros por asignar</h2>
      <ErrorAlert error={s.error} />
      <div className="grid"><StatCard icon="inbox" label="Reportados sin ajustador" value={contar(s)} /></div>
      {!!s.data?.length && <div className="grid">{s.data.slice(0, 3).map((x) => <SiniestroCard key={x.id} siniestro={x} />)}</div>}
      <div><Button to="/app/siniestros">Ver siniestros reportados</Button></div>
    </section>
  )
}

function PanelAjustador() {
  const { usuario } = useAuth()
  const s = useAsync(() => siniestrosService.listar({ ajustadorId: usuario.id }), [usuario.id])
  const abiertos = (s.data ?? []).filter((x) => x.estado === 'EN_EVALUACION')
  return (
    <section className="stack">
      <h2>Mis casos</h2>
      <ErrorAlert error={s.error} />
      <div className="grid">
        <StatCard icon="alert" label="Por evaluar" value={contar(s, (x) => x.estado === 'EN_EVALUACION')} />
        <StatCard icon="checkCircle" label="Resueltos" value={contar(s, (x) => ['APROBADO', 'RECHAZADO', 'CERRADO'].includes(x.estado))} />
      </div>
      {!!abiertos.length && <div className="grid">{abiertos.slice(0, 3).map((x) => <SiniestroCard key={x.id} siniestro={x} />)}</div>}
      <div><Button to="/app/siniestros">Ver mis casos</Button></div>
    </section>
  )
}

export default function Dashboard() {
  const { usuario, puede, rolPrincipal } = useAuth()
  return (
    <>
      <PageHeader title={`Hola, ${usuario.username}`} subtitle={`Panel de ${ROL_LABEL[rolPrincipal].toLowerCase()}`} />
      <div className="stack stack--lg">
        {puede([CLIENTE]) && <PanelCliente />}
        {puede([SUSCRIPTOR, ADMIN]) && <PanelSuscriptor />}
        {puede([ASESOR, ADMIN]) && <PanelAsesor />}
        {puede([AJUSTADOR]) && <PanelAjustador />}
      </div>
    </>
  )
}
