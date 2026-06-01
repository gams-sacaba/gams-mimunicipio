import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { conexion } from '../../environments/environment';

const base_url = conexion.server.base_url + '/dependency';

@Injectable({
  providedIn: 'root',
})
export class DependenciasService {
  constructor(private http: HttpClient) {}

  getDependencias(): Observable<any> {
    return this.http.get<any>(`${base_url}`);
  }

  getDependenciaById(id: string): Observable<any> {
    return this.http.get<any>(`${base_url}/${id}`);
  }

  getFiltroCampos(campo: string, valor: string) {
    return this.http.get<any>(`${base_url}/campo/${campo}/${valor}`);
  }

  addDependencia(dependencia: any) {
    return this.http.post<any>(`${base_url}`, dependencia);
  }

  updateDependencia(id: string, dependencia: any) {
    return this.http.put<any>(`${base_url}/${id}`, dependencia);
  }

  deleteElemento(id: string) {
    return this.http.delete<any>(`${base_url}/${id}`);
  }
}
