import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { conexion } from '../../environments/environment';

const base_url = conexion.server.base_url + '/detail';

@Injectable({
  providedIn: 'root',
})
export class DetallesService {
  constructor(private http: HttpClient) {}

  getDetalles(): Observable<any> {
    return this.http.get<any>(`${base_url}`);
  }

  getFiltroCampos(campo: string, valor: string) {
    return this.http.get<any>(`${base_url}/campo/${campo}/${valor}`);
  }

  getDetallesById(id: string): Observable<any> {
    return this.http.get<any>(`${base_url}/${id}`);
  }

  addDetalle(detalle: any) {
    return this.http.post<any>(`${base_url}`, detalle);
  }

  updateDetalle(id: string, detalle: any) {
    return this.http.put<any>(`${base_url}/${id}`, detalle);
  }

  deleteDetalle(id: string) {
    return this.http.delete<any>(`${base_url}/${id}`);
  }
}
