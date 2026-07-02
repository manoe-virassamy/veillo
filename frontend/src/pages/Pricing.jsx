import { Link } from "react-router-dom";

const plans = [
  {
    name: "Gratuit",
    price: "0€",
    period: "pour toujours",
    desc: "Pour découvrir Veillo et vérifier tes emails librement.",
    features: [
      "Vérifications illimitées",
      "Score de vulnérabilité",
      "Recommandations personnalisées",
    ],
    cta: "Commencer gratuitement",
    ctaLink: "/",
    highlight: false,
  },
  {
    name: "Pro",
    price: "5€",
    period: "par mois",
    desc: "Pour ceux qui veulent une vraie protection au quotidien.",
    features: [
      "Surveillance continue 24h/24",
      "Alertes en temps réel",
      "Recommandations détaillées",
      "Historique des fuites",
      "Jusqu'à 3 emails surveillés",
    ],
    cta: "Essayer 30 jours gratuits",
    ctaLink: "/",
    highlight: true,
  },
  {
    name: "Famille",
    price: "10€",
    period: "par mois",
    desc: "Un seul abonnement pour protéger toute ta famille.",
    features: [
      "Tout ce qu'inclut Pro",
      "Jusqu'à 5 membres",
      "Tableau de bord famille",
      "Alertes groupées",
      "Accompagnement simplifié pour les moins technophiles",
    ],
    cta: "Protéger ma famille",
    ctaLink: "/familles",
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <>
      <section className="page-hero">
        <div className="eyebrow">Simple et transparent</div>
        <h1 className="serif">Un prix honnête pour une vraie protection</h1>
        <p className="lead">
          Commence gratuitement. Passe au niveau supérieur quand tu es convaincu.
        </p>
      </section>

      <section className="pricing-grid">
        {plans.map((plan) => (
          <div className={`pricing-card ${plan.highlight ? "pricing-highlight" : ""}`} key={plan.name}>
            <div className="plan-name">{plan.name}</div>
            <div className="plan-price">
              <span className="serif">{plan.price}</span>
              <span className="plan-period"> / {plan.period}</span>
            </div>
            <p className="plan-desc">{plan.desc}</p>
            <ul className="plan-features">
              {plan.features.map((f) => (
                <li key={f}>
                  <span className="check">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link to={plan.ctaLink} className={`plan-cta ${plan.highlight ? "plan-cta-highlight" : ""}`}>
              {plan.cta}
            </Link>
          </div>
        ))}
      </section>

      <footer>
        <div>Veillo</div>
        <div>Fait avec soin à Paris</div>
      </footer>
    </>
  );
}
