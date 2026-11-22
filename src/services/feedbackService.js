import { db, simular } from './mocks/db'

// shortcut: la retroalimentación del usuario se guarda solo en el mock local; no hay endpoint todavía.
export const feedbackService = {
  enviar: simular(({ contexto, calificacion, comentario }) => {
    db().feedback.push({ contexto, calificacion, comentario, fecha: new Date().toISOString() })
  }),
}
