import Keycloak from 'keycloak-js';
import { CONFIG } from '../config';

// Keycloak configuration
const keycloakConfig = {
    url: CONFIG.KEYCLOAK.URL,
    realm: CONFIG.KEYCLOAK.REALM,
    clientId: CONFIG.KEYCLOAK.CLIENT_ID,
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
