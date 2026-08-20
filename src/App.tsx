import { useMemo, useState } from 'react'
import cardsData from './data/cards.json'
import type { Card, FiltersState } from './types'
import { StatsBar } from './components/StatsBar'
import { Filters } from './components/Filters'
import { CardGrid } from './components/CardGrid'
import { CardDetail } from './components/CardDetail'

const initialCards = (cardsData as Card[]).slice().sort((a, b) => b.orden - a.orden)

export default function App() {
  const [cards, setCards] = useState<Card[]>(initialCards)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filters, setFilters] = useState<FiltersState>({
    search: '',
    pokemon: 'all',
    estado: 'all',
    idioma: 'all',
  })

  const idiomas = useMemo(() => {
    const set = new Set<string>()
    for (const card of cards) card.idiomasDisponibles.forEach((f) => set.add(f))
    return [...set]
  }, [cards])

  const selected = selectedId ? cards.find((c) => c.id === selectedId) : null

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    return cards.filter((card) => {
      if (filters.pokemon !== 'all' && card.pokemon !== filters.pokemon) return false
      if (filters.estado === 'tengo' && !card.laTengo) return false
      if (filters.estado === 'quiero' && !card.laQuiero) return false
      if (filters.idioma !== 'all' && !card.idiomasDisponibles.includes(filters.idioma)) return false
      if (q) {
        const haystack = `${card.nombre} ${card.coleccion} ${card.codigo} ${card.numero ?? ''}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [cards, filters])

  async function toggleTengo(id: string) {
    const previous = cards
    setCards((current) =>
      current.map((c) => (c.id === id ? { ...c, laTengo: !c.laTengo } : c)),
    )
    try {
      const res = await fetch('/api/toggle-tengo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    } catch (error) {
      console.warn('No se pudo guardar el cambio en cards.json', error)
      setCards(previous)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>
          <span className="flame">🔥</span> Colección Charmander
        </h1>
        <p className="subtitle">Cartas TCG · Charmander &amp; Charmeleon</p>
      </header>
      <StatsBar cards={cards} />
      <Filters filters={filters} onChange={setFilters} idiomas={idiomas} resultCount={filtered.length} />
      <CardGrid cards={filtered} onSelect={setSelectedId} />
      {selected && (
        <CardDetail card={selected} onClose={() => setSelectedId(null)} onToggleTengo={toggleTengo} />
      )}
    </div>
  )
}
