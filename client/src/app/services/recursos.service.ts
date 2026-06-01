import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { conexion } from '../../environments/environment';

const base_url = conexion.server.base_url + '/resources';

@Injectable({
  providedIn: 'root',
})
export class RecursosService {
  constructor(private http: HttpClient) {}

  getSettings(): Observable<any> {
    return this.http.get<any[]>(`${base_url}/settings`);
  }

  getRecursosDisponibles(): Observable<any> {
    return this.http.get<any>(`${base_url}/available`);
  }

  downloadRecurso(id: string): Observable<Blob> {
    return this.http.get(`${base_url}/download/${id}`, {
      responseType: 'blob',
    });
  }
}
