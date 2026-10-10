
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { JoueurComponent } from './joueur/joueur.component';
import { ClubComponent } from './club/club.component';
import { SaisonComponent } from './saison/saison.component';
import { MatchComponent } from './match/match.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'joueurs', component: JoueurComponent },
  { path: 'clubs', component: ClubComponent },
  { path: 'saisons', component: SaisonComponent },
  { path: 'matchs', component: MatchComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}
