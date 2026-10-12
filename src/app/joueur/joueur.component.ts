import { Component } from "@angular/core"
import { map } from "rxjs"
import { Club, Joueur } from "models/joueur.model"
import { JoueurService } from "services/joueur.service"
import { POSTES, drapeau, logoClub, photoJoueur, themeClub } from "club/club-visuels"

@Component({
  selector: "joueur",
  templateUrl: "./joueur.component.html",
  styleUrls: ["./joueur.component.scss"],
})
export class JoueurComponent {
  // Joueurs rangés par club, puis par nom
  joueurs$ = this.joueurService
    .getAll()
    .pipe(
      map((joueurs) => [...joueurs].sort((a, b) => a.club.nom.localeCompare(b.club.nom) || a.nom.localeCompare(b.nom))),
    )

  readonly postes = Object.entries(POSTES).map(([code, libelle]) => ({ code, libelle }))
  clubFiltre: number | null = null
  posteFiltre: string | null = null
  recherche = ""
  photosManquantes = new Set<number>()

  drapeau = drapeau
  logoClub = logoClub
  photoJoueur = photoJoueur
  themeClub = themeClub

  constructor(private joueurService: JoueurService) {}

  libellePoste(code: string): string {
    return POSTES[code] ?? code
  }

  // Clubs présents dans la liste, pour les filtres
  clubs(joueurs: Joueur[]): Club[] {
    const parId = new Map(joueurs.map((j) => [j.club.id, j.club]))
    return [...parId.values()].sort((a, b) => a.nom.localeCompare(b.nom))
  }

  filtrer(joueurs: Joueur[]): Joueur[] {
    const texte = this.recherche.trim().toLocaleLowerCase("fr")
    return joueurs.filter(
      (j) =>
        (this.clubFiltre === null || j.club.id === this.clubFiltre) &&
        (this.posteFiltre === null || j.poste === this.posteFiltre) &&
        (!texte || `${j.prenom} ${j.nom}`.toLocaleLowerCase("fr").includes(texte)),
    )
  }

  rechercher(event: Event): void {
    this.recherche = (event.target as HTMLInputElement).value
  }

  // Couleurs du club + rang d'apparition (animation décalée, plafonnée)
  styleCarte(joueur: Joueur, index: number): Record<string, string> {
    return { ...themeClub(joueur.club), "--i": String(Math.min(index, 16)) }
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
}
