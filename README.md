// src/app/app.ts
import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { RouterOutlet }   from '@angular/router';
import { NavbarComponent }  from './shared/layout/navbar/navbar';
import { SidebarComponent } from './shared/layout/sidebar/sidebar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent],
  templateUrl: './app.html',
  styleUrl:    './app.scss'
})
export class AppComponent implements OnInit {

  sidebarCollapsed = false;
  isMobile         = false;

  // ── Détecte la taille d'écran au resize ──
  @HostListener('window:resize')
  onResize(): void {
    this.isMobile = window.innerWidth <= 768;
    // Sur tablette/mobile → sidebar fermée par défaut
    if (this.isMobile) {
      this.sidebarCollapsed = true;
    }
  }

  ngOnInit(): void {
    this.onResize(); // applique dès le démarrage
  }

  onToggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  // Ferme la sidebar quand on clique sur l'overlay (mobile)
  onOverlayClick(): void {
    if (this.isMobile) {
      this.sidebarCollapsed = true;
    }
  }
}
