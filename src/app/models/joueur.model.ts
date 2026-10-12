export interface Club {
  id: number
  nom: string
  ville: string
  pays: string
  stade: string
  coach: string
  imageCoach: string | null
  logoClub: string | null
  code: string | null
  surnom: string | null
  anneeCreation: number | null
  couleurPrimaire: string
  couleurSecondaire: string
  capaciteStade: number | null
  titresEuroleague: number
  titresNationaux: number
  description: string | null
  latitude: number | null
  longitude: number | null
}

export interface Joueur {
  id: number
  nom: string
  prenom: string
  anniversaire: string | null
  nationalite: string
  taille: number | null
  poste: string
  photoJoueur: string | null
  club: Club
}
