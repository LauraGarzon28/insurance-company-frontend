import { useAsync } from '../../hooks/useAsync'
import { reglasService } from '../../services/reglasService'
import { date } from '../../utils/format'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { AsyncView } from '../../components/ui/States'
import { Detail } from '../../components/ui/Display'

const detalle = (r) => [
  ['Versión', r.version], ['Tasa base', `${(r.tasaBase * 100).toFixed(2)}% del valor asegurado`],
  ['Umbral de revisión manual', `Puntaje > ${r.umbralRevisionManual}`], ['Vigente desde', date(r.vigenteDesde)],
]

export default function Reglas() {
  const state = useAsync(() => reglasService.listar(), [])
  return (
    <>
      <PageHeader title="Reglas de suscripción" subtitle="Parámetros con los que se calcula la prima y se decide la revisión manual." />
      <AsyncView state={state}>
        {(reglas) => {
          const vigente = reglas.find((r) => r.vigente)
          return (
            <div className="stack stack--lg">
              {vigente && (
                <Card title="Reglas vigentes" accent action={<Badge tone="success">Vigente</Badge>}>
                  <div className="stack">
                    <Detail items={detalle(vigente)} />
                    <p className="muted small">
                      Prima = valor asegurado × tasa base × (1 + puntaje de riesgo / 100). Si el puntaje supera el umbral, la cotización
                      pasa a revisión manual del suscriptor. Cada prima queda asociada a la versión vigente al momento de calcularla.
                    </p>
                  </div>
                </Card>
              )}
              <section className="stack">
                <h2>Versiones anteriores</h2>
                <div className="grid grid--2">
                  {reglas.filter((r) => !r.vigente).map((r) => (
                    <Card key={r.version} title={`Versión ${r.version}`} action={<Badge tone="neutral">Reemplazada</Badge>}><Detail items={detalle(r).slice(1)} /></Card>
                  ))}
                </div>
              </section>
            </div>
          )
        }}
      </AsyncView>
    </>
  )
}
