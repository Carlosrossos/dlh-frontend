import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { parseApiError } from '../utils/errorHandler';
import './Auth.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function SignUp() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showError, showSuccess, showWarning } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation de la confirmation du mot de passe
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
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Inscription échouée');
      }

      // Update auth context
      login(data.token, data.user);
      showSuccess('Compte créé avec succès !');

      // Redirect to map
      navigate('/map');
    } catch (err: unknown) {
      const message = parseApiError(err);
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Inscription</h1>
        <p className="auth-subtitle">Créez votre compte</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Entrez votre email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
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
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="auth-footer">
          Déjà un compte ? <Link to="/signin">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
