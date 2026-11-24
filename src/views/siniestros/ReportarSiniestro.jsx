import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useAsync } from '../../hooks/useAsync'
import { useAction } from '../../hooks/useAction'
import { useStepForm } from '../../hooks/useStepForm'
import { polizasService } from '../../services/polizasService'
import { siniestrosService } from '../../services/siniestrosService'
import { date, shortId, toISODate } from '../../utils/format'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Alert, { ErrorAlert } from '../../components/ui/Alert'
import { SelectField, TextAreaField, TextField } from '../../components/ui/Fields'
import { AsyncView, EmptyState } from '../../components/ui/States'

const hoy = toISODate(new Date())

function Formulario({ vigentes, inicial }) {
  const navigate = useNavigate()
  const form = useStepForm([{
    id: 'reporte',
    validate: (v) => {
      const p = vigentes.find((x) => x.id === v.polizaId)
      return {
        ...(!p && { polizaId: 'Selecciona una póliza vigente' }),
        ...(v.descripcion.trim().length < 15 && { descripcion: 'Describe lo ocurrido con más detalle (mínimo 15 caracteres)' }),
        ...(!v.fechaOcurrencia && { fechaOcurrencia: 'Indica cuándo ocurrió' }),
        ...(v.fechaOcurrencia > hoy && { fechaOcurrencia: 'La fecha no puede ser futura' }),
        ...(p && v.fechaOcurrencia && v.fechaOcurrencia < p.fechaInicio && { fechaOcurrencia: `Debe ser posterior al inicio de la vigencia (${date(p.fechaInicio)})` }),
      }
    },
  }], { polizaId: inicial, descripcion: '', fechaOcurrencia: hoy })
  const { values: v } = form
  const poliza = vigentes.find((x) => x.id === v.polizaId)

  const reportar = useAction(() => siniestrosService.reportar({
    polizaId: poliza.id, descripcion: v.descripcion.trim(), fechaOcurrencia: v.fechaOcurrencia,
  }))

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.next()) return
    const s = await reportar.run()
    if (!s) return
    navigate('/app/confirmacion', {
      state: {
        title: 'Siniestro reportado', message: 'Registramos tu reporte. Un asesor lo asignará a un ajustador y podrás seguir su estado aquí.', contexto: 'siniestro',
        details: [['Siniestro', shortId(s.id)], ['Póliza', poliza.numero ?? shortId(poliza.id)], ['Fecha del hecho', date(v.fechaOcurrencia)]],
        actions: [{ label: 'Ver estado del siniestro', to: `/app/siniestros/${s.id}` }, { label: 'Mis siniestros', to: '/app/siniestros' }],
      },
    })
  }

  return (
    <form noValidate onSubmit={onSubmit} style={{ maxWidth: 680 }}>
      <Card title="Datos del siniestro">
        <div className="stack">
          <SelectField label="Póliza afectada" placeholder="Selecciona una póliza"
            options={vigentes.map((p) => ({ value: p.id, label: `${p.numero ?? shortId(p.id)} · ${p.descripcion ?? ''}` }))} {...form.bind('polizaId')} />
          <TextField label="Fecha del hecho" type="date" max={hoy} min={poliza?.fechaInicio} {...form.bind('fechaOcurrencia')} />
          <TextAreaField label="¿Qué ocurrió?" hint="Incluye lugar, daños y cualquier detalle que ayude a evaluar el caso." {...form.bind('descripcion')} />
          <ErrorAlert error={reportar.error} />
          <div><Button type="submit" loading={reportar.loading}>Reportar siniestro</Button></div>
        </div>
      </Card>
    </form>
  )
}

export default function ReportarSiniestro() {
  const { usuario } = useAuth()
  const [params] = useSearchParams()
  const state = useAsync(() => (usuario.clienteId ? polizasService.listarPorCliente(usuario.clienteId) : []), [usuario.clienteId])
  return (
    <>
      <PageHeader title="Reportar un siniestro" subtitle="Solo puedes reportar siniestros sobre pólizas vigentes." back={{ to: '/app/siniestros', label: 'Mis siniestros' }} />
      <AsyncView state={state}>
        {(lista) => {
          const vigentes = lista.filter((p) => p.estado === 'VIGENTE')
          if (!vigentes.length) {
            return <EmptyState icon="shield" title="No tienes pólizas vigentes" action={<Button to="/app/cotizar">Cotizar un seguro</Button>}>
              Un siniestro no puede reportarse sobre una póliza vencida o cancelada.
            </EmptyState>
          }
          return (
            <div className="stack">
              {params.get('polizaId') && !vigentes.some((p) => p.id === params.get('polizaId')) && <Alert tone="warning">La póliza indicada no está vigente.</Alert>}
              <Formulario vigentes={vigentes} inicial={vigentes.some((p) => p.id === params.get('polizaId')) ? params.get('polizaId') : ''} />
            </div>
          )
        }}
      </AsyncView>
    </>
  )
}
