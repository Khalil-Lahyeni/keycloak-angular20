import { KeycloakOptions } from 'keycloak-angular';
import { environment } from '../environments/environment';

export const keycloakConfig: KeycloakOptions = {
  config: {
    url: environment.keycloak.url,
    realm: environment.keycloak.realm,
    clientId: environment.keycloak.clientId
  },
  initOptions: {
    onLoad: 'check-sso',
    checkLoginIframe: false
  },
  enableBearerInterceptor: true,
  bearerPrefix: 'Bearer',
  bearerExcludedUrls: ['/assets']
};
