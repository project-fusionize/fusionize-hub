import Keycloak from 'keycloak-js';

// Keycloak configuration
const keycloakConfig = {
    url: 'http://localhost:8080/',
    realm: 'fuz',
    clientId: 'fusionize-hub',
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
