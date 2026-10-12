import { Component, OnInit } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import { Club } from '../models/joueur.model';
import { Match, Saison } from '../models/saison.model';
import { ClubService } from '../services/club.service';
import { SaisonService } from '../services/saison.service';
import { logoClub } from '../club/club-visuels';
import { sigle, vainqueur } from '../calendrier/calendrier-outils';

type Statut = 'A_VENIR' | 'EN_COURS' | 'TERMINEE';

// Ce qu'affiche la page : chaque mini-saison découpée en journées, avec sa progression
interface JourneeVue {
  numero: number;
  matchs: Match[];
}

interface MiniSaisonVue {
  numero: number;
  statut: Statut;
  joues: number;
  total: number;
  journees: JourneeVue[];
}

interface SaisonVue {
  saison: Saison;
  joues: number;
  total: number;
  miniSaisons: MiniSaisonVue[];
}

@Component({
  selector: 'app-saison',
  templateUrl: './saison.component.html',
  styleUrl: './saison.component.scss'
})
export class SaisonComponent implements OnInit {
  saisonsEnCours: SaisonVue[] = [];
  saisonsPassees: SaisonVue[] = [];
  chargement = true;
  erreur = false;

  vainqueur = vainqueur;

  private clubs = new Map<number, Club>();
  private ouvertes = new Set<string>(); // mini-saisons dépliées, clé "saison-numéro"

  constructor(private saisonService: SaisonService, private clubService: ClubService) {}

  ngOnInit(): void {
    forkJoin({
      saisons: this.saisonService.getSaisons(),
      // les logos ne sont qu'un bonus : la page s'affiche même sans la liste des clubs
      clubs: this.clubService.getAll().pipe(catchError(() => of<Club[]>([])))
    }).subscribe({
      next: ({ saisons, clubs }) => {
        this.clubs = new Map(clubs.map((c) => [c.id, c]));
        const vues = saisons.map((s) => this.versVue(s));
        this.saisonsEnCours = vues.filter((v) => v.saison.statut === 'EN_COURS');
        this.saisonsPassees = vues.filter((v) => v.saison.statut === 'TERMINEE');

        // on déplie la mini-saison en cours (sinon la dernière) de chaque saison
        for (const vue of vues) {
          const aDeplier = vue.miniSaisons.find((m) => m.statut !== 'TERMINEE') ?? vue.miniSaisons[vue.miniSaisons.length - 1];
          if (aDeplier) {
            this.ouvertes.add(this.cle(vue, aDeplier));
          }
        }
        this.chargement = false;
      },
      error: () => {
        this.erreur = true;
        this.chargement = false;
      }
    });
  }

  estOuverte(vue: SaisonVue, mini: MiniSaisonVue): boolean {
    return this.ouvertes.has(this.cle(vue, mini));
  }

  basculer(vue: SaisonVue, mini: MiniSaisonVue): void {
    const cle = this.cle(vue, mini);
    if (!this.ouvertes.delete(cle)) {
      this.ouvertes.add(cle);
    }
  }

  logo(clubId: number): string {
    const club = this.clubs.get(clubId);
    return club ? logoClub(club) : 'assets/logo_club/defaut.svg';
  }

  // Code court (PAR, MUN...) affiché à la place du nom sur petit écran
  sigle(clubId: number, nom: string): string {
    return sigle(this.clubs.get(clubId), nom);
  }

  libelleStatut(statut: string): string {
    switch (statut) {
      case 'A_VENIR':
        return 'À venir';
      case 'EN_COURS':
        return 'En cours';
      case 'TERMINEE':
        return 'Terminée';
      default:
        return 'Terminé';
    }
  }

  private cle(vue: SaisonVue, mini: MiniSaisonVue): string {
    return `${vue.saison.id}-${mini.numero}`;
  }

  private versVue(saison: Saison): SaisonVue {
    const miniSaisons = saison.miniSaisons.map((mini) => {
      const joues = mini.matchs.filter((m) => m.statut === 'TERMINE').length;
      const statut: Statut = joues === mini.matchs.length ? 'TERMINEE' : joues === 0 ? 'A_VENIR' : 'EN_COURS';

      // matchs regroupés par journée (ils arrivent déjà triés par journée puis date)
      const journees: JourneeVue[] = [];
      for (const match of mini.matchs) {
        const derniere = journees[journees.length - 1];
        if (derniere?.numero === match.journee) {
          derniere.matchs.push(match);
        } else {
          journees.push({ numero: match.journee, matchs: [match] });
        }
      }
      return { numero: mini.numero, statut, joues, total: mini.matchs.length, journees };
    });

    return {
      saison,
      joues: miniSaisons.reduce((n, m) => n + m.joues, 0),
      total: miniSaisons.reduce((n, m) => n + m.total, 0),
      miniSaisons
    };
  }
}
