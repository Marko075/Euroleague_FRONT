import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"
import { HomeComponent } from "home/home.component"
import { JoueurComponent } from "joueur/joueur.component"
import { ClubComponent } from "club/club.component"

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "joueurs", 
    component: JoueurComponent 
  },
  { path: "clubs", 
    component: ClubComponent 
  }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
