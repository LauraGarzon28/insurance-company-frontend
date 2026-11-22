export default function Stepper({ steps, current }) {
  return (
    <ol className="stepper" aria-label="Progreso">
      {steps.map((s, i) => (
        <li key={s.id} className={i < current ? 'is-done' : i === current ? 'is-active' : ''} aria-current={i === current ? 'step' : undefined}>
          <span className="stepper__n">Paso {i + 1}</span>
          <span>{s.title}</span>
        </li>
      ))}
    </ol>
  )
}
