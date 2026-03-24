// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

/**
 * Guard fonctionnel (Angular Standalone style).
 *
 * Vérifie si l'utilisateur a une session valide côté Gateway.
 * Si oui  → accès à la route autorisé.
 * Si non  → redirection automatique vers Keycloak via le Gateway.
 */
export const authGuard: CanActivateFn = () => {
  const http        = inject(HttpClient);
  const authService = inject(AuthService);
  const router      = inject(Router);

  return http
    .get<any>(`${environment.apiGatewayUrl}/api/auth/userinfo`, {
      withCredentials: true
    })
    .pipe(
      map((user) => {
        // Session valide → charge les infos et autorise l'accès
        authService.loadUserInfo();
        return true;
      }),
      catchError(() => {
        // Pas de session → le Gateway redirigera vers Keycloak
        // On redirige vers une page intermédiaire qui déclenche le login
        window.location.href = `${environment.apiGatewayUrl}/api/auth/login`;
        return of(false);
      })
    );
};
