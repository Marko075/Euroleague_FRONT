import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { Observable, map } from "rxjs"
import { Meteo } from "models/club.model"

// API publique Open-Meteo (gratuite, sans clé) : météo actuelle de la ville du club
@Injectable({ providedIn: "root" })
export class MeteoService {
  private apiUrl = "https://api.open-meteo.com/v1/forecast"

  constructor(private http: HttpClient) {}

  getMeteoActuelle(latitude: number, longitude: number): Observable<Meteo> {
    const params = {
      latitude,
      longitude,
      current: "temperature_2m,weather_code,wind_speed_10m",
      timezone: "auto",
    }
    return this.http
      .get<{ current: { temperature_2m: number; weather_code: number; wind_speed_10m: number } }>(
        this.apiUrl,
        { params },
      )
      .pipe(
        map((reponse) => ({
          temperature: Math.round(reponse.current.temperature_2m),
          vent: Math.round(reponse.current.wind_speed_10m),
          code: reponse.current.weather_code,
        })),
      )
  }
}
