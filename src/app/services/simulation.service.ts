import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { Observable } from "rxjs"
import { MatchStats } from "models/match-stats.model"

// Simulation des matchs d'une mini-saison : les résultats sont enregistrés par le back
@Injectable({ providedIn: "root" })
export class SimulationService {
  private apiUrl = "http://localhost:8080/saisons"

  constructor(private http: HttpClient) {}

  simulerMiniSaison(saisonId: number, miniSaison: number): Observable<MatchStats[]> {
    return this.http.post<MatchStats[]>(`${this.url(saisonId, miniSaison)}/simulation`, null)
  }

  simulerJournee(saisonId: number, miniSaison: number, journee: number): Observable<MatchStats[]> {
    return this.http.post<MatchStats[]>(`${this.url(saisonId, miniSaison)}/journees/${journee}/simulation`, null)
  }

  // Les matchs de la mini-saison redeviennent « à venir »
  reinitialiser(saisonId: number, miniSaison: number): Observable<void> {
    return this.http.delete<void>(`${this.url(saisonId, miniSaison)}/simulation`)
  }

  private url(saisonId: number, miniSaison: number): string {
    return `${this.apiUrl}/${saisonId}/mini-saisons/${miniSaison}`
  }
}
