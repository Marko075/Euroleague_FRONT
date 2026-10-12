import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { Observable } from "rxjs"
import { Club, Joueur } from "models/joueur.model"
import { BilanClub } from "models/club.model"
import { Match } from "models/saison.model"

@Injectable({ providedIn: "root" })
export class ClubService {
  private apiUrl = "http://localhost:8080/clubs"

  constructor(private http: HttpClient) {}

  getAll(): Observable<Club[]> {
    return this.http.get<Club[]>(this.apiUrl)
  }

  getById(id: number): Observable<Club> {
    return this.http.get<Club>(`${this.apiUrl}/${id}`)
  }

  getJoueurs(id: number): Observable<Joueur[]> {
    return this.http.get<Joueur[]>(`${this.apiUrl}/${id}/joueurs`)
  }

  getMatchs(id: number): Observable<Match[]> {
    return this.http.get<Match[]>(`${this.apiUrl}/${id}/matchs`)
  }

  getBilan(id: number): Observable<BilanClub> {
    return this.http.get<BilanClub>(`${this.apiUrl}/${id}/bilan`)
  }
}
