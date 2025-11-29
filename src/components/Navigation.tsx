import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

function Navigation() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to={isAuthenticated ? '/map' : '/'} className="nav-logo">
          <svg width="32" height="32" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 50 L30 35 L40 45 L50 30 L60 40 L60 60 L20 60 Z" fill="#646cff"/>
            <circle cx="55" cy="25" r="3" fill="#ffd700"/>
            <path d="M35 45 L40 40 L45 45 L40 50 Z" fill="white" fillOpacity="0.8"/>
          </svg>
          <span>Dormir là-haut</span>
        </Link>
        <div className="nav-right">
          <button onClick={() => navigate('/profile')} className="profile-btn">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
