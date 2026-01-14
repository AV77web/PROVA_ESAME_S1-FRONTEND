// =================================================
// File: api.js
// Service per la gestione delle chiamate API con HttpOnly Cookie
// @author: Full Stack Senior Developer
// @version: 2.0.0 2026-01-14
// =================================================

const API_BASE_URL = import.meta.env.PROD
    ? "https://prova-esame-s1-backend.onrender.com"
    : "http://localhost:3000";

/**
 * Funzione di utilità per gestire le risposte delle API
 */
const handleResponse = async (response) => {
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Si è verificato un errore');
    }

    return data;
};

/**
 * API per il login utente
 * Il backend imposta automaticamente il cookie HttpOnly
 * @param {string} email - Email dell'utente
 * @param {string} password - Password dell'utente
 * @returns {Promise<Object>} - Dati utente e messaggio di successo
 */
export const loginUser = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // FONDAMENTALE: invia e riceve cookie HttpOnly
        body: JSON.stringify({ email, password }),
    });

    return handleResponse(response);
};

/**
 * API per la registrazione utente
 * @param {Object} userData - Dati dell'utente da registrare
 * @param {string} userData.nome - Nome dell'utente
 * @param {string} userData.cognome - Cognome dell'utente
 * @param {string} userData.email - Email dell'utente
 * @param {string} userData.password - Password dell'utente
 * @param {string} [userData.ruolo] - Ruolo dell'utente (opzionale)
 * @returns {Promise<Object>} - Dati utente registrato
 */
export const registerUser = async (userData) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
    });

    return handleResponse(response);
};

/**
 * API per verificare lo stato di autenticazione
 * Controlla se esiste un cookie HttpOnly valido
 * @returns {Promise<Object>} - { authenticated: boolean, user: Object }
 */
export const verifyAuth = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // FONDAMENTALE: invia il cookie HttpOnly
        });

        if (!response.ok) {
            // Se la risposta è 401 o 403, l'utente non è autenticato
            if (response.status === 401 || response.status === 403) {
                return { authenticated: false, user: null };
            }
            throw new Error('Errore nella verifica dell\'autenticazione');
        }

        return handleResponse(response);
    } catch (error) {
        console.error('Errore verifica autenticazione:', error);
        return { authenticated: false, user: null };
    }
};

/**
 * API per il logout utente
 * Il backend rimuove il cookie HttpOnly
 * @returns {Promise<Object>}
 */
export const logoutUser = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // FONDAMENTALE: invia il cookie per poterlo cancellare
        });

        return handleResponse(response);
    } catch (error) {
        console.error('Errore durante il logout:', error);
        // Anche se il logout fallisce, consideriamo l'utente come logout
        return { message: 'Logout effettuato lato client' };
    }
};
