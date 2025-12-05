import React, { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import keycloak from './keycloak';
import type { KeycloakProfile } from 'keycloak-js';

interface AuthContextType {
    isAuthenticated: boolean;
    userProfile: KeycloakProfile | undefined;
    login: () => void;
    logout: () => void;
    token: string | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [userProfile, setUserProfile] = useState<KeycloakProfile | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const initKeycloak = async () => {
            try {
                const authenticated = await keycloak.init({
                    onLoad: 'login-required', // Force login on load
                    checkLoginIframe: false,
                });

                setIsAuthenticated(authenticated);

                if (authenticated) {
                    const profile = await keycloak.loadUserProfile();
                    setUserProfile(profile);
                }
            } catch (error) {
                console.error('Failed to initialize Keycloak:', error);
            } finally {
                setLoading(false);
            }
        };

        initKeycloak();
    }, []);

    const login = () => {
        keycloak.login();
    };

    const logout = () => {
        keycloak.logout();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                userProfile,
                login,
                logout,
                token: keycloak.token,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
