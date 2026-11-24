import { env } from '../config/env'
import { http, qs } from './http'
import { polizasMock } from './mocks/polizasMock'

const base = env.endpoints.polizas

const real = {
  emitir: ({ cotizacion, fechaInicio, fechaFin }) => http.post(base, { cotizacionId: cotizacion.id, fechaInicio, fechaFin }),
  obtener: (id) => http.get(`${base}/${id}`),
  listarPorCliente: (clienteId) => http.get(`${base}${qs({ clienteId })}`),
  renovar: (id) => http.post(`${base}/${id}/renovaciones`),
  cancelar: (id) => http.post(`${base}/${id}/cancelacion`),
}

export const polizasService = env.isMock('polizas') ? polizasMock : real
