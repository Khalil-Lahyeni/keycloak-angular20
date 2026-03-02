import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile, KeycloakTokenParsed } from 'keycloak-js';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserRegistration {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly keycloakService = inject(KeycloakService);
  private readonly http = inject(HttpClient);

  private readonly keycloakUrl = environment.keycloak.url;
  private readonly realm = environment.keycloak.realm;
  private readonly clientId = environment.keycloak.clientId;

  isLoggedIn(): boolean {
    return this.keycloakService.isLoggedIn();
  }

  hasRole(role: string): boolean {
    return this.keycloakService.isUserInRole(role);
  }

  getRoles(): string[] {
    return this.keycloakService.getUserRoles();
  }

  async getUserProfile(): Promise<KeycloakProfile> {
    return this.keycloakService.loadUserProfile();
  }

  getTokenParsed(): KeycloakTokenParsed | undefined {
    return this.keycloakService.getKeycloakInstance().tokenParsed;
  }

  /**
   * Récupère le nom d'utilisateur
   */
  getUsername(): string {
    return this.keycloakService.getUsername();
  }

  /**
   * Récupère le token d'accès
   */
  async getToken(): Promise<string> {
    return this.keycloakService.getToken();
  }

  /**
   * Connecte l'utilisateur - redirige vers Keycloak
   */
  login(): void {
    this.keycloakService.login({
      redirectUri: window.location.origin + '/home'
    });
  }

  /**
   * Déconnecte l'utilisateur
   */
  logout(): void {
    this.keycloakService.logout(window.location.origin + '/login');
  }

  /**
   * Redirige vers la page de gestion du compte Keycloak
   */
  accountManagement(): void {
    this.keycloakService.getKeycloakInstance().accountManagement();
  }

  /**
   * Met à jour le token si nécessaire
   */
  async updateToken(minValidity: number = 5): Promise<boolean> {
    return this.keycloakService.updateToken(minValidity);
  }

  /**
   * Redirige vers la page d'inscription native de Keycloak
   */
  registerWithKeycloak(): void {
    const registrationUrl = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/registrations`;
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: window.location.origin + '/login',
      response_type: 'code',
      scope: 'openid'
    });
    
    window.location.href = `${registrationUrl}?${params.toString()}`;
  }

  /**
   * Inscription via l'API Keycloak Admin
   * Note: Nécessite un token admin ou un service account configuré
   * Pour la production, cette logique devrait être dans un backend
   */
  async register(user: UserRegistration): Promise<void> {
    // Obtenir un token admin (pour développement uniquement)
    // En production, utilisez un backend sécurisé
    const adminToken = await this.getAdminToken();
    
    const url = `${this.keycloakUrl}/admin/realms/${this.realm}/users`;
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    });

    const userRepresentation = {
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      enabled: true,
      emailVerified: false,
      credentials: [{
        type: 'password',
        value: user.password,
        temporary: false
      }]
    };

    try {
      await firstValueFrom(this.http.post(url, userRepresentation, { headers }));
    } catch (error: any) {
      if (error.status === 409) {
        throw new Error('Un utilisateur avec ce nom ou cet email existe déjà');
      }
      throw new Error('Erreur lors de la création du compte');
    }
  }

  /**
   * Obtient un token admin pour l'API Keycloak
   * ATTENTION: Ne pas utiliser en production côté client!
   * Cette méthode est pour le développement uniquement.
   * En production, créez un endpoint backend sécurisé.
   */
  private async getAdminToken(): Promise<string> {
    const tokenUrl = `${this.keycloakUrl}/realms/master/protocol/openid-connect/token`;
    
    const body = new URLSearchParams({
      grant_type: 'password',
      client_id: 'actia-app',
      username: environment.admin.username,
      password: environment.admin.password
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    try {
      const response: any = await firstValueFrom(
        this.http.post(tokenUrl, body.toString(), { headers })
      );
      return response.access_token;
    } catch (error) {
      console.error('Failed to get admin token:', error);
      throw new Error('Impossible de se connecter au serveur d\'authentification');
    }
  }
}
