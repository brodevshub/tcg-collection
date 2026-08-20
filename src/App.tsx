import { useEffect, useMemo, useState } from 'react'
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

  // En dev, el import estático de cards.json puede venir cacheado por Vite;
  // se sincroniza con el disco al arrancar. En build estático el fetch falla
  // y se queda el import.
  useEffect(() => {
    fetch('/api/cards')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Card[] | null) => {
        if (data) setCards(data.slice().sort((a, b) => b.orden - a.orden))
      })
      .catch(() => {})
  }, [])
  const [filters, setFilters] = useState<FiltersState>({
    search: '',
    pokemon: 'all',
    estado: 'all',
    idioma: 'all',
    sort: 'orden-desc',
  })

  const idiomas = useMemo(() => {
    const set = new Set<string>()
    for (const card of cards) card.idiomasDisponibles.forEach((f) => set.add(f))
    return [...set]
  }, [cards])

  const selected = selectedId ? cards.find((c) => c.id === selectedId) : null

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    const result = cards.filter((card) => {
      if (filters.pokemon !== 'all' && card.pokemon !== filters.pokemon) return false
      if (filters.estado === 'tengo' && !card.laTengo) return false
      if (filters.estado === 'faltan' && card.laTengo) return false
      if (filters.idioma !== 'all' && !card.idiomasDisponibles.includes(filters.idioma)) return false
      if (q) {
        const haystack = `${card.nombre} ${card.coleccion} ${card.codigo} ${card.numero ?? ''}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
    // Las cartas sin precio van siempre al final al ordenar por precio
    result.sort((a, b) => {
      switch (filters.sort) {
        case 'orden-asc':
          return a.orden - b.orden
        case 'precio-desc':
          return (b.precioMin ?? -Infinity) - (a.precioMin ?? -Infinity)
        case 'precio-asc':
          return (a.precioMin ?? Infinity) - (b.precioMin ?? Infinity)
        default:
          return b.orden - a.orden
      }
    })
    return result
  }, [cards, filters])

  async function persist(url: string, payload: object, previous: Card[]) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    } catch (error) {
      console.warn('No se pudo guardar el cambio en cards.json', error)
      setCards(previous)
    }
  }

  function toggleIdioma(id: string, idioma: string) {
    const card = cards.find((c) => c.id === id)
    if (!card) return
    const tengo = !card.idiomasQueTengo.includes(idioma)
    setCards((current) =>
      current.map((c) => {
        if (c.id !== id) return c
        const idiomasQueTengo = c.idiomasDisponibles.filter((f) =>
          f === idioma ? tengo : c.idiomasQueTengo.includes(f),
        )
        // laTengo se deriva de los idiomas marcados
        return { ...c, idiomasQueTengo, laTengo: idiomasQueTengo.length > 0 }
      }),
    )
    void persist('/api/toggle-idioma', { id, idioma, tengo }, cards)
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
        <CardDetail card={selected} onClose={() => setSelectedId(null)} onToggleIdioma={toggleIdioma} />
      )}
    </div>
  )
}
