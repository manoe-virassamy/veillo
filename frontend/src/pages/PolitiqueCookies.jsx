import Footer from "../components/Footer";

export default function PolitiqueCookies() {
  return (
    <>
      <section className="legal-page">
        <div className="eyebrow">Dernière mise à jour : juillet 2026</div>
        <h1 className="serif">Politique de cookies</h1>

        <p>
          Veillo n'utilise pas de cookies. Pour te garder connecté, l'application stocke un jeton de
          session dans le stockage local de ton navigateur (<code>localStorage</code>) — une technologie
          différente des cookies, qui n'est ni envoyée à des serveurs tiers ni utilisée à des fins de
          suivi publicitaire. Elle est automatiquement effacée si tu te déconnectes.
        </p>

        <p>
          La seule exception : lorsque tu paies un abonnement, tu es redirigé vers une page de paiement
          hébergée par <strong>Stripe</strong>. Cette page, sur le domaine de Stripe, peut déposer ses
          propres cookies, gérés selon leur propre politique de confidentialité — Veillo n'y a pas accès
          et n'en a pas le contrôle.
        </p>

        <p>
          Nous n'utilisons aucun outil d'analyse d'audience (type Google Analytics) ni de traceur
          publicitaire.
        </p>
      </section>

      <Footer />
    </>
  );
}
