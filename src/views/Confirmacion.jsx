import { Navigate, useLocation } from 'react-router-dom'
import Icon from '../components/ui/Icon'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { Detail } from '../components/ui/Display'
import FeedbackWidget from '../components/domain/FeedbackWidget'

/**
 * Página de confirmación genérica. Se abre con navigate('/app/confirmacion', { state }) donde
 * state = { tone?, title, message, details?: [[etiqueta, valor]], actions?: [{ label, to, variant? }], contexto }
 */
export default function Confirmacion() {
  const { state } = useLocation()
  if (!state) return <Navigate to="/app" replace />
  const { tone = 'success', title, message, details, actions = [], contexto } = state

  return (
    <div className="confirm">
      <div className={`confirm__icon tone-${tone}`}><Icon name={tone === 'success' ? 'checkCircle' : 'info'} size={44} /></div>
      <div className="stack stack--sm">
        <h1>{title}</h1>
        <p className="muted">{message}</p>
      </div>
      {details && <Card className="right" flat><div style={{ textAlign: 'left' }}><Detail items={details} /></div></Card>}
      <div className="row" style={{ justifyContent: 'center' }}>
        {actions.map((a, i) => <Button key={a.to} to={a.to} variant={a.variant ?? (i === 0 ? 'primary' : 'secondary')}>{a.label}</Button>)}
        <Button to="/app" variant="ghost">Ir al inicio</Button>
      </div>
      <hr className="divider" style={{ width: '100%' }} />
      <FeedbackWidget contexto={contexto ?? title} />
    </div>
  )
}
