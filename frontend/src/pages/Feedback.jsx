import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const RATINGS = Array.from({ length: 10 }, (_, i) => String(i + 1));
const UNDERSTANDING_OPTIONS = ["Oui, facilement", "Oui, mais avec un peu de temps", "Non, pas vraiment"];
const USEFULNESS_OPTIONS = ["Oui, j'ai découvert des choses", "Un peu", "Non, rien de nouveau"];
const SUBSCRIBE_OPTIONS = ["Oui, sans hésiter", "Peut-être", "Non"];

function ChoiceGroup({ options, value, onChange, name }) {
  return (
    <div className="choice-group" role="radiogroup" aria-label={name}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className={`choice-btn ${value === opt ? "active" : ""}`}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function Feedback() {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [rating, setRating] = useState(null);
  const [understanding, setUnderstanding] = useState(null);
  const [usefulness, setUsefulness] = useState(null);
  const [message, setMessage] = useState("");
  const [subscribeIntent, setSubscribeIntent] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!rating) { setError("Merci de donner une note globale."); return; }
    if (!understanding || !usefulness || !subscribeIntent) {
      setError("Merci de répondre à toutes les questions.");
      return;
    }
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, rating, understanding, usefulness, message, subscribeIntent }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
    } catch {
      setError("Une erreur est survenue, réessaie.");
      setStatus(null);
    }
  }

  return (
    <>
      <section className="auth-page">
        <div className="auth-box" style={{ maxWidth: "560px" }}>
          <div className="eyebrow">Bêta testeur</div>
          <h1 className="serif">Formulaire de feedback Veillo</h1>
          <p className="lead" style={{ marginBottom: "28px" }}>
            5 questions, 2 minutes — ton retour compte beaucoup pour la suite de Veillo.
          </p>

          {status === "done" ? (
            <p className="form-note">Merci, ton retour est bien arrivé !</p>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="field">
                <label>Sur 10, tu donnerais quelle note à Veillo ?</label>
                <ChoiceGroup name="Note globale" options={RATINGS} value={rating} onChange={setRating} />
              </div>

              <div className="field">
                <label>Est-ce que tu as compris ce que fait Veillo dès la première utilisation ?</label>
                <ChoiceGroup name="Compréhension" options={UNDERSTANDING_OPTIONS} value={understanding} onChange={setUnderstanding} />
              </div>

              <div className="field">
                <label>Est-ce que le résultat de ta vérification t'a appris quelque chose ?</label>
                <ChoiceGroup name="Utilité ressentie" options={USEFULNESS_OPTIONS} value={usefulness} onChange={setUsefulness} />
              </div>

              <div className="field">
                <label>Qu'est-ce qui t'a gêné ou manqué ? (facultatif)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Raconte-nous..."
                  className="feedback-textarea"
                />
              </div>

              <div className="field">
                <label>Si Veillo était disponible à 4,99€/mois, tu t'abonnerais ?</label>
                <ChoiceGroup name="Intention d'abonnement" options={SUBSCRIBE_OPTIONS} value={subscribeIntent} onChange={setSubscribeIntent} />
              </div>

              <div className="field">
                <label>Ton email (facultatif)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ton@email.com"
                />
              </div>

              {error && <p className="error-note">{error}</p>}
              <button type="submit" className="auth-btn" disabled={status === "sending"}>
                {status === "sending" ? "Envoi..." : "Envoyer mon retour →"}
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
