import { Component, OnInit } from '@angular/core';
import { ClassementMiniSaison } from '../models/classement.model';
import { ClassementService } from '../services/classement.service';

@Component({
  selector: 'app-classement',
  templateUrl: './classement.component.html',
  styleUrl: './classement.component.scss'
})
export class ClassementComponent implements OnInit {
  classements: ClassementMiniSaison[] = [];
  chargement = true;
  erreur = false;

  constructor(private classementService: ClassementService) {}

  ngOnInit(): void {
    this.classementService.getClassements().subscribe({
      next: (classements) => {
        this.classements = classements;
        this.chargement = false;
      },
      error: () => {
        this.erreur = true;
        this.chargement = false;
      }
    });
  }

  // Affiche +12, -5 ou 0
  formatDiff(diff: number): string {
    return diff > 0 ? '+' + diff : String(diff);
  }
}
