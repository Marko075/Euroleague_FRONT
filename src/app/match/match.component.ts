import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Club } from '../models/joueur.model';
import { MatchStats } from '../models/match-stats.model';
import { ClubService } from '../services/club.service';
import { FiltresMatch, MatchService } from '../services/match.service';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrl: './match.component.scss'
})
export class MatchComponent implements OnInit {
  matchs: MatchStats[] = [];
  chargement = true;
  erreur = false;

  // Filtres sélectionnés, lus depuis l'URL (ex : /matchs?miniSaison=1&journee=3&clubId=2)
  filtres: FiltresMatch = { miniSaison: null, journee: null, clubId: null };

  // Données servant à remplir les listes déroulantes
  clubs: Club[] = [];
  private tousLesMatchs: MatchStats[] = [];

  constructor(
    private matchService: MatchService,
    private clubService: ClubService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Les clubs, et tous les matchs joués (pour savoir quelles mini-saisons et journées existent)
    this.clubService.getAll().subscribe((clubs) => (this.clubs = clubs));
    this.matchService.getMatchs().subscribe((matchs) => (this.tousLesMatchs = matchs));

    // À chaque changement des filtres dans l'URL, on recharge les matchs
    this.route.queryParamMap.subscribe((params) => {
      this.filtres = {
        miniSaison: this.lireNombre(params, 'miniSaison'),
        journee: this.lireNombre(params, 'journee'),
        clubId: this.lireNombre(params, 'clubId')
      };
      this.chargerMatchs();
    });
  }

  private chargerMatchs(): void {
    this.chargement = true;
    this.erreur = false;
    this.matchService.getMatchs(this.filtres).subscribe({
      next: (matchs) => {
        this.matchs = matchs;
        this.chargement = false;
      },
      error: () => {
        this.erreur = true;
        this.chargement = false;
      }
    });
  }

  private lireNombre(params: ParamMap, nom: string): number | null {
    const valeur = params.get(nom);
    return valeur ? Number(valeur) : null;
  }

  // Mini-saisons disponibles, dans l'ordre
  get miniSaisons(): number[] {
    return [...new Set(this.tousLesMatchs.map((m) => m.miniSaison))].sort((a, b) => a - b);
  }

  // Journées disponibles (seulement celles de la mini-saison choisie, s'il y en a une)
  get journees(): number[] {
    const matchs = this.filtres.miniSaison === null
      ? this.tousLesMatchs
      : this.tousLesMatchs.filter((m) => m.miniSaison === this.filtres.miniSaison);
    return [...new Set(matchs.map((m) => m.journee))].sort((a, b) => a - b);
  }

  get filtreActif(): boolean {
    return this.filtres.miniSaison !== null || this.filtres.journee !== null || this.filtres.clubId !== null;
  }

  // Appelé quand une liste déroulante change : on met à jour l'URL,
  // ce qui déclenche le rechargement des matchs via queryParamMap
  changerFiltre(nom: keyof FiltresMatch, event: Event): void {
    const valeur = (event.target as HTMLSelectElement).value;
    const nouveauxFiltres: FiltresMatch = { ...this.filtres, [nom]: valeur ? Number(valeur) : null };

    // Si la journée choisie n'existe pas dans la nouvelle mini-saison, on la retire
    if (nom === 'miniSaison' && nouveauxFiltres.miniSaison !== null && nouveauxFiltres.journee !== null) {
      const existe = this.tousLesMatchs.some(
        (m) => m.miniSaison === nouveauxFiltres.miniSaison && m.journee === nouveauxFiltres.journee
      );
      if (!existe) {
        nouveauxFiltres.journee = null;
      }
    }
    this.appliquerFiltres(nouveauxFiltres);
  }

  reinitialiser(): void {
    this.appliquerFiltres({ miniSaison: null, journee: null, clubId: null });
  }

  private appliquerFiltres(filtres: FiltresMatch): void {
    // un filtre à null est retiré de l'URL
    this.router.navigate([], { relativeTo: this.route, queryParams: filtres });
  }

  // Vrai si ce joueur est le MVP du match (sert à surligner sa ligne)
  estMvp(match: MatchStats, joueurId: number): boolean {
    return match.mvpId === joueurId;
  }

  // Vrai si l'équipe a gagné le match (sert à mettre son score en gras)
  domicileGagne(match: MatchStats): boolean {
    return match.scoreDomicile > match.scoreExterieur;
  }
}
