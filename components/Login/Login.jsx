// =================================================
// File: Login.jsx
// Componente per la pagina di login
// @author: andrea.villari@allievi.itsdigitalacademy.com
// @version: 1.0.0 2026-01-14
// =================================================

import { useState } from 'react';
import { useAuth } from '../../src/context/AuthContext';
import { loginUser } from '../../src/services/api';
import './Login.css';

const Login = ({ onSwitchToRegister, onLoginSuccess }) => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');

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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Gestisce l'invio del form
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');

        // Validazione lato client
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            // Chiamata API per il login
            const response = await loginUser(formData.email, formData.password);

            console.log('Login effettuato con successo:', response);

            // Salva i dati utente nel contesto
            login(response.user);

            // Callback per notificare il successo del login
            if (onLoginSuccess) {
                onLoginSuccess(response.user);
            }
        } catch (error) {
            console.error('Errore durante il login:', error);
            setServerError(error.message || 'Si è verificato un errore durante il login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Accedi</h2>
                <p className="login-subtitle">Benvenuto! Inserisci le tue credenziali</p>

                <form onSubmit={handleSubmit} className="login-form" noValidate>
                    {/* Messaggio di errore del server */}
                    {serverError && (
                        <div className="error-banner">
                            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{serverError}</span>
                        </div>
                    )}

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
                            autoComplete="current-password"
                        />
                        {errors.password && (
                            <p className="form-error">{errors.password}</p>
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
                                Accesso in corso...
                            </>
                        ) : (
                            'Accedi'
                        )}
                    </button>
                </form>

                {/* Link alla registrazione */}
                <div className="login-footer">
                    <p>
                        Non hai un account?{' '}
                        <button
                            type="button"
                            onClick={onSwitchToRegister}
                            className="link-button"
                            disabled={isLoading}
                        >
                            Registrati
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
