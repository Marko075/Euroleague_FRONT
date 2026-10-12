import { Component } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser"
import { Observable, catchError, combineLatest, map, of, shareReplay, switchMap, tap } from "rxjs"
import { ClubService } from "services/club.service"
import { MeteoService } from "services/meteo.service"
import { Club, Joueur } from "models/joueur.model"
import { BilanClub, Meteo } from "models/club.model"
import { Match } from "models/saison.model"
import {
  POSTES,
  drapeau,
  logoClub,
  photoCoach,
  photoJoueur,
  photoStade,
  themeClub,
} from "../club/club-visuels"

interface MatchDuClub {
  match: Match
  adversaire: Club | undefined
  adversaireNom: string
  aDomicile: boolean
  scorePour: number | null
  scoreContre: number | null
  victoire: boolean
}

interface FicheClub {
  club: Club
  joueurs: Joueur[]
  bilan: BilanClub
  derniers: MatchDuClub[]
  prochains: MatchDuClub[]
  carte: SafeResourceUrl | null
}

@Component({
  selector: "club-detail",
  templateUrl: "./club-detail.component.html",
  styleUrls: ["./club-detail.component.scss"],
})
export class ClubDetailComponent {
  postes = POSTES
  posteFiltre: string | null = null
  photosManquantes = new Set<number>()

  logoClub = logoClub
  photoCoach = photoCoach
  photoJoueur = photoJoueur
  photoStade = photoStade
  drapeau = drapeau
  themeClub = themeClub

  fiche$: Observable<FicheClub> = this.route.paramMap.pipe(
    map((params) => Number(params.get("id"))),
    tap(() => {
      this.posteFiltre = null
      window.scrollTo({ top: 0 })
    }),
    switchMap((id) =>
      combineLatest([
        this.clubService.getById(id),
        this.clubService.getJoueurs(id),
        this.clubService.getMatchs(id),
        this.clubService.getBilan(id),
        this.clubService.getAll(),
      ]),
    ),
    map(([club, joueurs, matchs, bilan, clubs]) => {
      const parId = new Map(clubs.map((c) => [c.id, c]))
      const versMatchDuClub = (match: Match) => this.versMatchDuClub(club, match, parId)
      return {
        club,
        joueurs,
        bilan,
        derniers: matchs
          .filter((m) => m.statut === "TERMINE")
          .reverse()
          .slice(0, 5)
          .map(versMatchDuClub),
        prochains: matchs
          .filter((m) => m.statut === "A_VENIR")
          .slice(0, 3)
          .map(versMatchDuClub),
        carte: this.urlCarte(club),
      }
    }),
    shareReplay(1),
  )

  // Météo chargée à part : si l'API externe ne répond pas, le reste de la page s'affiche quand même
  meteo$: Observable<Meteo | null> = this.fiche$.pipe(
    switchMap(({ club }) =>
      club.latitude != null && club.longitude != null
        ? this.meteoService.getMeteoActuelle(club.latitude, club.longitude).pipe(catchError(() => of(null)))
        : of(null),
    ),
  )

  constructor(
    private route: ActivatedRoute,
    private clubService: ClubService,
    private meteoService: MeteoService,
    private sanitizer: DomSanitizer,
  ) {}

  joueursFiltres(joueurs: Joueur[]): Joueur[] {
    return this.posteFiltre ? joueurs.filter((j) => j.poste === this.posteFiltre) : joueurs
  }

  postesPresents(joueurs: Joueur[]): string[] {
    return Object.keys(POSTES).filter((p) => joueurs.some((j) => j.poste === p))
  }

  photoIntrouvable(joueur: Joueur): void {
    this.photosManquantes.add(joueur.id)
  }

  initiales(joueur: Joueur): string {
    return joueur.prenom.charAt(0) + joueur.nom.charAt(0)
  }

  age(joueur: Joueur): number | null {
    if (!joueur.anniversaire) return null
    const naissance = new Date(joueur.anniversaire)
    const maintenant = new Date()
    let age = maintenant.getFullYear() - naissance.getFullYear()
    const anniversairePasse =
      maintenant.getMonth() > naissance.getMonth() ||
      (maintenant.getMonth() === naissance.getMonth() && maintenant.getDate() >= naissance.getDate())
    if (!anniversairePasse) age--
    return age
  }

  trophees(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i)
  }

  moyenne(total: number, matchs: number): string {
    return matchs > 0 ? (total / matchs).toFixed(1) : "–"
  }

  // Codes météo WMO renvoyés par Open-Meteo
  libelleMeteo(code: number): { texte: string; icone: string } {
    if (code === 0) return { texte: "Ciel dégagé", icone: "wb_sunny" }
    if (code <= 3) return { texte: "Partiellement nuageux", icone: "wb_cloudy" }
    if (code <= 48) return { texte: "Brouillard", icone: "foggy" }
    if (code <= 67 || (code >= 80 && code <= 82)) return { texte: "Pluie", icone: "umbrella" }
    if (code <= 77 || code === 85 || code === 86) return { texte: "Neige", icone: "ac_unit" }
    return { texte: "Orage", icone: "thunderstorm" }
  }

  private versMatchDuClub(club: Club, match: Match, clubs: Map<number, Club>): MatchDuClub {
    const aDomicile = match.clubDomicileId === club.id
    const scorePour = aDomicile ? match.scoreDomicile : match.scoreExterieur
    const scoreContre = aDomicile ? match.scoreExterieur : match.scoreDomicile
    return {
      match,
      adversaire: clubs.get(aDomicile ? match.clubExterieurId : match.clubDomicileId),
      adversaireNom: aDomicile ? match.clubExterieurNom : match.clubDomicileNom,
      aDomicile,
      scorePour,
      scoreContre,
      victoire: scorePour != null && scoreContre != null && scorePour > scoreContre,
    }
  }

  // Carte OpenStreetMap intégrée, centrée sur la salle
  private urlCarte(club: Club): SafeResourceUrl | null {
    if (club.latitude == null || club.longitude == null) return null
    const d = 0.012
    const bbox = [club.longitude - d, club.latitude - d / 2, club.longitude + d, club.latitude + d / 2].join(",")
    const url =
      "https://www.openstreetmap.org/export/embed.html?bbox=" +
      encodeURIComponent(bbox) +
      "&layer=mapnik&marker=" +
      club.latitude +
      "," +
      club.longitude
    return this.sanitizer.bypassSecurityTrustResourceUrl(url)
  }
}
