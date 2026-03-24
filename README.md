// src/app/app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [

    // ── Zone.js optimisé ──
    provideZoneChangeDetection({ eventCoalescing: true }),

    // ── Router ──
    provideRouter(routes),

    // ── HttpClient avec intercepteur auth ──
    // authInterceptor ajoute withCredentials: true automatiquement
    // sur tous les appels vers le Gateway → cookie SESSION envoyé
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),

  ]
};
