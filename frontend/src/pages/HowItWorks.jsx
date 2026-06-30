import { Link } from "react-router-dom";

const steps = [
  {
    num: "01",
    title: "Tu entres ton adresse email",
    desc: "Aucun compte à créer, aucun mot de passe à donner. Juste ton email, celui que tu utilises sur tes comptes importants.",
  },
  {
    num: "02",
    title: "On croise nos bases de données",
    desc: "Veillo consulte des milliers de fuites de données connues et référencées — des incidents réels où des informations personnelles ont été exposées sur internet.",
  },
  {
    num: "03",
    title: "Tu reçois un score clair",
    desc: "Pas de jargon technique. Un score sur 100, une explication simple de ce qui a fuité, et des actions concrètes classées par priorité.",
  },
  {
    num: "04",
    title: "On continue à surveiller pour toi",
    desc: "Les nouvelles fuites apparaissent chaque semaine. Avec Veillo Pro, on t'alerte automatiquement si ton email est impliqué — tu n'as rien à faire.",
  },
];

export default function HowItWorks() {
  return (
    <>
      <section className="page-hero">
        <div className="eyebrow">Transparent par design</div>
        <h1 className="serif">Comment Veillo fonctionne</h1>
        <p className="lead">
          On ne fait pas de magie. On t'explique exactement ce qu'on fait avec ton email, et pourquoi ça marche.
        </p>
      </section>

      <section className="steps-section">
        {steps.map((step) => (
          <div className="step" key={step.num}>
            <div className="step-num serif">{step.num}</div>
            <div className="step-content">
              <h2>{step.title}</h2>
              <p>{step.desc}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="page-cta">
        <h2 className="serif">Prêt à voir ce qu'on sait sur toi ?</h2>
        <p>Vérification gratuite, sans inscription, en 10 secondes.</p>
        <Link to="/" className="cta-btn">Vérifier mon email →</Link>
      </section>

      <footer>
        <div>Veillo</div>
        <div>Fait avec soin à Paris</div>
      </footer>
    </>
  );
}
