import { formatDate, formatNumber } from "@angular/common"
import { ClassementLigne, ClassementMiniSaison } from "models/classement.model"
import { Club, Joueur } from "models/joueur.model"
import { MatchStats, StatsJoueur } from "models/match-stats.model"
import { Saison } from "models/saison.model"
import { photoJoueur, photoStade } from "club/club-visuels"
import {
  MatchCalendrier,
  ajouterJours,
  cleJour,
  estTermine,
  lundi,
  matchsDesSaisons,
  matchsParJour,
  vainqueur,
} from "calendrier/calendrier-outils"

// Tout ce qu'affiche la page d'accueil est calculé ici, à partir des réponses de notre API

export type Categorie = "points" | "rebonds" | "passes" | "interceptions"

export const CATEGORIES: { cle: Categorie; court: string; libelle: string }[] = [
  { cle: "points", court: "PTS", libelle: "points" },
  { cle: "rebonds", court: "REB", libelle: "rebonds" },
  { cle: "passes", court: "PD", libelle: "passes déc." },
  { cle: "interceptions", court: "INT", libelle: "interceptions" },
]

export interface DonneesAccueil {
  saisons: Saison[]
  clubs: Club[]
  joueurs: Joueur[]
  classements: ClassementMiniSaison[]
  matchsJoues: MatchStats[]
}

export interface StatJoueur {
  joueurId: number
  nom: string
  prenom: string
  club: Club | undefined
  matchs: number
  moyennes: Record<Categorie, number>
}

export interface Mvp {
  joueurId: number
  nom: string
  prenom: string
  club: Club | undefined
  nombre: number
}

export interface RecordSaison {
  icone: string
  valeur: string
  libelle: string
  detail: string
}

export interface JourSemaine {
  date: Date
  aujourdhui: boolean
  match: MatchCalendrier | undefined
}

export interface DernierMatch {
  match: MatchCalendrier
  mvp: StatsJoueur | undefined
}

export interface Actualite {
  tag: string
  titre: string
  extrait: string
  date: Date
  lien: string
  image: string | null
  portrait: boolean // photo détourée d'un joueur plutôt qu'une photo de salle
  club: Club | undefined
}

export interface Accueil {
  saison: string | null
  clubs: Club[]
  clubsParId: Map<number, Club>
  bandeau: MatchCalendrier[]
  prochain: MatchCalendrier | undefined
  aVenir: MatchCalendrier[]
  semaine: JourSemaine[]
  dernier: DernierMatch | undefined
  classements: ClassementMiniSaison[]
  leaders: Record<Categorie, StatJoueur[]>
  stars: { domicile: StatJoueur | undefined; exterieur: StatJoueur | undefined }
  roiMvp: Mvp | undefined
  leader: { club: Club | undefined; ligne: ClassementLigne; miniSaison: number } | undefined
  une: Actualite | undefined
  actualites: Actualite[]
  records: RecordSaison[]
  chiffres: { clubs: number; joueurs: number; joues: number; total: number; places: number }
}

