import { Component, OnInit } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import { ClassementLigne, ClassementMiniSaison } from '../models/classement.model';
import { Club } from '../models/joueur.model';
import { ClassementService } from '../services/classement.service';
import { ClubService } from '../services/club.service';
import { logoClub, themeClub } from '../club/club-visuels';

@Component({
  selector: 'app-classement',
  templateUrl: './classement.component.html',
  styleUrl: './classement.component.scss'
})
export class ClassementComponent implements OnInit {
  classements: ClassementMiniSaison[] = [];
  index = 0; // mini-saison affichée (par défaut la plus récente)
  chargement = true;
  erreur = false;

  private clubs = new Map<number, Club>();

  constructor(private classementService: ClassementService, private clubService: ClubService) {}

  ngOnInit(): void {
    forkJoin({
      classements: this.classementService.getClassements(),
      // logos et couleurs : la page reste utilisable sans eux
      clubs: this.clubService.getAll().pipe(catchError(() => of<Club[]>([])))
    }).subscribe({
      next: ({ classements, clubs }) => {
        this.classements = classements;
        this.index = Math.max(0, classements.length - 1);
        this.clubs = new Map(clubs.map((c) => [c.id, c]));
        this.chargement = false;
      },
      error: () => {
        this.erreur = true;
        this.chargement = false;
      }
    });
  }

  get classementAffiche(): ClassementMiniSaison | undefined {
    return this.classements[this.index];
  }

  // Affiche +12, -5 ou 0
  formatDiff(diff: number): string {
    return diff > 0 ? '+' + diff : String(diff);
  }

  pourcentage(ligne: ClassementLigne): number {
    const joues = ligne.victoires + ligne.defaites;
    return joues ? (ligne.victoires / joues) * 100 : 0;
  }

  logo(clubId: number): string {
    const club = this.clubs.get(clubId);
    return club ? logoClub(club) : 'assets/logo_club/defaut.svg';
  }

  theme(clubId: number): Record<string, string> {
    const club = this.clubs.get(clubId);
    return club ? themeClub(club) : {};
  }
}
