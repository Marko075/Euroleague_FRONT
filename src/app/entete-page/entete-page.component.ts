import { Component, Input } from "@angular/core"

// En-tête commun des pages : sur-titre, grand titre (deuxième ligne en dégradé) et description.
// Ce qui est placé entre les balises s'affiche à droite (compteurs, boutons...)
@Component({
  selector: "entete-page",
  templateUrl: "./entete-page.component.html",
  styleUrls: ["./entete-page.component.scss"],
})
export class EntetePageComponent {
  @Input() surTitre = ""
  @Input({ required: true }) titre!: string
  @Input() accent = ""
  @Input() description = ""
}
