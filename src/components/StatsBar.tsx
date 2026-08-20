import type { Card } from '../types'

const euros = (n: number) =>
  n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'

export function StatsBar({ cards }: { cards: Card[] }) {
  const total = cards.length
  const tengo = cards.filter((c) => c.laTengo)
  const faltan = cards.filter((c) => !c.laTengo)
  const pct = total === 0 ? 0 : Math.round((tengo.length / total) * 100)
  const suma = (list: Card[]) => list.reduce((acc, c) => acc + (c.precioMin ?? 0), 0)

  return (
    <section className="stats">
      <div className="stat">
        <span className="stat-value">{total}</span>
        <span className="stat-label">Cartas</span>
        <span className="stat-price">{euros(suma(cards))}</span>
      </div>
      <div className="stat stat-tengo">
        <span className="stat-value">{tengo.length}</span>
        <span className="stat-label">Las tengo</span>
        <span className="stat-price">{euros(suma(tengo))}</span>
      </div>
      <div className="stat stat-faltan">
        <span className="stat-value">{faltan.length}</span>
        <span className="stat-label">Me faltan</span>
        <span className="stat-price">{euros(suma(faltan))}</span>
      </div>
      <div className="stat">
        <span className="stat-value">{cards.filter((c) => c.precioMin == null).length}</span>
        <span className="stat-label">Sin precio</span>
      </div>
      <div className="stat">
        <span className="stat-value">{pct}%</span>
        <span className="stat-label">Completado</span>
      </div>
    </section>
  )
}
