// src/app/shared/layout/sidebar/sidebar.ts
import { Component, Input } from '@angular/core';
import { CommonModule }     from '@angular/common';
import { RouterModule }     from '@angular/router';

export interface MenuItem {
  label: string;
  icon:  string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl:    './sidebar.scss'
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Input() isMobile  = false;

  readonly menuItems: MenuItem[] = [
    { label: 'Dashboard',  icon: 'bi-speedometer2', route: '/dashboard'  },
    { label: 'Paramètres', icon: 'bi-gear',         route: '/parametres' }
  ];
}
