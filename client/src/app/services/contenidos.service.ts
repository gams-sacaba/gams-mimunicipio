import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { conexion } from '../../environments/environment';

const base_url = conexion.server.base_url + '/content';

@Injectable({
  providedIn: 'root',
})
export class ContenidosService {
  constructor(private http: HttpClient) {}

  getContenidos(params?: any): Observable<any> {
    return this.http.get<any>(`${base_url}`, { params });
  }

  getFiltroCampos(campo: string, valor: string) {
    return this.http.get<any>(`${base_url}/campo/${campo}/${valor}`);
  }

  getContenidosById(id: string): Observable<any> {
    return this.http.get<any>(`${base_url}/${id}`);
  }

  addContenido(contenido: any) {
    return this.http.post<any>(`${base_url}`, contenido);
  }

  updateContenido(id: string, contenido: any) {
    return this.http.put<any>(`${base_url}/${id}`, contenido);
  }

  deleteElemento(id: string) {
    return this.http.delete<any>(`${base_url}/${id}`);
  }
}
