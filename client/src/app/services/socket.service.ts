import { Injectable, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Router } from '@angular/router';
import { conexion } from '../../environments/environment';
import { BehaviorSubject, timer, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private bc: BroadcastChannel | null = null;

  public connected$ = new BehaviorSubject<boolean>(false);
  public contenidoUpdate$ = new BehaviorSubject<void>(undefined);
  public solicitudUpdatedToUser$ = new BehaviorSubject<any>(null);
  public solicitudUpdateToApprover$ = new BehaviorSubject<any>(null);
  public recursoUpdate$ = new BehaviorSubject<void>(undefined);

  private forceLogoutSource = new Subject<any>();
  public forceLogout$ = this.forceLogoutSource.asObservable();

  constructor(
    private router: Router,
    private ngZone: NgZone,
  ) {
    try {
      this.bc = new BroadcastChannel('app-auth');
      this.bc.onmessage = (ev) => {
        if (ev && ev.data) {
          if (ev.data.type === 'FORCE_LOGOUT') {
            this.handleForceLogout(ev.data.payload, false);
          } else if (ev.data.type === 'CONNECT_WITH_TOKEN') {
            const token = ev.data.payload?.token;
            if (token) this.connect(token);
          }
        }
      };
    } catch (err) {
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
      reconnection: false,
      forceNew: true,
    });

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;
      this.connected$.next(true);
    });

    this.socket.on('disconnect', (reason: any) => {
      this.connected$.next(false);

      if (reason !== 'io client disconnect') {
        this.scheduleReconnect();
      }
    });

    this.socket.on('connect_error', (err: any) => {
      console.error('Socket connect error', err?.message || err);

      if (
        err &&
        (err.message === 'AUTH_FAILED' ||
          err.message === 'TOKEN_INVALIDATED' ||
          err.message === 'AUTH_MISSING')
      ) {
        this.handleForceLogout({ reason: 'AUTH_FAILED' });
      } else {
        this.scheduleReconnect();
      }
    });

    this.socket.on('forceLogout', (payload: any) => {
      this.handleForceLogout(payload);
    });

    this.socket.on('contenidoUpdated', (payload: any) => {
      this.ngZone.run(() => {
        this.contenidoUpdate$.next(undefined);
      });
    });

    this.socket.on('recursoUpdated', (payload: any) => {
      this.ngZone.run(() => {
        this.recursoUpdate$.next(undefined);
      });
    });

    this.socket.on('solicitudUpdatedToUser', (payload: any) => {
      this.ngZone.run(() => {
        this.solicitudUpdatedToUser$.next(payload);
      });
    });

    this.socket.on('solicitudUpdatedToApprover', (payload: any) => {
      console.warn(
        'Actualización de solicitud recibida al aprobador (socket):',
        payload,
      );

      this.ngZone.run(() => {
        this.solicitudUpdateToApprover$.next(payload);
      });
    });
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('Max reconnection attempts reached');
      return;
    }
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
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
      this.socket.off();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on<T = any>(eventName: string, cb: (payload: T) => void) {
    if (!this.socket) return;
    this.socket.on(eventName, (payload: T) => {
      this.ngZone.run(() => cb(payload));
    });
  }

  emit(eventName: string, payload?: any) {
    if (!this.socket) return;
    this.socket.emit(eventName, payload);
  }

  private handleForceLogout(payload: any, broadcast = true) {
    console.warn('handleForceLogout local', payload);

    if (this.bc && broadcast) {
      this.bc.postMessage({ type: 'FORCE_LOGOUT', payload });
    }
    this.disconnect();
    this.forceLogoutSource.next(payload);
  }

  reconnectWithToken(newToken: string) {
    if (!newToken) return;

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
