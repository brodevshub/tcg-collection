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
}

export interface FiltersState {
  search: string
  pokemon: 'all' | 'Charmander' | 'Charmeleon'
  estado: 'all' | 'tengo' | 'quiero'
  idioma: string
}
