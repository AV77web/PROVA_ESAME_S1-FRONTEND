// =================================================
// File: Categorie.jsx
// Componente per la gestione delle categorie di permesso
// @author: Full Stack Senior Developer
// @version: 1.0.0 2026-01-20
// =================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../src/context/AuthContext';
import {
    getCategorie,
    createCategoria,
    updateCategoria,
    deleteCategoria
} from '../../src/services/api';
import './Categorie.css';

const Categorie = () => {
    const { user } = useAuth();
    const [categorie, setCategorie] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentCategoria, setCurrentCategoria] = useState(null);
    const [formData, setFormData] = useState({
        categoriaId: '',
        descrizione: ''
    });

    // Carica le categorie
    const loadCategorie = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getCategorie();
            setCategorie(response.data || []);
        } catch (err) {
            console.error('[CATEGORIE] Errore caricamento:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategorie();
    }, []);

    // Apri modal per nuova categoria
    const handleOpenCreateModal = () => {
        setEditMode(false);
        setCurrentCategoria(null);
        setFormData({ categoriaId: '', descrizione: '' });
        setShowModal(true);
    };

    // Apri modal per modifica
    const handleOpenEditModal = (categoria) => {
        setEditMode(true);
        setCurrentCategoria(categoria);
        setFormData({
            categoriaId: categoria.CategoriaID,
            descrizione: categoria.Descrizione
        });
        setShowModal(true);
    };

    // Chiudi modal
    const handleCloseModal = () => {
        setShowModal(false);
        setEditMode(false);
        setCurrentCategoria(null);
        setFormData({ categoriaId: '', descrizione: '' });
    };

    // Crea nuova categoria
    const handleCreate = async (e) => {
        e.preventDefault();

        if (!formData.categoriaId || !formData.descrizione) {
            setError('Tutti i campi sono obbligatori');
            return;
        }

        try {
            setError(null);
            await createCategoria({
                categoriaId: parseInt(formData.categoriaId),
                descrizione: formData.descrizione
            });

            handleCloseModal();
            loadCategorie();
        } catch (err) {
            console.error('[CATEGORIE] Errore creazione:', err);
            setError(err.message);
        }
    };

    // Modifica categoria
    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!formData.descrizione) {
            setError('La descrizione è obbligatoria');
            return;
        }

        try {
            setError(null);
            await updateCategoria(currentCategoria.CategoriaID, {
                descrizione: formData.descrizione
            });

            handleCloseModal();
            loadCategorie();
        } catch (err) {
            console.error('[CATEGORIE] Errore modifica:', err);
            setError(err.message);
        }
    };

    // Elimina categoria
    const handleDelete = async (id) => {
        if (!window.confirm('Sei sicuro di voler eliminare questa categoria? Questa azione non può essere annullata.')) {
            return;
        }

        try {
            setError(null);
            await deleteCategoria(id);
            loadCategorie();
        } catch (err) {
            console.error('[CATEGORIE] Errore eliminazione:', err);
            setError(err.message);
        }
    };

    // Solo i Responsabili possono gestire le categorie
    if (user?.ruolo !== 'Responsabile') {
        return (
            <div className="categorie-container">
                <div className="access-denied">
                    <div className="access-denied-icon">🔒</div>
                    <h2>Accesso Negato</h2>
                    <p>Solo i Responsabili possono gestire le categorie di permesso.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="categorie-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Caricamento categorie...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="categorie-container">
            {/* Header */}
            <div className="categorie-header">
                <div className="header-content">
                    <div className="header-title">
                        <span className="icon-title">🏷️</span>
                        <h1>Gestione Categorie</h1>
                    </div>
                    <p className="header-subtitle">
                        Crea, modifica ed elimina le categorie di permesso disponibili nel sistema.
                    </p>
                </div>
                <button
                    className="btn-primary"
                    onClick={handleOpenCreateModal}
                >
                    + Nuova Categoria
                </button>
            </div>

            {/* Messaggio di errore */}
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {/* Statistiche */}
            <div className="stats-grid">
                <div className="stat-card total">
                    <div className="stat-icon">📊</div>
                    <div className="stat-info">
                        <span className="stat-value">{categorie.length}</span>
                        <span className="stat-label">Categorie Totali</span>
                    </div>
                </div>
            </div>

            {/* Tabella categorie */}
            <div className="categorie-table-section">
                <div className="table-header">
                    <span className="table-icon">📄</span>
                    <h3>Elenco Categorie</h3>
                </div>

                {categorie.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📂</div>
                        <h3>Nessuna categoria trovata</h3>
                        <p>Non ci sono categorie di permesso nel sistema.</p>
                        <button className="btn-primary mt-3" onClick={handleOpenCreateModal}>
                            Crea la prima categoria
                        </button>
                    </div>
                ) : (
                    <table className="categorie-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Descrizione</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categorie.map(categoria => (
                                <tr key={categoria.CategoriaID}>
                                    <td>
                                        <span className="categoria-id">
                                            {categoria.CategoriaID}
                                        </span>
                                    </td>
                                    <td className="descrizione-cell">
                                        {categoria.Descrizione}
                                    </td>
                                    <td>
                                        <div className="actions-cell">
                                            <button
                                                className="btn-edit"
                                                onClick={() => handleOpenEditModal(categoria)}
                                                title="Modifica Categoria"
                                            >
                                                ✏️ Modifica
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDelete(categoria.CategoriaID)}
                                                title="Elimina Categoria"
                                            >
                                                🗑️ Elimina
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal per creazione/modifica */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <span className="modal-icon">
                                    {editMode ? '✏️' : '➕'}
                                </span>
                                {editMode ? 'Modifica Categoria' : 'Nuova Categoria'}
                            </h2>
                            <button
                                className="modal-close"
                                onClick={handleCloseModal}
                                title="Chiudi"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={editMode ? handleUpdate : handleCreate} className="categoria-form">
                            {!editMode && (
                                <div className="form-group">
                                    <label>ID Categoria *</label>
                                    <input
                                        type="number"
                                        value={formData.categoriaId}
                                        onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })}
                                        placeholder="Es: 1"
                                        required
                                        min="1"
                                    />
                                    <small className="form-hint">Inserisci un numero identificativo univoco</small>
                                </div>
                            )}

                            {editMode && (
                                <div className="form-group">
                                    <label>ID Categoria</label>
                                    <input
                                        type="text"
                                        value={formData.categoriaId}
                                        disabled
                                        className="disabled-input"
                                    />
                                    <small className="form-hint">L'ID non può essere modificato</small>
                                </div>
                            )}

                            <div className="form-group">
                                <label>Descrizione *</label>
                                <input
                                    type="text"
                                    value={formData.descrizione}
                                    onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}
                                    placeholder="Es: Ferie, Malattia, Permesso Personale"
                                    required
                                    maxLength="200"
                                />
                                <small className="form-hint">Massimo 200 caratteri</small>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={handleCloseModal}
                                >
                                    Annulla
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                >
                                    {editMode ? 'Salva Modifiche' : 'Crea Categoria'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categorie;
