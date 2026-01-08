/* eslint-disable @typescript-eslint/no-explicit-any */
const env = (window as any).env || {};

export const CONFIG = {
    API_BASE_URL: env.APP_API_BASE_URL || import.meta.env.APP_API_BASE_URL || 'http://localhost:8081',
    KEYCLOAK: {
        URL: env.APP_KEYCLOAK_URL || import.meta.env.APP_KEYCLOAK_URL || 'http://localhost:8080/',
        REALM: env.APP_KEYCLOAK_REALM || import.meta.env.APP_KEYCLOAK_REALM || 'fuz',
        CLIENT_ID: env.APP_KEYCLOAK_CLIENT_ID || import.meta.env.APP_KEYCLOAK_CLIENT_ID || 'fusionize-hub',
    }
};
