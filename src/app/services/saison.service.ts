import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Saison } from '../models/saison.model';

@Injectable({
  providedIn: 'root'
})
export class SaisonService {
  private readonly apiUrl = 'http://localhost:8080/saisons';

  constructor(private http: HttpClient) {}

  getSaisons(): Observable<Saison[]> {
    return this.http.get<Saison[]>(this.apiUrl);
  }
}