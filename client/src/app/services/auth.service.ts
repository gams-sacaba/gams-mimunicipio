import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';

import { conexion } from '../../environments/environment.prod';
import { SocketService } from './socket.service';

const base_url = conexion.server.base_url + '/session';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  private userRole = new BehaviorSubject<string>(this.getUserRoleFromStorage());
  private userName = new BehaviorSubject<string>(this.getUserNameFromStorage());
  private userId = new BehaviorSubject<string>(this.getUserIdFromStorage());
  private userStatus = new BehaviorSubject<string>(this.getStatusFromStorage());
  private userRegistro = new BehaviorSubject<string>(
    this.getUserRegistroFromStorage(),
  );
  private userFuncionario = new BehaviorSubject<string>(
    this.getUserFuncionarioFromStorage(),
  );
  private aprobador = new BehaviorSubject<string>(
    this.getAprobadorFromStorage(),
  );
  private isAprobador = new BehaviorSubject<string>(
    this.getIsAprobadorFromStorage(),
  );
  private userDataSubject = new BehaviorSubject<any>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
    private dialog: MatDialog,
    private socketService: SocketService,
  ) {
    const savedData = localStorage.getItem('userData');
    if (savedData) {
      this.userDataSubject.next(JSON.parse(savedData));
    }

    const token = localStorage.getItem('token');
    if (token) {
      setTimeout(() => this.socketService.connect(token), 500);
    }
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  private getUserIdFromStorage(): string {
    return localStorage.getItem('id') || '';
  }

  private getUserRoleFromStorage(): string {
    return localStorage.getItem('role') || '';
  }

  private getUserNameFromStorage(): string {
    return localStorage.getItem('name') || '';
  }

  private getUserRegistroFromStorage(): string {
    return localStorage.getItem('registro') || '';
  }

  private getUserFuncionarioFromStorage(): string {
    return localStorage.getItem('funcionario') || '';
  }

  private getAprobadorFromStorage(): string {
    return localStorage.getItem('aprobador') || '';
  }

  private getIsAprobadorFromStorage(): string {
    return localStorage.getItem('isAprobador') || '';
  }

  private getStatusFromStorage(): string {
    return localStorage.getItem('status') || '';
  }

  getUserRole(): Observable<string> {
    return this.userRole.asObservable();
  }

  getUserName(): Observable<string> {
    return this.userName.asObservable();
  }

  getUserNameValue(): string {
    return this.userName.getValue();
  }

  getUserRegistro(): string {
    return this.userRegistro.getValue();
  }

  getUserFuncionario(): string {
    return this.userFuncionario.getValue();
  }

  getAprobador(): string {
    return this.aprobador.getValue();
  }

  getIsAprobador(): string {
    return this.isAprobador.getValue();
  }

  getUseStatus(): Observable<string> {
    return this.userStatus.asObservable();
  }

  changePassword(payload: {
    id: string;
    currentPassword: string;
    newPassword: string;
    options?: number;
  }): Observable<any> {
    payload.options = 1;
    return this.http.put(`${base_url}/update`, payload);
  }

  login(credentials: { username: string; password: string; role: number }) {
    return this.http.post<any>(`${base_url}`, credentials).pipe(
      tap((user) => {
        console.log(user);
        if (user && user.token) {
          localStorage.setItem('token', user.token);
          localStorage.setItem('role', user.role);
          localStorage.setItem('name', user.name);
          localStorage.setItem('registro', user.registro);
          localStorage.setItem('funcionario', user.funcionario);
          localStorage.setItem('id', credentials.username);
          localStorage.setItem('aprobador', user.aprobador);
          localStorage.setItem('isAprobador', user.isAprobador);
          localStorage.setItem('status', user.status);
          localStorage.setItem('modules', JSON.stringify(user.modules || {}));
          this.loggedIn.next(true);
          this.userRole.next(user.role);
          this.userName.next(user.name);
          this.userStatus.next(user.status);
          this.userRegistro.next(user.registro);
          this.userFuncionario.next(user.funcionario);
          this.aprobador.next(user.aprobador);
          this.isAprobador.next(user.isAprobador);
          this.userId.next(credentials.username);
          this.userDataSubject.next({
            ...user,
            modules: user.modules || {},
          });

          this.socketService.connect(user.token);
        }
      }),
    );
  }

  getAccessibleModules(): Observable<string[]> {
    return this.userDataSubject.pipe(
      map((userData: any) => {
        if (userData?.modules) {
          return userData.modules;
        }
        const savedModules = localStorage.getItem('modules');
        return savedModules ? JSON.parse(savedModules) : {};
      }),
    );
  }

  hasAccessToModule(moduleName: string): Observable<boolean> {
    return this.getAccessibleModules().pipe(
      map((modules) => modules.includes(moduleName)),
    );
  }

  logout(): boolean {
    localStorage.removeItem('token');

    localStorage.removeItem('base_url');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('registro');
    localStorage.removeItem('funcionario');
    localStorage.removeItem('aprobador');
    localStorage.removeItem('isAprobador');
    localStorage.removeItem('status');
    localStorage.removeItem('modules');

    this.dialog.closeAll();
    this.loggedIn.next(false);
    this.userRole.next('');
    this.userId.next('');
    this.socketService.disconnect();
    this.router.navigate(['/login']);
    return true;
  }

  isLoggedIn(): boolean {
    return this.loggedIn.value;
  }
}
