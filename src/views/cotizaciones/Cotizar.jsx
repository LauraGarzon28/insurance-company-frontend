import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useAsync } from '../../hooks/useAsync'
import { useAction } from '../../hooks/useAction'
import { useStepForm } from '../../hooks/useStepForm'
import { clientesService } from '../../services/clientesService'
import { cotizacionesService } from '../../services/cotizacionesService'
import { reglasService } from '../../services/reglasService'
import { ESTADO_META, TIPOS_DOCUMENTO, TIPOS_RIESGO } from '../../contracts/enums'
import { calcularPrima, calcularPuntaje } from '../../utils/pricing'
import { isEmail, vacio } from '../../utils/validation'
import { money, shortId } from '../../utils/format'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Stepper from '../../components/ui/Stepper'
import Button from '../../components/ui/Button'
import Alert, { ErrorAlert } from '../../components/ui/Alert'
import { ChoiceField, CheckboxField, SelectField, TextAreaField, TextField } from '../../components/ui/Fields'
import { AsyncView } from '../../components/ui/States'
import { Detail, Progress } from '../../components/ui/Display'
import CostBreakdown from '../../components/domain/CostBreakdown'

const MENSAJES = {
  COTIZADA: 'Tu cotización está lista. Revisa el detalle y acéptala para emitir tu póliza.',
  EN_REVISION_MANUAL: 'Tu riesgo requiere revisión manual. Un suscriptor la evaluará y te mostraremos el resultado aquí.',
  SOLICITADA: 'Estamos evaluando tu riesgo. Te mostraremos la prima apenas esté lista.',
}

