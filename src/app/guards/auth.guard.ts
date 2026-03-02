import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/keycloak.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // Vérifier les rôles requis si spécifiés dans la route
    const requiredRoles = route.data?.['roles'] as string[] | undefined;
    
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => authService.hasRole(role));
      
      if (!hasRequiredRole) {
        // Rediriger vers une page d'accès refusé ou la page d'accueil
        router.navigate(['/login']);
        return false;
      }
    }
    
    return true;
  }

  // Rediriger vers la page de login si non authentifié
  router.navigate(['/login']);
  return false;
};
