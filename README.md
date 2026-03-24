// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  // ── Page callback après login Keycloak ──
  {
    path: 'callback',
    loadComponent: () =>
      import('./features/auth/callback/callback.component')
        .then(m => m.CallbackComponent)
  },

  // ── Routes protégées par authGuard ──
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },

  // ── Redirect par défaut ──
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  // ── Route inconnue ──
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
