import { Link } from "react-router-dom";

const reasons = [
  {
    icon: "👴",
    title: "Tes parents et grands-parents",
    desc: "Ils sont souvent les plus ciblés par les arnaques en ligne. ShieldMe surveille pour eux sans qu'ils aient besoin de comprendre comment ça marche.",
  },
  {
    icon: "👶",
    title: "Tes enfants",
    desc: "Leurs données peuvent être exposées sans qu'ils le sachent. On surveille leurs emails et les alerte (ou toi) en cas de problème.",
  },
  {
    icon: "👫",
    title: "Ton couple",
    desc: "Un compte partagé pour surveiller vos deux emails, avec des alertes centralisées. Moins de comptes, plus de tranquillité.",
  },
];

export default function Families() {
  return (
    <>
      <section className="page-hero">
        <div className="eyebrow">Plan Famille à 10€/mois</div>
        <h1 className="serif">Protège ceux que tu aimes, <em>sans effort</em></h1>
        <p className="lead">
          Un seul abonnement. Jusqu'à 5 membres. Un tableau de bord pour tout surveiller d'un coup d'œil.
        </p>
        <Link to="/tarifs" className="cta-btn">Voir les tarifs →</Link>
      </section>

      <section className="families-section">
        <div className="families-head">
          <div className="eyebrow">Pour qui c'est fait</div>
          <h2 className="serif">Ceux qui ont besoin de toi pour les protéger</h2>
        </div>
        <div className="families-grid">
          {reasons.map((r) => (
            <div className="family-card" key={r.title}>
              <div className="family-icon">{r.icon}</div>
              <h3>{r.title}</h3>
              <p>{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="families-how">
        <h2 className="serif">Comment ça fonctionne</h2>
        <div className="how-steps">
          <div className="how-step">
            <div className="how-num serif">1</div>
            <p>Tu crées ton compte ShieldMe Famille</p>
          </div>
          <div className="how-step">
            <div className="how-num serif">2</div>
            <p>Tu ajoutes les emails de tes proches (ils reçoivent juste un email d'invitation)</p>
          </div>
          <div className="how-step">
            <div className="how-num serif">3</div>
            <p>ShieldMe surveille tout le monde en continu et t'alerte si quelque chose se passe</p>
          </div>
        </div>
      </section>

      <section className="page-cta">
        <h2 className="serif">Commence avec la vérification gratuite</h2>
        <p>Vérifie d'abord ton propre email. Puis invite ta famille.</p>
        <Link to="/" className="cta-btn">Vérifier mon email →</Link>
      </section>

      <footer>
        <div>ShieldMe</div>
        <div>Fait avec soin à Paris</div>
      </footer>
    </>
  );
}
