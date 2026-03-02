import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular';

import { routes } from './app.routes';
import { keycloakConfig } from './keycloak.config';

function initializeKeycloak(keycloak: KeycloakService) {
  return (): Promise<boolean> => {
    return new Promise((resolve) => {
      keycloak
        .init(keycloakConfig)
        .then((authenticated) => {
          console.log('Keycloak initialized, authenticated:', authenticated);
          resolve(authenticated);
        })
        .catch((error) => {
          console.error('Keycloak initialization failed:', error);
          // Résoudre avec false pour ne pas bloquer l'application
          resolve(false);
        });
    });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService]
    }
  ]
};
