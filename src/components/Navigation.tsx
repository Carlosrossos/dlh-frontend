import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

function Navigation() {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to={isAuthenticated ? '/map' : '/'} className="nav-logo">
          <svg width="32" height="32" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 50 L30 35 L40 45 L50 30 L60 40 L60 60 L20 60 Z" fill="#d4a574"/>
            <circle cx="55" cy="25" r="3" fill="#ffd700"/>
            <path d="M35 45 L40 40 L45 45 L40 50 Z" fill="white" fillOpacity="0.8"/>
          </svg>
          <span>Dormir là-haut</span>
        </Link>
        {/* Burger menu is rendered separately in App.tsx */}
      </div>
    </nav>
  );
}

export default Navigation;
