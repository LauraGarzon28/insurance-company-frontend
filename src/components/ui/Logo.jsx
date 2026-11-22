import { Link } from 'react-router-dom'

export default function Logo({ to = '/' }) {
  return (
    <Link to={to} className="logo" aria-label="Aseguradora Digital, inicio">
      <svg className="logo__mark" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#3b82e6" />
        <path d="M16 5l8 3v7c0 5-3.4 9-8 11-4.6-2-8-6-8-11V8z" fill="#fff" />
        <path d="M12.5 15.5l2.5 2.5 4.5-5" fill="none" stroke="#1a66c8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>Aseguradora Digital</span>
    </Link>
  )
}
