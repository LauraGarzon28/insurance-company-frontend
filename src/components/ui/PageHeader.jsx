import { Link } from 'react-router-dom'
import Icon from './Icon'

export default function PageHeader({ title, subtitle, actions, back }) {
  return (
    <header className="page-header">
      <div>
        {back && <Link to={back.to} className="backlink"><Icon name="arrowLeft" size={16} />{back.label}</Link>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="row">{actions}</div>}
    </header>
  )
}
