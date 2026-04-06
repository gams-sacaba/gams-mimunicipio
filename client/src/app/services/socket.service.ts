// src/app/services/socket.service.ts
import { Injectable, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Router } from '@angular/router';
import { conexion } from '../../environments/environment.prod';
import { BehaviorSubject, timer, Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private bc: BroadcastChannel | null = null;

  // estado observable para UI si quieres mostrar conectado/desconectado
  public connected$ = new BehaviorSubject<boolean>(false);
  public contenidoUpdate$ = new BehaviorSubject<void>(undefined);
  public solicitudUpdatedToUser$ = new BehaviorSubject<any>(null);
  public solicitudUpdateToApprover$ = new BehaviorSubject<any>(null);

  constructor(
    private router: Router,
    private ngZone: NgZone,
  ) {
    // BroadcastChannel para coordinar entre pestañas (name arbitrario)
    try {
      this.bc = new BroadcastChannel('app-auth');
      this.bc.onmessage = (ev) => {
        if (ev && ev.data) {
          if (ev.data.type === 'FORCE_LOGOUT') {
            this.handleForceLogout(ev.data.payload, false);
          } else if (ev.data.type === 'CONNECT_WITH_TOKEN') {
            // otra pestaña dice que se autenticó: intenta conectar con token
            const token = ev.data.payload?.token;
            if (token) this.connect(token);
          }
        }
      };
    } catch (err) {
      // BroadcastChannel no disponible (navegadores viejos)
      this.bc = null;
    }
  }

  connect(token?: string) {
    const authToken = token || localStorage.getItem('token');
    if (!authToken) return;

    if (this.socket && this.socket.connected) return;

    this.socket = io(conexion.server.base_url, {
      auth: { token: authToken },
      transports: ['websocket'],
      reconnection: false, // control manual
      forceNew: true,
    });

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;
      this.connected$.next(true);
      //console.log('Socket conectado', this.socket?.id);
    });

    this.socket.on('disconnect', (reason: any) => {
      this.connected$.next(false);
      //console.log('Socket desconectado', reason);
      // Si desconexión inesperada, intentar reconectar
      if (reason !== 'io client disconnect') {
        this.scheduleReconnect();
      }
    });

    this.socket.on('connect_error', (err: any) => {
      console.error('Socket connect error', err?.message || err);
      // Si el error viene de autenticación, forzar logout
      if (
        err &&
        (err.message === 'AUTH_FAILED' ||
          err.message === 'TOKEN_INVALIDATED' ||
          err.message === 'AUTH_MISSING')
      ) {
        this.handleForceLogout({ reason: 'AUTH_FAILED' });
      } else {
        // otros errores: intentar reconexión escalonada
        this.scheduleReconnect();
      }
    });

    // Event: forceLogout desde servidor
    this.socket.on('forceLogout', (payload: any) => {
      //console.warn('Forzado logout recibido (socket):', payload);
      this.handleForceLogout(payload);
    });

    // NUEVO LISTENER: Escucha el evento de actualización de contenidos
    this.socket.on('contenidoUpdated', (payload: any) => {
      //console.warn('Actualización de contenidos recibida (socket):', payload);
      // Notifica a todos los suscriptores que deben recargar
      this.ngZone.run(() => {
        this.contenidoUpdate$.next(undefined);
      });
    });

    this.socket.on('solicitudUpdatedToUser', (payload: any) => {
      //console.warn('Actualización de solicitud recibida (socket):', payload);
      // Notifica a los suscriptores con los datos de la solicitud
      this.ngZone.run(() => {
        this.solicitudUpdatedToUser$.next(payload);
      });
    });

    this.socket.on('solicitudUpdatedToApprover', (payload: any) => {
      console.warn(
        'Actualización de solicitud recibida al aprobador (socket):',
        payload,
      );
      // Notifica a los suscriptores con los datos de la solicitud
      this.ngZone.run(() => {
        this.solicitudUpdateToApprover$.next(payload);
      });
    });

    // Ejemplo de evento de datos en tiempo real
    // this.socket.on('newData', (payload) => { ... });

    // protecciones: ping/pong: si lo necesitas -> socket.emit('pingServer')
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('Max reconnection attempts reached');
      return;
    }
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // backoff
    console.log(
      `Reconectando en ${delay} ms (intento ${this.reconnectAttempts})`,
    );
    timer(delay).subscribe(() => {
      const token = localStorage.getItem('token');
      if (token) {
        this.connect(token);
      }
    });
  }

  disconnect() {
    this.reconnectAttempts = 0;
    this.connected$.next(false);
    if (this.socket) {
      this.socket.off(); // limpiar listeners
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on<T = any>(eventName: string, cb: (payload: T) => void) {
    if (!this.socket) return;
    this.socket.on(eventName, (payload: T) => {
      // asegurar ejecución dentro de NgZone para que detecte cambios en Angular
      this.ngZone.run(() => cb(payload));
    });
  }

  emit(eventName: string, payload?: any) {
    if (!this.socket) return;
    this.socket.emit(eventName, payload);
  }

  // Cuando recibimos forceLogout: limpiamos y notificamos otras pestañas
  private handleForceLogout(payload: any, broadcast = true) {
    // limpiar storage / redirección desde AuthService idealmente
    console.warn('handleForceLogout local', payload);
    // Notificar otras pestañas
    if (this.bc && broadcast) {
      this.bc.postMessage({ type: 'FORCE_LOGOUT', payload });
    }
    // realizar limpieza local
    localStorage.removeItem('token');
    // redirigir fuera de NgZone para evitar problemas en rutas
    this.disconnect();
    this.ngZone.run(() => this.router.navigate(['/login']));
  }

  // reconnect with a freshly issued token (e.g. after refresh)
  reconnectWithToken(newToken: string) {
    if (!newToken) return;
    // informar otras pestañas para que se conecten también
    if (this.bc) {
      this.bc.postMessage({
        type: 'CONNECT_WITH_TOKEN',
        payload: { token: newToken },
      });
    }
    this.disconnect();
    localStorage.setItem('token', newToken);
    this.connect(newToken);
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}
