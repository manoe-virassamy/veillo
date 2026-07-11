import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const planLabels = { free: 'Gratuit', pro: 'Pro', famille: 'Famille' };
const planColors = { free: 'var(--ink-soft)', pro: 'var(--sage)', famille: 'var(--coral)' };

function scoreColor(score) {
  if (score >= 70) return '#2D4F3E';
  if (score >= 40) return '#C97A3A';
  return '#C9483A';
}

function InviteForm({ token }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);

  async function handleInvite(e) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch(`${API_URL}/api/auth/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? 'sent' : 'error');
      if (res.ok) setEmail('');
    } catch {
      setStatus('error');
    }
  }

  return (
    <form className="invite-form" onSubmit={handleInvite}>
      <input
        type="email"
        required
        placeholder="email.du.proche@exemple.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <button type="submit" className="upgrade-btn" disabled={status === 'sending'}>
        {status === 'sending' ? 'Envoi...' : 'Inviter un proche →'}
      </button>
      {status === 'sent' && <p className="form-note">Invitation envoyée !</p>}
      {status === 'error' && <p className="error-note">Erreur, réessaie.</p>}
    </form>
  );
}

function PlanSwitcher({ user, token, onPlanChange }) {
  const [updating, setUpdating] = useState(false);

  async function handleChange(plan) {
    if (plan === user.plan || updating) return;
    setUpdating(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/plan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan }),
      });
      if (res.ok) onPlanChange(await res.json());
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="admin-plan-switcher">
      <span>Mode démo, voir le rendu du plan :</span>
      {['free', 'pro', 'famille'].map(p => (
        <button
          key={p}
          type="button"
          className={`admin-plan-btn ${user.plan === p ? 'active' : ''}`}
          onClick={() => handleChange(p)}
          disabled={updating}
        >
          {planLabels[p]}
        </button>
      ))}
    </div>
  );
}

const AUTO_INVITE_LIMIT = 50;

function WaitlistPanel({ token }) {
  const [entries, setEntries] = useState(null);
  const [inviting, setInviting] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/waitlist`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(setEntries)
      .catch(() => setEntries([]));
  }, [token]);

  async function handleInvite(email) {
    setInviting(email);
    try {
      const res = await fetch(`${API_URL}/api/waitlist/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setEntries(prev => prev.map(e => e.email === email ? { ...e, invited: true } : e));
      }
    } finally {
      setInviting(null);
    }
  }

  const invitedCount = entries?.filter(e => e.invited).length ?? 0;

  return (
    <details className="admin-waitlist">
      <summary>
        Liste d'attente — {invitedCount}/{AUTO_INVITE_LIMIT} invités
        {entries ? ` (${entries.length} au total)` : ''}
      </summary>
      {entries?.length === 0 && <p className="form-note">Personne pour l'instant.</p>}
      <ul className="waitlist-list">
        {entries?.map(e => (
          <li key={e.email}>
            <span className="waitlist-email">{e.email}</span>
            {e.invited ? (
              <span className="waitlist-invited">Invité</span>
            ) : (
              <span className="waitlist-pending">
                En attente
                <button type="button" onClick={() => handleInvite(e.email)} disabled={inviting === e.email}>
                  {inviting === e.email ? 'Envoi...' : "Envoyer l'invitation"}
                </button>
              </span>
            )}
          </li>
        ))}
      </ul>
    </details>
  );
}

function ChangePasswordForm({ token }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (newPassword.length < 8) { setError('Mot de passe trop court (8 caractères minimum)'); return; }
    if (newPassword !== confirm) { setError('Les mots de passe ne correspondent pas'); return; }
    setStatus('sending');
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setStatus(null); return; }
      setStatus('done');
      setCurrentPassword('');
      setNewPassword('');
      setConfirm('');
    } catch {
      setError('Une erreur est survenue, réessaie.');
      setStatus(null);
    }
  }

  return (
    <details className="account-section">
      <summary>Changer mon mot de passe</summary>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field">
          <label>Mot de passe actuel</label>
          <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
        </div>
        <div className="field">
          <label>Nouveau mot de passe</label>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="8 caractères minimum" />
        </div>
        <div className="field">
          <label>Confirmer le nouveau mot de passe</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
        </div>
        {error && <p className="error-note">{error}</p>}
        {status === 'done' && <p className="form-note">Mot de passe mis à jour.</p>}
        <button type="submit" className="auth-btn" disabled={status === 'sending'}>
          {status === 'sending' ? 'Mise à jour...' : 'Mettre à jour →'}
        </button>
      </form>
    </details>
  );
}

function VerifyBanner({ token }) {
  const [status, setStatus] = useState(null);

  async function handleResend() {
    setStatus('sending');
    try {
      const res = await fetch(`${API_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="verify-banner">
      <span>Confirme ton adresse email pour activer pleinement ton compte.</span>
      {status === 'sent' ? (
        <span className="verify-banner-sent">Email renvoyé !</span>
      ) : (
        <button type="button" onClick={handleResend} disabled={status === 'sending'}>
          {status === 'sending' ? 'Envoi...' : 'Renvoyer l\'email'}
        </button>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user, token, login, logout } = useAuth();
  const navigate = useNavigate();
  const [lastCheck, setLastCheck] = useState(undefined);

  useEffect(() => {
    fetch(`${API_URL}/api/check/latest`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => setLastCheck(data))
      .catch(() => setLastCheck(null));
  }, [token]);

  function handleLogout() {
    logout();
    navigate('/');
  }

  async function handleDeleteAccount() {
    if (!window.confirm('Supprimer définitivement ton compte Veillo ? Cette action est irréversible.')) return;
    await fetch(`${API_URL}/api/auth/account`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    logout();
    navigate('/');
  }

  function handlePlanChange(updatedUser) {
    login(token, updatedUser);
  }

  async function handleManageSubscription() {
    const res = await fetch(`${API_URL}/api/stripe/create-portal-session`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  return (
    <>
      <section className="dashboard">
        <div className="dashboard-header">
          <div>
            <div className="eyebrow">Tableau de bord</div>
            <h1 className="serif">Bonjour, {user.firstName}</h1>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Se déconnecter</button>
        </div>

        {!user.emailVerified && <VerifyBanner token={token} />}
        {user.isAdmin && <PlanSwitcher user={user} token={token} onPlanChange={handlePlanChange} />}
        {user.isAdmin && <WaitlistPanel token={token} />}

        <div className="dashboard-grid">
          <div className="dash-card">
            <div className="dash-card-label">Ton plan</div>
            <div className="dash-plan" style={{ color: planColors[user.plan] }}>
              {planLabels[user.plan]}
            </div>
            {user.plan === 'free' ? (
              <Link to="/tarifs" className="upgrade-btn">Passer au Pro →</Link>
            ) : (
              <button
                type="button"
                className="upgrade-btn"
                style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
                onClick={handleManageSubscription}
              >
                Gérer mon abonnement →
              </button>
            )}
          </div>

          <div className="dash-card">
            <div className="dash-card-label">Email surveillé</div>
            <div className="dash-email">{user.email}</div>
            {user.plan !== 'free' && (
              <p className="dash-note">Surveillance active — on t'alertera en cas de fuite.</p>
            )}
            {user.plan === 'free' && (
              <p className="dash-note">Passe au plan Pro pour activer la surveillance continue.</p>
            )}
          </div>

          <div className="dash-card">
            <div className="dash-card-label">Dernière vérification</div>
            {!lastCheck ? (
              <div className="dash-email" style={{ fontSize: '15px', opacity: 0.5 }}>
                {lastCheck === undefined ? 'Chargement...' : "Aucune pour l'instant"}
              </div>
            ) : (
              <>
                <div className="dash-plan" style={{ color: scoreColor(lastCheck.score) }}>
                  {lastCheck.score}/100
                </div>
                <p className="dash-note">
                  {lastCheck.breach_count} fuite{lastCheck.breach_count > 1 ? 's' : ''} détectée{lastCheck.breach_count > 1 ? 's' : ''} — {new Date(lastCheck.created_at).toLocaleDateString('fr-FR')}
                </p>
              </>
            )}
            <Link to="/" className="upgrade-btn" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}>
              Vérifier {lastCheck ? 'à nouveau' : 'mon email'} →
            </Link>
          </div>

          {user.plan === 'famille' && (
            <div className="dash-card">
              <div className="dash-card-label">Membres de la famille</div>
              <div className="dash-email" style={{ fontSize: '15px', opacity: 0.5, marginBottom: '14px' }}>Aucun membre ajouté</div>
              <InviteForm token={token} />
            </div>
          )}
        </div>

        <ChangePasswordForm token={token} />
        <button className="danger-link" onClick={handleDeleteAccount}>Supprimer mon compte</button>
      </section>

      <Footer />
    </>
  );
}
