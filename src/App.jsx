// =================================================
// File: App.jsx
// Componente principale dell'applicazione
// @author: Full Stack Senior Developer
// @version: 1.0.0 2026-01-14
// =================================================

import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from '../components/Login/Login';
import Registration from '../components/Registration/Registration';
import Permessi from '../components/Permessi/Permessi';
import './App.css';

/**
 * Componente per la dashboard (schermata dopo il login)
 */
const Dashboard = () => {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('home'); // 'home' o 'permessi'

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Sistema Gestione Permessi</h1>
        </div>
        <div className="header-right">
          <span className="user-name">👤 {user?.nome} {user?.cognome}</span>
          <button onClick={logout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>

      {/* Menu di navigazione */}
      <nav className="dashboard-nav">
        <button
          className={`nav-item ${currentPage === 'home' ? 'active' : ''}`}
          onClick={() => setCurrentPage('home')}
        >
          🏠 Home
        </button>
        <button
          className={`nav-item ${currentPage === 'permessi' ? 'active' : ''}`}
          onClick={() => setCurrentPage('permessi')}
        >
          📋 Permessi
        </button>
      </nav>

      {/* Contenuto della pagina */}
      <div className="dashboard-content">
        {currentPage === 'home' ? (
          <div className="user-info-card">
            <h2>Informazioni Utente</h2>
            <div className="info-row">
              <span className="info-label">Nome:</span>
              <span className="info-value">{user?.nome}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Cognome:</span>
              <span className="info-value">{user?.cognome}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{user?.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Ruolo:</span>
              <span className={`badge badge-${user?.ruolo?.toLowerCase()}`}>
                {user?.ruolo}
              </span>
            </div>

            {/* Quick action */}
            <div className="quick-actions">
              <h3>Azioni Rapide</h3>
              <button
                className="btn-action"
                onClick={() => setCurrentPage('permessi')}
              >
                Vai a Gestione Permessi →
              </button>
            </div>
          </div>
        ) : (
          <Permessi />
        )}
      </div>
    </div>
  );
};

/**
 * Componente principale con routing
 */
const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentView, setCurrentView] = useState('login'); // 'login' o 'register'

  // Mostra uno spinner durante il caricamento iniziale
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-large"></div>
        <p>Caricamento...</p>
      </div>
    );
  }

  // Se l'utente è autenticato, mostra la dashboard
  if (isAuthenticated()) {
    return <Dashboard />;
  }

  // Altrimenti mostra login o registrazione
  return (
    <>
      {currentView === 'login' ? (
        <Login
          onSwitchToRegister={() => setCurrentView('register')}
          onLoginSuccess={(user) => {
            console.log('Login completato per:', user);
          }}
        />
      ) : (
        <Registration
          onSwitchToLogin={() => setCurrentView('login')}
          onRegistrationSuccess={(user) => {
            console.log('Registrazione completata per:', user);
          }}
        />
      )}
    </>
  );
};

/**
 * Componente App principale con Provider
 */
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
