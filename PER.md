// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Intercepteur fonctionnel (Angular Standalone style).
 *
 * Ajoute automatiquement withCredentials: true
 * sur toutes les requêtes vers le Gateway.
 *
 * Cela garantit que le cookie SESSION est toujours envoyé
 * sans avoir à l'écrire manuellement dans chaque service.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // On ajoute withCredentials uniquement pour les appels vers le Gateway
  if (req.url.startsWith(environment.apiGatewayUrl)) {
    const cloned = req.clone({ withCredentials: true });
    return next(cloned);
  }
  return next(req);

};
