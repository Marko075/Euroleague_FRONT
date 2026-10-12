import { Component, OnInit } from "@angular/core"
import { formatDate } from "@angular/common"
import { HttpErrorResponse } from "@angular/common/http"
import { Observable, forkJoin } from "rxjs"
import { Club } from "models/joueur.model"
import { MatchStats } from "models/match-stats.model"
import { Saison } from "models/saison.model"
import { ClubService } from "services/club.service"
import { MatchService } from "services/match.service"
import { SaisonService } from "services/saison.service"
import { SimulationService } from "services/simulation.service"
import { logoClub } from "club/club-visuels"
import {
  MatchCalendrier,
  ajouterJours,
  cleJour,
  estTermine,
  lundi,
  matchsDesSaisons,
  matchsParJour,
  sigle,
  vainqueur,
} from "./calendrier-outils"

interface Jour {
  date: Date
  dansLeMois: boolean
  aujourdhui: boolean
  matchs: MatchCalendrier[]
}

// Mini-saison proposée à la simulation : la première qui a encore des matchs à jouer, sinon la dernière
interface MiniSaisonCible {
  numero: number
  joues: number
  total: number
  prochaineJournee: number | null
}

type Action = "journee" | "miniSaison" | "reinitialisation"

@Component({
  selector: "calendrier",
  templateUrl: "./calendrier.component.html",
  styleUrls: ["./calendrier.component.scss"],
})
export class CalendrierComponent implements OnInit {
  readonly joursSemaine = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

  aujourdhui = new Date()
  mois = new Date(this.aujourdhui.getFullYear(), this.aujourdhui.getMonth(), 1)

  chargement = true
  erreur = false
  saison: Saison | null = null
  semaines: Jour[][] = []
  infoMois = ""
  selection: MatchCalendrier | null = null

  cible: MiniSaisonCible | null = null
  enCours: Action | null = null
  message: { texte: string; succes: boolean; lienMatchs: boolean } | null = null
  recemmentSimules = new Set<number>() // cases mises en valeur juste après une simulation

  estTermine = estTermine
  sigle = sigle
  vainqueur = vainqueur

  private matchs: MatchCalendrier[] = []
  private statsParMatch = new Map<number, MatchStats>()

  constructor(
    private saisonService: SaisonService,
    private clubService: ClubService,
    private matchService: MatchService,
    private simulationService: SimulationService,
  ) {}

  ngOnInit(): void {
    this.charger(() => (this.selection = this.prochainMatch()))
  }

  changerMois(sens: number): void {
    this.mois = new Date(this.mois.getFullYear(), this.mois.getMonth() + sens, 1)
    this.recalculer()
  }

  revenirAujourdhui(): void {
    this.allerAuMois(this.aujourdhui)
    this.recalculer()
  }

  selectionner(match: MatchCalendrier): void {
    this.selection = match
  }

  logo(club: Club | undefined): string {
    return club ? logoClub(club) : "assets/logo_club/defaut.svg"
  }

  mvp(match: MatchCalendrier): string | null {
    const stats = this.statsParMatch.get(match.id)
    if (!stats?.mvpId) return null
    const ligne = [...stats.statsDomicile, ...stats.statsExterieur].find((s) => s.joueurId === stats.mvpId)
    return `${stats.mvpPrenom} ${stats.mvpNom}` + (ligne ? ` · ${ligne.points} pts` : "")
  }

  libelleMatch(match: MatchCalendrier): string {
    const score = estTermine(match) ? `, ${match.scoreDomicile} à ${match.scoreExterieur}` : ""
    return `${formatDate(match.date, "EEEE d MMMM HH:mm", "fr")} : ${match.clubDomicileNom} contre ${
      match.clubExterieurNom
    }${score}`
  }

  // ----- Simulation (POST / DELETE sur le back, puis rechargement du calendrier) -----

  jouerJournee(): void {
    const { saison, cible } = this
    if (!saison || cible?.prochaineJournee == null) return
    const journee = cible.prochaineJournee
    this.simuler(
      "journee",
      this.simulationService.simulerJournee(saison.id, cible.numero, journee),
      `Journée ${journee} jouée`,
    )
  }

  lancerMiniSaison(): void {
    const { saison, cible } = this
    if (!saison || !cible) return
    this.simuler(
      "miniSaison",
      this.simulationService.simulerMiniSaison(saison.id, cible.numero),
      `Mini-saison ${cible.numero} terminée`,
    )
  }

  reinitialiser(): void {
    const { saison, cible } = this
    if (!saison || !cible) return
    this.demarrer("reinitialisation")
    this.simulationService.reinitialiser(saison.id, cible.numero).subscribe({
      next: () =>
        this.charger(() => {
          this.selection = this.prochainMatch()
          this.allerAuMois(this.selection?.date)
          this.message = { texte: `Mini-saison ${cible.numero} remise à zéro`, succes: true, lienMatchs: false }
        }),
      error: (e: HttpErrorResponse) => this.echec(e),
    })
  }

