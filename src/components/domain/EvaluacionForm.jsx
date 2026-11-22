import { useNavigate } from 'react-router-dom'
import { useAction } from '../../hooks/useAction'
import { useStepForm } from '../../hooks/useStepForm'
import { siniestrosService } from '../../services/siniestrosService'
import { money, shortId } from '../../utils/format'
import Button from '../ui/Button'
import { ErrorAlert } from '../ui/Alert'
import { ChoiceField, TextAreaField, TextField } from '../ui/Fields'

/** Formulario del ajustador: decisión (aprobado/rechazado), monto indemnizable y comentario. */
export default function EvaluacionForm({ siniestro: s }) {
  const navigate = useNavigate()
  const max = s.valorAseguradoPoliza
  const aprobado = (v) => v.decision === 'APROBADO'

  const form = useStepForm([{
    id: 'evaluacion',
    validate: (v) => ({
      ...(!v.decision && { decision: 'Selecciona una decisión' }),
      // Regla de negocio: el monto aprobado nunca excede el valor asegurado de la póliza.
      ...(aprobado(v) && !(Number(v.monto) > 0) && { monto: 'Ingresa un monto mayor que cero' }),
      ...(aprobado(v) && Number(v.monto) > max && { monto: `El monto no puede superar el valor asegurado (${money(max)})` }),
      ...(v.comentario.trim().length < 5 && { comentario: 'Explica brevemente tu decisión' }),
    }),
  }], { decision: '', monto: '', comentario: '' })
  const { values: v, bind } = form

  const evaluar = useAction(() => siniestrosService.evaluar(s.id, {
    aprobado: aprobado(v), montoPropuesto: aprobado(v) ? Number(v.monto) : null, comentario: v.comentario.trim(),
  }))

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.next()) return
    const r = await evaluar.run()
    if (!r) return
    navigate('/app/confirmacion', {
      state: {
        title: 'Evaluación registrada', message: `El siniestro quedó ${aprobado(v) ? 'aprobado' : 'rechazado'}. Ahora puedes cerrar el caso.`, contexto: 'evaluacion',
        details: [['Siniestro', shortId(s.id)], ['Decisión', aprobado(v) ? 'Aprobado' : 'Rechazado'], ...(aprobado(v) ? [['Monto indemnizable', money(Number(v.monto))]] : [])],
        actions: [{ label: 'Ver siniestro', to: `/app/siniestros/${s.id}` }, { label: 'Mis casos', to: '/app/siniestros' }],
      },
    })
  }

  return (
    <form className="stack" noValidate onSubmit={onSubmit}>
      <ChoiceField label="Decisión" options={[{ value: 'APROBADO', label: 'Aprobar' }, { value: 'RECHAZADO', label: 'Rechazar' }]} {...bind('decision')} />
      {aprobado(v) && (
        <TextField label="Monto indemnizable (COP)" type="number" min="1" step="any" inputMode="numeric"
          hint={`Máximo permitido: ${money(max)}`} {...bind('monto')} />
      )}
      <TextAreaField label="Comentario de la evaluación" {...bind('comentario')} />
      <ErrorAlert error={evaluar.error} />
      <Button type="submit" loading={evaluar.loading}>Registrar evaluación</Button>
    </form>
  )
}
