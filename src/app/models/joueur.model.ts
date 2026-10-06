export interface Club {
  id: number
  nom: string
  ville: string
  pays: string
  stade: string
  coach: string
  imageCoach: string | null
  logoClub: string | null
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