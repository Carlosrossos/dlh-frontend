import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './BurgerMenu.css';

function BurgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  return (
    <>
      {/* Burger Button */}
      <button 
        className={`burger-button ${isOpen ? 'open' : ''}`}
        onClick={toggleMenu}
        aria-label="Menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="burger-overlay" 
          onClick={closeMenu}
        />
      )}

      {/* Menu Panel */}
      <div className={`burger-menu ${isOpen ? 'open' : ''}`}>
        <div className="burger-menu-header">
          {user && (
            <div className="burger-user-info">
              <div className="burger-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="burger-user-name">{user.name}</div>
                <div className="burger-user-email">{user.email}</div>
              </div>
            </div>
          )}
        </div>

        <nav className="burger-menu-nav">
          {user ? (
            <>
              <Link to="/map" className="burger-menu-item" onClick={closeMenu}>
                🗺️ Carte
              </Link>
              <Link to="/profile" className="burger-menu-item" onClick={closeMenu}>
                👤 Mon Profil
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="burger-menu-item" onClick={closeMenu}>
                  🛡️ Administration
                </Link>
              )}
              
              <div className="burger-menu-divider"></div>
              
              <Link to="/legal/terms" className="burger-menu-item" onClick={closeMenu}>
                📋 Conditions d'utilisation
              </Link>
              <Link to="/legal/privacy" className="burger-menu-item" onClick={closeMenu}>
                🔒 Confidentialité
              </Link>
              <Link to="/contact" className="burger-menu-item" onClick={closeMenu}>
                📧 Contact
              </Link>
              
              <div className="burger-menu-divider"></div>
              
              <button 
                className="burger-menu-item logout-item" 
                onClick={handleLogout}
              >
                🚪 Se déconnecter
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="burger-menu-item" onClick={closeMenu}>
                🔑 Se connecter
              </Link>
              <Link to="/signup" className="burger-menu-item" onClick={closeMenu}>
                ✨ Créer un compte
              </Link>
              
              <div className="burger-menu-divider"></div>
              
              <Link to="/legal/terms" className="burger-menu-item" onClick={closeMenu}>
                📋 Conditions d'utilisation
              </Link>
              <Link to="/legal/privacy" className="burger-menu-item" onClick={closeMenu}>
                🔒 Confidentialité
              </Link>
              <Link to="/contact" className="burger-menu-item" onClick={closeMenu}>
                📧 Contact
              </Link>
            </>
          )}
        </nav>
      </div>
    </>
  );
}

export default BurgerMenu;
