import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const plans = [
  { id: 'free', name: 'Gratuit', price: '0€', desc: '1 vérification, score de base' },
  { id: 'pro', name: 'Pro', price: '5€/mois', desc: 'Surveillance continue, alertes, 3 emails' },
  { id: 'famille', name: 'Famille', price: '10€/mois', desc: 'Jusqu\'à 5 membres, tableau de bord familial' },
];

export default function Register() {
  const [searchParams] = useSearchParams();
  const [plan, setPlan] = useState(searchParams.get('plan') || 'free');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, plan }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      login(data.token, data.user);
      navigate('/dashboard');
    } catch {
      setError('Une erreur est survenue, réessaie.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="auth-page">
        <div className="auth-box">
          <div className="eyebrow">Créer un compte</div>
          <h1 className="serif">Rejoins ShieldMe</h1>

          <div className="plan-selector">
            {plans.map(p => (
              <button
                key={p.id}
                type="button"
                className={`plan-option ${plan === p.id ? 'selected' : ''}`}
                onClick={() => setPlan(p.id)}
              >
                <div className="plan-option-name">{p.name}</div>
                <div className="plan-option-price">{p.price}</div>
                <div className="plan-option-desc">{p.desc}</div>
              </button>
            ))}
          </div>

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
        <div>ShieldMe</div>
        <div>Fait avec soin à Paris</div>
      </footer>
    </>
  );
}
