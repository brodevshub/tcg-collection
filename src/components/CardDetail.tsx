import { useEffect, useState } from 'react'
import type { Card } from '../types'

// IDs de idioma del filtro de Cardmarket (?language=1,4 = inglés + español)
const CARDMARKET_LANG_IDS: Record<string, string> = {
  '🇬🇧': '1',
  '🇫🇷': '2',
  '🇪🇸': '4',
  '🇨🇳': '6',
  '🇯🇵': '7',
  '🇰🇷': '10',
  '🇹🇼': '11',
  '🇮🇩': '16',
  '🇹🇭': '17',
}

function cardmarketLink(card: Card): string {
  // Si está disponible en japonés, se busca solo en japonés
  const ids = card.idiomasDisponibles.includes('🇯🇵')
    ? [CARDMARKET_LANG_IDS['🇯🇵']]
    : card.idiomasDisponibles.map((flag) => CARDMARKET_LANG_IDS[flag]).filter(Boolean)
  // Mismo filtro con el que se scrapea precioMin: estado mínimo Excellent
  const params = ['minCondition=3']
  if (ids.length) params.push(`language=${ids.join(',')}`)
  return `${card.cardmarketUrl}?${params.join('&')}`
}

interface Props {
  card: Card
  onClose: () => void
  onToggleIdioma: (id: string, idioma: string) => void
}

export function CardDetail({ card, onClose, onToggleIdioma }: Props) {
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
            <dt>Precio mínimo (EX o NM)</dt>
            <dd className="aside-precio">
              {card.precioMin != null
                ? `${card.precioMin.toFixed(2).replace('.', ',')} €`
                : 'Sin ofertas con estos filtros'}
            </dd>
          </div>
          <div>
            <dt>Idiomas (marca los que tienes)</dt>
            <dd className="aside-langs">
              {card.idiomasDisponibles.length === 0 && '—'}
              {card.idiomasDisponibles.map((flag) => {
                const owned = card.idiomasQueTengo.includes(flag)
                return (
                  <button
                    key={flag}
                    type="button"
                    className={`flag-btn ${owned ? 'flag-btn-owned' : ''}`}
                    title={owned ? 'La tengo en este idioma (quitar)' : 'No la tengo en este idioma (marcar)'}
                    onClick={() => onToggleIdioma(card.id, flag)}
                  >
                    {flag}
                  </button>
                )
              })}
            </dd>
          </div>
        </dl>
        <div className="aside-actions">
          <span className={`estado ${card.laTengo ? 'estado-tengo' : ''}`}>
            {card.laTengo ? '✓ La tengo' : 'No la tengo'}
          </span>
          <a className="aside-link" href={cardmarketLink(card)} target="_blank" rel="noopener noreferrer">
            Ver en Cardmarket ↗
          </a>
        </div>
      </aside>
    </>
  )
}
