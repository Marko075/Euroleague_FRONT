import { Component, HostListener } from "@angular/core"
import { Link } from "models/links.model"

@Component({
  selector: "navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent {
  links: Link[] = []
  sidebarOpen = false

  constructor() {
    this.links.push({ name: "Joueurs", href: "joueurs", icon: "person" })
    this.links.push({ name: "Clubs", href: "clubs", icon: "groups" })
    this.links.push({ name: "Saisons", href: "saisons", icon: "calendar_month" })
    this.links.push({ name: "Matchs", href: "matchs", icon: "scoreboard" })
    this.links.push({ name: "Classements", href: "classements", icon: "leaderboard" })
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen
  }

  closeSidebar() {
    this.sidebarOpen = false
  }

  @HostListener("document:keydown.escape")
  onEscape() {
    this.closeSidebar()
  }
}
