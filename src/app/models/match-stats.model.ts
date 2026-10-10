export interface StatsJoueur {
  joueurId: number;
  nom: string;
  prenom: string;
  poste: string;
  points: number;
  lancersFrancs: number;
  deuxPoints: number;
  troisPoints: number;
  rebonds: number;
  passesDecisives: number;
  interceptions: number;
}

export interface MatchStats {
  id: number;
  miniSaison: number;
  journee: number;
  dateMatch: string;

  clubDomicileId: number;
  clubDomicileNom: string;
  scoreDomicile: number;

  clubExterieurId: number;
  clubExterieurNom: string;
  scoreExterieur: number;

  mvpId: number | null;
  mvpNom: string | null;
  mvpPrenom: string | null;

  statsDomicile: StatsJoueur[];
  statsExterieur: StatsJoueur[];
}