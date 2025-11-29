import { Link } from 'react-router-dom';
import './Legal.css';

function Terms() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <Link to="/map" className="back-link">← Retour</Link>
        
        <h1>Conditions Générales d'Utilisation</h1>
        <p className="legal-updated">Dernière mise à jour : 1er novembre 2025</p>

        <section className="legal-section">
          <h2>1. Présentation du service</h2>
          <p>
            Dormir La Haut est une plateforme communautaire permettant de partager et découvrir 
            des lieux de bivouac, refuges et cabanes en montagne.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Acceptation des conditions</h2>
          <p>
            En utilisant Dormir La Haut, vous acceptez d'être lié par ces conditions générales 
            d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le service.
          </p>
        </section>

        <section className="legal-section">
          <h2>3. Inscription et compte utilisateur</h2>
          <p>
            Pour utiliser certaines fonctionnalités, vous devez créer un compte. Vous êtes responsable 
            de la confidentialité de vos identifiants et de toutes les activités effectuées sous votre compte.
          </p>
          <ul>
            <li>Vous devez fournir des informations exactes et à jour</li>
            <li>Vous ne devez pas partager votre compte avec d'autres personnes</li>
            <li>Vous devez nous informer immédiatement de toute utilisation non autorisée</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Contenu utilisateur</h2>
          <p>
            En publiant du contenu sur Dormir La Haut (POIs, commentaires, photos), vous :
          </p>
          <ul>
            <li>Garantissez que vous détenez les droits sur ce contenu</li>
            <li>Accordez à Dormir La Haut une licence non exclusive pour utiliser ce contenu</li>
            <li>Acceptez que votre contenu soit modéré avant publication</li>
            <li>Restez responsable de l'exactitude et de la légalité de votre contenu</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>5. Modération</h2>
          <p>
            Nous nous réservons le droit de :
          </p>
          <ul>
            <li>Modérer, modifier ou supprimer tout contenu inapproprié</li>
            <li>Suspendre ou supprimer des comptes en cas de violation des conditions</li>
            <li>Refuser toute contribution sans justification</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>6. Utilisation acceptable</h2>
          <p>Vous vous engagez à ne pas :</p>
          <ul>
            <li>Publier de contenu illégal, offensant ou inapproprié</li>
            <li>Harceler, menacer ou intimider d'autres utilisateurs</li>
            <li>Utiliser le service à des fins commerciales sans autorisation</li>
            <li>Tenter de contourner les mesures de sécurité</li>
            <li>Collecter des données d'autres utilisateurs</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>7. Responsabilité</h2>
          <p>
            <strong>Important :</strong> Les informations sur les POIs sont fournies par la communauté 
            et peuvent être inexactes ou obsolètes. Dormir La Haut ne garantit pas :
          </p>
          <ul>
            <li>L'exactitude des informations sur les lieux</li>
            <li>La sécurité ou l'accessibilité des lieux</li>
            <li>La légalité du bivouac dans les zones indiquées</li>
          </ul>
          <p>
            Vous êtes seul responsable de vos décisions et de votre sécurité en montagne. 
            Vérifiez toujours les réglementations locales et les conditions météorologiques.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Propriété intellectuelle</h2>
          <p>
            Le service Dormir La Haut, son design, son code et sa marque sont protégés par 
            les droits de propriété intellectuelle. Vous ne pouvez pas copier, modifier ou 
            distribuer ces éléments sans autorisation.
          </p>
        </section>

        <section className="legal-section">
          <h2>9. Modifications du service</h2>
          <p>
            Nous nous réservons le droit de modifier, suspendre ou interrompre le service 
            à tout moment, avec ou sans préavis.
          </p>
        </section>

        <section className="legal-section">
          <h2>10. Résiliation</h2>
          <p>
            Vous pouvez supprimer votre compte à tout moment depuis vos paramètres. 
            Nous pouvons également suspendre ou supprimer votre compte en cas de violation 
            de ces conditions.
          </p>
        </section>

        <section className="legal-section">
          <h2>11. Droit applicable</h2>
          <p>
            Ces conditions sont régies par le droit français. Tout litige sera soumis 
            aux tribunaux compétents.
          </p>
        </section>

        <section className="legal-section">
          <h2>12. Contact</h2>
          <p>
            Pour toute question concernant ces conditions, contactez-nous via notre 
            <Link to="/contact"> page de contact</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Terms;
