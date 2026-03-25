// src/app/shared/layout/navbar/navbar.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl:    './navbar.scss'
})
export class NavbarComponent {

  // Permet au parent (app) de toggler la sidebar
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(public authService: AuthService) {}

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }
}
