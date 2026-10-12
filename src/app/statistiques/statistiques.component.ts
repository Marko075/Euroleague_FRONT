
import { Component, OnInit } from '@angular/core';

import { Periode } from '../models/periode.model';
import { JoueurOption } from '../models/joueur-option.model';
import { StatsPeriodeJoueur } from '../models/stats-periode-joueur.model';

import { StatistiquesService } from '../services/statistiques.service';

@Component({
  selector: 'app-statistiques',
  standalone: false,
  templateUrl: './statistiques.component.html',
  styleUrls: ['./statistiques.component.scss']
})
export class StatistiquesComponent implements OnInit {

  periodes: Periode[] = [];
  joueurs: JoueurOption[] = [];

  miniSaisonSelectionnee: number | null = null;
  journeeSelectionnee: number | null = null;
  joueurSelectionne: number | null = null;

  statistiques: StatsPeriodeJoueur | null = null;

  rechercheJoueur = '';
  listeJoueursOuverte = false;

  chargement = false;
  erreur: string | null = null;

  constructor(
    private statistiquesService: StatistiquesService
  ) {}

  ngOnInit(): void {
    this.chargerPeriodes();
    this.chargerJoueurs();
  }

  chargerPeriodes(): void {
    this.statistiquesService.getPeriodes().subscribe({
      next: (periodes) => {
        this.periodes = periodes;
      },
      error: (err) => {
        console.error(
          'Erreur lors du chargement des périodes :',
          err
        );
        this.erreur = 'Impossible de charger les mini-saisons.';
      }
    });
  }

  chargerJoueurs(): void {
    this.statistiquesService.getJoueurs().subscribe({
      next: (joueurs) => {
        this.joueurs = joueurs;
      },
      error: (err) => {
        console.error(
          'Erreur lors du chargement des joueurs :',
          err
        );
        this.erreur = 'Impossible de charger les joueurs.';
      }
    });
  }

  get journeesDisponibles(): number[] {
    if (this.miniSaisonSelectionnee === null) {
      return [];
    }

    const periode = this.periodes.find(
      p => p.miniSaison === this.miniSaisonSelectionnee
    );

    return periode?.journees ?? [];
  }

  get joueursFiltres(): JoueurOption[] {
    const recherche = this.rechercheJoueur
      .trim()
      .toLocaleLowerCase('fr');

    if (!recherche) {
      return this.joueurs;
    }

    return this.joueurs.filter(joueur => {
      const nomComplet = `${joueur.prenom} ${joueur.nom}`
        .toLocaleLowerCase('fr');

      const nomInverse = `${joueur.nom} ${joueur.prenom}`
        .toLocaleLowerCase('fr');

      return nomComplet.includes(recherche) ||
        nomInverse.includes(recherche) ||
        joueur.prenom.toLocaleLowerCase('fr').includes(recherche) ||
        joueur.nom.toLocaleLowerCase('fr').includes(recherche);
    });
  }

  changerRechercheJoueur(event: Event): void {
    const valeur = (event.target as HTMLInputElement).value;

    this.rechercheJoueur = valeur;
    this.listeJoueursOuverte = true;

    this.joueurSelectionne = null;
    this.statistiques = null;
    this.erreur = null;
    this.chargement = false;
  }

  selectionnerJoueur(joueur: JoueurOption): void {
    this.joueurSelectionne = joueur.id;

    this.rechercheJoueur =
      `${joueur.prenom} ${joueur.nom}`;

    this.listeJoueursOuverte = false;

    this.actualiserStatistiques();
  }

  changerMiniSaison(event: Event): void {
    const valeur = (event.target as HTMLSelectElement).value;

    this.miniSaisonSelectionnee =
      valeur === '' ? null : Number(valeur);

    this.journeeSelectionnee = null;

    this.actualiserStatistiques();
  }

  changerJournee(event: Event): void {
    const valeur = (event.target as HTMLSelectElement).value;

    this.journeeSelectionnee =
      valeur === '' ? null : Number(valeur);

    this.actualiserStatistiques();
  }

  actualiserStatistiques(): void {
    this.statistiques = null;
    this.erreur = null;

    if (this.joueurSelectionne === null) {
      this.chargement = false;
      return;
    }

    this.chargement = true;

    this.statistiquesService.getStatistiquesJoueur(
      this.joueurSelectionne,
      this.miniSaisonSelectionnee,
      this.journeeSelectionnee
    ).subscribe({
      next: (resultat) => {
        this.statistiques = resultat;
        this.chargement = false;
      },
      error: (err) => {
        console.error(
          'Erreur lors du chargement des statistiques :',
          err
        );

        this.erreur =
          'Impossible de charger les statistiques de ce joueur.';

        this.chargement = false;
      }
    });
  }

  getPhotoJoueur(nom: string, prenom: string): string {
    return 'assets/joueurs/' +
      nom.toLowerCase() + '_' +
      prenom.toLowerCase() + '.png';
  }
}
