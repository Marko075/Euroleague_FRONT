import { Component } from "@angular/core"
import { catchError, of } from "rxjs"
import { Club } from "models/joueur.model"
import { ClubService } from "services/club.service"

// Pied de page commun à toutes les pages (newsletter, appli et liens légaux factices)
@Component({
  selector: "site-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.scss"],
})
export class FooterComponent {
  clubs$ = this.clubService.getAll().pipe(catchError(() => of<Club[]>([])))
  annee = new Date().getFullYear()
  inscrit = false

  constructor(private clubService: ClubService) {}

  // Le navigateur valide déjà le champ (type="email" + required) avant l'envoi
  inscrire(event: Event): void {
    event.preventDefault()
    this.inscrit = true
  }
}