export default function Cotizar() {
  const { usuario, vincularCliente } = useAuth()
  const navigate = useNavigate()
  const tienePerfil = !!usuario.clienteId
  const perfil = useAsync(() => (tienePerfil ? clientesService.obtener(usuario.clienteId) : null), [usuario.clienteId])
  const reglas = useAsync(() => reglasService.vigente(), [])

  const steps = [
    {
      id: 'datos', title: 'Tus datos',
      validate: (v) => tienePerfil ? {} : {
        ...(vacio(v.nombreCompleto) && { nombreCompleto: 'Ingresa tu nombre completo' }),
        ...(vacio(v.numeroDocumento) && { numeroDocumento: 'Ingresa tu número de documento' }),
        ...(!isEmail(v.correo) && { correo: 'Ingresa un correo válido' }),
        ...(!/^\d{7,15}$/.test(v.telefono.replace(/\s/g, '')) && { telefono: 'Ingresa un teléfono válido (7 a 15 dígitos)' }),
      },
    },
    {
      id: 'riesgo', title: 'Riesgo a asegurar',
      validate: (v) => ({
        ...(!v.tipoRiesgo && { tipoRiesgo: 'Selecciona qué quieres asegurar' }),
        ...(v.descripcion.trim().length < 10 && { descripcion: 'Describe el riesgo (mínimo 10 caracteres)' }),
        ...(!(Number(v.valorAsegurado) > 0) && { valorAsegurado: 'Ingresa un valor mayor que cero' }),
      }),
    },
    { id: 'resumen', title: 'Resumen' },
  ]
  const form = useStepForm(steps, {
    nombreCompleto: '', tipoDocumento: 'CC', numeroDocumento: '', correo: '', telefono: '',
    tipoRiesgo: '', descripcion: '', valorAsegurado: '', siniestrosPrevios: '0', medidasProteccion: false,
  })
  const { values: v, bind } = form

  const puntaje = calcularPuntaje(v)
  const valor = Number(v.valorAsegurado) || 0
  const estimacion = reglas.data ? calcularPrima(valor, puntaje, reglas.data) : null

  const enviar = useAction(async () => {
    let clienteId = usuario.clienteId
    if (!clienteId) {
      const cliente = await clientesService.registrar({
        nombreCompleto: v.nombreCompleto.trim(), tipoDocumento: v.tipoDocumento, numeroDocumento: v.numeroDocumento.trim(),
        correo: v.correo.trim(), telefono: v.telefono.replace(/\s/g, ''),
      })
      clienteId = cliente.id
      vincularCliente(clienteId)
    }
    return cotizacionesService.solicitar({
      clienteId, descripcionRiesgo: `${TIPOS_RIESGO[v.tipoRiesgo].label} — ${v.descripcion.trim()}`, valorAsegurado: valor, puntajeRiesgo: puntaje,
    })
  })

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.next() || !form.isLast) return
    const c = await enviar.run()
    if (!c) return
    navigate('/app/confirmacion', {
      state: {
        title: '¡Cotización solicitada!', message: MENSAJES[c.estado], contexto: 'cotizacion',
        details: [
          ['Cotización', shortId(c.id)],
          ['ID completo', c.id],
          ['Estado', ESTADO_META[c.estado].label],
          ['Prima anual', c.prima ? money(c.prima.monto) : 'Pendiente'],
        ],
        actions: [{ label: 'Ver cotización', to: `/app/cotizaciones/${c.id}` }, { label: 'Cotizar otro riesgo', to: '/app/cotizar' }],
      },
    })
  }

  return (
    <>
      <PageHeader title="Cotiza tu seguro" subtitle="Tres pasos rápidos para conocer el costo antes de comprar." />
      <div className="stack stack--lg" style={{ maxWidth: 760 }}>
        <Stepper steps={steps} current={form.index} />
        <form noValidate onSubmit={onSubmit}>
          <Card title={form.step.title}>
            <div className="stack">
              {form.index === 0 && (tienePerfil ? (
                <AsyncView state={perfil}>
                  {(c) => (
                    <>
                      <Alert tone="info">Usaremos los datos de tu perfil de cliente.</Alert>
                      <Detail items={[['Nombre', c.nombreCompleto], ['Documento', `${c.tipoDocumento} ${c.numeroDocumento}`], ['Correo', c.correo], ['Teléfono', c.telefono]]} />
                    </>
                  )}
                </AsyncView>
              ) : (
                <div className="form-grid">
                  <TextField className="full" label="Nombre completo" autoComplete="name" {...bind('nombreCompleto')} />
                  <SelectField label="Tipo de documento" options={TIPOS_DOCUMENTO.map((t) => ({ value: t, label: t }))} {...bind('tipoDocumento')} />
                  <TextField label="Número de documento" inputMode="numeric" {...bind('numeroDocumento')} />
                  <TextField label="Correo electrónico" type="email" autoComplete="email" {...bind('correo')} />
                  <TextField label="Teléfono" type="tel" autoComplete="tel" {...bind('telefono')} />
                  <p className="muted small full">Estos datos se guardan como tu perfil de cliente y no se vuelven a pedir.</p>
                </div>
              ))}

              {form.index === 1 && (
                <>
                  <ChoiceField label="¿Qué quieres asegurar?" options={Object.entries(TIPOS_RIESGO).map(([value, t]) => ({ value, label: t.label }))} {...bind('tipoRiesgo')} />
                  <TextAreaField label="Describe el riesgo" hint="Ej.: Apartamento de 90 m² en Bogotá, piso 5, con vigilancia." {...bind('descripcion')} />
                  <div className="form-grid">
                    <TextField label="Valor a asegurar (COP)" type="number" min="1" step="any" inputMode="numeric"
                      hint={valor > 0 ? money(valor) : undefined} {...bind('valorAsegurado')} />
                    <SelectField label="Siniestros en los últimos 3 años" options={[{ value: '0', label: 'Ninguno' }, { value: '1', label: 'Uno' }, { value: '2', label: 'Dos o más' }]} {...bind('siniestrosPrevios')} />
                  </div>
                  <CheckboxField label="Cuento con medidas de protección" hint="Alarma, vigilancia, GPS, seguro de salud previo u otras."
                    checked={v.medidasProteccion} onChange={bind('medidasProteccion').onChange} />
                </>
              )}

              {form.index === 2 && (
                <>
                  <Detail items={[
                    ['Asegurado', tienePerfil ? perfil.data?.nombreCompleto : v.nombreCompleto],
                    ['Riesgo', TIPOS_RIESGO[v.tipoRiesgo]?.label], ['Descripción', v.descripcion], ['Valor asegurado', money(valor)],
                  ]} />
                  <hr className="divider" />
                  <h3>Costo estimado</h3>
                  <div>
                    <div className="row row--between small"><span>Nivel de riesgo</span><strong>{puntaje}/100</strong></div>
                    <Progress value={puntaje} label="Nivel de riesgo" />
                  </div>
                  {estimacion && <CostBreakdown estimado valorAsegurado={valor} puntaje={puntaje} tasaBase={reglas.data.tasaBase} total={estimacion.total} versionReglas={reglas.data.version} />}
                  {estimacion?.requiereRevisionManual && (
                    <Alert tone="warning">Tu nivel de riesgo supera el umbral ({reglas.data.umbralRevisionManual}). Un suscriptor revisará tu solicitud antes de confirmar la prima.</Alert>
                  )}
                  <ErrorAlert error={enviar.error} />
                </>
              )}
            </div>
          </Card>

          <div className="row row--between" style={{ marginTop: '1rem' }}>
            <Button variant="ghost" onClick={form.back} disabled={form.index === 0 || enviar.loading}>Atrás</Button>
            <Button type="submit" loading={enviar.loading} disabled={form.index === 0 && tienePerfil && !perfil.data}>
              {form.isLast ? 'Solicitar cotización' : 'Continuar'}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
