import { useState } from 'react'
import type { Card } from '../types'

interface Props {
  card: Card
  onSelect: (id: string) => void
}

export function CardItem({ card, onSelect }: Props) {
  const [imgError, setImgError] = useState(false)

  return (
    <button
      type="button"
      className={`card ${card.laTengo ? 'card-owned' : ''}`}
      onClick={() => onSelect(card.id)}
      title={`${card.nombre} · ${card.coleccion}`}
    >
      {imgError ? (
        <div className="card-placeholder">🔥</div>
      ) : (
        <img
          src={`/cards/${card.id}.jpg`}
          alt={card.nombre}
          loading="lazy"
          onError={() => setImgError(true)}
        />
      )}
    </button>
  )
}
