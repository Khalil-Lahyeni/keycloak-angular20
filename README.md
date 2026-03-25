// src/app/layout/sidebar/sidebar.ts
import { Component, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon:  string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl:    './sidebar.scss'
})
export class SidebarComponent {

  readonly navItems: NavItem[] = [
    { label: 'Dashboard',   icon: 'bi-speedometer2',  route: '/dashboard'   },
    { label: 'Équipements', icon: 'bi-cpu',            route: '/equipements' },
    { label: 'Alertes',     icon: 'bi-bell',           route: '/alertes'     },
    { label: 'Maintenance', icon: 'bi-tools',          route: '/maintenance' },
    { label: 'Rapports',    icon: 'bi-bar-chart-line', route: '/rapports'    },
  ];

  readonly username = computed(() => this.authService.username());

  constructor(public authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}
