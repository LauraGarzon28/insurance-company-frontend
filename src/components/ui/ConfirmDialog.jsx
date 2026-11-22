import { useEffect, useRef } from 'react'
import Button from './Button'
import { ErrorAlert } from './Alert'

/** Diálogo modal de confirmación (usa <dialog> nativo: foco atrapado y cierre con Esc). */
export default function ConfirmDialog({ open, title, children, confirmLabel = 'Confirmar', variant = 'primary', loading, error, onConfirm, onCancel }) {
  const ref = useRef(null)
  useEffect(() => {
    const d = ref.current
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  return (
    <dialog ref={ref} onClose={onCancel} aria-labelledby="dlg-title">
      <div className="stack">
        <h2 id="dlg-title">{title}</h2>
        <div className="muted">{children}</div>
        <ErrorAlert error={error} />
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onCancel} disabled={loading}>Volver</Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </div>
      </div>
    </dialog>
  )
}
