import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MatchStats } from '../models/match-stats.model';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private readonly apiUrl = 'http://localhost:8080/matchs';

  constructor(private http: HttpClient) {}

  getDerniersMatchs(): Observable<MatchStats[]> {
    return this.http.get<MatchStats[]>(`${this.apiUrl}/derniers`);
  }
}