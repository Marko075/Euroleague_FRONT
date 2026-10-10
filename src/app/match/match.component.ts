import { Component, OnInit } from '@angular/core';
import { MatchStats } from '../models/match-stats.model';
import { MatchService } from '../services/match.service';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrl: './match.component.scss'
})
export class MatchComponent implements OnInit {
  matchs: MatchStats[] = [];
  chargement = true;
  erreur = false;

  constructor(private matchService: MatchService) {}

  ngOnInit(): void {
    this.matchService.getDerniersMatchs().subscribe({
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

  // Vrai si ce joueur est le MVP du match (sert à surligner sa ligne)
  estMvp(match: MatchStats, joueurId: number): boolean {
    return match.mvpId === joueurId;
  }

  // Vrai si l'équipe a gagné le match (sert à mettre son score en gras)
  domicileGagne(match: MatchStats): boolean {
    return match.scoreDomicile > match.scoreExterieur;
  }
}