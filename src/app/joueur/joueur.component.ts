import { Component } from "@angular/core"
import { JoueurService } from "services/joueur.service"

@Component({
  selector: "joueur",
  templateUrl: "./joueur.component.html",
  styleUrls: ["./joueur.component.scss"],
})
export class JoueurComponent {
  joueurs$ = this.joueurService.getAll()

  private postes: Record<string, string> = {
    M: "Meneur",
    AR: "Arrière",
    AI: "Ailier",
    AF: "Ailier Fort",
    P: "Pivot",
  }

  constructor(private joueurService: JoueurService) {}

  libellePoste(code: string): string {
    return this.postes[code] ?? code
  }
}