import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { conexion } from '../../environments/environment';

const base_url = conexion.server.base_url + '/inbox';
@Injectable({
  providedIn: 'root',
})
export class BandejaService {
  constructor(private http: HttpClient) {}

  getBandeja(): Observable<any> {
    return this.http.get<any>(`${base_url}`);
  }

  getFiltroCampos(campo: string, valor: string) {
    return this.http.get<any>(`${base_url}/campo/${campo}/${valor}`);
  }

  getFiltroElementos(elemento: string, campo: string, valor: string) {
    return this.http
      .get<any>(`${base_url}/elemento/${elemento}/${campo}/${valor}`)
      .pipe(
        catchError((err) => {
          if (err.status === 404) {
            return [];
          }

          // console.error('Error al obtener elementos:', err);
          return of([]);
        }),
      );
  }

  getBandejaById(id: string): Observable<any> {
    return this.http.get<any>(`${base_url}/${id}`);
  }
  addBandeja(nivel: any) {
    return this.http.post<any>(`${base_url}`, nivel);
  }

  updateBandeja(id: string, nivel: any) {
    return this.http.put<any>(`${base_url}/${id}`, nivel);
  }

  deleteBandeja(id: string) {
    return this.http.delete<any>(`${base_url}/${id}`);
  }
}
