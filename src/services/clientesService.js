import { env } from '../config/env'
import { http } from './http'
import { clientesMock } from './mocks/clientesMock'

const base = env.endpoints.clientes

const real = {
  registrar: (datos) => http.post(base, datos),
  obtener: (id) => http.get(`${base}/${id}`),
}

export const clientesService = env.isMock('clientes') ? clientesMock : real
