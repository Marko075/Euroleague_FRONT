import { Component } from "@angular/core"
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser"
import { Observable, catchError, forkJoin, map, of, shareReplay, switchMap, timer } from "rxjs"
import { Club } from "models/joueur.model"
import { ClassementMiniSaison } from "models/classement.model"
import { ClassementService } from "services/classement.service"
import { ClubService } from "services/club.service"
import { JoueurService } from "services/joueur.service"
import { MatchService } from "services/match.service"
import { SaisonService } from "services/saison.service"
import { logoClub, photoJoueur, photoStade, themeClub } from "club/club-visuels"
import { MatchCalendrier, estTermine, sigle, vainqueur } from "calendrier/calendrier-outils"
import { Accueil, CATEGORIES, Categorie, Decompte, construireAccueil, decompte } from "./accueil"
import { VIDEOS, Video } from "./videos"

@Component({
  selector: "home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent {
  readonly categories = CATEGORIES
  readonly videos = VIDEOS
  readonly maintenant = new Date()

  erreur = false
  categorie: Categorie = "points"
  indexClassement: number | null = null // null = dernière mini-saison
  video: Video = VIDEOS[0]
  urlVideo: SafeResourceUrl | null = null

  estTermine = estTermine
  sigle = sigle
  vainqueur = vainqueur
  photo = photoJoueur
  photoStade = photoStade

  accueil$: Observable<Accueil | null> = forkJoin({
    saisons: this.saisonService.getSaisons(),
    clubs: this.clubService.getAll(),
    joueurs: this.joueurService.getAll(),
    classements: this.classementService.getClassements(),
    matchsJoues: this.matchService.getMatchs(),
  }).pipe(
    map((donnees) => construireAccueil(donnees, this.maintenant)),
    catchError(() => {
      this.erreur = true
      return of(null)
    }),
    shareReplay(1),
  )

  // Compte à rebours jusqu'au prochain match, mis à jour chaque seconde
  decompte$: Observable<Decompte | null> = this.accueil$.pipe(
    switchMap((accueil) => {
      const prochain = accueil?.prochain
      return prochain ? timer(0, 1000).pipe(map(() => decompte(prochain.date))) : of(null)
    }),
  )

  constructor(
    private saisonService: SaisonService,
    private clubService: ClubService,
    private joueurService: JoueurService,
    private classementService: ClassementService,
    private matchService: MatchService,
    private sanitizer: DomSanitizer,
  ) {}

  logo(club: Club | undefined): string {
    return club ? logoClub(club) : "assets/logo_club/defaut.svg"
  }

  logoCode(code: string): string {
    return logoClub({ code })
  }

  theme(club: Club | undefined): Record<string, string> {
    return club ? themeClub(club) : {}
  }

  // Fond du hub : la salle du prochain match, à défaut celle du premier club
  photoFond(accueil: Accueil): string | null {
    const club = accueil.prochain?.domicile ?? accueil.clubs[0]
    return club ? photoStade(club) : null
  }

  // Couleurs des deux équipes d'une affiche (fond partagé en diagonale, halos)
  couleursAffiche(match: MatchCalendrier): Record<string, string> {
    const accent = (club: Club | undefined) => (club ? themeClub(club)["--accent"] : "#5b3ff0")
    return {
      "--dom-c1": match.domicile?.couleurPrimaire ?? "#2a2170",
      "--ext-c1": match.exterieur?.couleurPrimaire ?? "#2a2170",
      "--dom": accent(match.domicile),
      "--ext": accent(match.exterieur),
    }
  }

  get libelleCategorie(): string {
    return CATEGORIES.find((c) => c.cle === this.categorie)?.libelle ?? ""
  }

  // ----- Classement : sélecteur de mini-saison -----
  private indexEffectif(accueil: Accueil): number {
    return this.indexClassement ?? accueil.classements.length - 1
  }

  classementAffiche(accueil: Accueil): ClassementMiniSaison | undefined {
    return accueil.classements[this.indexEffectif(accueil)]
  }

  peutChangerClassement(accueil: Accueil, sens: number): boolean {
    const index = this.indexEffectif(accueil) + sens
    return index >= 0 && index < accueil.classements.length
  }

  changerClassement(accueil: Accueil, sens: number): void {
    if (this.peutChangerClassement(accueil, sens)) {
      this.indexClassement = this.indexEffectif(accueil) + sens
    }
  }

  // ----- EuroLeague TV : la vidéo ne se charge qu'au clic -----
  lire(video: Video): void {
    this.video = video
    this.urlVideo = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`,
    )
  }

  miniature(video: Video, taille: "maxresdefault" | "mqdefault"): string {
    return `https://i.ytimg.com/vi/${video.id}/${taille}.jpg`
  }

  defilerVers(event: Event, cible: HTMLElement): void {
    event.preventDefault()
    cible.scrollIntoView({ behavior: "smooth", block: "start" })
  }
}
