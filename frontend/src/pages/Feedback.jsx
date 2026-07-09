import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function Feedback() {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
      setMessage("");
    } catch {
      setError("Une erreur est survenue, réessaie.");
      setStatus(null);
    }
  }

  return (
    <>
      <section className="auth-page">
        <div className="auth-box">
          <div className="eyebrow">Bêta testeur</div>
          <h1 className="serif">Un avis, un bug, une idée ?</h1>
          <p className="lead" style={{ marginBottom: "28px" }}>
            Ton retour compte beaucoup pour la suite de Veillo — dis-nous ce qui marche, ce qui
            coince, ou ce qui te manque.
          </p>

          {status === "done" ? (
            <p className="form-note">Merci, ton message est bien arrivé !</p>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="field">
                <label>Ton email (facultatif)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ton@email.com"
                />
              </div>
              <div className="field">
                <label>Ton message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={6}
                  placeholder="Raconte-nous..."
                  className="feedback-textarea"
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
