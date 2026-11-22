import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useAsync } from '../../hooks/useAsync'
import { polizasService } from '../../services/polizasService'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import { AsyncView, EmptyState } from '../../components/ui/States'
import { FilterChips } from '../../components/ui/Display'
import { PolizaCard } from '../../components/domain/Cards'

export default function Polizas() {
  const { usuario } = useAuth()
  const [filtro, setFiltro] = useState('')
  const state = useAsync(() => (usuario.clienteId ? polizasService.listarPorCliente(usuario.clienteId) : []), [usuario.clienteId])

  return (
    <>
      <PageHeader title="Mis pólizas" subtitle="Todas tus pólizas en un solo lugar." actions={<Button to="/app/cotizar">Cotizar otro seguro</Button>} />
      <AsyncView state={state}>
        {(lista) => {
          if (!lista.length) {
            return <EmptyState icon="shield" title="Aún no tienes pólizas" action={<Button to="/app/cotizar">Cotizar un seguro</Button>}>
              Cotiza, acepta y emite tu primera póliza.
            </EmptyState>
          }
          const n = (e) => lista.filter((p) => p.estado === e).length
          const visibles = filtro ? lista.filter((p) => p.estado === filtro) : lista
          return (
            <div className="stack">
              <FilterChips label="Filtrar por estado" value={filtro} onChange={setFiltro} options={[
                { value: '', label: `Todas (${lista.length})` }, { value: 'VIGENTE', label: `Vigentes (${n('VIGENTE')})` },
                { value: 'VENCIDA', label: `Vencidas (${n('VENCIDA')})` }, { value: 'CANCELADA', label: `Canceladas (${n('CANCELADA')})` },
              ]} />
              {visibles.length ? <div className="grid">{visibles.map((p) => <PolizaCard key={p.id} poliza={p} />)}</div>
                : <EmptyState icon="search" title="Sin resultados">No tienes pólizas con ese estado.</EmptyState>}
            </div>
          )
        }}
      </AsyncView>
    </>
  )
}
