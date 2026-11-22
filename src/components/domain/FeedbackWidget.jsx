import { useState } from 'react'
import { feedbackService } from '../../services/feedbackService'
import { useAction } from '../../hooks/useAction'
import Button from '../ui/Button'
import Alert, { ErrorAlert } from '../ui/Alert'
import { TextAreaField } from '../ui/Fields'

/** Retroalimentación del usuario tras completar un trámite (calificación 1-5 + comentario opcional). */
export default function FeedbackWidget({ contexto }) {
  const [rating, setRating] = useState(0)
  const [comentario, setComentario] = useState('')
  const [enviado, setEnviado] = useState(false)
  const { run, loading, error } = useAction(async () => {
    await feedbackService.enviar({ contexto, calificacion: rating, comentario })
    return true
  })

  if (enviado) return <Alert tone="success">¡Gracias por tu opinión! Nos ayuda a mejorar.</Alert>
  return (
    <form className="stack" style={{ width: '100%' }} onSubmit={async (e) => { e.preventDefault(); if (rating && (await run())) setEnviado(true) }}>
      <h3>¿Cómo fue tu experiencia?</h3>
      <div className="rating" role="radiogroup" aria-label="Calificación">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} de 5`}
            className={n <= rating ? 'on' : ''} onClick={() => setRating(n)}>★</button>
        ))}
      </div>
      {rating > 0 && (
        <>
          <TextAreaField label="Comentario (opcional)" value={comentario} onChange={(e) => setComentario(e.target.value)} />
          <ErrorAlert error={error} />
          <div><Button type="submit" variant="secondary" loading={loading}>Enviar opinión</Button></div>
        </>
      )}
    </form>
  )
}
