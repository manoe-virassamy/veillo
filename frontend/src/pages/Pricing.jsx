import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const freePlan = {
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
};

const proFeatures = [
  "Surveillance continue 24h/24",
  "Alertes en temps réel",
  "Recommandations détaillées",
  "Historique des fuites",
  "Jusqu'à 3 emails surveillés",
];

const familleFeatures = [
  "Tout ce qu'inclut Pro",
  "Jusqu'à 5 membres",
  "Tableau de bord famille",
  "Alertes groupées",
  "Accompagnement simplifié pour les moins technophiles",
];

const betaOffers = [
  {
    name: "Pro bêta",
    price: "2,99€",
    period: "/mois, à vie",
    desc: "Le tarif reste bloqué à ce prix tant que l'abonnement est actif.",
    features: proFeatures,
    offerKey: "pro-beta",
  },
  {
    name: "Famille bêta",
    price: "5,99€",
    period: "/mois, à vie",
    desc: "Le tarif reste bloqué à ce prix tant que l'abonnement est actif.",
    features: familleFeatures,
    offerKey: "famille-beta",
  },
];

const standardOffers = {
  monthly: [
    {
      name: "Pro",
      price: "4,99€",
      period: "/mois",
      note: "1er mois à 1,99€",
      features: proFeatures,
      offerKey: "pro-monthly",
    },
    {
      name: "Famille",
      price: "9,99€",
      period: "/mois",
      note: "1er mois à 3,99€",
      features: familleFeatures,
      offerKey: "famille-monthly",
    },
  ],
  yearly: [
    {
      name: "Pro",
      price: "47,90€",
      period: "/an",
      note: "soit 3,99€/mois",
      features: proFeatures,
      offerKey: "pro-yearly",
    },
    {
      name: "Famille",
      price: "95,90€",
      period: "/an",
      note: "soit 7,99€/mois",
      features: familleFeatures,
      offerKey: "famille-yearly",
    },
  ],
};

export default function Pricing() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [billing, setBilling] = useState("monthly");
  const [beta, setBeta] = useState(null);
  const [loadingOffer, setLoadingOffer] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/stripe/beta-status`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setBeta)
      .catch(() => setBeta(null));
  }, []);

  async function handleCheckout(offerKey) {
    if (!user) { navigate("/connexion"); return; }
    setLoadingOffer(offerKey);
    try {
      const res = await fetch(`${API_URL}/api/stripe/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ offer: offerKey }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoadingOffer(null);
    }
  }

  function OfferCard({ offer, highlight }) {
    return (
      <div className={`pricing-card ${highlight ? "pricing-highlight" : ""}`}>
        <div className="plan-name">{offer.name}</div>
        <div className="plan-price">
          <span className="serif">{offer.price}</span>
          <span className="plan-period"> {offer.period}</span>
        </div>
        {offer.note && <p className="plan-note">{offer.note}</p>}
        <p className="plan-desc">{offer.desc}</p>
        <ul className="plan-features">
          {offer.features.map((f) => (
            <li key={f}><span className="check">✓</span> {f}</li>
          ))}
        </ul>
        {offer.offerKey ? (
          <button
            type="button"
            className={`plan-cta ${highlight ? "plan-cta-highlight" : ""}`}
            onClick={() => handleCheckout(offer.offerKey)}
            disabled={loadingOffer === offer.offerKey}
          >
            {loadingOffer === offer.offerKey ? "Redirection..." : "Choisir cette offre →"}
          </button>
        ) : (
          <Link to={offer.ctaLink} className={`plan-cta ${highlight ? "plan-cta-highlight" : ""}`}>
            {offer.cta}
          </Link>
        )}
      </div>
    );
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

      {beta?.available && (
        <section className="beta-banner">
          <div className="eyebrow">🔥 Offre bêta — {beta.remaining} places restantes sur 50</div>
          <h2 className="serif">Prix bloqué à vie pour les premiers utilisateurs</h2>
          <div className="pricing-grid">
            {betaOffers.map((offer) => <OfferCard offer={offer} highlight key={offer.offerKey} />)}
          </div>
        </section>
      )}

      <section className="billing-toggle">
        <button
          type="button"
          className={billing === "monthly" ? "active" : ""}
          onClick={() => setBilling("monthly")}
        >
          Mensuel
        </button>
        <button
          type="button"
          className={billing === "yearly" ? "active" : ""}
          onClick={() => setBilling("yearly")}
        >
          Annuel (-20%)
        </button>
      </section>

      <section className="pricing-grid">
        <OfferCard offer={freePlan} />
        {standardOffers[billing].map((offer) => <OfferCard offer={offer} highlight={offer.name === "Pro"} key={offer.offerKey} />)}
      </section>

      <footer>
        <div>Veillo</div>
        <div>Fait avec soin à Paris</div>
      </footer>
    </>
  );
}
