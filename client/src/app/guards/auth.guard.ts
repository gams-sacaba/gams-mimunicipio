import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, combineLatest } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | boolean {
    const moduleName = route.data['module'] as string;

    return combineLatest([this.authService.getAccessibleModules()]).pipe(
      take(1),
      map(([accessibleModules]) => {
        if (!this.authService.isLoggedIn()) {
          this.router.navigate(['/login']);
          return false;
        }

        if (
          !accessibleModules ||
          typeof accessibleModules !== 'object' ||
          Object.keys(accessibleModules).length === 0
        ) {
          this.authService.logout();
          return false;
        }

        const posiblesModulos = ['bandeja', 'datos', 'solicitudes'];

        const userModules = Object.keys(accessibleModules).map((k) =>
          k.toLowerCase(),
        );
        const validUserModules = userModules.filter((m) =>
          posiblesModulos.includes(m),
        );

        if (validUserModules.length === 0) {
          this.authService.logout();
          return false;
        }

        const normalizedModule = moduleName?.trim().toLowerCase();
        if (normalizedModule && !validUserModules.includes(normalizedModule)) {
          if (validUserModules.length > 0) {
            this.router.navigate([`/${validUserModules[0]}`]);
          } else {
            this.authService.logout();
          }
          return false;
        }

        return true;
      }),
    );
  }
}
