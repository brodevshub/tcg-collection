import type { Card } from '../types'

export function StatsBar({ cards }: { cards: Card[] }) {
  const total = cards.length
  const tengo = cards.filter((c) => c.laTengo).length
  const quiero = cards.filter((c) => c.laQuiero).length
  const pct = total === 0 ? 0 : Math.round((tengo / total) * 100)

  return (
    <section className="stats">
      <div className="stat">
        <span className="stat-value">{total}</span>
        <span className="stat-label">Cartas</span>
      </div>
      <div className="stat stat-tengo">
        <span className="stat-value">{tengo}</span>
        <span className="stat-label">Las tengo</span>
      </div>
      <div className="stat stat-quiero">
        <span className="stat-value">{quiero}</span>
        <span className="stat-label">Las quiero</span>
      </div>
      <div className="stat">
        <span className="stat-value">{pct}%</span>
        <span className="stat-label">Completado</span>
      </div>
    </section>
  )
}
