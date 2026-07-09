import Footer from "../components/Footer";

export default function PolitiqueConfidentialite() {
  return (
    <>
      <section className="legal-page">
        <div className="eyebrow">Dernière mise à jour : juillet 2026</div>
        <h1 className="serif">Politique de confidentialité</h1>

        <h2>1. Qui est responsable de tes données</h2>
        <p>
          Veillo est édité par Manoé Virassamy (immatriculation en cours — voir les
          <a href="/mentions-legales"> Mentions légales</a> pour les coordonnées à jour).
          Pour toute question sur tes données, écris à <strong>veillo.contact@gmail.com</strong>.
        </p>

        <h2>2. Quelles données on collecte, et pourquoi</h2>
        <table className="legal-table">
          <thead>
            <tr><th>Donnée</th><th>Pourquoi</th></tr>
          </thead>
          <tbody>
            <tr><td>Email</td><td>Créer et sécuriser ton compte, te connecter, t'envoyer les emails nécessaires (réinitialisation de mot de passe, invitation)</td></tr>
            <tr><td>Prénom</td><td>Te dire bonjour sur ton tableau de bord</td></tr>
            <tr><td>Mot de passe</td><td>Stocké sous forme de hash irréversible (bcrypt) — jamais en clair, jamais lisible par nous</td></tr>
            <tr><td>Résultats de vérification (score, nombre de fuites, date)</td><td>Afficher ton historique sur ton tableau de bord</td></tr>
            <tr><td>Plan d'abonnement, identifiants Stripe</td><td>Gérer ton abonnement et la facturation — tes coordonnées bancaires ne transitent jamais par nos serveurs, Stripe les gère entièrement</td></tr>
          </tbody>
        </table>

        <h2>3. Avec qui on partage tes données</h2>
        <p>Aucune donnée n'est vendue. Elle est transmise uniquement aux prestataires techniques nécessaires au fonctionnement du service :</p>
        <ul>
          <li><strong>Supabase</strong> — hébergement de la base de données</li>
          <li><strong>Render</strong> — hébergement du serveur</li>
          <li><strong>Vercel</strong> — hébergement du site</li>
          <li><strong>Stripe</strong> — traitement des paiements</li>
          <li><strong>SendGrid</strong> — envoi des emails transactionnels</li>
          <li><strong>Have I Been Pwned</strong> — l'email que tu vérifies leur est transmis pour croiser les fuites de données connues</li>
        </ul>
        <p>
          Certains de ces prestataires sont situés hors de l'Union européenne (États-Unis, Australie).
          Ces transferts sont encadrés par leurs propres garanties contractuelles (clauses contractuelles types).
        </p>

        <h2>4. Combien de temps on garde tes données</h2>
        <p>
          Tant que ton compte existe. Tu peux le supprimer à tout moment depuis ton tableau de bord
          ("Supprimer mon compte") — toutes tes données (compte, historique de vérifications) sont
          effacées immédiatement et définitivement.
        </p>

        <h2>5. Tes droits</h2>
        <p>Conformément au RGPD, tu peux à tout moment :</p>
        <ul>
          <li>Accéder à tes données</li>
          <li>Les faire rectifier</li>
          <li>Les faire supprimer (directement via le bouton dans ton compte, ou par email)</li>
          <li>T'opposer à leur traitement ou en demander la limitation</li>
          <li>Demander la portabilité de tes données</li>
        </ul>
        <p>
          Pour exercer ces droits, écris à <strong>veillo.contact@gmail.com</strong>. Tu peux aussi déposer
          une réclamation auprès de la CNIL (cnil.fr) si tu estimes que tes droits ne sont pas respectés.
        </p>

        <h2>6. Sécurité</h2>
        <p>
          Les mots de passe sont hashés (jamais stockés en clair), les connexions à nos serveurs sont
          chiffrées (HTTPS/SSL), et les données au repos sont chiffrées par notre hébergeur de base de
          données. Aucune donnée bancaire n'est jamais stockée par Veillo — Stripe s'en charge entièrement.
        </p>

        <h2>7. Cookies</h2>
        <p>
          Voir notre <a href="/cookies">politique de cookies</a> dédiée.
        </p>
      </section>

      <Footer />
    </>
  );
}
