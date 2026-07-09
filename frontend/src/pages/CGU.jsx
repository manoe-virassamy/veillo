import Footer from "../components/Footer";

export default function CGU() {
  return (
    <>
      <section className="legal-page">
        <div className="eyebrow">Dernière mise à jour : juillet 2026</div>
        <h1 className="serif">Conditions générales d'utilisation</h1>

        <h2>1. Objet</h2>
        <p>
          Les présentes CGU régissent l'utilisation du service Veillo, une application de
          vérification et de surveillance de fuites de données personnelles.
        </p>

        <h2>2. Description du service</h2>
        <p>
          Veillo permet de vérifier si un email apparaît dans des fuites de données connues,
          d'obtenir un score de vulnérabilité et des recommandations. Le service propose un
          plan Gratuit (vérifications illimitées) et des plans payants Pro et Famille (surveillance
          continue, alertes, historique étendu), selon la grille tarifaire affichée sur la page Tarifs.
        </p>

        <h2>3. Inscription et compte</h2>
        <p>
          L'inscription est réservée aux personnes âgées d'au moins 18 ans. Tu es responsable de la
          confidentialité de ton mot de passe et de l'exactitude des informations fournies. Tu peux
          supprimer ton compte à tout moment depuis ton tableau de bord.
        </p>

        <h2>4. Abonnements et paiement</h2>
        <p>
          Les plans Pro et Famille sont des abonnements récurrents facturés via Stripe. L'offre bêta
          (tarif réduit à vie) est réservée aux 50 premiers abonnés et n'est plus disponible une fois
          ce quota atteint. Tu peux résilier ton abonnement à tout moment depuis le portail de gestion
          accessible dans ton tableau de bord — la résiliation prend effet à la fin de la période déjà payée.
        </p>

        <h2>5. Limites du service</h2>
        <p>
          Veillo s'appuie sur des sources tierces (notamment Have I Been Pwned) pour détecter les
          fuites de données. Ces sources ne sont pas exhaustives : l'absence de résultat ne garantit
          pas l'absence de fuite réelle. Veillo est un outil d'aide à la vigilance, pas une garantie
          de sécurité absolue.
        </p>

        <h2>6. Résiliation</h2>
        <p>
          Tu peux supprimer ton compte à tout moment. Nous pouvons suspendre ou supprimer un compte
          en cas d'utilisation abusive du service (tentative de contournement des limites techniques,
          usage frauduleux, etc.).
        </p>

        <h2>7. Propriété intellectuelle</h2>
        <p>
          Le nom Veillo, son design et son contenu sont la propriété de son éditeur. Toute reproduction
          non autorisée est interdite.
        </p>

        <h2>8. Modification des CGU</h2>
        <p>
          Ces CGU peuvent évoluer. En cas de changement significatif, tu en seras informé par email
          ou via l'application.
        </p>

        <h2>9. Droit applicable</h2>
        <p>Les présentes CGU sont soumises au droit français.</p>

        <h2>10. Contact</h2>
        <p>Pour toute question : <strong>veillo.contact@gmail.com</strong></p>
      </section>

      <Footer />
    </>
  );
}
