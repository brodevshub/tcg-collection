export interface Card {
  id: string
  nombre: string
  pokemon: 'Charmander' | 'Charmeleon'
  orden: number
  coleccion: string
  codigo: string
  numero: string | null
  laTengo: boolean
  laQuiero: boolean
  idiomasDisponibles: string[]
  idiomasQueTengo: string[]
  cardmarketUrl: string
  // Precio más bajo en Cardmarket (EUR) con estado mínimo Excellent y los
  // idiomas disponibles. null = sin ofertas con esos filtros.
  precioMin?: number | null
}

export type SortMode = 'orden-desc' | 'orden-asc' | 'precio-desc' | 'precio-asc'

export interface FiltersState {
  search: string
  pokemon: 'all' | 'Charmander' | 'Charmeleon'
  estado: 'all' | 'tengo' | 'quiero'
  idioma: string
  sort: SortMode
}
