import React, {
    createContext,
    useState,
    useEffect,
    useContext,
    type ReactNode
} from "react";
import keycloak from "./keycloak";
import type { KeycloakProfile } from "keycloak-js";

interface AuthContextType {
    isAuthenticated: boolean;
    userProfile: KeycloakProfile | undefined;
    login: () => void;
    logout: () => void;
    token: string | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Prevent multiple init attempts
let initPromise: Promise<boolean> | null = null;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userProfile, setUserProfile] = useState<KeycloakProfile | undefined>(undefined);
    const [token, setToken] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    // -----------------------------
    // 1) Initialize Keycloak
    // -----------------------------
    useEffect(() => {
        const initKeycloak = async () => {
            if (!initPromise) {
                initPromise = keycloak.init({
                    onLoad: "login-required",
                    checkLoginIframe: false,
                });
            }

            try {
                const authenticated = await initPromise;

                setIsAuthenticated(authenticated);
                setToken(keycloak.token ?? undefined);

                if (authenticated) {
                    try {
                        const profile = await keycloak.loadUserProfile();
                        setUserProfile(profile);
                    } catch (err) {
                        console.warn("Failed to load profile:", err);
                    }
                }
            } catch (err) {
                console.error("Keycloak initialization failed:", err);
            } finally {
                setLoading(false);
            }
        };

        initKeycloak();
    }, []);

    // -----------------------------
    // 2) Token Refresh Interval
    // -----------------------------
    useEffect(() => {
        if (!isAuthenticated) return;

        const interval = setInterval(() => {
            keycloak
                .updateToken(30)
                .then((refreshed) => {
                    if (refreshed) {
                        setToken(keycloak.token ?? undefined);
                        // console.log("Token refreshed");
                    }
                })
                .catch((err) => {
                    console.error("Failed to refresh token:", err);
                    keycloak.login();
                });
        }, 10000); // check every 10s

        return () => clearInterval(interval);
    }, [isAuthenticated]);

    const login = () => {
        keycloak.login({ redirectUri: window.location.origin });
    };

    const logout = () => {
        keycloak.logout({ redirectUri: window.location.origin });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
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
                token
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used inside <AuthProvider>");
    }
    return ctx;
};
