import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Register() {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');
  const [inviteState, setInviteState] = useState('checking');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!inviteToken) { setInviteState('missing'); return; }
    fetch(`${API_URL}/api/waitlist/invite/${inviteToken}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.email) { setEmail(data.email); setInviteState('valid'); }
        else setInviteState('invalid');
      })
      .catch(() => setInviteState('invalid'));
  }, [inviteToken]);

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
        body: JSON.stringify({ email, password, plan: 'free', firstName, inviteToken }),
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

  if (inviteState === 'checking') {
    return (
      <>
        <section className="auth-page">
          <div className="auth-box" style={{ textAlign: 'center' }}>
            <div className="eyebrow">Un instant</div>
            <h1 className="serif">Vérification de ton invitation...</h1>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  if (inviteState !== 'valid') {
    return (
      <>
        <section className="auth-page">
          <div className="auth-box" style={{ textAlign: 'center' }}>
            <div className="eyebrow">Sur invitation</div>
            <h1 className="serif">Veillo est en bêta fermée</h1>
            <p className="lead" style={{ marginBottom: '32px' }}>
              {inviteState === 'missing'
                ? "L'inscription se fait uniquement sur invitation pour l'instant. Rejoins la liste d'attente, on t'invite dès qu'une place se libère."
                : "Ce lien d'invitation est invalide ou a déjà été utilisé."}
            </p>
            <Link to="/beta" className="auth-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
              Rejoindre la liste d'attente
            </Link>
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
          <div className="eyebrow">Créer un compte</div>
          <h1 className="serif">Rejoins Veillo</h1>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <label>Prénom</label>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required placeholder="Ton prénom" />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" value={email} readOnly />
            </div>
            <div className="field">
              <label>Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="8 caractères minimum" />
            </div>
            <div className="field">
              <label>Confirmer le mot de passe</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="Répète ton mot de passe" />
            </div>
            <label className="consent-check">
              <input type="checkbox" required />
              <span>
                J'accepte les <Link to="/cgu" target="_blank">CGU</Link> et la{' '}
                <Link to="/confidentialite" target="_blank">politique de confidentialité</Link>
              </span>
            </label>
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

      <Footer />
    </>
  );
}
