import { useState } from "react";
import ShieldVisual from "../components/ShieldVisual";
import CheckForm from "../components/CheckForm";
import ResultsPanel from "../components/ResultsPanel";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkedEmail, setCheckedEmail] = useState(null);

  function handleReset() {
    setResult(null);
    setCheckedEmail(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleCheck(email) {
    setLoading(true);
    setError(null);
    setCheckedEmail(email);
    try {
      const res = await fetch(`${API_URL}/api/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Erreur lors de la vérification");
      const data = await res.json();
      setResult(data);
      setTimeout(() => {
        document.getElementById("resultsSection")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      setError("Impossible de vérifier cet email pour le moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="hero">
        <div>
          <div className="eyebrow">Vérification gratuite en 10 secondes</div>
          <h1 className="serif">
            Sache enfin <em>ce qu'internet sait</em> de toi.
          </h1>
          <p className="lead">
            ShieldMe vérifie si tes données ont fuité, t'explique simplement les risques,
            et te dit quoi faire — sans jargon, sans panique.
          </p>
          <CheckForm onCheck={handleCheck} loading={loading} />
          {error && <p className="error-note">{error}</p>}
        </div>
        <ShieldVisual score={result?.score ?? null} loading={loading} />
      </section>

      <ResultsPanel result={result} email={checkedEmail} onReset={handleReset} />

      <section className="features">
        <div className="features-head">
          <div className="eyebrow">Comment ShieldMe t'accompagne</div>
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

      <footer>
        <div>ShieldMe</div>
        <div>Fait avec soin à Paris</div>
      </footer>
    </>
  );
}
