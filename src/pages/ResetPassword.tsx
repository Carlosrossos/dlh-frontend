import { useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { parseApiError } from '../utils/errorHandler';
import './Auth.css';

function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { showError, showSuccess, showWarning } = useToast();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      const msg = 'Les mots de passe ne correspondent pas';
      setError(msg);
      showWarning(msg);
      return;
    }

    if (formData.password.length < 6) {
      const msg = 'Le mot de passe doit contenir au moins 6 caractères';
      setError(msg);
      showWarning(msg);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: formData.password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la réinitialisation');
      }

      setSuccess(true);
      showSuccess('Mot de passe réinitialisé avec succès !');
      
      // Rediriger vers la connexion après 3 secondes
      setTimeout(() => {
        navigate('/signin');
      }, 3000);
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
          <h1>✅ Mot de passe réinitialisé !</h1>
          <p className="auth-subtitle">
            Votre mot de passe a été modifié avec succès.
            <br />
            Vous allez être redirigé vers la page de connexion...
          </p>
          <Link to="/signin" className="btn btn-primary btn-full">
            Se connecter maintenant
          </Link>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>❌ Lien invalide</h1>
          <p className="auth-subtitle">
            Ce lien de réinitialisation est invalide ou a expiré.
          </p>
          <Link to="/forgot-password" className="btn btn-primary btn-full">
            Demander un nouveau lien
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Nouveau mot de passe</h1>
        <p className="auth-subtitle">
          Entrez votre nouveau mot de passe
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">Nouveau mot de passe</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 6 caractères"
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Confirmez votre mot de passe"
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/signin">Retour à la connexion</Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;
