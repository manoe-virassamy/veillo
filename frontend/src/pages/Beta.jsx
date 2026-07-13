import { useState } from "react";
import Footer from "../components/Footer";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function Beta() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [invited, setInvited] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/waitlist/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setInvited(!!data.invited);
      setStatus("done");
    } catch {
      setError("Une erreur est survenue, réessaie.");
      setStatus(null);
    }
  }

  return (
    <>
      <section className="page-hero">
        <div className="eyebrow">Bientôt disponible</div>
        <h1 className="serif">
          Sache enfin <em>ce qu'internet sait</em> de toi.
        </h1>
        <p className="lead">
          Veillo vérifie si tes données ont fuité, t'explique simplement les risques, et te dit
          quoi faire — sans jargon, sans panique. On ouvre l'accès progressivement : inscris-toi
          sur la liste d'attente pour être prévenu dès que ta place est prête.
        </p>

        {status === "done" ? (
          <p className="form-note">
            {invited
              ? "C'est fait — ton invitation vient d'être envoyée par email. Va vérifier ta boîte de réception (et les spams, au cas où)."
              : "C'est fait — tu es sur la liste. L'invitation te sera envoyée par email dès qu'une place sera prête."}
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Ton prénom"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="beta-firstname"
            />
            <div className="check-form">
              <input
                type="email"
                placeholder="ton.email@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Envoi..." : "Rejoindre la liste d'attente"}
              </button>
            </div>
          </form>
        )}
        {error && <p className="error-note">{error}</p>}
      </section>

      <section className="features">
        <div className="features-head">
          <div className="eyebrow">Ce qui t'attend</div>
          <h2 className="serif">
            La cybersécurité, sans avoir besoin d'être ingénieur pour la comprendre.
          </h2>
        </div>
        <div className="feature-grid">
          <div className="feature">
            <div className="num serif">Vigie</div>
            <h3>Surveillance continue</h3>
            <p>On surveille en permanence si tes données apparaissent dans de nouvelles fuites, et on t'alerte aussitôt.</p>
          </div>
          <div className="feature">
            <div className="num serif">Entraînement</div>
            <h3>Anti-phishing</h3>
            <p>De fausses attaques bienveillantes pour t'entraîner à reconnaître les vraies, sans jamais te mettre en danger.</p>
          </div>
          <div className="feature">
            <div className="num serif">Coffre</div>
            <h3>Identité centralisée</h3>
            <p>Tes mots de passe et documents sensibles, rangés dans un seul endroit, simple et chiffré.</p>
          </div>
          <div className="feature">
            <div className="num serif">Famille</div>
            <h3>Protection partagée</h3>
            <p>Un seul compte pour veiller sur tes proches les moins à l'aise avec la technologie.</p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
