import { db, simular, uid, ahora, fallar } from './db'
import { estadoDe } from './polizasMock'
import { money } from '../../utils/format'

const buscar = (id) => db().siniestros.find((s) => s.id === id) ?? fallar('No se encontró el siniestro', 404)
const exigir = (s, ...estados) => {
  if (!estados.includes(s.estado)) fallar(`Operación inválida: el siniestro está ${s.estado} y se esperaba ${estados.join(' o ')}`)
  return s
}
const evento = (s, estado, detalle, actor) => {
  s.estado = estado
  s.historial.push({ estado, fecha: ahora(), detalle, actor })
}

export const siniestrosMock = {
  reportar: simular(({ polizaId, descripcion, fechaOcurrencia }) => {
    const p = db().polizas.find((x) => x.id === polizaId) ?? fallar('No se encontró la póliza', 404)
    if (estadoDe(p) !== 'VIGENTE') fallar('El siniestro se rechaza: la póliza está vencida o cancelada')
    const s = {
      id: uid(), polizaId, clienteId: p.clienteId, descripcion, estado: 'REPORTADO', valorAseguradoPoliza: p.valorAsegurado,
      montoAprobado: null, fechaOcurrencia, ajustadorId: null, comentarioDecision: null,
      historial: [{ estado: 'REPORTADO', fecha: ahora(), detalle: 'El cliente reportó el siniestro.', actor: 'Cliente' }],
    }
    db().siniestros.push(s)
    return s
  }),
  obtener: simular(buscar),
  listar: simular(({ clienteId, ajustadorId, polizaId, estado } = {}) =>
    db().siniestros
      .filter((s) => (!clienteId || s.clienteId === clienteId) && (!ajustadorId || s.ajustadorId === ajustadorId)
        && (!polizaId || s.polizaId === polizaId) && (!estado || s.estado === estado))
      .reverse()),
  listarAjustadores: simular(() => db().ajustadores),
  asignar: simular((id, ajustadorId) => {
    const s = exigir(buscar(id), 'REPORTADO')
    const aj = db().ajustadores.find((a) => a.id === ajustadorId) ?? fallar('Ajustador no encontrado', 404)
    s.ajustadorId = ajustadorId
    evento(s, 'EN_EVALUACION', `Asignado al ajustador ${aj.nombre}.`, 'Asesor comercial')
    return s
  }),
  evaluar: simular((id, { aprobado, montoPropuesto, comentario }) => {
    const s = exigir(buscar(id), 'EN_EVALUACION')
    s.comentarioDecision = comentario || null
    if (aprobado) {
      // Regla de negocio: el monto aprobado nunca excede el valor asegurado.
      if (!(montoPropuesto > 0)) fallar('El monto aprobado debe ser mayor que cero')
      if (montoPropuesto > s.valorAseguradoPoliza) fallar(`El monto aprobado no puede superar el valor asegurado de la póliza (${money(s.valorAseguradoPoliza)})`)
      s.montoAprobado = montoPropuesto
      evento(s, 'APROBADO', `Evaluación aprobada por ${money(montoPropuesto)}.`, 'Ajustador')
    } else {
      evento(s, 'RECHAZADO', 'Evaluación rechazada.', 'Ajustador')
    }
    return s
  }),
  cerrar: simular((id) => {
    const s = exigir(buscar(id), 'APROBADO', 'RECHAZADO')
    evento(s, 'CERRADO', 'Caso cerrado.', 'Ajustador')
    return s
  }),
}
