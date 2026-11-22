import { db, simular } from './mocks/db'

// shortcut: cotizaciones-service no expone las reglas de suscripción (se envían en cada evaluación);
// se sirven simuladas. Reemplazar por un GET cuando el backend las publique.
export const reglasService = {
  listar: simular(() => db().reglas),
  vigente: simular(() => db().reglas.find((r) => r.vigente)),
}
