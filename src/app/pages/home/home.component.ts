import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/keycloak.service';
import { KeycloakProfile } from 'keycloak-js';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private readonly authService = inject(AuthService);
  
  userProfile = signal<KeycloakProfile | null>(null);
  username = signal<string>('');
  roles = signal<string[]>([]);
  token = signal<string>('');
  showToken = signal<boolean>(false);

  async ngOnInit(): Promise<void> {
    if (this.authService.isLoggedIn()) {
      this.username.set(this.authService.getUsername());
      this.roles.set(this.authService.getRoles());
      
      try {
        const profile = await this.authService.getUserProfile();
        this.userProfile.set(profile);
        
        const accessToken = await this.authService.getToken();
        this.token.set(accessToken);
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
      }
    }
  }

  toggleToken(): void {
    this.showToken.update(value => !value);
  }

  logout(): void {
    this.authService.logout();
  }

  manageAccount(): void {
    this.authService.accountManagement();
  }
}
