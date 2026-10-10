export interface Match {
  id: number;
  journee: number;
  dateMatch: string;
  statut: 'A_VENIR' | 'EN_COURS' | 'TERMINE';
  clubDomicileId: number;
  clubDomicileNom: string;
  scoreDomicile: number | null;
  clubExterieurId: number;
  clubExterieurNom: string;
  scoreExterieur: number | null;
}

export interface MiniSaison {
  numero: number;
  matchs: Match[];
}

export interface Saison {
  id: number;
  nom: string;
  dateDebut: string;
  dateFin: string | null;
  statut: 'A_VENIR' | 'EN_COURS' | 'TERMINEE';
  miniSaisons: MiniSaison[];
}