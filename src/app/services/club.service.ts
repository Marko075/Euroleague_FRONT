import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { Observable } from "rxjs"
import { Club     } from "models/joueur.model"

@Injectable({ providedIn: "root" })
export class ClubService {
  private apiUrl = "http://localhost:8080/clubs"

  constructor(private http: HttpClient) {}

  getAll(): Observable<Club[]> {
    return this.http.get<Club[]>(this.apiUrl)
  }
}