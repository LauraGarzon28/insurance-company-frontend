import { useNavigate, useParams } from 'react-router-dom'
import { useAsync } from '../../hooks/useAsync'
import { useAction } from '../../hooks/useAction'
import { useStepForm } from '../../hooks/useStepForm'
import { cotizacionesService } from '../../services/cotizacionesService'
import { polizasService } from '../../services/polizasService'
import { TIPOS_RIESGO } from '../../contracts/enums'
import { tipoDeDescripcion } from '../../utils/pricing'
import { addYears, date, money, toISODate } from '../../utils/format'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Alert, { ErrorAlert } from '../../components/ui/Alert'
import { TextField } from '../../components/ui/Fields'
import { AsyncView } from '../../components/ui/States'
import { CheckList, Detail } from '../../components/ui/Display'

const hoy = toISODate(new Date())
const validate = (v) => ({
  ...(!v.fechaInicio && { fechaInicio: 'Selecciona la fecha de inicio' }),
  ...(v.fechaInicio && v.fechaInicio < hoy && { fechaInicio: 'La fecha de inicio no puede ser anterior a hoy' }),
  ...(!v.fechaFin && { fechaFin: 'Selecciona la fecha de fin' }),
  ...(v.fechaInicio && v.fechaFin && v.fechaInicio >= v.fechaFin && { fechaFin: 'La fecha de fin debe ser posterior al inicio' }),
})

function Formulario({ c }) {
  const navigate = useNavigate()
  const form = useStepForm([{ id: 'emision', validate }], { fechaInicio: hoy, fechaFin: addYears(hoy, 1) })
  const emitir = useAction(() => polizasService.emitir({ cotizacion: c, fechaInicio: form.values.fechaInicio, fechaFin: form.values.fechaFin }))
  const coberturas = TIPOS_RIESGO[tipoDeDescripcion(c.descripcionRiesgo)]?.coberturas ?? []

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.next()) return
    const p = await emitir.run()
    if (!p) return
    navigate('/app/confirmacion', {
      state: {
        title: '¡Tu póliza fue emitida!', message: 'Ya estás formalmente asegurado. Puedes consultarla cuando quieras.', contexto: 'emision',
        details: [['Póliza', p.numero ?? p.id.slice(0, 8).toUpperCase()], ['Vigencia', `${date(p.fechaInicio)} – ${date(p.fechaFin)}`], ['Valor asegurado', money(p.valorAsegurado)]],
        actions: [{ label: 'Ver mi póliza', to: `/app/polizas/${p.id}` }, { label: 'Ver mis pólizas', to: '/app/polizas' }],
      },
    })
  }

  if (c.estado !== 'ACEPTADA') {
    return <Alert tone="warning">Solo se puede emitir una póliza a partir de una cotización aceptada. Esta cotización está en estado {c.estado}.</Alert>
  }
  return (
    <form className="split" noValidate onSubmit={onSubmit}>
      <div className="stack">
        <Card title="Vigencia de la póliza">
          <div className="form-grid">
            <TextField label="Inicio" type="date" min={hoy} {...form.bind('fechaInicio')} />
            <TextField label="Fin" type="date" min={form.values.fechaInicio || hoy} {...form.bind('fechaFin')} />
          </div>
        </Card>
        <Card title="Coberturas incluidas"><CheckList items={coberturas} /></Card>
      </div>
      <Card title="Resumen" accent>
        <div className="stack">
          <Detail items={[['Riesgo', c.descripcionRiesgo], ['Valor asegurado', money(c.valorAsegurado)], ['Prima anual', money(c.prima.monto)]]} />
          <ErrorAlert error={emitir.error} />
          <Button type="submit" block loading={emitir.loading}>Emitir póliza</Button>
        </div>
      </Card>
    </form>
  )
}

export default function EmitirPoliza() {
  const { id } = useParams()
  const state = useAsync(() => cotizacionesService.obtener(id), [id])
  return (
    <>
      <PageHeader title="Emitir póliza" subtitle="Define la vigencia y confirma para quedar asegurado." back={{ to: `/app/cotizaciones/${id}`, label: 'Volver a la cotización' }} />
      <AsyncView state={state}>{(c) => <Formulario c={c} />}</AsyncView>
    </>
  )
}
