import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const planLabels = { free: 'Gratuit', pro: 'Pro', famille: 'Famille' };
const planColors = { free: 'var(--ink-soft)', pro: 'var(--sage)', famille: 'var(--coral)' };

function scoreColor(score) {
  if (score >= 70) return '#2D4F3E';
  if (score >= 40) return '#C97A3A';
  return '#C9483A';
}

export default function Dashboard() {
  const { user, token, logout } = useAuth();
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

  return (
    <>
      <section className="dashboard">
        <div className="dashboard-header">
          <div>
            <div className="eyebrow">Tableau de bord</div>
            <h1 className="serif">Bonjour, {user.email.split('@')[0]}</h1>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Se déconnecter</button>
        </div>

        <div className="dashboard-grid">
          <div className="dash-card">
            <div className="dash-card-label">Ton plan</div>
            <div className="dash-plan" style={{ color: planColors[user.plan] }}>
              {planLabels[user.plan]}
            </div>
            {user.plan === 'free' && (
              <Link to="/tarifs" className="upgrade-btn">Passer au Pro →</Link>
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
              <div className="dash-email" style={{ fontSize: '15px', opacity: 0.5 }}>Aucun membre ajouté</div>
              <button className="upgrade-btn">Inviter un proche →</button>
            </div>
          )}
        </div>
      </section>

      <footer>
        <div>Veillo</div>
        <div>Fait avec soin à Paris</div>
      </footer>
    </>
  );
}
