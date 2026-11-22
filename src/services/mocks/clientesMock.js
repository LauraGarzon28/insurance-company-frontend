import { db, simular, uid, fallar } from './db'

export const clientesMock = {
  registrar: simular((datos) => {
    if (db().clientes.some((c) => c.numeroDocumento === datos.numeroDocumento)) {
      fallar('Ya existe un cliente registrado con ese documento', 409)
    }
    const cliente = { id: uid(), ...datos }
    db().clientes.push(cliente)
    return cliente
  }),
  obtener: simular((id) => db().clientes.find((c) => c.id === id) ?? fallar('Cliente no encontrado', 404)),
}
