import type { FiltersState } from '../types'

interface Props {
  filters: FiltersState
  onChange: (filters: FiltersState) => void
  idiomas: string[]
  resultCount: number
}

export function Filters({ filters, onChange, idiomas, resultCount }: Props) {
  return (
    <section className="filters">
      <input
        type="search"
        className="filter-search"
        placeholder="Buscar por nombre, colección o código…"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
      />
      <select
        value={filters.pokemon}
        onChange={(e) => onChange({ ...filters, pokemon: e.target.value as FiltersState['pokemon'] })}
      >
        <option value="all">Todos los Pokémon</option>
        <option value="Charmander">Charmander</option>
        <option value="Charmeleon">Charmeleon</option>
      </select>
      <select
        value={filters.estado}
        onChange={(e) => onChange({ ...filters, estado: e.target.value as FiltersState['estado'] })}
      >
        <option value="all">Todas</option>
        <option value="tengo">Las que tengo</option>
        <option value="faltan">Las que me faltan</option>
      </select>
      <select value={filters.idioma} onChange={(e) => onChange({ ...filters, idioma: e.target.value })}>
        <option value="all">Todos los idiomas</option>
        {idiomas.map((flag) => (
          <option key={flag} value={flag}>
            {flag}
          </option>
        ))}
      </select>
      <select
        value={filters.sort}
        onChange={(e) => onChange({ ...filters, sort: e.target.value as FiltersState['sort'] })}
      >
        <option value="orden-desc">Más nuevas primero</option>
        <option value="orden-asc">Más antiguas primero</option>
        <option value="precio-asc">Precio: menor a mayor</option>
        <option value="precio-desc">Precio: mayor a menor</option>
      </select>
      <span className="result-count">
        {resultCount} {resultCount === 1 ? 'carta' : 'cartas'}
      </span>
    </section>
  )
}
