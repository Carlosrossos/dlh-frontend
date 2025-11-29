import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/signin');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  return (
    <div className="hero-container">
      <div className="hero-content">
        <div className="hero-logo">
          <svg width="100" height="100" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="38" fill="white" fillOpacity="0.9"/>
            <path d="M20 50 L30 35 L40 45 L50 30 L60 40 L60 60 L20 60 Z" fill="#646cff"/>
            <circle cx="55" cy="25" r="3" fill="#ffd700"/>
            <path d="M35 45 L40 40 L45 45 L40 50 Z" fill="white" fillOpacity="0.8"/>
          </svg>
        </div>
        <div className="hero-features">
          <div className="feature-box">
            <div className="feature-icon">🏔️</div>
            <p>Trouvez facilement des spots pour dormir en montagne.</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon">🤝</div>
            <p>Partagez vos lieux de bivouac, refuges et cabanes avec la communauté.</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon">✨</div>
            <p>Profitez d'une application simple, sans pub et pensée pour l'aventure.</p>
          </div>
        </div>
        <div className="hero-buttons">
          <button className="btn btn-primary" onClick={handleSignIn}>
            Se connecter
          </button>
          <button className="btn btn-secondary" onClick={handleSignUp}>
            Créer un compte
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
