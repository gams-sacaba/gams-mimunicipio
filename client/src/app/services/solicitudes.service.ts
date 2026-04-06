import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { conexion } from '../../environments/environment.prod';

const base_url = conexion.server.base_url + '/request';

@Injectable({
  providedIn: 'root',
})
export class SolicitudesService {
  constructor(private http: HttpClient) {}

  getSolicitudes(): Observable<any> {
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
          return of([]); // Devuelve un array vacío o cualquier valor por defecto si ocurre un error
        })
      );
  }

  getSolicitudById(id: string): Observable<any> {
    return this.http.get<any>(`${base_url}/${id}`);
  }
  addSolicitud(nivel: any) {
    return this.http.post<any>(`${base_url}`, nivel);
  }

  updateSolicitud(id: string, nivel: any) {
    return this.http.put<any>(`${base_url}/${id}`, nivel);
  }

  deleteSolicitud(id: string) {
    return this.http.delete<any>(`${base_url}/${id}`);
  }
}
