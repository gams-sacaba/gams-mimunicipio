import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { conexion } from '../../environments/environment';
import { Observable } from 'rxjs';

const base_url = conexion.server.base_url + '/validators';

@Injectable({
  providedIn: 'root',
})
export class QrService {
  constructor(private http: HttpClient) {}

  validarQr(codigoHash: string): Observable<any> {
    return this.http.get(`${base_url}/${codigoHash}`);
  }
}
