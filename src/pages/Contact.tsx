import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Legal.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement email sending
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="legal-page">
      <div className="legal-container">
        <Link to="/map" className="back-link">← Retour</Link>
        
        <h1>Nous Contacter</h1>
        <p className="legal-intro">
          Une question, une suggestion ou un problème ? N'hésitez pas à nous contacter !
        </p>

        {submitted ? (
          <div className="contact-success">
            <div className="success-icon">✅</div>
            <h2>Message envoyé !</h2>
            <p>Nous vous répondrons dans les plus brefs délais.</p>
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Nom *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Votre nom"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="votre@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Sujet *</label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionnez un sujet</option>
                <option value="question">Question générale</option>
                <option value="bug">Signaler un bug</option>
                <option value="suggestion">Suggestion d'amélioration</option>
                <option value="content">Signaler un contenu</option>
                <option value="account">Problème de compte</option>
                <option value="partnership">Partenariat</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                placeholder="Décrivez votre demande..."
              />
            </div>

            <button type="submit" className="submit-btn">
              📧 Envoyer le message
            </button>
          </form>
        )}

        <section className="legal-section contact-info">
          <h2>Autres moyens de contact</h2>
          
          <div className="contact-method">
            <h3>📧 Email direct</h3>
            <p>
              <a href="mailto:contact@dormirlahaut.fr">contact@dormirlahaut.fr</a>
            </p>
          </div>

          <div className="contact-method">
            <h3>⏱️ Délai de réponse</h3>
            <p>Nous nous efforçons de répondre sous 48h ouvrées.</p>
          </div>

          <div className="contact-method">
            <h3>🐛 Signaler un bug</h3>
            <p>
              Pour les bugs techniques, merci de préciser :
            </p>
            <ul>
              <li>Votre navigateur et version</li>
              <li>Les étapes pour reproduire le problème</li>
              <li>Une capture d'écran si possible</li>
            </ul>
          </div>

          <div className="contact-method">
            <h3>💡 Suggestions</h3>
            <p>
              Vos idées sont les bienvenues ! N'hésitez pas à nous faire part 
              de vos suggestions pour améliorer Dormir La Haut.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Contact;