  private simuler(action: Action, appel: Observable<MatchStats[]>, texte: string): void {
    this.demarrer(action)
    appel.subscribe({
      next: (simules) =>
        this.charger(() => {
          // on se place sur le premier match simulé et on fait clignoter les cases jouées
          const premier = this.matchs.find((m) => m.id === simules[0]?.id)
          if (premier) {
            this.selection = premier
            this.allerAuMois(premier.date)
          }
          this.recemmentSimules = new Set(simules.map((m) => m.id))
          setTimeout(() => (this.recemmentSimules = new Set()), 2500)
          const pluriel = simules.length > 1 ? "s" : ""
          this.message = {
            texte: `${texte} : ${simules.length} match${pluriel} simulé${pluriel}.`,
            succes: true,
            lienMatchs: true,
          }
        }),
      error: (e: HttpErrorResponse) => this.echec(e),
    })
  }

  private demarrer(action: Action): void {
    this.enCours = action
    this.message = null
  }

  private echec(e: HttpErrorResponse): void {
    this.enCours = null
    this.message = {
      texte: e.status === 409 ? "Ces matchs ont déjà été joués." : "La simulation a échoué : le back est-il lancé ?",
      succes: false,
      lienMatchs: false,
    }
  }

  // ----- Chargement et construction de la grille -----

  private charger(ensuite: () => void): void {
    forkJoin({
      saisons: this.saisonService.getSaisons(),
      clubs: this.clubService.getAll(),
      matchsJoues: this.matchService.getMatchs(),
    }).subscribe({
      next: ({ saisons, clubs, matchsJoues }) => {
        this.saison = saisons.find((s) => s.statut === "EN_COURS") ?? saisons[0] ?? null
        this.matchs = matchsDesSaisons(saisons, clubs)
        this.statsParMatch = new Map(matchsJoues.map((m) => [m.id, m]))
        this.cible = this.miniSaisonCible()
        ensuite()
        this.recalculer()
        this.chargement = false
        this.enCours = null
      },
      error: () => {
        if (this.chargement) {
          this.erreur = true
        } else {
          this.message = { texte: "Impossible de recharger le calendrier.", succes: false, lienMatchs: false }
        }
        this.chargement = false
        this.enCours = null
      },
    })
  }

  private miniSaisonCible(): MiniSaisonCible | null {
    const miniSaisons = [...(this.saison?.miniSaisons ?? [])].sort((a, b) => a.numero - b.numero)
    const cible =
      miniSaisons.find((mini) => mini.matchs.some((m) => !estTermine(m))) ?? miniSaisons[miniSaisons.length - 1]
    if (!cible) return null
    const restants = cible.matchs.filter((m) => !estTermine(m))
    return {
      numero: cible.numero,
      joues: cible.matchs.length - restants.length,
      total: cible.matchs.length,
      prochaineJournee: restants.length ? Math.min(...restants.map((m) => m.journee)) : null,
    }
  }

  private prochainMatch(): MatchCalendrier | null {
    return this.matchs.find((m) => !estTermine(m)) ?? this.matchs[this.matchs.length - 1] ?? null
  }

  private allerAuMois(date: Date | undefined): void {
    if (date) this.mois = new Date(date.getFullYear(), date.getMonth(), 1)
  }

  private recalculer(): void {
    const parJour = matchsParJour(this.matchs)
    const finDuMois = new Date(this.mois.getFullYear(), this.mois.getMonth() + 1, 0)

    const semaines: Jour[][] = []
    for (let debut = lundi(this.mois); debut <= finDuMois; debut = ajouterJours(debut, 7)) {
      semaines.push(Array.from({ length: 7 }, (_, i) => this.jour(ajouterJours(debut, i), parJour)))
    }
    this.semaines = semaines

    const duMois = this.matchs.filter(
      (m) => m.date.getMonth() === this.mois.getMonth() && m.date.getFullYear() === this.mois.getFullYear(),
    )
    const miniSaisons = [...new Set(duMois.map((m) => m.miniSaison))]
    this.infoMois =
      duMois.length === 0
        ? "Pas de match ce mois-ci"
        : `${duMois.length} match${duMois.length > 1 ? "s" : ""} · Mini-saison${
            miniSaisons.length > 1 ? "s" : ""
          } ${miniSaisons.join(" et ")}`
  }

  private jour(date: Date, parJour: Map<string, MatchCalendrier[]>): Jour {
    return {
      date,
      dansLeMois: date.getMonth() === this.mois.getMonth(),
      aujourdhui: cleJour(date) === cleJour(this.aujourdhui),
      matchs: parJour.get(cleJour(date)) ?? [],
    }
  }
}
