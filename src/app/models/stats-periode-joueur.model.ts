
export interface StatsPeriodeJoueur {
  joueurId: number;
  nom: string;
  prenom: string;
  clubNom: string | null;
  poste: string;
  matchsJoues: number;
  points: number;
  rebonds: number;
  passesDecisives: number;
  nbMvp: number;
}
