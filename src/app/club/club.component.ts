import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { ClubService } from "services/club.service"
import { Club } from "models/joueur.model"
import { drapeau, logoClub, themeClub } from "./club-visuels"

@Component({
  selector: "club",
  templateUrl: "./club.component.html",
  styleUrls: ["./club.component.scss"],
})
export class ClubComponent {
  clubs$ = this.clubService.getAll()

  logoClub = logoClub
  drapeau = drapeau
  themeClub = themeClub

  constructor(
    private clubService: ClubService,
    private router: Router,
  ) {}

  // Inclinaison 3D de la carte qui suit la souris
  suivreSouris(event: MouseEvent): void {
    const carte = event.currentTarget as HTMLElement
    const rect = carte.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height
    carte.style.setProperty("--mx", `${x * 100}%`)
    carte.style.setProperty("--my", `${y * 100}%`)
    carte.style.setProperty("--ry", `${(x - 0.5) * 14}deg`)
    carte.style.setProperty("--rx", `${(0.5 - y) * 14}deg`)
  }

  reinitialiser(event: MouseEvent): void {
    const carte = event.currentTarget as HTMLElement
    carte.style.setProperty("--rx", "0deg")
    carte.style.setProperty("--ry", "0deg")
  }

  ouvrir(club: Club): void {
    this.router.navigate(["/clubs", club.id])
  }

  trophees(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i)
  }
}