export function construireAccueil(d: DonneesAccueil, maintenant: Date): Accueil {
  const clubsParId = new Map(d.clubs.map((club) => [club.id, club]))
  const clubDuJoueur = new Map(d.joueurs.map((j) => [j.id, clubsParId.get(j.club.id) ?? j.club]))
  const matchs = matchsDesSaisons(d.saisons, d.clubs)
  const joues = matchs.filter(estTermine)
  const aVenir = matchs.filter((m) => !estTermine(m))
  const prochain = aVenir[0]

  const reguliers = joueursReguliers(statsParJoueur(d.matchsJoues, clubDuJoueur))
  const leaders = {
    points: meilleurs(reguliers, "points"),
    rebonds: meilleurs(reguliers, "rebonds"),
    passes: meilleurs(reguliers, "passes"),
    interceptions: meilleurs(reguliers, "interceptions"),
  }
  const star = (clubId: number | undefined) =>
    meilleurs(
      reguliers.filter((s) => s.club?.id === clubId),
      "points",
    )[0]

  const statsParMatch = new Map(d.matchsJoues.map((m) => [m.id, m]))
  const dernierJoue = joues[joues.length - 1]
  const dernier = dernierJoue ? { match: dernierJoue, mvp: mvpDuMatch(statsParMatch.get(dernierJoue.id)) } : undefined
  const roiMvp = meilleurMvp(d.matchsJoues, clubDuJoueur)

  const parJour = matchsParJour(matchs)
  const debutSemaine = lundi(maintenant)
  const semaine = Array.from({ length: 7 }, (_, i) => {
    const date = ajouterJours(debutSemaine, i)
    return { date, aujourdhui: cleJour(date) === cleJour(maintenant), match: parJour.get(cleJour(date))?.[0] }
  })

  // classement le plus récent (mini-saisons triées par numéro) et son premier
  const dernierClassement = d.classements[d.classements.length - 1]
  const premiere = dernierClassement?.lignes[0]

  const actualites = construireActualites({
    classement: dernierClassement,
    clubsParId,
    prochain,
    dernier,
    roiMvp,
    leaders,
    maintenant,
  })

  return {
    // l'API renvoie les saisons de la plus récente à la plus ancienne
    saison: (d.saisons.find((s) => s.statut === "EN_COURS") ?? d.saisons[0])?.nom ?? null,
    clubs: d.clubs,
    clubsParId,
    bandeau: [...joues.slice(-4), ...aVenir.slice(0, 4)],
    prochain,
    aVenir: aVenir.slice(0, 4),
    semaine,
    dernier,
    classements: d.classements,
    leaders,
    stars: { domicile: star(prochain?.clubDomicileId), exterieur: star(prochain?.clubExterieurId) },
    roiMvp,
    leader: premiere
      ? { club: clubsParId.get(premiere.clubId), ligne: premiere, miniSaison: dernierClassement.miniSaison }
      : undefined,
    une: actualites[0],
    actualites: actualites.slice(1),
    records: records(d.matchsJoues),
    chiffres: {
      clubs: d.clubs.length,
      joueurs: d.joueurs.length,
      joues: joues.length,
      total: matchs.length,
      places: d.clubs.reduce((total, club) => total + (club.capaciteStade ?? 0), 0),
    },
  }
}

// ---------- Statistiques des joueurs ----------

function statsParJoueur(matchs: MatchStats[], clubDuJoueur: Map<number, Club>): StatJoueur[] {
  const cumuls = new Map<number, { ligne: StatsJoueur; matchs: number; totaux: Record<Categorie, number> }>()
  for (const match of matchs) {
    for (const ligne of [...match.statsDomicile, ...match.statsExterieur]) {
      const cumul = cumuls.get(ligne.joueurId) ?? {
        ligne,
        matchs: 0,
        totaux: { points: 0, rebonds: 0, passes: 0, interceptions: 0 },
      }
      cumul.matchs++
      cumul.totaux.points += ligne.points
      cumul.totaux.rebonds += ligne.rebonds
      cumul.totaux.passes += ligne.passesDecisives
      cumul.totaux.interceptions += ligne.interceptions
      cumuls.set(ligne.joueurId, cumul)
    }
  }
  return [...cumuls.values()].map(({ ligne, matchs, totaux }) => ({
    joueurId: ligne.joueurId,
    nom: ligne.nom,
    prenom: ligne.prenom,
    club: clubDuJoueur.get(ligne.joueurId),
    matchs,
    moyennes: {
      points: totaux.points / matchs,
      rebonds: totaux.rebonds / matchs,
      passes: totaux.passes / matchs,
      interceptions: totaux.interceptions / matchs,
    },
  }))
}

// Pour les classements par moyenne, il faut avoir joué au moins la moitié des matchs
function joueursReguliers(stats: StatJoueur[]): StatJoueur[] {
  const minimum = Math.ceil(Math.max(0, ...stats.map((s) => s.matchs)) / 2)
  return stats.filter((s) => s.matchs >= minimum)
}

function meilleurs(stats: StatJoueur[], categorie: Categorie): StatJoueur[] {
  return [...stats].sort((a, b) => b.moyennes[categorie] - a.moyennes[categorie]).slice(0, 5)
}

function mvpDuMatch(match: MatchStats | undefined): StatsJoueur | undefined {
  return match ? [...match.statsDomicile, ...match.statsExterieur].find((s) => s.joueurId === match.mvpId) : undefined
}

function meilleurMvp(matchs: MatchStats[], clubDuJoueur: Map<number, Club>): Mvp | undefined {
  const parJoueur = new Map<number, Mvp>()
  for (const match of matchs) {
    if (match.mvpId == null) continue
    const mvp = parJoueur.get(match.mvpId) ?? {
      joueurId: match.mvpId,
      nom: match.mvpNom ?? "",
      prenom: match.mvpPrenom ?? "",
      club: clubDuJoueur.get(match.mvpId),
      nombre: 0,
    }
    mvp.nombre++
    parJoueur.set(match.mvpId, mvp)
  }
  return [...parJoueur.values()].sort((a, b) => b.nombre - a.nombre)[0]
}

