// src/app/core/services/auth.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface UserInfo {
  sub:                string;
  preferred_username: string;
  email:              string;
  given_name?:        string;
  family_name?:       string;
  roles?:             string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  // ── Signals (état réactif Angular 20) ──
  private _user    = signal<UserInfo | null>(null);
  private _loading = signal<boolean>(false);

  // ── Computed publics ──
  readonly user        = computed(() => this._user());
  readonly isLoggedIn  = computed(() => this._user() !== null);
  readonly loading     = computed(() => this._loading());
  readonly username    = computed(() => this._user()?.preferred_username ?? '');

  constructor(
    private http:   HttpClient,
    private router: Router
  ) {}

  /**
   * Récupère les infos utilisateur depuis le Gateway.
   * Le Gateway lit la session Redis et renvoie les infos du JWT.
   * Angular ne touche jamais le JWT directement.
   */
  loadUserInfo(): void {
    this._loading.set(true);
    this.http
      .get<UserInfo>(`${environment.apiGatewayUrl}/api/auth/userinfo`, {
        withCredentials: true  // envoie le cookie SESSION
      })
      .subscribe({
        next: (user) => {
          this._user.set(user);
          this._loading.set(false);
        },
        error: () => {
          this._user.set(null);
          this._loading.set(false);
        }
      });
  }

  /**
   * Redirige vers le Gateway qui redirige vers Keycloak.
   * Angular ne contacte jamais Keycloak directement.
   */
  login(): void {
    // Le Gateway gère la redirection OAuth2 → Keycloak
    window.location.href = `${environment.apiGatewayUrl}/api/collecte/ping`;
  }

  /**
   * Logout via le Gateway → Keycloak invalide la session SSO
   * puis redirige vers Angular.
   */
  logout(): void {
    this._user.set(null);
    window.location.href = `${environment.apiGatewayUrl}/logout`;
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique.
   */
  hasRole(role: string): boolean {
    return this._user()?.roles?.includes(role) ?? false;
  }
}
