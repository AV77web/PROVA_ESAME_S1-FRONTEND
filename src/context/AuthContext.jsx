// =================================================
// File: AuthContext.jsx
// Context per la gestione dello stato di autenticazione con HttpOnly Cookie
// @author: Full Stack Senior Developer
// @version: 2.0.0 2026-01-14
// =================================================

import { createContext, useState, useContext, useEffect } from 'react';
import { verifyAuth, logoutUser } from '../services/api';

const AuthContext = createContext(null);

/**
 * Hook personalizzato per accedere al contesto di autenticazione
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve essere usato all\'interno di un AuthProvider');
    }
    return context;
};

/**
 * Provider del contesto di autenticazione
 * IMPORTANTE: NON usa localStorage, si affida completamente ai cookie HttpOnly
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    /**
     * Verifica l'autenticazione controllando il cookie HttpOnly tramite API
     * Questa funzione viene chiamata all'avvio dell'app
     */
    const checkAuth = async () => {
        console.log('[AUTH] Verifica autenticazione in corso...');
        setLoading(true);

        try {
            const response = await verifyAuth();

            if (response.authenticated && response.user) {
                console.log('[AUTH] Utente autenticato:', response.user.email);
                setUser(response.user);
            } else {
                console.log('[AUTH] Nessun utente autenticato');
                setUser(null);
            }
        } catch (error) {
            console.error('[AUTH] Errore durante la verifica:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Verifica l'autenticazione all'avvio dell'applicazione
    useEffect(() => {
        checkAuth();
    }, []);

    /**
     * Effettua il login salvando i dati utente in memoria (non localStorage)
     * Il cookie HttpOnly viene gestito automaticamente dal browser
     * @param {Object} userData - Dati dell'utente ricevuti dal backend
     */
    const login = (userData) => {
        console.log('[AUTH] Login effettuato per:', userData.email);
        setUser(userData);
        // NON salviamo in localStorage - l'autenticazione è gestita dal cookie HttpOnly
    };

    /**
     * Effettua il logout rimuovendo i dati utente e il cookie HttpOnly
     */
    const logout = async () => {
        console.log('[AUTH] Logout in corso...');

        try {
            // Chiama l'API per rimuovere il cookie HttpOnly server-side
            await logoutUser();
            console.log('[AUTH] Logout completato');
        } catch (error) {
            console.error('[AUTH] Errore durante il logout:', error);
        } finally {
            // Rimuove i dati utente dallo state indipendentemente dal risultato
            setUser(null);
        }
    };

    /**
     * Verifica se l'utente è autenticato
     * @returns {boolean}
     */
    const isAuthenticated = () => {
        return user !== null;
    };

    /**
     * Ricarica lo stato di autenticazione (utile dopo operazioni che potrebbero invalidare il cookie)
     */
    const refreshAuth = async () => {
        await checkAuth();
    };

    const value = {
        user,
        login,
        logout,
        isAuthenticated,
        refreshAuth,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
