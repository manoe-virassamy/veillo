import Footer from "../components/Footer";

export default function MentionsLegales() {
  return (
    <>
      <section className="legal-page">
        <div className="eyebrow">Dernière mise à jour : juillet 2026</div>
        <h1 className="serif">Mentions légales</h1>

        <div className="legal-warning">
          Cette page est incomplète : l'immatriculation de l'activité (numéro SIRET) est en cours.
          Les champs ci-dessous seront complétés dès qu'elle sera effective.
        </div>

        <h2>Éditeur du site</h2>
        <p>
          Nom : Manoé Virassamy<br />
          Statut : <em>à compléter (immatriculation en cours)</em><br />
          Adresse : <em>à compléter</em><br />
          SIRET : <em>à compléter</em><br />
          Contact : veillo.contact@gmail.com
        </p>

        <h2>Directeur de la publication</h2>
        <p>Manoé Virassamy</p>

        <h2>Hébergement</h2>
        <p>
          <strong>Frontend :</strong> Vercel Inc. — 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis<br />
          <strong>Backend et base de données :</strong> Render Services, Inc. — 525 Brannan St Ste 300, San Francisco, CA 94107, États-Unis
        </p>

        <h2>Contact</h2>
        <p>Pour toute question relative au site : veillo.contact@gmail.com</p>
      </section>

      <Footer />
    </>
  );
}
