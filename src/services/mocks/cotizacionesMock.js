import { db, simular, uid, fallar } from './db'
import { calcularPrima } from '../../utils/pricing'

export const reglasVigentes = () => db().reglas.find((r) => r.vigente)

const buscar = (id) => db().cotizaciones.find((c) => c.id === id) ?? fallar('No se encontró la cotización', 404)
const exigir = (c, esperado) => {
  if (c.estado !== esperado) fallar(`Operación inválida: la cotización está ${c.estado} y se esperaba ${esperado}`)
  return c
}

function evaluar(c, reglas) {
  exigir(c, 'SOLICITADA')
  const r = calcularPrima(c.valorAsegurado, c.puntajeRiesgo, reglas)
  c.prima = { monto: r.total, versionReglas: reglas.version }
  c.estado = r.requiereRevisionManual ? 'EN_REVISION_MANUAL' : 'COTIZADA'
  return c
}

const cambiar = (de, a) => simular((id) => Object.assign(exigir(buscar(id), de), { estado: a }))
const nuevasPrimero = (lista) => lista.slice().reverse()

export const cotizacionesMock = {
  // El backend real no evalúa al crear (solo el suscriptor puede); el mock simula la evaluación automática.
  solicitar: simular((datos) => {
    if (!db().clientes.some((c) => c.id === datos.clienteId)) fallar('Cliente no encontrado', 404)
    const c = { id: uid(), ...datos, estado: 'SOLICITADA', prima: null }
    db().cotizaciones.push(c)
    return evaluar(c, reglasVigentes())
  }),
  obtener: simular(buscar),
  listarPorCliente: simular((clienteId) => nuevasPrimero(db().cotizaciones.filter((c) => c.clienteId === clienteId))),
  listarPendientes: simular(() => nuevasPrimero(db().cotizaciones.filter((c) => ['SOLICITADA', 'EN_REVISION_MANUAL'].includes(c.estado)))),
  evaluar: simular((id, reglas) => evaluar(buscar(id), reglas)),
  aprobar: cambiar('EN_REVISION_MANUAL', 'COTIZADA'),
  rechazar: cambiar('EN_REVISION_MANUAL', 'RECHAZADA'),
  aceptar: cambiar('COTIZADA', 'ACEPTADA'),
}
