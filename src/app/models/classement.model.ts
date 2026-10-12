export interface ClassementLigne {
  rang: string; // "1", "2"... ou "equal"
  clubId: number;
  clubNom: string;
  victoires: number;
  defaites: number;
  diff: number;
}

export interface ClassementMiniSaison {
  miniSaison: number;
  journee: number;
  lignes: ClassementLigne[];
}