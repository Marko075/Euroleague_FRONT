import { Club } from "models/joueur.model"
import { Match, Saison } from "models/saison.model"

// Match prêt à afficher : date convertie, mini-saison et clubs complets (logos, couleurs)
export interface MatchCalendrier extends Match {
  miniSaison: number
  date: Date
  domicile: Club | undefined
  exterieur: Club | undefined
}

// Tous les matchs des saisons, du plus ancien au plus récent
export function matchsDesSaisons(saisons: Saison[], clubs: Club[]): MatchCalendrier[] {
  const clubsParId = new Map(clubs.map((club) => [club.id, club]))
  return saisons
    .flatMap((saison) =>
      saison.miniSaisons.flatMap((mini) =>
        mini.matchs.map((match) => ({
          ...match,
          miniSaison: mini.numero,
          date: new Date(match.dateMatch),
          domicile: clubsParId.get(match.clubDomicileId),
          exterieur: clubsParId.get(match.clubExterieurId),
        })),
      ),
    )
    .sort((a, b) => a.date.getTime() - b.date.getTime())
}

export function estTermine(match: Match): boolean {
  return match.statut === "TERMINE" && match.scoreDomicile != null && match.scoreExterieur != null
}

export function vainqueur(match: Match): "domicile" | "exterieur" | null {
  if (match.scoreDomicile == null || match.scoreExterieur == null || match.scoreDomicile === match.scoreExterieur) {
    return null
  }
  return match.scoreDomicile > match.scoreExterieur ? "domicile" : "exterieur"
}

// Sigle affiché dans les vignettes : code EuroLeague, sinon les 3 premières lettres du nom
export function sigle(club: Club | undefined, nom: string): string {
  return club?.code ?? nom.slice(0, 3).toUpperCase()
}

// Clé d'un jour (sans l'heure), pour regrouper les matchs par date
export function cleJour(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

export function ajouterJours(date: Date, jours: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + jours)
}

// Lundi de la semaine d'une date : les semaines commencent le lundi, à la française
export function lundi(date: Date): Date {
  return ajouterJours(date, -((date.getDay() + 6) % 7))
}

export function matchsParJour(matchs: MatchCalendrier[]): Map<string, MatchCalendrier[]> {
  const parJour = new Map<string, MatchCalendrier[]>()
  for (const match of matchs) {
    const cle = cleJour(match.date)
    parJour.set(cle, [...(parJour.get(cle) ?? []), match])
  }
  return parJour
}
