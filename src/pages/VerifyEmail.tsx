import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Auth.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function VerifyEmail() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const hasVerified = useRef(false); // Prevent double calls in StrictMode

  useEffect(() => {
    const verifyEmail = async () => {
      // Prevent multiple calls
      if (hasVerified.current) return;
      hasVerified.current = true;

      if (!token) {
        setStatus('error');
        setMessage('Token de vérification manquant');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/verify-email/${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erreur de vérification');
        }

        // Login the user automatically
        if (data.token && data.user) {
          login(data.token, data.user);
        }

        setStatus('success');
        setMessage(data.message || 'Email vérifié avec succès !');
        showSuccess('Email vérifié ! Bienvenue !');

        // Redirect to map after 2 seconds
        setTimeout(() => {
          navigate('/map');
        }, 2000);
      } catch (err) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Erreur de vérification');
        showError('Échec de la vérification');
      }
    };

    verifyEmail();
  }, [token, login, navigate, showSuccess, showError]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        {status === 'loading' && (
          <>
            <h1>⏳ Vérification en cours...</h1>
            <p className="auth-subtitle">Veuillez patienter</p>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="loading-spinner"></div>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <h1>✅ Email vérifié !</h1>
            <p className="auth-subtitle">{message}</p>
            <p style={{ color: '#666', marginTop: '1rem' }}>
              Redirection vers la carte...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <h1>❌ Erreur</h1>
            <p className="auth-subtitle" style={{ color: '#dc3545' }}>
              {message}
            </p>
            <p style={{ color: '#666', margin: '1.5rem 0' }}>
              Le lien a peut-être expiré ou a déjà été utilisé.
            </p>
            <Link to="/signin" className="btn btn-primary btn-full">
              Aller à la connexion
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
