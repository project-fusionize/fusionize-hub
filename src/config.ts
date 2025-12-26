export const CONFIG = {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081',
    KEYCLOAK: {
        URL: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080/',
        REALM: import.meta.env.VITE_KEYCLOAK_REALM || 'fuz',
        CLIENT_ID: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'fusionize-hub',
    }
};
