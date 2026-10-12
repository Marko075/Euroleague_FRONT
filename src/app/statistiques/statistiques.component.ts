
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Periode } from '../models/periode.model';
import { JoueurOption } from '../models/joueur-option.model';
import { StatsPeriodeJoueur } from '../models/stats-periode-joueur.model';
import { Club } from '../models/joueur.model';

import { StatistiquesService } from '../services/statistiques.service';
import { ClubService } from '../services/club.service';
import { POSTES, logoClub, themeClub } from '../club/club-visuels';

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

  // Clubs (logos et couleurs de la fiche), retrouvés par leur nom
  private clubs: Club[] = [];

  constructor(
    private statistiquesService: StatistiquesService,
    private clubService: ClubService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.chargerPeriodes();
    this.chargerJoueurs();
    this.clubService.getAll().subscribe({
      next: (clubs) => {
        this.clubs = clubs;
      },
      error: () => {
        this.clubs = []; // la page fonctionne sans les couleurs des clubs
      }
    });
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

        // Arrivée depuis la page Joueurs (/statistiques?joueur=12) : joueur présélectionné
        const joueurId = Number(this.route.snapshot.queryParamMap.get('joueur'));
        const joueur = joueurs.find(j => j.id === joueurId);
        if (joueur) {
          this.selectionnerJoueur(joueur);
        }
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

  // Ferme la liste quand le focus quitte le champ de recherche et sa liste
  fermerSiFocusSort(event: FocusEvent): void {
    const conteneur = event.currentTarget as HTMLElement;
    if (!conteneur.contains(event.relatedTarget as Node | null)) {
      this.listeJoueursOuverte = false;
    }
  }

  // Total ramené au nombre de matchs joués (null s'il n'y en a aucun)
  moyenne(total: number): number | null {
    const matchs = this.statistiques?.matchsJoues ?? 0;
    return matchs > 0 ? total / matchs : null;
  }

  libellePoste(code: string): string {
    return POSTES[code] ?? code;
  }

  logo(nomClub: string | null): string {
    const club = this.clubDe(nomClub);
    return club ? logoClub(club) : 'assets/logo_club/defaut.svg';
  }

  theme(nomClub: string | null): Record<string, string> {
    const club = this.clubDe(nomClub);
    return club ? themeClub(club) : {};
  }

  private clubDe(nomClub: string | null): Club | undefined {
    return this.clubs.find(c => c.nom === nomClub);
  }
}
