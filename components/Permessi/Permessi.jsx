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

    if (loading) {
        return <div className="loading-state">Caricamento in corso...</div>;
    }

    return (
        <div className="permessi-container">
            <div className="permessi-header">
                <h1>Gestione Permessi</h1>
                {user?.ruolo === 'Dipendente' && (
                    <button
                        className="btn-primary"
                        onClick={() => setShowModal(true)}
                    >
                        + Nuova Richiesta
                    </button>
                )}
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {/* Filtri */}
            <div className="filters-container">
                <div className="filter-group">
                    <label>Stato:</label>
                    <select
                        value={filtro.stato}
                        onChange={(e) => setFiltro({ ...filtro, stato: e.target.value })}
                    >
                        <option value="">Tutti</option>
                        <option value="In attesa">In attesa</option>
                        <option value="Approvato">Approvato</option>
                        <option value="Rifiutato">Rifiutato</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Categoria:</label>
                    <select
                        value={filtro.categoria}
                        onChange={(e) => setFiltro({ ...filtro, categoria: e.target.value })}
                    >
                        <option value="">Tutte</option>
                        {categorie.map(cat => (
                            <option key={cat.CategoriaID} value={cat.CategoriaID}>
                                {cat.Descrizione}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tabella permessi */}
            {permessi.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <h3>Nessuna richiesta trovata</h3>
                    <p>Non ci sono richieste di permesso da visualizzare</p>
                </div>
            ) : (
                <table className="permessi-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            {user?.ruolo === 'Responsabile' && <th>Richiedente</th>}
                            <th>Categoria</th>
                            <th>Data Inizio</th>
                            <th>Data Fine</th>
                            <th>Stato</th>
                            <th>Data Richiesta</th>
                            {user?.ruolo === 'Responsabile' && <th>Valutatore</th>}
                            <th>Azioni</th>
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
                                        {user?.ruolo === 'Responsabile' && permesso.Stato === 'In attesa' && (
                                            <>
                                                <button
                                                    className="btn-success"
                                                    onClick={() => handleValuta(permesso.RichiestaID, 'Approvato')}
                                                >
                                                    ✓ Approva
                                                </button>
                                                <button
                                                    className="btn-danger"
                                                    onClick={() => handleValuta(permesso.RichiestaID, 'Rifiutato')}
                                                >
                                                    ✗ Rifiuta
                                                </button>
                                            </>
                                        )}

                                        {/* Azioni per Dipendente */}
                                        {user?.ruolo === 'Dipendente' && permesso.Stato === 'In attesa' && (
                                            <button
                                                className="btn-danger"
                                                onClick={() => handleDelete(permesso.RichiestaID)}
                                            >
                                                Elimina
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Modal per nuova richiesta */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Nuova Richiesta di Permesso</h2>
                            <button
                                className="modal-close"
                                onClick={() => setShowModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleCreatePermesso}>
                            <div className="form-group">
                                <label>Categoria *</label>
                                <select
                                    value={formData.categoriaId}
                                    onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })}
                                    required
                                >
                                    <option value="">Seleziona una categoria</option>
                                    {categorie.map(cat => (
                                        <option key={cat.CategoriaID} value={cat.CategoriaID}>
                                            {cat.Descrizione}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Data Inizio *</label>
                                <input
                                    type="date"
                                    value={formData.dataInizio}
                                    onChange={(e) => setFormData({ ...formData, dataInizio: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Data Fine *</label>
                                <input
                                    type="date"
                                    value={formData.dataFine}
                                    onChange={(e) => setFormData({ ...formData, dataFine: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Motivazione</label>
                                <textarea
                                    value={formData.motivazione}
                                    onChange={(e) => setFormData({ ...formData, motivazione: e.target.value })}
                                    placeholder="Inserisci una motivazione (opzionale)"
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Annulla
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                >
                                    Crea Richiesta
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
