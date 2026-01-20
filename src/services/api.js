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

// =================================================
// API PER LA GESTIONE DEI PERMESSI
// =================================================

/**
 * Ottieni tutte le categorie di permesso
 * @returns {Promise<Object>} - Lista delle categorie
 */
export const getCategorie = async () => {
    const response = await fetch(`${API_BASE_URL}/categorie`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    return handleResponse(response);
};

/**
 * Ottieni una singola categoria di permesso
 * @param {number} id - ID della categoria
 * @returns {Promise<Object>} - Dettagli della categoria
 */
export const getCategoria = async (id) => {
    const response = await fetch(`${API_BASE_URL}/categorie/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    return handleResponse(response);
};

/**
 * Crea una nuova categoria di permesso (solo Responsabile)
 * @param {Object} categoriaData - Dati della categoria
 * @param {number} categoriaData.categoriaId - ID della categoria
 * @param {string} categoriaData.descrizione - Descrizione della categoria
 * @returns {Promise<Object>} - Categoria creata
 */
export const createCategoria = async (categoriaData) => {
    const response = await fetch(`${API_BASE_URL}/categorie`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(categoriaData),
    });
    return handleResponse(response);
};

/**
 * Modifica una categoria di permesso esistente (solo Responsabile)
 * @param {number} id - ID della categoria
 * @param {Object} categoriaData - Dati aggiornati della categoria
 * @param {string} categoriaData.descrizione - Nuova descrizione
 * @returns {Promise<Object>} - Categoria modificata
 */
export const updateCategoria = async (id, categoriaData) => {
    const response = await fetch(`${API_BASE_URL}/categorie/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(categoriaData),
    });
    return handleResponse(response);
};

/**
 * Elimina una categoria di permesso (solo Responsabile)
 * @param {number} id - ID della categoria da eliminare
 * @returns {Promise<Object>} - Messaggio di conferma
 */
export const deleteCategoria = async (id) => {
    const response = await fetch(`${API_BASE_URL}/categorie/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    return handleResponse(response);
};

/**
 * Ottieni tutte le richieste di permesso (con filtri opzionali)
 * @param {Object} filters - Filtri per le richieste
 * @param {number} [filters.utenteId] - ID utente
 * @param {string} [filters.stato] - Stato della richiesta
 * @param {number} [filters.categoriaId] - ID categoria
 * @returns {Promise<Object>} - Lista delle richieste
 */
export const getPermessi = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.utenteId) params.append('utenteId', filters.utenteId);
    if (filters.stato) params.append('stato', filters.stato);
    if (filters.categoriaId) params.append('categoriaId', filters.categoriaId);

    const queryString = params.toString();
    const url = queryString ? `${API_BASE_URL}/permessi?${queryString}` : `${API_BASE_URL}/permessi`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    return handleResponse(response);
};

/**
 * Ottieni una singola richiesta di permesso
 * @param {number} id - ID della richiesta
 * @returns {Promise<Object>} - Dettagli della richiesta
 */
export const getPermesso = async (id) => {
    const response = await fetch(`${API_BASE_URL}/permessi/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    return handleResponse(response);
};

/**
 * Crea una nuova richiesta di permesso
 * @param {Object} permesso - Dati della richiesta
 * @param {string} permesso.dataInizio - Data di inizio
 * @param {string} permesso.dataFine - Data di fine
 * @param {number} permesso.categoriaId - ID categoria
 * @param {string} [permesso.motivazione] - Motivazione
 * @param {number} permesso.utenteId - ID utente richiedente
 * @returns {Promise<Object>} - Richiesta creata
 */
export const createPermesso = async (permesso) => {
    const response = await fetch(`${API_BASE_URL}/permessi`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(permesso),
    });
    return handleResponse(response);
};

/**
 * Modifica una richiesta di permesso (solo se propria e in attesa)
 * @param {number} id - ID della richiesta
 * @param {Object} permesso - Dati aggiornati
 * @param {string} permesso.dataInizio - Data di inizio
 * @param {string} permesso.dataFine - Data di fine
 * @param {number} permesso.categoriaId - ID categoria
 * @param {string} [permesso.motivazione] - Motivazione
 * @returns {Promise<Object>} - Richiesta aggiornata
 */
export const updatePermesso = async (id, permesso) => {
    const response = await fetch(`${API_BASE_URL}/permessi/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(permesso),
    });
    return handleResponse(response);
};

/**
 * Valuta una richiesta di permesso (approva o rifiuta)
 * @param {number} id - ID della richiesta
 * @param {string} stato - 'Approvato' o 'Rifiutato'
 * @param {number} utenteValutazioneId - ID del responsabile che valuta
 * @returns {Promise<Object>} - Richiesta aggiornata
 */
export const valutaPermesso = async (id, stato, utenteValutazioneId) => {
    const response = await fetch(`${API_BASE_URL}/permessi/${id}/valuta`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ stato, utenteValutazioneId }),
    });
    return handleResponse(response);
};

/**
 * Elimina una richiesta di permesso
 * Dipendenti: solo se propria e in attesa
 * Responsabili: possono eliminare anche richieste approvate
 * @param {number} id - ID della richiesta
 * @returns {Promise<Object>} - Messaggio di conferma
 */
export const deletePermesso = async (id) => {
    const response = await fetch(`${API_BASE_URL}/permessi/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    return handleResponse(response);
};

/**
 * Ottieni elenco richieste da approvare (solo per Responsabili)
 * @returns {Promise<Object>} - Lista delle richieste in attesa
 */
export const getRichiesteDaApprovare = async () => {
    const response = await fetch(`${API_BASE_URL}/permessi/da-approvare`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    return handleResponse(response);
};

/**
 * Approva una richiesta di permesso (solo Responsabili)
 * @param {number} id - ID della richiesta
 * @returns {Promise<Object>} - Richiesta approvata
 */
export const approvaRichiesta = async (id) => {
    const response = await fetch(`${API_BASE_URL}/permessi/${id}/approva`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    return handleResponse(response);
};

/**
 * Rifiuta una richiesta di permesso (solo Responsabili)
 * @param {number} id - ID della richiesta
 * @returns {Promise<Object>} - Richiesta rifiutata
 */
export const rifiutaRichiesta = async (id) => {
    const response = await fetch(`${API_BASE_URL}/permessi/${id}/rifiuta`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    return handleResponse(response);
};

/**
 * Ottieni statistiche aggregate delle richieste approvate (solo Responsabili)
 * Requisito Avanzato: Visualizzazione aggregata con numero totale di giorni
 * @param {Object} filters - Filtri opzionali
 * @param {number} [filters.utenteId] - ID utente/dipendente
 * @param {number} [filters.mese] - Mese (1-12)
 * @param {number} [filters.anno] - Anno (es: 2024)
 * @returns {Promise<Object>} - Statistiche aggregate per dipendente
 */
export const getStatistiche = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.utenteId) params.append('utenteId', filters.utenteId);
    if (filters.mese) params.append('mese', filters.mese);
    if (filters.anno) params.append('anno', filters.anno);

    const queryString = params.toString();
    const url = queryString
        ? `${API_BASE_URL}/permessi/statistiche?${queryString}`
        : `${API_BASE_URL}/permessi/statistiche`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    return handleResponse(response);
};