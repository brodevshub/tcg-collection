import { useEffect, useState } from 'react'
import type { Card } from '../types'

interface Props {
  card: Card
  onClose: () => void
  onToggleTengo: (id: string) => void
}

export function CardDetail({ card, onClose, onToggleTengo }: Props) {
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    setImgError(false)
  }, [card.id])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <aside className="aside">
        <button type="button" className="aside-close" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>
        <div className="aside-image">
          {imgError ? (
            <div className="card-placeholder">🔥</div>
          ) : (
            <img src={`/cards/${card.id}.jpg`} alt={card.nombre} onError={() => setImgError(true)} />
          )}
        </div>
        <h2 className="aside-name">{card.nombre}</h2>
        <p className="aside-set">
          {card.coleccion}
          <span className="aside-code">
            {' '}
            · {card.codigo}
            {card.numero ? ` #${card.numero}` : ''}
          </span>
        </p>
        <dl className="aside-facts">
          <div>
            <dt>Pokémon</dt>
            <dd>{card.pokemon}</dd>
          </div>
          <div>
            <dt>Idiomas disponibles</dt>
            <dd className="aside-langs">
              {card.idiomasDisponibles.length === 0 && '—'}
              {card.idiomasDisponibles.map((flag) => (
                <span
                  key={flag}
                  className={`flag ${card.idiomasQueTengo.includes(flag) ? 'flag-owned' : ''}`}
                  title={card.idiomasQueTengo.includes(flag) ? 'La tengo en este idioma' : 'Disponible'}
                >
                  {flag}
                </span>
              ))}
            </dd>
          </div>
          {card.idiomasQueTengo.length > 0 && (
            <div>
              <dt>La tengo en</dt>
              <dd className="aside-langs">
                {card.idiomasQueTengo.map((flag) => (
                  <span key={flag} className="flag flag-owned">
                    {flag}
                  </span>
                ))}
              </dd>
            </div>
          )}
        </dl>
        {card.laQuiero && <p className="aside-quiero">★ La quiero</p>}
        <div className="aside-actions">
          <button
            type="button"
            className={`btn-tengo ${card.laTengo ? 'active' : ''}`}
            onClick={() => onToggleTengo(card.id)}
          >
            {card.laTengo ? '✓ La tengo' : 'No la tengo'}
          </button>
          <a className="aside-link" href={card.cardmarketUrl} target="_blank" rel="noopener noreferrer">
            Ver en Cardmarket ↗
          </a>
        </div>
      </aside>
    </>
  )
}
