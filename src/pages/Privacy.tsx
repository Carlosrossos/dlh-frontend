import { Link } from 'react-router-dom';
import './Legal.css';

function Privacy() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <Link to="/map" className="back-link">← Retour</Link>
        
        <h1>Politique de Confidentialité</h1>
        <p className="legal-updated">Dernière mise à jour : 1er novembre 2025</p>

        <section className="legal-section">
          <h2>1. Introduction</h2>
          <p>
            Dormir La Haut respecte votre vie privée et s'engage à protéger vos données personnelles. 
            Cette politique explique comment nous collectons, utilisons et protégeons vos informations.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Données collectées</h2>
          <h3>Données d'inscription</h3>
          <ul>
            <li>Nom d'utilisateur</li>
            <li>Adresse email</li>
            <li>Mot de passe (chiffré)</li>
          </ul>

          <h3>Données d'utilisation</h3>
          <ul>
            <li>POIs créés et proposés</li>
            <li>Commentaires et photos publiés</li>
            <li>Favoris et likes</li>
            <li>Historique de contributions</li>
          </ul>

          <h3>Données techniques</h3>
          <ul>
            <li>Adresse IP</li>
            <li>Type de navigateur</li>
            <li>Données de connexion</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. Utilisation des données</h2>
          <p>Nous utilisons vos données pour :</p>
          <ul>
            <li>Fournir et améliorer le service</li>
            <li>Gérer votre compte utilisateur</li>
            <li>Modérer le contenu</li>
            <li>Communiquer avec vous</li>
            <li>Assurer la sécurité du service</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Partage des données</h2>
          <p>
            Nous ne vendons jamais vos données personnelles. Vos données peuvent être partagées :
          </p>
          <ul>
            <li><strong>Publiquement :</strong> Votre nom d'utilisateur et vos contributions (POIs, commentaires)</li>
            <li><strong>Avec les modérateurs :</strong> Pour la modération du contenu</li>
            <li><strong>Légalement :</strong> Si requis par la loi</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>5. Sécurité des données</h2>
          <p>
            Nous mettons en œuvre des mesures de sécurité pour protéger vos données :
          </p>
          <ul>
            <li>Chiffrement des mots de passe</li>
            <li>Connexions sécurisées (HTTPS)</li>
            <li>Authentification par token JWT</li>
            <li>Limitation des tentatives de connexion</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>6. Vos droits (RGPD)</h2>
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul>
            <li><strong>Droit d'accès :</strong> Consulter vos données</li>
            <li><strong>Droit de rectification :</strong> Modifier vos informations</li>
            <li><strong>Droit à l'effacement :</strong> Supprimer votre compte</li>
            <li><strong>Droit à la portabilité :</strong> Exporter vos données</li>
            <li><strong>Droit d'opposition :</strong> Refuser certains traitements</li>
          </ul>
          <p>
            Pour exercer ces droits, rendez-vous dans vos paramètres ou 
            <Link to="/contact"> contactez-nous</Link>.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Cookies</h2>
          <p>
            Nous utilisons des cookies essentiels pour :
          </p>
          <ul>
            <li>Maintenir votre session de connexion</li>
            <li>Mémoriser vos préférences</li>
          </ul>
          <p>
            Nous n'utilisons pas de cookies publicitaires ou de tracking tiers.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Conservation des données</h2>
          <p>
            Vos données sont conservées tant que votre compte est actif. 
            Après suppression de votre compte :
          </p>
          <ul>
            <li>Vos données personnelles sont supprimées</li>
            <li>Vos contributions publiques peuvent être conservées (anonymisées)</li>
            <li>Les logs de sécurité sont conservés 12 mois</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>9. Mineurs</h2>
          <p>
            Le service est destiné aux personnes de 13 ans et plus. 
            Si vous avez moins de 18 ans, demandez l'autorisation de vos parents.
          </p>
        </section>

        <section className="legal-section">
          <h2>10. Modifications</h2>
          <p>
            Nous pouvons modifier cette politique de confidentialité. 
            Les modifications importantes vous seront notifiées par email.
          </p>
        </section>

        <section className="legal-section">
          <h2>11. Contact</h2>
          <p>
            Pour toute question sur vos données personnelles, contactez-nous via notre 
            <Link to="/contact"> page de contact</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Privacy;
