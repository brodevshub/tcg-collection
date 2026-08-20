import { useState } from 'react'
import type { Card } from '../types'

interface Props {
  card: Card
  onToggleTengo: (id: string) => void
}

export function CardItem({ card, onToggleTengo }: Props) {
  const [imgError, setImgError] = useState(false)

  return (
    <article className={`card ${card.laTengo ? 'card-owned' : ''}`}>
      <a
        className="card-image-link"
        href={card.cardmarketUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Ver en Cardmarket"
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
      </a>
      <div className="card-body">
        <h2 className="card-name">{card.nombre}</h2>
        <p className="card-set">
          {card.coleccion}
          <span className="card-code">
            {' '}
            · {card.codigo}
            {card.numero ? ` #${card.numero}` : ''}
          </span>
        </p>
        <div className="card-langs">
          {card.idiomasDisponibles.map((flag) => (
            <span
              key={flag}
              className={`flag ${card.idiomasQueTengo.includes(flag) ? 'flag-owned' : ''}`}
              title={card.idiomasQueTengo.includes(flag) ? 'La tengo en este idioma' : 'Idioma disponible'}
            >
              {flag}
            </span>
          ))}
        </div>
        <div className="card-actions">
          <button
            type="button"
            className={`btn-tengo ${card.laTengo ? 'active' : ''}`}
            onClick={() => onToggleTengo(card.id)}
          >
            {card.laTengo ? '✓ Tengo' : 'No tengo'}
          </button>
          {card.laQuiero && <span className="badge-quiero">★ Quiero</span>}
        </div>
        <a className="card-link" href={card.cardmarketUrl} target="_blank" rel="noopener noreferrer">
          Ver en Cardmarket ↗
        </a>
      </div>
    </article>
  )
}
