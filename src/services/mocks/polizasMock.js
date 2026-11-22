import { db, simular, uid, fallar } from './db'
import { TIPOS_RIESGO } from '../../contracts/enums'
import { addDays, daysBetween, toISODate } from '../../utils/format'
import { tipoDeDescripcion } from '../../utils/pricing'

// Mismo cálculo que Poliza.estadoEn() del backend.
const estadoDe = (p) => (p.cancelada ? 'CANCELADA' : p.fechaFin < toISODate(new Date()) ? 'VENCIDA' : 'VIGENTE')
export const polizaVista = ({ cancelada, ...p }) => ({ ...p, estado: estadoDe({ cancelada, ...p }) })

const buscar = (id) => db().polizas.find((p) => p.id === id) ?? fallar('No se encontró la póliza', 404)
const nuevasPrimero = (lista) => lista.slice().reverse()

export const polizasMock = {
  // Recibe la cotización completa: con cotizaciones reales, esta no vive en la base simulada.
  emitir: simular(({ cotizacion: cot, fechaInicio, fechaFin }) => {
    const cotizacionId = cot.id
    if (cot.estado !== 'ACEPTADA') fallar('Solo se puede emitir una póliza a partir de una cotización aceptada')
    if (db().polizas.some((p) => p.cotizacionId === cotizacionId)) fallar('Ya se emitió una póliza para esta cotización', 409)
    if (!(fechaInicio < fechaFin)) fallar('La fecha de inicio debe ser anterior a la fecha de fin')
    const resto = cot.descripcionRiesgo.split(' — ').slice(1)
    const tipo = tipoDeDescripcion(cot.descripcionRiesgo) ?? 'HOGAR'
    const p = {
      id: uid(), numero: `POL-2026-${String(db().polizas.length + 1).padStart(4, '0')}`, clienteId: cot.clienteId, cotizacionId,
      valorAsegurado: cot.valorAsegurado, fechaInicio, fechaFin, cancelada: false, tipoRiesgo: tipo,
      descripcion: resto.join(' — ') || cot.descripcionRiesgo, prima: cot.prima.monto, coberturas: TIPOS_RIESGO[tipo].coberturas,
    }
    db().polizas.push(p)
    return polizaVista(p)
  }),
  obtener: simular((id) => polizaVista(buscar(id))),
  listarPorCliente: simular((clienteId) => nuevasPrimero(db().polizas.filter((p) => p.clienteId === clienteId)).map(polizaVista)),
  renovar: simular((id) => {
    const p = buscar(id)
    if (p.cancelada) fallar('No se puede renovar una póliza cancelada; debe cotizarse de nuevo')
    const dias = daysBetween(p.fechaInicio, p.fechaFin)
    p.fechaInicio = addDays(p.fechaFin, 1)
    p.fechaFin = addDays(p.fechaInicio, dias)
    return polizaVista(p)
  }),
  cancelar: simular((id) => {
    const p = buscar(id)
    if (p.cancelada) fallar('La póliza ya se encuentra cancelada')
    p.cancelada = true
    return polizaVista(p)
  }),
}

export { estadoDe }
