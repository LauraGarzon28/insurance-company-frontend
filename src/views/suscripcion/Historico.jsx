import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAsync } from '../../hooks/useAsync'
import { siniestrosService } from '../../services/siniestrosService'
import { money } from '../../utils/format'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { SelectField, TextField } from '../../components/ui/Fields'
import { AsyncView, EmptyState } from '../../components/ui/States'
import { StatCard } from '../../components/ui/Display'
import { SiniestroCard } from '../../components/domain/Cards'

/** Histórico de siniestros por cliente o por póliza (HU-10), filtrable por URL: ?clienteId= o ?polizaId= */
export default function Historico() {
  const [params, setParams] = useSearchParams()
  const clienteId = params.get('clienteId') ?? ''
  const polizaId = params.get('polizaId') ?? ''
  const [campo, setCampo] = useState(polizaId ? 'polizaId' : 'clienteId')
  const [valor, setValor] = useState(clienteId || polizaId)
  const state = useAsync(() => siniestrosService.listar({ clienteId, polizaId }), [clienteId, polizaId])

  return (
    <>
      <PageHeader title="Histórico de siniestros" subtitle="Consulta los siniestros de un cliente o de una póliza para mejorar la evaluación de riesgo." />
      <div className="stack stack--lg">
        <Card title="Filtrar">
          <form className="row" style={{ alignItems: 'flex-end' }}
            onSubmit={(e) => { e.preventDefault(); setParams(valor.trim() ? { [campo]: valor.trim() } : {}) }}>
            <SelectField label="Buscar por" value={campo} onChange={(e) => setCampo(e.target.value)}
              options={[{ value: 'clienteId', label: 'ID de cliente' }, { value: 'polizaId', label: 'ID de póliza' }]} />
            <TextField label="Identificador" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="xxxxxxxx-xxxx-…" />
            <Button type="submit">Consultar</Button>
            {(clienteId || polizaId) && <Button variant="ghost" onClick={() => { setValor(''); setParams({}) }}>Quitar filtro</Button>}
          </form>
        </Card>

        <AsyncView state={state}>
          {(lista) => {
            if (!lista.length) return <EmptyState icon="history" title="Sin siniestros registrados">No hay siniestros para este criterio: es un buen indicador de bajo historial de reclamaciones.</EmptyState>
            const aprobados = lista.filter((s) => s.montoAprobado != null)
            return (
              <div className="stack">
                <div className="grid">
                  <StatCard icon="alert" label="Siniestros" value={lista.length} />
                  <StatCard icon="checkCircle" label="Aprobados" value={aprobados.length} />
                  <StatCard icon="shield" label="Total indemnizado" value={money(aprobados.reduce((t, s) => t + s.montoAprobado, 0))} />
                </div>
                <div className="grid">{lista.map((s) => <SiniestroCard key={s.id} siniestro={s} />)}</div>
              </div>
            )
          }}
        </AsyncView>
      </div>
    </>
  )
}
