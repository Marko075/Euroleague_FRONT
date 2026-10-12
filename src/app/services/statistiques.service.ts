
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Periode } from '../models/periode.model';
import { JoueurOption } from '../models/joueur-option.model';
import { StatsPeriodeJoueur } from '../models/stats-periode-joueur.model';

@Injectable({
  providedIn: 'root'
})
export class StatistiquesService {

  private readonly apiUrl = 'http://localhost:8080/statistiques';

  constructor(private http: HttpClient) {}

  getPeriodes(): Observable<Periode[]> {
    return this.http.get<Periode[]>(
      `${this.apiUrl}/periodes`
    );
  }

  getJoueurs(): Observable<JoueurOption[]> {
    return this.http.get<JoueurOption[]>(
      `${this.apiUrl}/joueurs`
    );
  }

  getStatistiquesJoueur(
    joueurId: number,
    miniSaison?: number | null,
    journee?: number | null
  ): Observable<StatsPeriodeJoueur> {

    let params = new HttpParams();

    if (miniSaison != null) {
      params = params.set('miniSaison', miniSaison);
    }

    if (journee != null) {
      params = params.set('journee', journee);
    }

    return this.http.get<StatsPeriodeJoueur>(
      `${this.apiUrl}/joueurs/${joueurId}`,
      { params }
    );
  }
}
