
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { JoueurComponent } from './joueur/joueur.component';
import { ClubComponent } from './club/club.component';
import { ClubDetailComponent } from './club-detail/club-detail.component';
import { SaisonComponent } from './saison/saison.component';
import { MatchComponent } from './match/match.component';
import { ClassementComponent } from 'classement/classement.component';
import { StatistiquesComponent } from 'statistiques/statistiques.component';
import { CalendrierComponent } from './calendrier/calendrier.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'joueurs', component: JoueurComponent },
  { path: 'clubs', component: ClubComponent },
  { path: 'clubs/:id', component: ClubDetailComponent },
  { path: 'saisons', component: SaisonComponent },
  { path: 'matchs', component: MatchComponent },
  { path: 'classements', component: ClassementComponent },
  { path: 'statistiques', component: StatistiquesComponent },
  { path: 'calendrier', component: CalendrierComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [
    // retour en haut de page à chaque navigation, et liens vers une ancre (ex. /#tv)
    // décalés de la hauteur de la navbar collante
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
      scrollOffset: [0, 76]
    })
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}
