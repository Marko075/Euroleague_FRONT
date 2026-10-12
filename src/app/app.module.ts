import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { NavbarComponent } from './navbar/navbar.component';
import { HomeComponent } from './home/home.component';
import { JoueurComponent } from './joueur/joueur.component';
import { ClubComponent } from './club/club.component';
import { ClubDetailComponent } from './club-detail/club-detail.component';
import { SaisonComponent } from './saison/saison.component';
import { MatchComponent } from './match/match.component';
import { ClassementComponent } from './classement/classement.component';

// formats français (dates, nombres) utilisables via le paramètre "fr" des pipes
registerLocaleData(localeFr);

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    JoueurComponent,
    ClubComponent,
    ClubDetailComponent,
    SaisonComponent,
    MatchComponent,
    ClassementComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    MatCardModule,
    MatIconModule,
    MatListModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
