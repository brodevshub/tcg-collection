import type { Card } from '../types'
import { CardItem } from './CardItem'

interface Props {
  cards: Card[]
  onSelect: (id: string) => void
}

export function CardGrid({ cards, onSelect }: Props) {
  if (cards.length === 0) {
    return <p className="empty">No hay cartas con esos filtros.</p>
  }
  return (
    <main className="grid">
      {cards.map((card) => (
        <CardItem key={card.id} card={card} onSelect={onSelect} />
      ))}
    </main>
  )
}