// ---------- Records de la saison ----------

function records(matchs: MatchStats[]): RecordSaison[] {
  if (matchs.length === 0) return []
  // en cas d'égalité on garde le premier rencontré, c'est-à-dire le plus récent
  const meilleur = <T>(liste: T[], valeur: (x: T) => number) => liste.reduce((a, b) => (valeur(b) > valeur(a) ? b : a))
  const ecart = (m: MatchStats) => Math.abs(m.scoreDomicile - m.scoreExterieur)
  const affiche = (m: MatchStats) => {
    const domicileGagne = m.scoreDomicile > m.scoreExterieur
    return domicileGagne
      ? `${m.clubDomicileNom} ${m.scoreDomicile}-${m.scoreExterieur} ${m.clubExterieurNom}`
      : `${m.clubExterieurNom} ${m.scoreExterieur}-${m.scoreDomicile} ${m.clubDomicileNom}`
  }

  const offensif = meilleur(matchs, (m) => Math.max(m.scoreDomicile, m.scoreExterieur))
  const large = meilleur(matchs, ecart)
  const serre = meilleur(matchs, (m) => -ecart(m))
  const performance = meilleur(
    matchs.flatMap((m) => [
      ...m.statsDomicile.map((ligne) => ({ ligne, adversaire: m.clubExterieurNom })),
      ...m.statsExterieur.map((ligne) => ({ ligne, adversaire: m.clubDomicileNom })),
    ]),
    (p) => p.ligne.points,
  )

  return [
    {
      icone: "local_fire_department",
      valeur: `${Math.max(offensif.scoreDomicile, offensif.scoreExterieur)} pts`,
      libelle: "Attaque la plus prolifique",
      detail: `${affiche(offensif)} · MS${offensif.miniSaison} J${offensif.journee}`,
    },
    {
      icone: "trending_up",
      valeur: `+${ecart(large)}`,
      libelle: "Plus large victoire",
      detail: `${affiche(large)} · MS${large.miniSaison} J${large.journee}`,
    },
    {
      icone: "timer",
      valeur: `${ecart(serre)} pt${ecart(serre) > 1 ? "s" : ""}`,
      libelle: "Match le plus serré",
      detail: `${affiche(serre)} · MS${serre.miniSaison} J${serre.journee}`,
    },
    {
      icone: "bolt",
      valeur: `${performance.ligne.points} pts`,
      libelle: "Record individuel",
      detail: `${performance.ligne.prenom} ${performance.ligne.nom} contre ${performance.adversaire}`,
    },
  ]
}

// ---------- Actualités, rédigées à partir des données ----------

