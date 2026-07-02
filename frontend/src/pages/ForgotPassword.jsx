import { useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } finally {
      setLoading(false);
      setSent(true);
    }
  }

  return (
    <>
      <section className="auth-page">
        <div className="auth-box">
          <div className="eyebrow">Mot de passe oublié</div>
          <h1 className="serif">Réinitialise ton mot de passe</h1>

          {sent ? (
            <p className="lead">
              Si un compte existe avec cet email, tu vas recevoir un lien de réinitialisation dans quelques instants.
            </p>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="field">
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="ton@email.com" />
              </div>
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Envoi...' : 'Envoyer le lien →'}
              </button>
            </form>
          )}

          <p className="auth-switch">
            <Link to="/connexion">Retour à la connexion</Link>
          </p>
        </div>
      </section>

      <footer>
        <div>Veillo</div>
        <div>Fait avec soin à Paris</div>
      </footer>
    </>
  );
}
