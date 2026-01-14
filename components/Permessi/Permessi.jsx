//=========================================================
// File: Permessi.jsx
// Componente per la gestione dei permessi
// @author: andrea.villari@allievi.itsdigitalacademy.com
// @version: 1.0.0 2026-01-14
//=========================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../../src/context/AuthContext';
import {
    getPermessi,
    getCategorie,
    createPermesso,
    valutaPermesso,
    deletePermesso
} from '../../src/services/api';
import './Permessi.css';

const Permessi = () => {
    const { user } = useAuth();
    const [permessi, setPermessi] = useState([]);
    const [categorie, setCategorie] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filtro, setFiltro] = useState({
        stato: '',
        categoria: ''
    });

    // Form per nuova richiesta
    const [formData, setFormData] = useState({
        dataInizio: '',
        dataFine: '',
        categoriaId: '',
        motivazione: ''
    });

    // Carica permessi e categorie all'avvio
    useEffect(() => {
        loadData();
    }, [user, filtro]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Carica categorie
            const catResponse = await getCategorie();
            setCategorie(catResponse.data || []);

            // Carica permessi
            const filters = {};

            // Se l'utente è Dipendente, mostra solo i suoi permessi
            if (user?.ruolo === 'Dipendente') {
                filters.utenteId = user.id;
            }

            // Aggiungi filtri selezionati
            if (filtro.stato) filters.stato = filtro.stato;
            if (filtro.categoria) filters.categoriaId = filtro.categoria;

            const permResponse = await getPermessi(filters);
            setPermessi(permResponse.data || []);

        } catch (err) {
            console.error('Errore nel caricamento:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePermesso = async (e) => {
        e.preventDefault();

        try {
            await createPermesso({
                ...formData,
                categoriaId: parseInt(formData.categoriaId),
                utenteId: user.id
            });

            setShowModal(false);
            setFormData({
                dataInizio: '',
                dataFine: '',
                categoriaId: '',
                motivazione: ''
            });
            loadData();
        } catch (err) {
            alert('Errore nella creazione: ' + err.message);
        }
    };

    const handleValuta = async (richiestaId, stato) => {
        if (!window.confirm(`Confermi di voler ${stato.toLowerCase()} questa richiesta?`)) {
            return;
        }

        try {
            await valutaPermesso(richiestaId, stato, user.id);
            loadData();
        } catch (err) {
            alert('Errore nella valutazione: ' + err.message);
        }
    };

    const handleDelete = async (richiestaId) => {
        if (!window.confirm('Sei sicuro di voler eliminare questa richiesta?')) {
            return;
        }

        try {
            await deletePermesso(richiestaId);
            loadData();
        } catch (err) {
            alert('Errore nell\'eliminazione: ' + err.message);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('it-IT');
    };

    const getStatoBadgeClass = (stato) => {
        switch (stato) {
            case 'In attesa': return 'stato-in-attesa';
            case 'Approvato': return 'stato-approvato';
            case 'Rifiutato': return 'stato-rifiutato';
            default: return '';
        }
    };

    // Calcola statistiche
    const stats = {
        totali: permessi.length,
        inAttesa: permessi.filter(p => p.Stato === 'In attesa').length,
        approvati: permessi.filter(p => p.Stato === 'Approvato').length,
        rifiutati: permessi.filter(p => p.Stato === 'Rifiutato').length
    };

    if (loading) {
        return (
            <div className="permessi-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Caricamento in corso...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="permessi-container">
            <div className="permessi-header">
                <div className="header-content">
                    <div className="header-title">
                        <span className="icon-title">📋</span>
                        <h1>Gestione Permessi</h1>
                    </div>
                    <p className="header-subtitle">
                        {user?.ruolo === 'Dipendente'
                            ? 'Gestisci le tue richieste di permesso'
                            : 'Gestisci tutte le richieste del team'}
                    </p>
                </div>
                {user?.ruolo === 'Dipendente' && (
                    <button
                        className="btn-primary"
                        onClick={() => setShowModal(true)}
                    >
                        <span className="btn-icon">+</span>
                        Nuova Richiesta
                    </button>
                )}
            </div>

            {/* Statistiche */}
            <div className="stats-container">
                <div className="stat-card stat-total">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.totali}</div>
                        <div className="stat-label">Totali</div>
                    </div>
                </div>
                <div className="stat-card stat-pending">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.inAttesa}</div>
                        <div className="stat-label">In Attesa</div>
                    </div>
                </div>
                <div className="stat-card stat-approved">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.approvati}</div>
                        <div className="stat-label">Approvati</div>
                    </div>
                </div>
                <div className="stat-card stat-rejected">
                    <div className="stat-icon">❌</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.rifiutati}</div>
                        <div className="stat-label">Rifiutati</div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {/* Filtri */}
            <div className="filters-container">
                <div className="filters-header">
                    <span className="filters-icon">🔍</span>
                    <h3>Filtra Richieste</h3>
                </div>
                <div className="filters-content">
                    <div className="filter-group">
                        <label>
                            <span className="label-icon">📌</span>
                            Stato
                        </label>
                        <select
                            value={filtro.stato}
                            onChange={(e) => setFiltro({ ...filtro, stato: e.target.value })}
                        >
                            <option value="">🔘 Tutti gli stati</option>
                            <option value="In attesa">⏳ In attesa</option>
                            <option value="Approvato">✅ Approvato</option>
                            <option value="Rifiutato">❌ Rifiutato</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>
                            <span className="label-icon">📂</span>
                            Categoria
                        </label>
                        <select
                            value={filtro.categoria}
                            onChange={(e) => setFiltro({ ...filtro, categoria: e.target.value })}
                        >
                            <option value="">📁 Tutte le categorie</option>
                            {categorie.map(cat => (
                                <option key={cat.CategoriaID} value={cat.CategoriaID}>
                                    {cat.Descrizione}
                                </option>
                            ))}
                        </select>
                    </div>

                    {(filtro.stato || filtro.categoria) && (
                        <button
                            className="btn-clear-filters"
                            onClick={() => setFiltro({ stato: '', categoria: '' })}
                        >
                            ✖ Rimuovi Filtri
                        </button>
                    )}
                </div>
            </div>

            {/* Tabella permessi */}
            {permessi.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <h3>Nessuna richiesta trovata</h3>
                    <p>Non ci sono richieste di permesso da visualizzare</p>
                    {user?.ruolo === 'Dipendente' && (
                        <button
                            className="btn-primary"
                            onClick={() => setShowModal(true)}
                            style={{ marginTop: '20px' }}
                        >
                            <span className="btn-icon">+</span>
                            Crea la tua prima richiesta
                        </button>
                    )}
                </div>
            ) : (
                <div className="table-wrapper">
                    <div className="table-header">
                        <h3>
                            <span className="table-icon">📋</span>
                            Elenco Richieste ({permessi.length})
                        </h3>
                    </div>
                    <table className="permessi-table">
                        <thead>
                            <tr>
                                <th>🆔 ID</th>
                                {user?.ruolo === 'Responsabile' && <th>👤 Richiedente</th>}
                                <th>📂 Categoria</th>
                                <th>📅 Data Inizio</th>
                                <th>📅 Data Fine</th>
                                <th>📊 Stato</th>
                                <th>🕐 Data Richiesta</th>
                                {user?.ruolo === 'Responsabile' && <th>👨‍💼 Valutatore</th>}
                                <th>⚙️ Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {permessi.map(permesso => (
                                <tr key={permesso.RichiestaID}>
                                    <td>{permesso.RichiestaID}</td>
                                    {user?.ruolo === 'Responsabile' && (
                                        <td>
                                            {permesso.RichiedenteNome} {permesso.RichiedenteCognome}
                                        </td>
                                    )}
                                    <td>{permesso.CategoriaDescrizione}</td>
                                    <td>{formatDate(permesso.DataInizio)}</td>
                                    <td>{formatDate(permesso.DataFine)}</td>
                                    <td>
                                        <span className={`stato-badge ${getStatoBadgeClass(permesso.Stato)}`}>
                                            {permesso.Stato}
                                        </span>
                                    </td>
                                    <td>{formatDate(permesso.DataRichiesta)}</td>
                                    {user?.ruolo === 'Responsabile' && (
                                        <td>
                                            {permesso.ValutatoreNome ?
                                                `${permesso.ValutatoreNome} ${permesso.ValutatoreCognome}` :
                                                '-'
                                            }
                                        </td>
                                    )}
                                    <td>
                                        <div className="actions-cell">
                                            {/* Azioni per Responsabile */}
                                            {user?.ruolo === 'Responsabile' && permesso.Stato === 'In attesa' ? (
                                                <>
                                                    <button
                                                        className="btn-success"
                                                        onClick={() => handleValuta(permesso.RichiestaID, 'Approvato')}
                                                        title="Approva richiesta"
                                                    >
                                                        ✓ Approva
                                                    </button>
                                                    <button
                                                        className="btn-danger"
                                                        onClick={() => handleValuta(permesso.RichiestaID, 'Rifiutato')}
                                                        title="Rifiuta richiesta"
                                                    >
                                                        ✗ Rifiuta
                                                    </button>
                                                </>
                                            ) : user?.ruolo === 'Responsabile' ? (
                                                <span className="no-action">Già valutata</span>
                                            ) : null}

                                            {/* Azioni per Dipendente */}
                                            {user?.ruolo === 'Dipendente' && permesso.Stato === 'In attesa' ? (
                                                <button
                                                    className="btn-danger"
                                                    onClick={() => handleDelete(permesso.RichiestaID)}
                                                    title="Elimina richiesta"
                                                >
                                                    🗑️ Elimina
                                                </button>
                                            ) : user?.ruolo === 'Dipendente' ? (
                                                <span className="no-action">Non modificabile</span>
                                            ) : null}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal per nuova richiesta */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <span className="modal-icon">📝</span>
                                Nuova Richiesta di Permesso
                            </h2>
                            <button
                                className="modal-close"
                                onClick={() => setShowModal(false)}
                                title="Chiudi"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleCreatePermesso} className="permesso-form">
                            <div className="form-group">
                                <label>
                                    <span className="form-icon">📂</span>
                                    Categoria *
                                </label>
                                <select
                                    value={formData.categoriaId}
                                    onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })}
                                    required
                                >
                                    <option value="">📁 Seleziona una categoria</option>
                                    {categorie.map(cat => (
                                        <option key={cat.CategoriaID} value={cat.CategoriaID}>
                                            {cat.Descrizione}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        <span className="form-icon">📅</span>
                                        Data Inizio *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.dataInizio}
                                        onChange={(e) => setFormData({ ...formData, dataInizio: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        <span className="form-icon">📅</span>
                                        Data Fine *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.dataFine}
                                        onChange={(e) => setFormData({ ...formData, dataFine: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>
                                    <span className="form-icon">📝</span>
                                    Motivazione
                                </label>
                                <textarea
                                    value={formData.motivazione}
                                    onChange={(e) => setFormData({ ...formData, motivazione: e.target.value })}
                                    placeholder="Inserisci la motivazione della richiesta (opzionale)..."
                                    rows="4"
                                />
                                <small className="form-hint">
                                    💡 Una motivazione chiara aiuta ad approvare più velocemente la richiesta
                                </small>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    ✖ Annulla
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                >
                                    ✓ Crea Richiesta
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Permessi;
