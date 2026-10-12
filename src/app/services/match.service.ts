import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MatchStats } from '../models/match-stats.model';

// Filtres optionnels de la page Matchs (null = pas de filtre)
export interface FiltresMatch {
  miniSaison: number | null;
  journee: number | null;
  clubId: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private readonly apiUrl = 'http://localhost:8080/matchs';

  constructor(private http: HttpClient) {}

  // Matchs joués ; seuls les filtres renseignés sont envoyés à l'API
  getMatchs(filtres: FiltresMatch = { miniSaison: null, journee: null, clubId: null }): Observable<MatchStats[]> {
    let params = new HttpParams();
    if (filtres.miniSaison !== null) {
      params = params.set('miniSaison', filtres.miniSaison);
    }
    if (filtres.journee !== null) {
      params = params.set('journee', filtres.journee);
    }
    if (filtres.clubId !== null) {
      params = params.set('clubId', filtres.clubId);
    }
    return this.http.get<MatchStats[]>(this.apiUrl, { params });
  }
}
