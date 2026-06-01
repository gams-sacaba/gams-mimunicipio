import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { conexion } from '../../environments/environment';

const base_url = conexion.server.base_url + '/registro';

@Injectable({
  providedIn: 'root',
})
export class RegistrosService {
  constructor(private http: HttpClient) {}

  getRegistros(): Observable<any> {
    return this.http.get<any>(`${base_url}`);
  }

  getRegistroById(id: string): Observable<any> {
    return this.http.get<any>(`${base_url}/${id}`);
  }

  getFiltroCampos(campo: string, valor: string) {
    return this.http.get<any>(`${base_url}/campo/${campo}/${valor}`);
  }

  getFiltroElementos(elemento: string, campo: string, valor: string) {
    return this.http.get<any>(
      `${base_url}/elemento/${elemento}/${campo}/${valor}`,
    );
  }

  searchRegistros(params: any): Observable<any> {
    return this.http.post<any>(`${base_url}/search`, params);
  }

  addRegistro(registro: any) {
    return this.http.post<any>(`${base_url}`, registro);
  }

  updateRegistro(id: string, registro: any) {
    return this.http.put<any>(`${base_url}/${id}`, registro);
  }

  deleteRegistro(id: string) {
    return this.http.delete<any>(`${base_url}/${id}`);
  }
}
