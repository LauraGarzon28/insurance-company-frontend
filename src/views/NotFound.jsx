import { EmptyState } from '../components/ui/States'
import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '1rem' }}>
      <EmptyState icon="search" title="Página no encontrada" action={<Button to="/">Ir al inicio</Button>}>
        La dirección que buscas no existe o fue movida.
      </EmptyState>
    </div>
  )
}
