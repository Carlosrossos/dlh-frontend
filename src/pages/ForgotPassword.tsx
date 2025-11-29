import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { parseApiError } from '../utils/errorHandler';
import './Auth.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function ForgotPassword() {
  const { showError, showSuccess } = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      setSuccess(true);
      showSuccess('Email envoyé ! Vérifiez votre boîte de réception.');
    } catch (err: unknown) {
      const message = parseApiError(err);
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>📧 Email envoyé !</h1>
          <p className="auth-subtitle">
            Si un compte existe avec cette adresse email, vous recevrez un lien pour réinitialiser votre mot de passe.
          </p>
          <p className="auth-footer">
            <Link to="/signin">Retour à la connexion</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Mot de passe oublié</h1>
        <p className="auth-subtitle">
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Entrez votre email"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Envoi...' : 'Envoyer le lien'}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/signin">Retour à la connexion</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
