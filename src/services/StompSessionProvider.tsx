import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Client } from '@stomp/stompjs';
import { useAuth } from '../auth/AuthContext';

interface StompContextType {
    client: Client | null;
    connected: boolean;
}

const StompContext = createContext<StompContextType>({
    client: null,
    connected: false,
});

export const useStomp = () => useContext(StompContext);

import { CONFIG } from '../config';

const WS_URL = `${CONFIG.API_BASE_URL.replace(/^http/, 'ws')}/ws/1.0`;

export const StompSessionProvider = ({ children }: { children: ReactNode }) => {
    const { token, isAuthenticated } = useAuth();
    const [connected, setConnected] = useState(false);
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !token) {
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
                setConnected(false);
            }
            return;
        }

        // Avoid reconnecting if token is same and already connected?
        // Actually, if token changes, we probably should reconnect.
        // For now, simpler logic: if we have a client, check if we need to recreate.

        if (clientRef.current && clientRef.current.active) {
            return;
        }

        const client = new Client({
            brokerURL: WS_URL,
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log('STOMP: Connected Global Session');
                setConnected(true);
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
            onWebSocketClose: () => {
                console.log('STOMP: WebSocket Closed');
                setConnected(false);
            },
            onDisconnect: () => {
                setConnected(false);
            }
        });

        client.activate();
        clientRef.current = client;

        return () => {
            // We don't necessarily want to deactivate on every render if dependencies change 
            // but here the only dependency is token/auth. 
            // If component unmounts (e.g. strict mode logs out), we deactivate.
            // Ideally we might want a persistent connection across route changes if the provider is at top level.
        };
    }, [isAuthenticated, token]);

    // Cleanup on unmount of provider (app close)
    useEffect(() => {
        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
            }
        };
    }, []);

    return (
        <StompContext.Provider value={{ client: clientRef.current, connected }}>
            {children}
        </StompContext.Provider>
    );
};