function construireActualites(c: {
  classement: ClassementMiniSaison | undefined
  clubsParId: Map<number, Club>
  prochain: MatchCalendrier | undefined
  dernier: DernierMatch | undefined
  roiMvp: Mvp | undefined
  leaders: Record<Categorie, StatJoueur[]>
  maintenant: Date
}): Actualite[] {
  const actualites: Actualite[] = []
  const lendemain = c.dernier ? ajouterJours(c.dernier.match.date, 1) : c.maintenant
  const stade = (club: Club | undefined) => (club ? photoStade(club) : null)

  const [premier, second] = c.classement?.lignes ?? []
  if (c.classement && premier) {
    const club = c.clubsParId.get(premier.clubId)
    const suite =
      c.prochain && c.prochain.miniSaison > c.classement.miniSaison
        ? ` Place à la mini-saison ${c.prochain.miniSaison}, qui démarre le ${formatDate(
            c.prochain.date,
            "d MMMM",
            "fr",
          )}.`
        : ""
    actualites.push({
      tag: "Classement",
      titre: `${premier.clubNom} remporte la mini-saison ${c.classement.miniSaison}`,
      extrait:
        `${premier.victoires} victoires, ${premier.defaites} défaite${premier.defaites > 1 ? "s" : ""} ` +
        `et ${premier.diff > 0 ? "+" : ""}${premier.diff} au différentiel : ${premier.clubNom} termine en tête` +
        (second ? ` devant ${second.clubNom}.` : ".") +
        suite,
      date: lendemain,
      lien: "/classements",
      image: stade(club),
      portrait: false,
      club,
    })
  }

  if (c.prochain) {
    const p = c.prochain
    actualites.push({
      tag: "À venir",
      titre: `${p.clubDomicileNom} reçoit ${p.clubExterieurNom}`,
      extrait:
        capitaliser(formatDate(p.date, "EEEE d MMMM 'à' HH:mm", "fr")) +
        (p.domicile ? `, ${p.domicile.stade} (${p.domicile.ville})` : "") +
        `. Mini-saison ${p.miniSaison}, journée ${p.journee}.`,
      date: c.maintenant,
      lien: "/calendrier",
      image: stade(p.domicile),
      portrait: false,
      club: p.domicile,
    })
  }

  if (c.dernier) {
    const m = c.dernier.match
    const domicileGagne = vainqueur(m) === "domicile"
    const gagnant = domicileGagne ? m.clubDomicileNom : m.clubExterieurNom
    const perdant = domicileGagne ? m.clubExterieurNom : m.clubDomicileNom
    const score = domicileGagne ? `${m.scoreDomicile}-${m.scoreExterieur}` : `${m.scoreExterieur}-${m.scoreDomicile}`
    const mvp = c.dernier.mvp
    actualites.push({
      tag: "Résultat",
      titre: domicileGagne
        ? `${gagnant} bat ${perdant} ${score}`
        : `${gagnant} s'impose à ${m.domicile?.ville ?? "l'extérieur"} (${score})`,
      extrait: mvp
        ? `MVP du match : ${mvp.prenom} ${mvp.nom}, ${mvp.points} points, ${mvp.rebonds} rebonds et ${mvp.passesDecisives} passes décisives.`
        : `${perdant} s'incline lors de la journée ${m.journee}.`,
      date: m.date,
      lien: "/matchs",
      image: stade(m.domicile),
      portrait: false,
      club: m.domicile,
    })
  }

  if (c.roiMvp) {
    const mvp = c.roiMvp
    actualites.push({
      tag: "MVP",
      titre: `${mvp.prenom} ${mvp.nom}, ${mvp.nombre} fois MVP`,
      extrait:
        "Personne n'a été élu MVP aussi souvent cette saison." +
        (mvp.club ? ` Le joueur de ${mvp.club.nom} survole la compétition.` : ""),
      date: lendemain,
      lien: "/joueurs",
      image: photoJoueur(mvp),
      portrait: true,
      club: mvp.club,
    })
  }

  // Un leader statistique, en évitant de remettre en avant le roi des MVP juste au-dessus
  const vedette = CATEGORIES.map((categorie) => ({
    categorie: categorie.cle,
    joueur: c.leaders[categorie.cle][0],
  })).find(({ joueur }) => joueur && joueur.joueurId !== c.roiMvp?.joueurId)
  if (vedette) {
    const s = vedette.joueur
    const moyenne = formatNumber(s.moyennes[vedette.categorie], "fr", "1.1-1")
    actualites.push({
      tag: "Stats",
      titre: `${s.prenom} ${s.nom}, ${TITRES_LEADER[vedette.categorie]}`,
      extrait: `${moyenne} ${UNITES_LEADER[vedette.categorie]} par match en ${s.matchs} matchs${
        s.club ? ` avec ${s.club.nom}` : ""
      }.`,
      date: lendemain,
      lien: "/joueurs",
      image: photoJoueur(s),
      portrait: true,
      club: s.club,
    })
  }

  return actualites
}

const TITRES_LEADER: Record<Categorie, string> = {
  points: "meilleur marqueur de la saison",
  rebonds: "patron des rebonds",
  passes: "meilleur passeur de la saison",
  interceptions: "roi des interceptions",
}

const UNITES_LEADER: Record<Categorie, string> = {
  points: "points",
  rebonds: "rebonds",
  passes: "passes décisives",
  interceptions: "interceptions",
}

function capitaliser(texte: string): string {
  return texte.charAt(0).toUpperCase() + texte.slice(1)
}

// ---------- Compte à rebours ----------

export interface Decompte {
  jours: string
  heures: string
  minutes: string
  secondes: string
  termine: boolean
}

export function decompte(cible: Date, maintenant = new Date()): Decompte {
  const reste = Math.max(0, cible.getTime() - maintenant.getTime())
  const s = Math.floor(reste / 1000)
  const deuxChiffres = (n: number) => String(n).padStart(2, "0")
  return {
    jours: deuxChiffres(Math.floor(s / 86400)),
    heures: deuxChiffres(Math.floor((s % 86400) / 3600)),
    minutes: deuxChiffres(Math.floor((s % 3600) / 60)),
    secondes: deuxChiffres(s % 60),
    termine: reste === 0,
  }
}
