import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 8) { setError('Mot de passe trop court (8 caractères minimum)'); return; }
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return; }
    setLoading(true);
    setError(null);
    const slowTimer = setTimeout(() => setSlow(true), 4000);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, plan: 'free' }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      login(data.token, data.user);
      navigate('/dashboard');
    } catch {
      setError('Une erreur est survenue, réessaie.');
    } finally {
      clearTimeout(slowTimer);
      setSlow(false);
      setLoading(false);
    }
  }

  return (
    <>
      <section className="auth-page">
        <div className="auth-box">
          <div className="eyebrow">Créer un compte</div>
          <h1 className="serif">Rejoins Veillo</h1>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="ton@email.com" />
            </div>
            <div className="field">
              <label>Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="8 caractères minimum" />
            </div>
            <div className="field">
              <label>Confirmer le mot de passe</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="Répète ton mot de passe" />
            </div>
            {loading && slow && <p className="form-note">Premier chargement un peu long, le serveur se réveille (jusqu'à 30 secondes)...</p>}
            {error && <p className="error-note">{error}</p>}
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Création...' : 'Créer mon compte →'}
            </button>
          </form>

          <p className="auth-switch">
            Déjà un compte ? <Link to="/connexion">Se connecter</Link>
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
