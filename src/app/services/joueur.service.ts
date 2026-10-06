import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { Observable } from "rxjs"
import { Joueur     } from "models/joueur.model"

@Injectable({ providedIn: "root" })
export class JoueurService {
  private apiUrl = "http://localhost:8080/joueurs"

  constructor(private http: HttpClient) {}

  getAll(): Observable<Joueur[]> {
    return this.http.get<Joueur[]>(this.apiUrl)
  }
}
