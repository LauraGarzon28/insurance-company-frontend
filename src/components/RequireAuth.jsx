import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { EmptyState } from './ui/States'
import Button from './ui/Button'

/** Protege rutas: exige sesión y, opcionalmente, alguno de los `roles`. */
export default function RequireAuth({ roles }) {
  const { autenticado, puede } = useAuth()
  const location = useLocation()
  if (!autenticado) return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
  if (roles && !puede(roles)) {
    return (
      <EmptyState icon="lock" title="No tienes acceso a esta sección" action={<Button to="/app">Volver al inicio</Button>}>
        Tu rol actual no permite ver esta página.
      </EmptyState>
    )
  }
  return <Outlet />
}
