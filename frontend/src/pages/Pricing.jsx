import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

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
    checkoutPlan: null,
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
    checkoutPlan: "pro",
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
    checkoutPlan: "famille",
    highlight: false,
  },
];

export default function Pricing() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState(null);

  async function handleUpgrade(checkoutPlan) {
    if (!user) { navigate("/connexion"); return; }
    setLoadingPlan(checkoutPlan);
    try {
      const res = await fetch(`${API_URL}/api/stripe/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: checkoutPlan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoadingPlan(null);
    }
  }

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
            {plan.checkoutPlan ? (
              <button
                type="button"
                className={`plan-cta ${plan.highlight ? "plan-cta-highlight" : ""}`}
                onClick={() => handleUpgrade(plan.checkoutPlan)}
                disabled={loadingPlan === plan.checkoutPlan}
              >
                {loadingPlan === plan.checkoutPlan ? "Redirection..." : plan.cta}
              </button>
            ) : (
              <Link to={plan.ctaLink} className={`plan-cta ${plan.highlight ? "plan-cta-highlight" : ""}`}>
                {plan.cta}
              </Link>
            )}
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
