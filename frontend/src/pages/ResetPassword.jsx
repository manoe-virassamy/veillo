import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Footer from '../components/Footer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 8) { setError('Mot de passe trop court (8 caractères minimum)'); return; }
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setDone(true);
      setTimeout(() => navigate('/connexion'), 2000);
    } catch {
      setError('Une erreur est survenue, réessaie.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <>
        <section className="auth-page">
          <div className="auth-box">
            <div className="eyebrow">Lien invalide</div>
            <h1 className="serif">Ce lien est incomplet</h1>
            <p className="lead">
              <Link to="/mot-de-passe-oublie">Redemande un lien de réinitialisation</Link>.
            </p>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <section className="auth-page">
        <div className="auth-box">
          <div className="eyebrow">Nouveau mot de passe</div>
          <h1 className="serif">Choisis un nouveau mot de passe</h1>

          {done ? (
            <p className="lead">Mot de passe mis à jour. Redirection vers la connexion...</p>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="field">
                <label>Nouveau mot de passe</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="8 caractères minimum" />
              </div>
              <div className="field">
                <label>Confirmer le mot de passe</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="Répète ton mot de passe" />
              </div>
              {error && <p className="error-note">{error}</p>}
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Mise à jour...' : 'Réinitialiser →'}
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
