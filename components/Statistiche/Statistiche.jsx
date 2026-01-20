// =================================================
// File: Statistiche.jsx
// Componente per visualizzare statistiche aggregate delle richieste (Requisito Avanzato)
// @author: Full Stack Senior Developer
// @version: 1.0.0 2026-01-20
// =================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../src/context/AuthContext';
import { getStatistiche, getPermessi } from '../../src/services/api';
import './Statistiche.css';

const Statistiche = () => {
    const { user } = useAuth();
    const [statistiche, setStatistiche] = useState([]);
    const [dipendenti, setDipendenti] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        utenteId: '',
        mese: '',
        anno: new Date().getFullYear()
    });

    // Carica le statistiche
    const loadStatistiche = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const filterParams = {};
            if (filters.utenteId) filterParams.utenteId = parseInt(filters.utenteId);
            if (filters.mese) filterParams.mese = parseInt(filters.mese);
            if (filters.anno) filterParams.anno = parseInt(filters.anno);

            const response = await getStatistiche(filterParams);
            setStatistiche(response.data || []);
        } catch (err) {
            console.error('[STATISTICHE] Errore caricamento:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Carica elenco dipendenti per il filtro
    const loadDipendenti = async () => {
        try {
            const response = await getPermessi({ stato: 'Approvato' });
            const uniqueDipendenti = {};
            
            // Estraggo dipendenti unici dalle richieste
            response.data?.forEach(permesso => {
                if (!uniqueDipendenti[permesso.UtenteID]) {
                    uniqueDipendenti[permesso.UtenteID] = {
                        UtenteID: permesso.UtenteID,
                        Nome: permesso.RichiedenteNome,
                        Cognome: permesso.RichiedenteCognome
                    };
                }
            });

            setDipendenti(Object.values(uniqueDipendenti).sort((a, b) => 
                a.Cognome.localeCompare(b.Cognome)
            ));
        } catch (err) {
            console.error('[STATISTICHE] Errore caricamento dipendenti:', err);
        }
    };

    useEffect(() => {
        loadDipendenti();
    }, []);

    useEffect(() => {
        loadStatistiche();
    }, [filters]);

    // Solo i Responsabili possono vedere le statistiche
    if (user?.ruolo !== 'Responsabile') {
        return (
            <div className="statistiche-container">
                <div className="access-denied">
                    <div className="access-denied-icon">🔒</div>
                    <h2>Accesso Negato</h2>
                    <p>Solo i Responsabili possono visualizzare le statistiche aggregate.</p>
                </div>
            </div>
        );
    }

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleResetFilters = () => {
        setFilters({
            utenteId: '',
            mese: '',
            anno: new Date().getFullYear()
        });
    };

    if (loading) {
        return (
            <div className="statistiche-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Caricamento statistiche...</p>
                </div>
            </div>
        );
    }

    const totalRichieste = statistiche.reduce((sum, stat) => sum + stat.NumeroRichieste, 0);
    const totalGiorniRichiesti = statistiche.reduce((sum, stat) => sum + stat.GiorniTotaliRichiesti, 0);
    const totalGiorniApprovati = statistiche.reduce((sum, stat) => sum + stat.GiorniTotaliApprovati, 0);

    return (
        <div className="statistiche-container">
            {/* Header */}
            <div className="statistiche-header">
                <div className="header-content">
                    <div className="header-title">
                        <span className="icon-title">📊</span>
                        <h1>Statistiche Richieste</h1>
                    </div>
                    <p className="header-subtitle">
                        Visualizza statistiche aggregate delle richieste di permesso approvate per dipendente.
                    </p>
                </div>
            </div>

            {/* Messaggio di errore */}
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {/* Statistiche Totali */}
            <div className="stats-summary">
                <div className="summary-card">
                    <div className="summary-icon">📋</div>
                    <div className="summary-info">
                        <span className="summary-value">{totalRichieste}</span>
                        <span className="summary-label">Richieste Totali</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">📅</div>
                    <div className="summary-info">
                        <span className="summary-value">{totalGiorniRichiesti}</span>
                        <span className="summary-label">Giorni Richiesti</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">✅</div>
                    <div className="summary-info">
                        <span className="summary-value">{totalGiorniApprovati}</span>
                        <span className="summary-label">Giorni Approvati</span>
                    </div>
                </div>
            </div>

            {/* Filtri */}
            <div className="filters-section">
                <div className="filters-header">
                    <span className="filters-icon">🔍</span>
                    <h3>Filtra Statistiche</h3>
                    {(filters.utenteId || filters.mese || filters.anno !== new Date().getFullYear()) && (
                        <button className="btn-clear-filters" onClick={handleResetFilters}>
                            Rimuovi Filtri
                        </button>
                    )}
                </div>
                <div className="filters-grid">
                    <div className="filter-group">
                        <label>Dipendente:</label>
                        <select
                            value={filters.utenteId}
                            onChange={(e) => handleFilterChange('utenteId', e.target.value)}
                        >
                            <option value="">Tutti i Dipendenti</option>
                            {dipendenti.map(dip => (
                                <option key={dip.UtenteID} value={dip.UtenteID}>
                                    {dip.Cognome} {dip.Nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Mese:</label>
                        <select
                            value={filters.mese}
                            onChange={(e) => handleFilterChange('mese', e.target.value)}
                        >
                            <option value="">Tutti i Mesi</option>
                            <option value="1">Gennaio</option>
                            <option value="2">Febbraio</option>
                            <option value="3">Marzo</option>
                            <option value="4">Aprile</option>
                            <option value="5">Maggio</option>
                            <option value="6">Giugno</option>
                            <option value="7">Luglio</option>
                            <option value="8">Agosto</option>
                            <option value="9">Settembre</option>
                            <option value="10">Ottobre</option>
                            <option value="11">Novembre</option>
                            <option value="12">Dicembre</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Anno:</label>
                        <input
                            type="number"
                            value={filters.anno}
                            onChange={(e) => handleFilterChange('anno', e.target.value)}
                            min="2020"
                            max={new Date().getFullYear() + 1}
                        />
                    </div>
                </div>
            </div>

            {/* Tabella Statistiche */}
            <div className="statistiche-table-section">
                <div className="table-header">
                    <span className="table-icon">📊</span>
                    <h3>Dettaglio per Dipendente</h3>
                </div>

                {statistiche.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📊</div>
                        <h3>Nessuna statistica trovata</h3>
                        <p>Non ci sono richieste approvate che corrispondono ai filtri selezionati.</p>
                    </div>
                ) : (
                    <table className="statistiche-table">
                        <thead>
                            <tr>
                                <th>Dipendente</th>
                                <th>Email</th>
                                <th>Mese</th>
                                <th>Anno</th>
                                <th>N. Richieste</th>
                                <th>Giorni Richiesti</th>
                                <th>Giorni Approvati</th>
                            </tr>
                        </thead>
                        <tbody>
                            {statistiche.map((stat, index) => (
                                <tr key={`${stat.UtenteID}-${stat.Mese}-${stat.Anno}-${index}`}>
                                    <td className="dipendente-cell">
                                        <strong>{stat.Cognome} {stat.Nome}</strong>
                                    </td>
                                    <td>{stat.Email}</td>
                                    <td>
                                        {stat.Mese ? new Date(2024, stat.Mese - 1).toLocaleString('it-IT', { month: 'long' }) : '-'}
                                    </td>
                                    <td>{stat.Anno || '-'}</td>
                                    <td>
                                        <span className="badge-count">{stat.NumeroRichieste}</span>
                                    </td>
                                    <td>
                                        <span className="badge-days">{stat.GiorniTotaliRichiesti} gg</span>
                                    </td>
                                    <td>
                                        <span className="badge-approved">{stat.GiorniTotaliApprovati} gg</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Grafico (opzionale) */}
            {statistiche.length > 0 && (
                <div className="chart-section">
                    <div className="chart-header">
                        <span className="chart-icon">📈</span>
                        <h3>Visualizzazione Grafica</h3>
                    </div>
                    <div className="chart-container">
                        {statistiche.map((stat, index) => {
                            const maxGiorni = Math.max(...statistiche.map(s => s.GiorniTotaliApprovati));
                            const percentage = maxGiorni > 0 ? (stat.GiorniTotaliApprovati / maxGiorni) * 100 : 0;
                            
                            return (
                                <div key={`chart-${index}`} className="chart-bar">
                                    <div className="chart-label">
                                        {stat.Cognome} {stat.Nome}
                                        {stat.Mese && (
                                            <span className="chart-period">
                                                {' '}({new Date(2024, stat.Mese - 1).toLocaleString('it-IT', { month: 'short' })} {stat.Anno})
                                            </span>
                                        )}
                                    </div>
                                    <div className="chart-bar-container">
                                        <div 
                                            className="chart-bar-fill"
                                            style={{ width: `${percentage}%` }}
                                        >
                                            <span className="chart-value">{stat.GiorniTotaliApprovati} gg</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Statistiche;
