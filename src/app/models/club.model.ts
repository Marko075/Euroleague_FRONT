export interface BilanClub {
  clubId: number
  matchsJoues: number
  victoires: number
  defaites: number
  pointsMarques: number
  pointsEncaisses: number
  rang: number | null
  miniSaison: number | null
  nombreClubs: number
  forme: ("V" | "D")[]
}

export interface Meteo {
  temperature: number
  vent: number
  code: number
}
