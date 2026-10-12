import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ClassementMiniSaison } from '../models/classement.model';

@Injectable({
  providedIn: 'root'
})
export class ClassementService {
  private readonly apiUrl = 'http://localhost:8080/classements';

  constructor(private http: HttpClient) {}

  getClassements(): Observable<ClassementMiniSaison[]> {
    return this.http.get<ClassementMiniSaison[]>(this.apiUrl);
  }
}