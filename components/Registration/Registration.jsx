// =================================================
// File: Registration.jsx
// Componente per la pagina di registrazione
// @author: andrea.villari@allievi.itsdigitalacademy.com
// @version: 1.0.0 2026-01-14
// =================================================

import { useState } from 'react';
import { registerUser } from '../../src/services/api';
import './Registration.css';

const Registration = ({ onSwitchToLogin, onRegistrationSuccess }) => {
    const [formData, setFormData] = useState({
        nome: '',
        cognome: '',
        email: '',
        password: '',
        confirmPassword: '',
        ruolo: 'Dipendente'
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    /**
     * Gestisce i cambiamenti nei campi del form
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Rimuove l'errore del campo quando l'utente inizia a digitare
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        // Rimuove l'errore del server
        if (serverError) {
            setServerError('');
        }
    };

    /**
     * Valida il form prima dell'invio
     */
    const validateForm = () => {
        const newErrors = {};

        // Validazione nome
        if (!formData.nome.trim()) {
            newErrors.nome = 'Il nome è obbligatorio';
        } else if (formData.nome.trim().length < 2) {
            newErrors.nome = 'Il nome deve contenere almeno 2 caratteri';
        }

        // Validazione cognome
        if (!formData.cognome.trim()) {
            newErrors.cognome = 'Il cognome è obbligatorio';
        } else if (formData.cognome.trim().length < 2) {
            newErrors.cognome = 'Il cognome deve contenere almeno 2 caratteri';
        }

        // Validazione email
        if (!formData.email) {
            newErrors.email = 'L\'email è obbligatoria';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Inserisci un\'email valida';
        }

        // Validazione password
        if (!formData.password) {
            newErrors.password = 'La password è obbligatoria';
        } else if (formData.password.length < 6) {
            newErrors.password = 'La password deve essere di almeno 6 caratteri';
        }

        // Validazione conferma password
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Conferma la password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Le password non corrispondono';
        }

        // Validazione ruolo
        if (!formData.ruolo) {
            newErrors.ruolo = 'Seleziona un ruolo';
        } else if (formData.ruolo !== 'Dipendente' && formData.ruolo !== 'Responsabile') {
            newErrors.ruolo = 'Ruolo non valido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Gestisce l'invio del form
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        setSuccessMessage('');

        // Validazione lato client
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            // Prepara i dati da inviare (escludi confirmPassword)
            const { confirmPassword, ...userData } = formData;

            // Chiamata API per la registrazione
            const response = await registerUser(userData);

            console.log('Registrazione effettuata con successo:', response);

            // Mostra messaggio di successo
            setSuccessMessage('Registrazione completata con successo! Reindirizzamento al login...');

            // Reset del form
            setFormData({
                nome: '',
                cognome: '',
                email: '',
                password: '',
                confirmPassword: '',
                ruolo: 'Dipendente'
            });

            // Reindirizza al login dopo 2 secondi
            setTimeout(() => {
                if (onRegistrationSuccess) {
                    onRegistrationSuccess(response.user);
                }
                if (onSwitchToLogin) {
                    onSwitchToLogin();
                }
            }, 2000);
        } catch (error) {
            console.error('Errore durante la registrazione:', error);
            setServerError(error.message || 'Si è verificato un errore durante la registrazione');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="registration-container">
            <div className="registration-card">
                <h2 className="registration-title">Crea un account</h2>
                <p className="registration-subtitle">Inserisci i tuoi dati per registrarti</p>

                <form onSubmit={handleSubmit} className="registration-form" noValidate>
                    {/* Messaggio di errore del server */}
                    {serverError && (
                        <div className="error-banner">
                            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{serverError}</span>
                        </div>
                    )}

                    {/* Messaggio di successo */}
                    {successMessage && (
                        <div className="success-banner">
                            <svg className="success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {/* Riga con Nome e Cognome */}
                    <div className="form-row">
                        {/* Campo Nome */}
                        <div className="form-group">
                            <label htmlFor="nome" className="form-label">
                                Nome
                            </label>
                            <input
                                type="text"
                                id="nome"
                                name="nome"
                                value={formData.nome}
                                onChange={handleChange}
                                className={`form-input ${errors.nome ? 'form-input-error' : ''}`}
                                placeholder="Mario"
                                disabled={isLoading}
                                autoComplete="given-name"
                            />
                            {errors.nome && (
                                <p className="form-error">{errors.nome}</p>
                            )}
                        </div>

                        {/* Campo Cognome */}
                        <div className="form-group">
                            <label htmlFor="cognome" className="form-label">
                                Cognome
                            </label>
                            <input
                                type="text"
                                id="cognome"
                                name="cognome"
                                value={formData.cognome}
                                onChange={handleChange}
                                className={`form-input ${errors.cognome ? 'form-input-error' : ''}`}
                                placeholder="Rossi"
                                disabled={isLoading}
                                autoComplete="family-name"
                            />
                            {errors.cognome && (
                                <p className="form-error">{errors.cognome}</p>
                            )}
                        </div>
                    </div>

                    {/* Campo Email */}
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`form-input ${errors.email ? 'form-input-error' : ''}`}
                            placeholder="esempio@email.com"
                            disabled={isLoading}
                            autoComplete="email"
                        />
                        {errors.email && (
                            <p className="form-error">{errors.email}</p>
                        )}
                    </div>

                    {/* Campo Password */}
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`form-input ${errors.password ? 'form-input-error' : ''}`}
                            placeholder="••••••••"
                            disabled={isLoading}
                            autoComplete="new-password"
                        />
                        {errors.password && (
                            <p className="form-error">{errors.password}</p>
                        )}
                    </div>

                    {/* Campo Conferma Password */}
                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">
                            Conferma Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`form-input ${errors.confirmPassword ? 'form-input-error' : ''}`}
                            placeholder="••••••••"
                            disabled={isLoading}
                            autoComplete="new-password"
                        />
                        {errors.confirmPassword && (
                            <p className="form-error">{errors.confirmPassword}</p>
                        )}
                    </div>

                    {/* Campo Ruolo */}
                    <div className="form-group">
                        <label htmlFor="ruolo" className="form-label">
                            Ruolo
                        </label>
                        <select
                            id="ruolo"
                            name="ruolo"
                            value={formData.ruolo}
                            onChange={handleChange}
                            className={`form-select ${errors.ruolo ? 'form-input-error' : ''}`}
                            disabled={isLoading}
                        >
                            <option value="Dipendente">Dipendente</option>
                            <option value="Responsabile">Responsabile</option>
                        </select>
                        {errors.ruolo && (
                            <p className="form-error">{errors.ruolo}</p>
                        )}
                    </div>

                    {/* Pulsante Submit */}
                    <button
                        type="submit"
                        className="btn-submit"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner"></span>
                                Registrazione in corso...
                            </>
                        ) : (
                            'Registrati'
                        )}
                    </button>
                </form>

                {/* Link al login */}
                <div className="registration-footer">
                    <p>
                        Hai già un account?{' '}
                        <button
                            type="button"
                            onClick={onSwitchToLogin}
                            className="link-button"
                            disabled={isLoading}
                        >
                            Accedi
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Registration;
