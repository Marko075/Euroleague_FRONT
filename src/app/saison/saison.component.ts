import { Component, OnInit } from '@angular/core';
import { Saison } from '../models/saison.model';
import { SaisonService } from '../services/saison.service';

@Component({
  selector: 'app-saison',
  templateUrl: './saison.component.html',
  styleUrl: './saison.component.scss'
})
export class SaisonComponent implements OnInit {
  saisonsEnCours: Saison[] = [];
  saisonsPassees: Saison[] = [];
  chargement = true;
  erreur = false;

  constructor(private saisonService: SaisonService) {}

  ngOnInit(): void {
    this.saisonService.getSaisons().subscribe({
      next: (saisons) => {
        this.saisonsEnCours = saisons.filter(s => s.statut === 'EN_COURS');
        this.saisonsPassees = saisons.filter(s => s.statut === 'TERMINEE');
        this.chargement = false;
      },
      error: () => {
        this.erreur = true;
        this.chargement = false;
      }
    });
  }
}